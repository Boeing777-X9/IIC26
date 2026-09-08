// RetinaGrid Clinical Store — Connected to FastAPI / MongoDB Backend
// With localStorage cache for immediate offline responsiveness

export type RiskLevel = "low" | "moderate" | "high";
export type ReferralStatus = "pending" | "viewed" | "under-review" | "reviewed" | "follow-up";
export type ReviewStatus = "awaiting" | "reviewed" | "follow-up";

export interface WorkerPermissions {
  can_screen: boolean;
  can_refer: boolean;
  can_register_patients: boolean;
  can_view_all_patients: boolean;
  can_override_priority: boolean;
  can_export_data: boolean;
  allowed_locations: string[];
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_title: string;
  clinic: string;
  status: "active" | "suspended";
  permissions: WorkerPermissions;
  created_at?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  diabetes_duration: number;
  village: string;
  contact: string;
  registered_by?: string;
  created_at?: string;
}

export interface ProbabilityItem {
  grade: number;
  name: string;
  probability: number;
  percentage: number;
}

export interface Screening {
  id: string;
  patient_id: string;
  worker_id: string;
  worker_name: string;
  date: string;
  eye: "left" | "right";
  grade: number;
  stage: string;
  title: string;
  risk: RiskLevel;
  priority: "routine" | "urgent" | "priority";
  confidence: number;
  probabilities: ProbabilityItem[];
  findings: string[];
  recommendation: string;
  referral_status?: ReferralStatus | null;
  created_at?: string;
  // NOTE: In compliance with storage policy, raw image blobs and heatmaps are NOT stored.
}

export interface Referral {
  id: string;
  screening_id: string;
  patient_id: string;
  worker_id: string;
  date: string;
  risk: RiskLevel;
  confidence: number;
  priority: "routine" | "urgent" | "priority";
  status: ReferralStatus;
  worker_notes?: string;
  doctor_notes?: string;
  doctor_review?: string;
  review_date?: string;
  grade?: number;
  stage_title?: string;
  probabilities?: ProbabilityItem[];
  recommendation?: string;
  findings?: string[];
  created_at?: string;
}

const API_BASE = "http://localhost:8000/api";

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function saveLocal<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ================= Active Worker State =================
export const DEFAULT_WORKER: Worker = {
  id: "HW-101",
  name: "Priya Venkat",
  email: "priya.venkat@health.gov.in",
  phone: "+91 94451 23098",
  role_title: "Primary Health Screener",
  clinic: "CHC Tirunelveli",
  status: "active",
  permissions: {
    can_screen: true,
    can_refer: true,
    can_register_patients: true,
    can_view_all_patients: true,
    can_override_priority: true,
    can_export_data: true,
    allowed_locations: ["Tirunelveli", "Alangulam", "Tenkasi"]
  }
};

export function getActiveWorker(): Worker {
  return loadLocal("retina_active_worker", DEFAULT_WORKER);
}

export function setActiveWorker(worker: Worker): void {
  saveLocal("retina_active_worker", worker);
}

// ================= Synchronized Data Access =================

export function getWorkers(): Worker[] {
  return loadLocal("retina_workers", [DEFAULT_WORKER]);
}

export function getPatients(): Patient[] {
  return loadLocal("retina_patients", []);
}

export function getScreenings(): Screening[] {
  return loadLocal("retina_screenings", []);
}

export function getReferrals(): Referral[] {
  return loadLocal("retina_referrals", []);
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

export function getReferral(id: string): Referral | undefined {
  return getReferrals().find(r => r.id === id);
}

export function getScreening(id: string): Screening | undefined {
  return getScreenings().find(s => s.id === id);
}

// ================= Async API Functions =================

export async function fetchWorkersApi(): Promise<Worker[]> {
  try {
    const res = await fetch(`${API_BASE}/workers`);
    if (res.ok) {
      const workers: Worker[] = await res.json();
      saveLocal("retina_workers", workers);
      return workers;
    }
  } catch (err) {
    console.warn("Using local workers cache (backend offline)", err);
  }
  return getWorkers();
}

export async function createWorkerApi(workerData: Worker): Promise<Worker> {
  const current = getWorkers();
  const updated = [workerData, ...current.filter(w => w.id !== workerData.id)];
  saveLocal("retina_workers", updated);

  try {
    const res = await fetch(`${API_BASE}/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Worker created locally (backend error)", err);
  }
  return workerData;
}

export async function updateWorkerApi(workerId: string, updates: Partial<Worker>): Promise<Worker | null> {
  const current = getWorkers();
  const idx = current.findIndex(w => w.id === workerId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...updates };
    saveLocal("retina_workers", current);

    // If active worker modified, update active worker in session
    const active = getActiveWorker();
    if (active.id === workerId) {
      setActiveWorker(current[idx]);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Worker updated locally (backend error)", err);
  }
  return current[idx] || null;
}

export async function deleteWorkerApi(workerId: string): Promise<boolean> {
  const current = getWorkers().filter(w => w.id !== workerId);
  saveLocal("retina_workers", current);

  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return true;
  }
}

export async function fetchPatientsApi(): Promise<Patient[]> {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (res.ok) {
      const data: Patient[] = await res.json();
      saveLocal("retina_patients", data);
      return data;
    }
  } catch (err) {
    console.warn("Using local patients cache", err);
  }
  return getPatients();
}

export async function createPatientApi(patientData: Patient): Promise<Patient> {
  const current = getPatients();
  saveLocal("retina_patients", [patientData, ...current]);

  try {
    await fetch(`${API_BASE}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData)
    });
  } catch (err) {
    console.warn("Patient saved locally", err);
  }
  return patientData;
}

export async function fetchScreeningsApi(): Promise<Screening[]> {
  try {
    const res = await fetch(`${API_BASE}/screenings`);
    if (res.ok) {
      const data: Screening[] = await res.json();
      saveLocal("retina_screenings", data);
      return data;
    }
  } catch (err) {
    console.warn("Using local screenings cache", err);
  }
  return getScreenings();
}

export async function createScreeningApi(s: Screening): Promise<Screening> {
  // Enforce storage policy: ensure no raw image blobs are saved to store
  const cleanScreening: Screening = {
    id: s.id,
    patient_id: s.patient_id,
    worker_id: s.worker_id,
    worker_name: s.worker_name,
    date: s.date,
    eye: s.eye,
    grade: s.grade,
    stage: s.stage,
    title: s.title,
    risk: s.risk,
    priority: s.priority,
    confidence: s.confidence,
    probabilities: s.probabilities,
    findings: s.findings,
    recommendation: s.recommendation,
    referral_status: s.referral_status,
    created_at: s.created_at || new Date().toISOString()
  };

  const list = getScreenings();
  saveLocal("retina_screenings", [cleanScreening, ...list]);

  try {
    await fetch(`${API_BASE}/screenings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanScreening)
    });
  } catch (err) {
    console.warn("Screening saved locally", err);
  }
  return cleanScreening;
}

export async function fetchReferralsApi(): Promise<Referral[]> {
  try {
    const res = await fetch(`${API_BASE}/referrals`);
    if (res.ok) {
      const data: Referral[] = await res.json();
      saveLocal("retina_referrals", data);
      return data;
    }
  } catch (err) {
    console.warn("Using local referrals cache", err);
  }
  return getReferrals();
}

export async function createReferralApi(r: Referral): Promise<Referral> {
  // Enforce storage policy: pure clinical data only
  const cleanReferral: Referral = {
    id: r.id,
    screening_id: r.screening_id,
    patient_id: r.patient_id,
    worker_id: r.worker_id,
    date: r.date,
    risk: r.risk,
    confidence: r.confidence,
    priority: r.priority,
    status: r.status,
    worker_notes: r.worker_notes,
    doctor_notes: r.doctor_notes,
    doctor_review: r.doctor_review,
    review_date: r.review_date,
    grade: r.grade,
    stage_title: r.stage_title,
    probabilities: r.probabilities,
    recommendation: r.recommendation,
    findings: r.findings,
    created_at: r.created_at || new Date().toISOString()
  };

  const list = getReferrals();
  saveLocal("retina_referrals", [cleanReferral, ...list]);

  try {
    await fetch(`${API_BASE}/referrals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanReferral)
    });
  } catch (err) {
    console.warn("Referral saved locally", err);
  }
  return cleanReferral;
}

export async function updateReferralApi(id: string, updates: Partial<Referral>): Promise<void> {
  const referrals = getReferrals();
  const idx = referrals.findIndex(r => r.id === id);
  if (idx >= 0) {
    referrals[idx] = { ...referrals[idx], ...updates };
    saveLocal("retina_referrals", referrals);
  }

  try {
    await fetch(`${API_BASE}/referrals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn("Referral updated locally", err);
  }
}

export async function fetchDbStatusApi(): Promise<{ engine: string; connected: boolean; database: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/db-status`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    engine: "offline",
    connected: false,
    database: "retinagrid",
    message: "Backend server unreachable"
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function resetStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("retina_workers");
    localStorage.removeItem("retina_patients");
    localStorage.removeItem("retina_screenings");
    localStorage.removeItem("retina_referrals");
    localStorage.removeItem("retina_active_worker");
  } catch {}
}

