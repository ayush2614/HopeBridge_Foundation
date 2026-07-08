"""HopeBridge Foundation backend tests (iteration 2 - includes auth/admin/config/cert)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://impact-bridge-org.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@hopebridge.org"
ADMIN_PASSWORD = "HopeBridge@2026"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(client):
    """Login once at module scope and return the JWT."""
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Root ----------
class TestRoot:
    def test_root_message(self, client):
        r = client.get(f"{API}/", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "HopeBridge" in data.get("message", "")


# ---------- Public config (iteration 2) ----------
class TestPublicConfig:
    def test_get_config_shape_and_values(self, client):
        r = client.get(f"{API}/config", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("upi_id") == "hopebridge@upi"
        assert isinstance(data.get("upi_payee_name"), str) and len(data["upi_payee_name"]) > 0
        # No secrets/db keys leaked
        assert "password" not in data
        assert "jwt" not in {k.lower() for k in data.keys()}


# ---------- Auth (iteration 2) ----------
class TestAuth:
    def test_login_success_returns_token_and_user(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data.get("access_token"), str) and len(data["access_token"]) > 20
        assert data.get("token_type") == "bearer"
        user = data.get("user") or {}
        assert user.get("email") == ADMIN_EMAIL
        assert user.get("role") == "admin"
        assert isinstance(user.get("id"), str)
        # No sensitive fields
        assert "password" not in user and "password_hash" not in user

    def test_login_wrong_password(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password!!"}, timeout=30)
        assert r.status_code == 401
        assert r.json().get("detail") == "Invalid email or password"

    def test_login_unknown_user(self, client):
        r = client.post(f"{API}/auth/login", json={"email": "nope@example.com", "password": "whatever"}, timeout=30)
        assert r.status_code == 401
        assert r.json().get("detail") == "Invalid email or password"

    def test_me_without_token(self, client):
        r = requests.get(f"{API}/auth/me", timeout=30)  # no session (no default header)
        assert r.status_code == 401

    def test_me_with_valid_token(self, client, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        user = data.get("user") or {}
        assert user.get("email") == ADMIN_EMAIL
        assert user.get("role") == "admin"
        assert "password_hash" not in user

    def test_me_invalid_token(self, client):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not-a-real-token"}, timeout=30)
        assert r.status_code == 401


# ---------- Admin (iteration 2) ----------
class TestAdmin:
    @pytest.mark.parametrize("path", ["/admin/stats", "/admin/volunteers", "/admin/contacts", "/admin/newsletter", "/admin/donations"])
    def test_admin_requires_auth(self, client, path):
        r = requests.get(f"{API}{path}", timeout=30)
        assert r.status_code == 401

    def test_admin_stats_with_token(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("volunteers", "contacts", "newsletter", "donations_paid", "donations_initiated", "total_amount_paid"):
            assert k in d, f"missing key {k}"
        assert isinstance(d["volunteers"], int)
        assert isinstance(d["contacts"], int)
        assert isinstance(d["newsletter"], int)
        assert isinstance(d["donations_paid"], int)
        assert isinstance(d["donations_initiated"], int)
        assert isinstance(d["total_amount_paid"], (int, float))

    def test_admin_volunteers_list_and_no_mongo_id(self, auth_headers, client):
        # Seed one volunteer first
        email = f"test_vol_admin_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "full_name": "TEST_AdminVol",
            "email": email,
            "phone": "+91 9876543210",
            "city": "Delhi",
            "area_of_interest": "Health Care",
            "message": "iter2",
        }
        r = client.post(f"{API}/volunteers", json=payload, timeout=30)
        assert r.status_code == 200, r.text

        r2 = requests.get(f"{API}/admin/volunteers", headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        rows = r2.json()
        assert isinstance(rows, list)
        emails = [row.get("email") for row in rows]
        assert email in emails
        # No mongo _id leak
        for row in rows:
            assert "_id" not in row

    def test_admin_contacts_endpoint(self, auth_headers):
        r = requests.get(f"{API}/admin/contacts", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_newsletter_endpoint(self, auth_headers):
        r = requests.get(f"{API}/admin/newsletter", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_donations_endpoint(self, auth_headers):
        r = requests.get(f"{API}/admin/donations", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list)
        for d in docs:
            assert "_id" not in d


# ---------- Volunteers (regression + email side-effect no-crash) ----------
class TestVolunteers:
    def test_create_volunteer_and_persist(self, client):
        payload = {
            "full_name": "TEST_Volunteer Jane",
            "email": f"test_vol_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+91 9876543210",
            "city": "Mumbai",
            "area_of_interest": "Education",
            "message": "Excited to join!",
        }
        r = client.post(f"{API}/volunteers", json=payload, timeout=30)
        # even with RESEND_API_KEY empty, request must succeed
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        assert "id" in data
        assert "_id" not in data

    def test_create_volunteer_invalid_email(self, client):
        payload = {
            "full_name": "TEST_Bad", "email": "not-an-email",
            "phone": "1234", "city": "X", "area_of_interest": "Education",
        }
        r = client.post(f"{API}/volunteers", json=payload, timeout=30)
        assert r.status_code == 422


# ---------- Contact (regression) ----------
class TestContact:
    def test_create_contact(self, client):
        payload = {
            "name": "TEST_Contact",
            "email": f"test_contact_{uuid.uuid4().hex[:8]}@example.com",
            "subject": "Hello",
            "message": "This is a test message",
        }
        r = client.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == payload["email"]


# ---------- Newsletter (regression + idempotency) ----------
class TestNewsletter:
    def test_subscribe_and_idempotent(self, client):
        email = f"test_nl_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r.status_code == 200
        first_id = r.json()["id"]
        r2 = client.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["id"] == first_id


# ---------- Donations (regression Stripe + iteration-2 certificate paths) ----------
class TestDonations:
    def test_checkout_supporter_pkg(self, client):
        payload = {"package_id": "supporter", "donor_name": "TEST", "donor_email": "t@x.com", "origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].startswith("https://checkout.stripe.com")
        assert isinstance(data["session_id"], str) and len(data["session_id"]) > 0

    def test_checkout_invalid_package(self, client):
        r = client.post(f"{API}/donations/checkout", json={"package_id": "bogus", "origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 400

    def test_checkout_custom_below_min(self, client):
        r = client.post(f"{API}/donations/checkout", json={"custom_amount": 50, "origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 400

    def test_status_nonexistent_session(self, client):
        r = client.get(f"{API}/donations/status/cs_test_nonexistent_xyz123", timeout=30)
        assert r.status_code == 404

    # ----- iteration 2: certificate PDF endpoint -----
    def test_certificate_not_found(self, client):
        r = client.get(f"{API}/donations/certificate/cs_test_does_not_exist_{uuid.uuid4().hex[:6]}", timeout=30)
        assert r.status_code == 404
        assert r.json().get("detail") == "Transaction not found"

    def test_certificate_not_paid_returns_400(self, client):
        # Create a fresh (unpaid) checkout session first
        payload = {"package_id": "friend", "donor_name": "TEST_CertUnpaid", "donor_email": "cert@test.com", "origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=60)
        assert r.status_code == 200
        sid = r.json()["session_id"]

        # Now hit certificate for an unpaid session -> expect 400
        r2 = client.get(f"{API}/donations/certificate/{sid}", timeout=30)
        assert r2.status_code == 400, r2.text
        assert "successful donations" in r2.json().get("detail", "").lower() or \
               "certificate" in r2.json().get("detail", "").lower()

    def test_certificate_pdf_when_paid(self, client):
        """Simulate a paid transaction directly via a helper that patches DB.
        We do this by inserting a synthetic paid tx via a debug flow — since none exists,
        we skip if we can't manipulate DB from tests. Instead, we validate the code path
        via /admin/donations for any already-paid entry."""
        # Try admin list; if any 'paid' row with receipt_number exists, exercise PDF endpoint
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        token = r.json()["access_token"]
        r2 = requests.get(f"{API}/admin/donations", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r2.status_code == 200
        paid = [d for d in r2.json() if d.get("payment_status") == "paid" and d.get("receipt_number")]
        if not paid:
            pytest.skip("No paid transactions in DB to verify PDF binary; error paths validated separately")
        sid = paid[0]["session_id"]
        r3 = client.get(f"{API}/donations/certificate/{sid}", timeout=30)
        assert r3.status_code == 200
        assert r3.headers.get("content-type", "").startswith("application/pdf")
        assert r3.content[:4] == b"%PDF"
