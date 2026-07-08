from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

# Fixed donation packages (server-side only) in INR
DONATION_PACKAGES = {
    "supporter": 500.0,
    "friend": 1000.0,
    "champion": 2500.0,
}
CUSTOM_MIN = 100.0
CUSTOM_MAX = 500000.0

app = FastAPI(title="HopeBridge Foundation API")
api_router = APIRouter(prefix="/api")


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class Volunteer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: EmailStr
    phone: str
    city: str
    area_of_interest: str
    message: Optional[str] = ""
    created_at: str = Field(default_factory=utcnow_iso)


class VolunteerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    city: str
    area_of_interest: str
    message: Optional[str] = ""


class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: Optional[str] = ""
    message: str
    created_at: str = Field(default_factory=utcnow_iso)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = ""
    message: str


class NewsletterSub(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(default_factory=utcnow_iso)


class NewsletterCreate(BaseModel):
    email: EmailStr


class CheckoutCreateRequest(BaseModel):
    package_id: Optional[str] = None  # supporter | friend | champion
    custom_amount: Optional[float] = None  # INR when package_id is None
    donor_name: Optional[str] = ""
    donor_email: Optional[str] = ""
    origin_url: str


class CheckoutCreateResponse(BaseModel):
    url: str
    session_id: str


class CheckoutStatusOut(BaseModel):
    session_id: str
    status: str
    payment_status: str
    amount_total: float
    currency: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "HopeBridge Foundation API is live"}


@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(payload: VolunteerCreate):
    vol = Volunteer(**payload.model_dump())
    await db.volunteers.insert_one(vol.model_dump())
    return vol


@api_router.get("/volunteers", response_model=List[Volunteer])
async def list_volunteers():
    docs = await db.volunteers.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    msg = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    return msg


@api_router.post("/newsletter", response_model=NewsletterSub)
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return existing
    sub = NewsletterSub(**payload.model_dump())
    await db.newsletter.insert_one(sub.model_dump())
    return sub


# ---------- Payment ----------
def _resolve_amount(req: CheckoutCreateRequest) -> float:
    if req.package_id:
        if req.package_id not in DONATION_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package_id")
        return float(DONATION_PACKAGES[req.package_id])
    if req.custom_amount is None:
        raise HTTPException(status_code=400, detail="package_id or custom_amount required")
    amt = float(req.custom_amount)
    if amt < CUSTOM_MIN or amt > CUSTOM_MAX:
        raise HTTPException(status_code=400, detail=f"Custom amount must be between ₹{CUSTOM_MIN:.0f} and ₹{CUSTOM_MAX:.0f}")
    return amt


@api_router.post("/donations/checkout", response_model=CheckoutCreateResponse)
async def create_donation_checkout(payload: CheckoutCreateRequest, http_request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    amount = _resolve_amount(payload)
    currency = "inr"

    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/donation-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/#donate"

    metadata = {
        "source": "hopebridge_donation",
        "package_id": payload.package_id or "custom",
        "donor_name": payload.donor_name or "",
        "donor_email": payload.donor_email or "",
    }

    req = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(req)

    tx = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": amount,
        "currency": currency,
        "package_id": payload.package_id or "custom",
        "donor_name": payload.donor_name or "",
        "donor_email": payload.donor_email or "",
        "metadata": metadata,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": utcnow_iso(),
        "updated_at": utcnow_iso(),
    }
    await db.payment_transactions.insert_one(tx)
    return CheckoutCreateResponse(url=session.url, session_id=session.session_id)


@api_router.get("/donations/status/{session_id}", response_model=CheckoutStatusOut)
async def get_donation_status(session_id: str, http_request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    amount_total_units = float(status.amount_total) / 100.0

    # Only update if not already terminal
    if tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": status.status,
                    "payment_status": status.payment_status,
                    "amount_total": amount_total_units,
                    "updated_at": utcnow_iso(),
                }
            },
        )

    return CheckoutStatusOut(
        session_id=session_id,
        status=status.status,
        payment_status=status.payment_status,
        amount_total=amount_total_units,
        currency=status.currency,
    )


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    try:
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception as e:
        logging.exception("Webhook error")
        raise HTTPException(status_code=400, detail=str(e))

    if event and event.session_id:
        await db.payment_transactions.update_one(
            {"session_id": event.session_id},
            {
                "$set": {
                    "payment_status": event.payment_status or "unknown",
                    "webhook_event": event.event_type,
                    "updated_at": utcnow_iso(),
                }
            },
        )
    return {"received": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
