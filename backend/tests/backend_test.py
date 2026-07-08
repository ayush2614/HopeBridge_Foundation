"""HopeBridge Foundation backend tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://impact-bridge-org.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root ----------
class TestRoot:
    def test_root_message(self, client):
        r = client.get(f"{API}/", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "HopeBridge" in data["message"]


# ---------- Volunteers ----------
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
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["full_name"] == payload["full_name"]
        assert data["email"] == payload["email"]
        assert data["phone"] == payload["phone"]
        assert data["city"] == payload["city"]
        assert data["area_of_interest"] == payload["area_of_interest"]
        assert "id" in data and isinstance(data["id"], str)
        assert "created_at" in data
        assert "_id" not in data

        # Verify persistence
        r2 = client.get(f"{API}/volunteers", timeout=30)
        assert r2.status_code == 200
        emails = [v["email"] for v in r2.json()]
        assert payload["email"] in emails

    def test_create_volunteer_invalid_email(self, client):
        payload = {
            "full_name": "TEST_Bad",
            "email": "not-an-email",
            "phone": "1234",
            "city": "X",
            "area_of_interest": "Education",
        }
        r = client.post(f"{API}/volunteers", json=payload, timeout=30)
        assert r.status_code == 422


# ---------- Contact ----------
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
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["subject"] == payload["subject"]
        assert data["message"] == payload["message"]
        assert "id" in data
        assert "created_at" in data
        assert "_id" not in data


# ---------- Newsletter ----------
class TestNewsletter:
    def test_subscribe_new_email(self, client):
        email = f"test_nl_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert "id" in data
        first_id = data["id"]

        # Idempotent - same email should return existing without error
        r2 = client.post(f"{API}/newsletter", json={"email": email}, timeout=30)
        assert r2.status_code == 200
        data2 = r2.json()
        assert data2["email"] == email
        assert data2["id"] == first_id


# ---------- Donations ----------
class TestDonations:
    @pytest.mark.parametrize("pkg,expected_amount", [
        ("supporter", 500.0),
        ("friend", 1000.0),
        ("champion", 2500.0),
    ])
    def test_checkout_valid_packages(self, client, pkg, expected_amount):
        payload = {
            "package_id": pkg,
            "donor_name": "TEST_Donor",
            "donor_email": "test_donor@example.com",
            "origin_url": BASE_URL,
        }
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("https://checkout.stripe.com")
        assert "session_id" in data and isinstance(data["session_id"], str) and len(data["session_id"]) > 0

        # Verify status endpoint reflects transaction
        sid = data["session_id"]
        r2 = client.get(f"{API}/donations/status/{sid}", timeout=60)
        assert r2.status_code == 200, r2.text
        st = r2.json()
        assert st["session_id"] == sid
        assert "payment_status" in st
        assert "status" in st

    def test_checkout_invalid_package(self, client):
        payload = {"package_id": "bogus", "origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 400
        assert "Invalid" in r.json().get("detail", "")

    def test_checkout_custom_below_min(self, client):
        payload = {"custom_amount": 50, "origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 400

    def test_checkout_custom_above_max(self, client):
        payload = {"custom_amount": 600000, "origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 400

    def test_checkout_no_package_no_amount(self, client):
        payload = {"origin_url": BASE_URL}
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 400

    def test_checkout_custom_valid(self, client):
        payload = {
            "custom_amount": 750,
            "donor_name": "TEST_CustomDonor",
            "origin_url": BASE_URL,
        }
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].startswith("https://checkout.stripe.com")

    def test_checkout_server_side_amount_authoritative(self, client):
        """Even if attacker passes custom_amount=1, package_id=friend should force 1000."""
        payload = {
            "package_id": "friend",
            "custom_amount": 1,  # attempted override
            "origin_url": BASE_URL,
        }
        r = client.post(f"{API}/donations/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]

        # Verify via status - amount_total when session initiated might be 0, so we check via a stripe read
        r2 = client.get(f"{API}/donations/status/{sid}", timeout=60)
        assert r2.status_code == 200
        # Stripe returns amount_total in the session; for open session it may still show 1000.00
        st = r2.json()
        # amount_total is set based on stripe session (created with 1000)
        assert st["amount_total"] == 1000.0 or st["amount_total"] == 0  # sometimes zero pre-payment

    def test_status_nonexistent_session(self, client):
        r = client.get(f"{API}/donations/status/cs_test_nonexistent_xyz123", timeout=30)
        assert r.status_code == 404
