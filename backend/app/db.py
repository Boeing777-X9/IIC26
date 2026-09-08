import os
import json
import logging
import hashlib
import secrets
from datetime import datetime
from typing import List, Dict, Any, Optional

DEFAULT_WORKER_PASSWORD = "retinix2026"

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(password: str, stored_hash: Optional[str]) -> bool:
    if not stored_hash or ":" not in stored_hash:
        return False
    try:
        salt, expected_hex = stored_hash.split(":", 1)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False

# Load environment variables from backend/.env or root
try:
    from dotenv import load_dotenv
    backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    atlas_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "atlas-credentials.env"))
    if os.path.exists(backend_env):
        load_dotenv(backend_env)
    elif os.path.exists(atlas_env):
        load_dotenv(atlas_env)
    else:
        load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("db")
logging.basicConfig(level=logging.INFO)

# MongoDB Configuration
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "retinix")

_mongo_client = None
_mongo_db = None
_use_mongodb = False

# SQLite Fallback path if MongoDB is not reachable
SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "retinix.db"))
if not os.path.exists(SQLITE_PATH):
    _legacy_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "retinagrid.db"))
    if os.path.exists(_legacy_db):
        SQLITE_PATH = _legacy_db

def sanitize_uri(uri: str) -> str:
    if "@" in uri:
        scheme = uri.split("://")[0] if "://" in uri else "mongodb+srv"
        host = uri.split("@")[-1].split("?")[0]
        return f"{scheme}://***:***@{host}"
    return uri

def get_db_status() -> Dict[str, Any]:
    global _use_mongodb, MONGODB_URI, MONGODB_DB_NAME
    return {
        "engine": "mongodb_atlas" if ("mongodb.net" in MONGODB_URI and _use_mongodb) else ("mongodb" if _use_mongodb else "sqlite_fallback"),
        "mongodb_uri": sanitize_uri(MONGODB_URI),
        "database": MONGODB_DB_NAME,
        "connected": _use_mongodb,
        "message": f"Connected to MongoDB Atlas ({MONGODB_DB_NAME})" if _use_mongodb else "MongoDB offline/unreachable; using local persistence"
    }

def init_db():
    global _mongo_client, _mongo_db, _use_mongodb, MONGODB_URI
    MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    _ensure_sqlite_schema()
    try:
        from pymongo import MongoClient
        logger.info(f"Connecting to MongoDB at {sanitize_uri(MONGODB_URI)} (timeout 5s)...")
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        _mongo_client = client
        _mongo_db = client[MONGODB_DB_NAME]
        _use_mongodb = True
        logger.info(f"✓ Connected to MongoDB database: '{MONGODB_DB_NAME}'")

        # Create indexes
        _mongo_db.workers.create_index("id", unique=True)
        _mongo_db.patients.create_index("id", unique=True)
        _mongo_db.screenings.create_index("id", unique=True)
        _mongo_db.referrals.create_index("id", unique=True)

        # Seed default worker only if no workers exist in the database
        default_pwd_hash = hash_password(DEFAULT_WORKER_PASSWORD)
        if _mongo_db.workers.count_documents({}) == 0:
            _mongo_db.workers.insert_one({
                "id": "HW-101",
                "name": "Priya Venkat",
                "email": "priya.venkat@health.gov.in",
                "phone": "+91 94451 23098",
                "role_title": "Primary Health Screener",
                "clinic": "CHC Tirunelveli",
                "status": "active",
                "permissions": {
                    "can_screen": True,
                    "can_refer": True,
                    "can_register_patients": True,
                    "can_view_all_patients": True,
                    "can_override_priority": True,
                    "can_export_data": True,
                    "allowed_locations": ["Tirunelveli", "Alangulam", "Tenkasi"]
                },
                "password_hash": default_pwd_hash,
                "created_at": datetime.now().isoformat()
            })
            logger.info("Seeded initial healthcare worker Priya Venkat in MongoDB.")
        else:
            # Backfill any existing workers missing a password_hash
            _mongo_db.workers.update_many(
                {"password_hash": {"$exists": False}},
                {"$set": {"password_hash": default_pwd_hash}}
            )

        # Do not seed mock patients automatically to allow a clean slate

        return True
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Falling back to local SQLite engine...")
        _use_mongodb = False
        _init_sqlite_fallback()
        return False


def _ensure_sqlite_schema():
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
        role_title TEXT NOT NULL, clinic TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
        permissions TEXT NOT NULL, created_at TEXT NOT NULL, password_hash TEXT
    )""")
    cursor.execute("PRAGMA table_info(workers)")
    cols = [col[1] for col in cursor.fetchall()]
    if "password_hash" not in cols:
        cursor.execute("ALTER TABLE workers ADD COLUMN password_hash TEXT")
        cursor.execute("UPDATE workers SET password_hash = ?", (hash_password(DEFAULT_WORKER_PASSWORD),))
        conn.commit()
    conn.close()

def _init_sqlite_fallback():
    _ensure_sqlite_schema()
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, diabetes_duration INTEGER NOT NULL,
        village TEXT NOT NULL, contact TEXT NOT NULL, registered_by TEXT DEFAULT 'Staff', created_at TEXT NOT NULL
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS screenings (
        id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, worker_id TEXT NOT NULL, worker_name TEXT NOT NULL,
        date TEXT NOT NULL, eye TEXT NOT NULL, grade INTEGER NOT NULL, stage TEXT NOT NULL, title TEXT NOT NULL,
        risk TEXT NOT NULL, priority TEXT NOT NULL, confidence REAL NOT NULL, probabilities TEXT NOT NULL,
        findings TEXT NOT NULL, recommendation TEXT NOT NULL, referral_status TEXT, created_at TEXT NOT NULL
    )""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY, screening_id TEXT NOT NULL, patient_id TEXT NOT NULL, worker_id TEXT NOT NULL,
        date TEXT NOT NULL, risk TEXT NOT NULL, confidence REAL NOT NULL, priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', worker_notes TEXT DEFAULT '', doctor_notes TEXT DEFAULT '',
        doctor_review TEXT DEFAULT '', review_date TEXT DEFAULT '', grade INTEGER DEFAULT 0, stage_title TEXT DEFAULT '',
        probabilities TEXT DEFAULT '[]', recommendation TEXT DEFAULT '', findings TEXT DEFAULT '[]', created_at TEXT NOT NULL
    )""")
    cursor.execute("SELECT COUNT(*) FROM workers")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """INSERT INTO workers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("HW-101", "Priya Venkat", "priya.venkat@health.gov.in", "+91 94451 23098",
             "Primary Health Screener", "CHC Tirunelveli", "active",
             json.dumps({
                 "can_screen": True, "can_refer": True, "can_register_patients": True,
                 "can_view_all_patients": True, "can_override_priority": True, "can_export_data": True,
                 "allowed_locations": ["Tirunelveli", "Alangulam", "Tenkasi"]
             }), datetime.now().isoformat())
        )
    conn.commit()
    conn.close()


# ================= Workers CRUD & Authentication =================

def get_all_workers() -> List[Dict[str, Any]]:
    if _use_mongodb:
        docs = list(_mongo_db.workers.find({}, {"_id": 0, "password_hash": 0}))
        return docs
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM workers ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["permissions"] = json.loads(d["permissions"])
        d.pop("password_hash", None)
        result.append(d)
    return result

def get_worker_by_id(worker_id: str, include_password: bool = False) -> Optional[Dict[str, Any]]:
    projection = {"_id": 0}
    if not include_password:
        projection["password_hash"] = 0
    if _use_mongodb:
        return _mongo_db.workers.find_one({"id": worker_id}, projection)
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM workers WHERE id = ?", (worker_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["permissions"] = json.loads(d["permissions"])
    if not include_password:
        d.pop("password_hash", None)
    return d

def create_worker(data: Dict[str, Any]) -> Dict[str, Any]:
    created_at = datetime.now().isoformat()
    permissions = data.get("permissions", {
        "can_screen": True,
        "can_refer": True,
        "can_register_patients": True,
        "can_view_all_patients": False,
        "can_override_priority": False,
        "can_export_data": False,
        "allowed_locations": [data.get("clinic", "")]
    })

    password = data.get("password") or DEFAULT_WORKER_PASSWORD
    password_hash = hash_password(password)

    record = {
        "id": data["id"],
        "name": data["name"],
        "email": data["email"],
        "phone": data["phone"],
        "role_title": data["role_title"],
        "clinic": data["clinic"],
        "status": data.get("status", "active"),
        "permissions": permissions,
        "password_hash": password_hash,
        "created_at": created_at
    }

    if _use_mongodb:
        _mongo_db.workers.insert_one(record)
        return get_worker_by_id(data["id"])

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute(
        """INSERT INTO workers (id, name, email, phone, role_title, clinic, status, permissions, created_at, password_hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (record["id"], record["name"], record["email"], record["phone"], record["role_title"],
         record["clinic"], record["status"], json.dumps(record["permissions"]), record["created_at"], record["password_hash"])
    )
    conn.commit()
    conn.close()
    return get_worker_by_id(data["id"])

def update_worker(worker_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    current = get_worker_by_id(worker_id, include_password=True)
    if not current:
        return None

    name = data.get("name", current["name"])
    email = data.get("email", current["email"])
    phone = data.get("phone", current["phone"])
    role_title = data.get("role_title", current["role_title"])
    clinic = data.get("clinic", current["clinic"])
    status = data.get("status", current["status"])
    permissions = data.get("permissions", current["permissions"])

    new_password = data.get("password")
    new_password_hash = hash_password(new_password) if new_password and new_password.strip() else current.get("password_hash")

    if _use_mongodb:
        update_doc = {
            "name": name, "email": email, "phone": phone,
            "role_title": role_title, "clinic": clinic, "status": status,
            "permissions": permissions
        }
        if new_password and new_password.strip():
            update_doc["password_hash"] = new_password_hash
        _mongo_db.workers.update_one({"id": worker_id}, {"$set": update_doc})
        return get_worker_by_id(worker_id)

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute(
        """UPDATE workers SET name = ?, email = ?, phone = ?, role_title = ?, clinic = ?, status = ?, permissions = ?, password_hash = ?
           WHERE id = ?""",
        (name, email, phone, role_title, clinic, status, json.dumps(permissions), new_password_hash, worker_id)
    )
    conn.commit()
    conn.close()
    return get_worker_by_id(worker_id)

def authenticate_worker(login: str, password: str) -> Optional[Dict[str, Any]]:
    login = (login or "").strip()
    password = (password or "").strip()
    if not login or not password:
        return None

    worker = None
    if _use_mongodb:
        # Search by id (case-insensitive), email (case-insensitive), or exact phone
        worker = _mongo_db.workers.find_one({
            "$or": [
                {"id": {"$regex": f"^{login}$", "$options": "i"}},
                {"email": {"$regex": f"^{login}$", "$options": "i"}},
                {"phone": login}
            ]
        }, {"_id": 0})
    else:
        import sqlite3
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM workers WHERE LOWER(id) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ?",
            (login, login, login)
        ).fetchone()
        conn.close()
        if row:
            worker = dict(row)
            worker["permissions"] = json.loads(worker["permissions"])

    if not worker:
        return None

    stored_hash = worker.get("password_hash")
    if not verify_password(password, stored_hash):
        return None

    if worker.get("status") == "suspended":
        return {
            "suspended": True,
            "id": worker["id"],
            "name": worker["name"],
            "message": "Healthcare worker account is suspended. Contact the supervising ophthalmologist."
        }

    worker.pop("password_hash", None)
    return worker

def delete_worker(worker_id: str) -> bool:
    if _use_mongodb:
        _mongo_db.workers.delete_one({"id": worker_id})
        return True
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute("DELETE FROM workers WHERE id = ?", (worker_id,))
    conn.commit()
    conn.close()
    return True


# ================= Patients CRUD =================

def get_all_patients() -> List[Dict[str, Any]]:
    if _use_mongodb:
        return list(_mongo_db.patients.find({}, {"_id": 0}))
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM patients ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
    if _use_mongodb:
        return _mongo_db.patients.find_one({"id": patient_id}, {"_id": 0})
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_patient(data: Dict[str, Any]) -> Dict[str, Any]:
    created_at = datetime.now().isoformat()
    record = {
        "id": data["id"],
        "name": data["name"],
        "age": int(data["age"]),
        "diabetes_duration": int(data["diabetes_duration"]),
        "village": data["village"],
        "contact": data["contact"],
        "registered_by": data.get("registered_by", "Staff"),
        "created_at": created_at
    }

    if _use_mongodb:
        _mongo_db.patients.insert_one(record)
        return get_patient_by_id(data["id"])

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute(
        """INSERT INTO patients (id, name, age, diabetes_duration, village, contact, registered_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (record["id"], record["name"], record["age"], record["diabetes_duration"],
         record["village"], record["contact"], record["registered_by"], record["created_at"])
    )
    conn.commit()
    conn.close()
    return get_patient_by_id(data["id"])


def delete_patient(patient_id: str) -> bool:
    if _use_mongodb:
        res = _mongo_db.patients.delete_one({"id": patient_id})
        _mongo_db.screenings.delete_many({"patient_id": patient_id})
        _mongo_db.referrals.delete_many({"patient_id": patient_id})
        return res.deleted_count > 0

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    deleted = cursor.rowcount > 0
    cursor.execute("DELETE FROM screenings WHERE patient_id = ?", (patient_id,))
    cursor.execute("DELETE FROM referrals WHERE patient_id = ?", (patient_id,))
    conn.commit()
    conn.close()
    return deleted


def delete_all_patients() -> int:
    if _use_mongodb:
        res = _mongo_db.patients.delete_many({})
        _mongo_db.screenings.delete_many({})
        _mongo_db.referrals.delete_many({})
        return res.deleted_count

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients")
    count = cursor.rowcount
    cursor.execute("DELETE FROM screenings")
    cursor.execute("DELETE FROM referrals")
    conn.commit()
    conn.close()
    return count


# ================= Screenings CRUD (NO RAW IMAGES STORED) =================

def get_all_screenings() -> List[Dict[str, Any]]:
    if _use_mongodb:
        return list(_mongo_db.screenings.find({}, {"_id": 0}))
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM screenings ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["probabilities"] = json.loads(d["probabilities"])
        d["findings"] = json.loads(d["findings"])
        result.append(d)
    return result

def create_screening(data: Dict[str, Any]) -> Dict[str, Any]:
    created_at = datetime.now().isoformat()
    probs = data.get("probabilities", [])
    findings = data.get("findings", [])

    record = {
        "id": data["id"],
        "patient_id": data["patient_id"],
        "worker_id": data.get("worker_id", "HW-101"),
        "worker_name": data.get("worker_name", "Staff"),
        "date": data["date"],
        "eye": data["eye"],
        "grade": int(data["grade"]),
        "stage": data["stage"],
        "title": data["title"],
        "risk": data["risk"],
        "priority": data["priority"],
        "confidence": float(data["confidence"]),
        "probabilities": probs,
        "findings": findings,
        "recommendation": data["recommendation"],
        "referral_status": data.get("referral_status"),
        "created_at": created_at
    }

    if _use_mongodb:
        _mongo_db.screenings.insert_one(record)
        return data

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute(
        """INSERT INTO screenings (id, patient_id, worker_id, worker_name, date, eye, grade, stage, title,
                                  risk, priority, confidence, probabilities, findings, recommendation, referral_status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (record["id"], record["patient_id"], record["worker_id"], record["worker_name"],
         record["date"], record["eye"], record["grade"], record["stage"], record["title"],
         record["risk"], record["priority"], record["confidence"], json.dumps(probs),
         json.dumps(findings), record["recommendation"], record["referral_status"], record["created_at"])
    )
    conn.commit()
    conn.close()
    return data


# ================= Referrals CRUD =================

def get_all_referrals() -> List[Dict[str, Any]]:
    if _use_mongodb:
        return list(_mongo_db.referrals.find({}, {"_id": 0}))
    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM referrals ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["probabilities"] = json.loads(d["probabilities"]) if d.get("probabilities") else []
        d["findings"] = json.loads(d["findings"]) if d.get("findings") else []
        result.append(d)
    return result

def create_referral(data: Dict[str, Any]) -> Dict[str, Any]:
    created_at = datetime.now().isoformat()
    probs = data.get("probabilities", [])
    findings = data.get("findings", [])

    record = {
        "id": data["id"],
        "screening_id": data["screening_id"],
        "patient_id": data["patient_id"],
        "worker_id": data.get("worker_id", "HW-101"),
        "date": data["date"],
        "risk": data["risk"],
        "confidence": float(data["confidence"]),
        "priority": data["priority"],
        "status": data.get("status", "pending"),
        "worker_notes": data.get("worker_notes", ""),
        "doctor_notes": data.get("doctor_notes", ""),
        "doctor_review": data.get("doctor_review", ""),
        "review_date": data.get("review_date", ""),
        "grade": data.get("grade", 0),
        "stage_title": data.get("stage_title", ""),
        "probabilities": probs,
        "recommendation": data.get("recommendation", ""),
        "findings": findings,
        "created_at": created_at
    }

    if _use_mongodb:
        _mongo_db.referrals.insert_one(record)
        _mongo_db.screenings.update_one(
            {"id": data["screening_id"]},
            {"$set": {"referral_status": data.get("status", "pending")}}
        )
        return data

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.execute(
        """INSERT INTO referrals (id, screening_id, patient_id, worker_id, date, risk, confidence, priority,
                                 status, worker_notes, doctor_notes, doctor_review, review_date, grade, stage_title,
                                 probabilities, recommendation, findings, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (record["id"], record["screening_id"], record["patient_id"], record["worker_id"],
         record["date"], record["risk"], record["confidence"], record["priority"],
         record["status"], record["worker_notes"], record["doctor_notes"],
         record["doctor_review"], record["review_date"], record["grade"],
         record["stage_title"], json.dumps(probs), record["recommendation"], json.dumps(findings), record["created_at"])
    )
    conn.execute(
        "UPDATE screenings SET referral_status = ? WHERE id = ?",
        (data.get("status", "pending"), data["screening_id"])
    )
    conn.commit()
    conn.close()
    return data

def update_referral(referral_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if _use_mongodb:
        curr = _mongo_db.referrals.find_one({"id": referral_id})
        if not curr:
            return None
        status = updates.get("status", curr["status"])
        doctor_notes = updates.get("doctor_notes", curr.get("doctor_notes", ""))
        doctor_review = updates.get("doctor_review", curr.get("doctor_review", ""))
        review_date = updates.get("review_date", curr.get("review_date") or datetime.now().strftime("%Y-%m-%d"))

        _mongo_db.referrals.update_one(
            {"id": referral_id},
            {"$set": {
                "status": status, "doctor_notes": doctor_notes,
                "doctor_review": doctor_review, "review_date": review_date
            }}
        )
        _mongo_db.screenings.update_one(
            {"id": curr["screening_id"]},
            {"$set": {"referral_status": status}}
        )
        return _mongo_db.referrals.find_one({"id": referral_id}, {"_id": 0})

    import sqlite3
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM referrals WHERE id = ?", (referral_id,)).fetchone()
    if not row:
        conn.close()
        return None

    current = dict(row)
    status = updates.get("status", current["status"])
    doctor_notes = updates.get("doctor_notes", current["doctor_notes"])
    doctor_review = updates.get("doctor_review", current["doctor_review"])
    review_date = updates.get("review_date", current["review_date"] or datetime.now().strftime("%Y-%m-%d"))

    conn.execute(
        """UPDATE referrals SET status = ?, doctor_notes = ?, doctor_review = ?, review_date = ?
           WHERE id = ?""",
        (status, doctor_notes, doctor_review, review_date, referral_id)
    )
    conn.execute(
        "UPDATE screenings SET referral_status = ? WHERE id = ?",
        (status, current["screening_id"])
    )
    conn.commit()
    conn.close()

    conn2 = sqlite3.connect(SQLITE_PATH)
    conn2.row_factory = sqlite3.Row
    updated = conn2.execute("SELECT * FROM referrals WHERE id = ?", (referral_id,)).fetchone()
    conn2.close()
    res = dict(updated)
    res["probabilities"] = json.loads(res["probabilities"]) if res.get("probabilities") else []
    res["findings"] = json.loads(res["findings"]) if res.get("findings") else []
    return res
