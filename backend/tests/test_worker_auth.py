import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db import DEFAULT_WORKER_PASSWORD, create_worker, delete_worker

class TestWorkerAuthentication(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.db import init_db, get_worker_by_id, create_worker
        init_db()
        if not get_worker_by_id("HW-AUTH-TEST"):
            create_worker({
                "id": "HW-AUTH-TEST",
                "name": "Auth Tester",
                "email": "authtester@health.gov.in",
                "phone": "+91 91111 22222",
                "role_title": "Tester",
                "clinic": "Test Clinic",
                "password": DEFAULT_WORKER_PASSWORD,
                "permissions": {"can_screen": True}
            })

    def setUp(self):
        self.client = TestClient(app)

    def test_login_success_with_id(self):
        response = self.client.post("/api/auth/worker/login", json={
            "login": "HW-AUTH-TEST",
            "password": DEFAULT_WORKER_PASSWORD
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["worker"]["id"], "HW-AUTH-TEST")
        self.assertNotIn("password_hash", data["worker"])

    def test_login_success_with_email(self):
        response = self.client.post("/api/auth/worker/login", json={
            "login": "authtester@health.gov.in",
            "password": DEFAULT_WORKER_PASSWORD
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["worker"]["id"], "HW-AUTH-TEST")

    def test_login_invalid_password(self):
        response = self.client.post("/api/auth/worker/login", json={
            "login": "HW-AUTH-TEST",
            "password": "incorrect_password_123"
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid credentials", response.json()["detail"])

    def test_login_nonexistent_worker(self):
        response = self.client.post("/api/auth/worker/login", json={
            "login": "HW-DOESNOTEXIST-999",
            "password": "some_password"
        })
        self.assertEqual(response.status_code, 401)

    def test_login_suspended_worker(self):
        test_id = "HW-SUSPENDED-01"
        delete_worker(test_id)
        try:
            create_worker({
                "id": test_id,
                "name": "Suspended Screener",
                "email": "suspended@health.gov.in",
                "phone": "+91 91111 22222",
                "role_title": "Field Screener",
                "clinic": "CHC Suspended",
                "status": "suspended",
                "password": "valid_password_123"
            })
            response = self.client.post("/api/auth/worker/login", json={
                "login": test_id,
                "password": "valid_password_123"
            })
            self.assertEqual(response.status_code, 403)
            self.assertIn("suspended", response.json()["detail"].lower())
        finally:
            delete_worker(test_id)

    def test_custom_worker_registration_and_login(self):
        test_id = "HW-TEST-99"
        delete_worker(test_id)
        try:
            # 1. Register new worker with custom password
            reg_response = self.client.post("/api/workers", json={
                "id": test_id,
                "name": "Dr. Testing Worker",
                "email": "test.worker@health.gov.in",
                "phone": "+91 99999 88888",
                "role_title": "Field Technician",
                "clinic": "CHC Test",
                "password": "custom_secure_password_456",
                "permissions": {
                    "can_screen": True,
                    "can_refer": False,
                    "can_register_patients": True
                }
            })
            self.assertEqual(reg_response.status_code, 201)
            worker_data = reg_response.json()
            self.assertEqual(worker_data["id"], test_id)
            self.assertNotIn("password_hash", worker_data)

            # 2. Login with custom password
            login_response = self.client.post("/api/auth/worker/login", json={
                "login": test_id,
                "password": "custom_secure_password_456"
            })
            self.assertEqual(login_response.status_code, 200)
            token = login_response.json()["token"]

            # 3. Verify me endpoint
            me_response = self.client.get(f"/api/auth/worker/me?token={token}")
            self.assertEqual(me_response.status_code, 200)
            self.assertEqual(me_response.json()["worker"]["name"], "Dr. Testing Worker")
            self.assertFalse(me_response.json()["worker"]["permissions"]["can_refer"])
        finally:
            delete_worker(test_id)

if __name__ == "__main__":
    unittest.main()
