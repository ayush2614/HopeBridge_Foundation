from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
import io
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

# --- Environment ---
ROOT_DIR = Path(__file__).parent
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "insecure-dev-secret")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@hopebridge.org")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "HopeBridge@2026")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "HopeBridge <onboarding@resend.dev>")
ORG_REG_NUMBER = os.environ.get("ORG_REG_NUMBER", "12345/2015")
ORG_PAN = os.environ.get("ORG_PAN", "AABTH1234C")
ORG_ADDRESS = os.environ.get("ORG_ADDRESS", "Mumbai, India")
ORG_SIGNATORY = os.environ.get("ORG_SIGNATORY", "Founder & CEO — HopeBridge Foundation")

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
security = HTTPBearer(auto_error=False)


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Email (Resend, non-blocking, toggleable) ----------
async def send_email_safe(to: str, subject: str, html: str) -> Optional[str]:
    """Send an email via Resend. If RESEND_API_KEY is empty, log & skip."""
    if not RESEND_API_KEY:
        logging.info(f"[email skipped — no RESEND_API_KEY] to={to} subject={subject!r}")
        return None
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        eid = result.get("id") if isinstance(result, dict) else None
        logging.info(f"[email sent id={eid}] to={to} subject={subject!r}")
        return eid
    except Exception as e:
        logging.exception(f"Email send failed to={to} subject={subject!r}: {e}")
        return None


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
    package_id: Optional[str] = None
    custom_amount: Optional[float] = None
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
    receipt_available: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class MeResponse(BaseModel):
    user: dict


class PublicConfig(BaseModel):
    upi_id: str
    upi_payee_name: str


# ---------- Public config ----------
@api_router.get("/")
async def root():
    return {"message": "HopeBridge Foundation API is live"}


@api_router.get("/config", response_model=PublicConfig)
async def get_public_config():
    return PublicConfig(
        upi_id=os.environ.get("UPI_ID", "hopebridge@upi"),
        upi_payee_name=os.environ.get("UPI_PAYEE_NAME", "HopeBridge Foundation"),
    )


# ---------- Volunteers ----------
@api_router.post("/volunteers", response_model=Volunteer)
async def create_volunteer(payload: VolunteerCreate):
    vol = Volunteer(**payload.model_dump())
    await db.volunteers.insert_one(vol.model_dump())
    # Fire-and-forget welcome email
    html = f"""
    <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a'>
      <h2 style='color:#1d4ed8;margin:0 0 8px'>Welcome to HopeBridge, {vol.full_name}!</h2>
      <p>Thank you for signing up as a volunteer. Your interest in <b>{vol.area_of_interest}</b>
      helps us reach more communities in {vol.city}.</p>
      <p>Our volunteer coordinator will reach you at <b>{vol.phone}</b> within 3–5 business days.</p>
      <hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0'/>
      <p style='color:#64748b;font-size:13px'>With gratitude,<br/>HopeBridge Foundation</p>
    </div>
    """
    asyncio.create_task(send_email_safe(vol.email, "Welcome to HopeBridge — Volunteer confirmation", html))
    return vol


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
        "receipt_number": None,
        "receipted_at": None,
        "created_at": utcnow_iso(),
        "updated_at": utcnow_iso(),
    }
    await db.payment_transactions.insert_one(tx)
    return CheckoutCreateResponse(url=session.url, session_id=session.session_id)


async def _mark_paid_side_effects(session_id: str, tx: dict, amount_total: float) -> None:
    """One-time side effects when a transaction becomes paid: assign receipt#, send email."""
    if tx.get("receipt_number"):
        return
    year = datetime.now(timezone.utc).year
    count = await db.payment_transactions.count_documents({"receipt_number": {"$ne": None}})
    receipt_no = f"HB-{year}-{count + 1:05d}"
    await db.payment_transactions.update_one(
        {"session_id": session_id, "receipt_number": None},
        {"$set": {"receipt_number": receipt_no, "receipted_at": utcnow_iso()}},
    )
    donor_email = tx.get("donor_email") or ""
    if donor_email:
        html = f"""
        <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a'>
          <h2 style='color:#16a34a;margin:0 0 8px'>Thank you for your donation!</h2>
          <p>Dear {tx.get('donor_name') or 'Friend'},</p>
          <p>We received your donation of <b>₹{amount_total:.2f}</b>. Every rupee helps us reach more communities.</p>
          <p><b>Receipt #:</b> {receipt_no}</p>
          <p>Your 80G tax-exemption certificate is available inside your donation confirmation page.</p>
          <hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0'/>
          <p style='color:#64748b;font-size:13px'>With gratitude,<br/>HopeBridge Foundation</p>
        </div>
        """
        asyncio.create_task(send_email_safe(donor_email, f"Donation Receipt {receipt_no} — HopeBridge Foundation", html))


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
    status_resp: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    amount_total_units = float(status_resp.amount_total) / 100.0

    if tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": status_resp.status,
                    "payment_status": status_resp.payment_status,
                    "amount_total": amount_total_units,
                    "updated_at": utcnow_iso(),
                }
            },
        )
        if status_resp.payment_status == "paid":
            await _mark_paid_side_effects(session_id, tx, amount_total_units)
            tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})

    return CheckoutStatusOut(
        session_id=session_id,
        status=status_resp.status,
        payment_status=status_resp.payment_status,
        amount_total=amount_total_units,
        currency=status_resp.currency,
        receipt_available=bool(tx.get("receipt_number")),
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


# ---------- 80G Certificate PDF ----------
def _build_certificate_pdf(tx: dict) -> bytes:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor

    buf = io.BytesIO()
    W, H = A4
    c = canvas.Canvas(buf, pagesize=A4)

    # Header band
    c.setFillColor(HexColor("#1d4ed8"))
    c.rect(0, H - 30 * mm, W, 30 * mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 22)
    c.drawString(20 * mm, H - 18 * mm, "HopeBridge Foundation")
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, H - 25 * mm, "80G Donation Receipt & Tax Exemption Certificate")

    # Body
    c.setFillColor(HexColor("#0f172a"))
    y = H - 45 * mm
    c.setFont("Helvetica-Bold", 14)
    c.drawString(20 * mm, y, f"Receipt No: {tx.get('receipt_number', '—')}")
    y -= 8 * mm
    c.setFont("Helvetica", 11)
    c.drawString(20 * mm, y, f"Date: {tx.get('receipted_at', tx.get('updated_at', ''))[:19].replace('T', ' ')} UTC")

    y -= 15 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Received with gratitude from:")
    y -= 7 * mm
    c.setFont("Helvetica", 11)
    donor_name = tx.get("donor_name") or "Anonymous Donor"
    donor_email = tx.get("donor_email") or "—"
    c.drawString(20 * mm, y, f"Name: {donor_name}")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Email: {donor_email}")

    y -= 12 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Donation details:")
    y -= 7 * mm
    c.setFont("Helvetica", 11)
    amt = float(tx.get("amount_total", tx.get("amount", 0)) or 0)
    c.drawString(20 * mm, y, f"Amount: INR {amt:,.2f}")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Payment mode: Online — Stripe Checkout")
    y -= 6 * mm
    c.drawString(20 * mm, y, f"Session ID: {tx.get('session_id', '—')}")

    # Tax note
    y -= 18 * mm
    c.setFillColor(HexColor("#f1f5f9"))
    c.rect(15 * mm, y - 26 * mm, W - 30 * mm, 30 * mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y - 5 * mm, "Tax exemption")
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y - 12 * mm, f"Donations to HopeBridge Foundation are eligible for 50% deduction u/s 80G of the Income Tax Act, 1961.")
    c.drawString(20 * mm, y - 18 * mm, f"Reg. No: {ORG_REG_NUMBER}    PAN: {ORG_PAN}")
    c.drawString(20 * mm, y - 24 * mm, f"Address: {ORG_ADDRESS}")

    # Signatory
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(20 * mm, 30 * mm, ORG_SIGNATORY)
    c.setLineWidth(0.5)
    c.line(20 * mm, 34 * mm, 90 * mm, 34 * mm)
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(20 * mm, 20 * mm, "This is a system-generated receipt. Please retain for your records.")

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()


@api_router.get("/donations/certificate/{session_id}")
async def download_certificate(session_id: str):
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.get("payment_status") != "paid" or not tx.get("receipt_number"):
        raise HTTPException(status_code=400, detail="Certificate available only for successful donations")
    pdf_bytes = _build_certificate_pdf(tx)
    filename = f"HopeBridge-Receipt-{tx['receipt_number']}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------- Auth ----------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin["id"], admin["email"], admin.get("role", "admin"))
    return LoginResponse(
        access_token=token,
        user={"id": admin["id"], "email": admin["email"], "role": admin.get("role", "admin"), "name": admin.get("name", "Admin")},
    )


@api_router.get("/auth/me", response_model=MeResponse)
async def me(admin: dict = Depends(get_current_admin)):
    return MeResponse(user=admin)


# ---------- Admin dashboard ----------
@api_router.get("/admin/stats")
async def admin_stats(_admin: dict = Depends(get_current_admin)):
    vols = await db.volunteers.count_documents({})
    contacts = await db.contact_messages.count_documents({})
    subs = await db.newsletter.count_documents({})
    paid = await db.payment_transactions.count_documents({"payment_status": "paid"})
    initiated = await db.payment_transactions.count_documents({})
    total_amount = 0.0
    async for d in db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0, "amount_total": 1, "amount": 1}):
        total_amount += float(d.get("amount_total") or d.get("amount") or 0)
    return {
        "volunteers": vols,
        "contacts": contacts,
        "newsletter": subs,
        "donations_paid": paid,
        "donations_initiated": initiated,
        "total_amount_paid": round(total_amount, 2),
    }


@api_router.get("/admin/volunteers", response_model=List[Volunteer])
async def admin_volunteers(_admin: dict = Depends(get_current_admin)):
    return await db.volunteers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.get("/admin/contacts", response_model=List[ContactMessage])
async def admin_contacts(_admin: dict = Depends(get_current_admin)):
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.get("/admin/newsletter", response_model=List[NewsletterSub])
async def admin_newsletter(_admin: dict = Depends(get_current_admin)):
    return await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.get("/admin/donations")
async def admin_donations(_admin: dict = Depends(get_current_admin)):
    docs = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    # Seed admin (idempotent)
    email = ADMIN_EMAIL.lower().strip()
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": utcnow_iso(),
        })
        logging.info(f"Seeded admin user: {email}")
    else:
        # Update password if env changed
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.admins.update_one(
                {"email": email},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD), "updated_at": utcnow_iso()}},
            )
            logging.info(f"Rotated admin password for: {email}")


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
