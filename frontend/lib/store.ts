// Demo state management - localStorage backed with SSR guard for Next.js

export type RiskLevel = "low" | "moderate" | "high";
export type ReferralStatus = "pending" | "viewed" | "under-review" | "reviewed" | "follow-up";
export type ReviewStatus = "awaiting" | "reviewed" | "follow-up";

export interface Patient {
  id: string;
  name: string;
  age: number;
  diabetesDuration: number;
  village: string;
  contact: string;
}

export interface Screening {
  id: string;
  patientId: string;
  date: string;
  eye: "left" | "right";
  risk: RiskLevel;
  confidence: number;
  referralStatus: ReferralStatus | null;
  notes?: string;
  workerName: string;
}

export interface Referral {
  id: string;
  screeningId: string;
  patientId: string;
  date: string;
  risk: RiskLevel;
  confidence: number;
  priority: "routine" | "urgent" | "priority";
  status: ReferralStatus;
  workerNotes?: string;
  doctorNotes?: string;
  doctorReview?: string;
  reviewDate?: string;
}

const SEED_PATIENTS: Patient[] = [
  { id: "PT-2401", name: "Lakshmi Devi", age: 58, diabetesDuration: 12, village: "Tirunelveli", contact: "+91 94123 45678" },
  { id: "PT-2402", name: "Rajan Krishnamurthy", age: 63, diabetesDuration: 8, village: "Madurai", contact: "+91 98765 12345" },
  { id: "PT-2403", name: "Saraswathi Nair", age: 51, diabetesDuration: 5, village: "Coimbatore", contact: "+91 91234 67890" },
  { id: "PT-2404", name: "Murugesan Pillai", age: 71, diabetesDuration: 15, village: "Salem", contact: "+91 87654 32109" },
  { id: "PT-2405", name: "Kamala Sundaram", age: 45, diabetesDuration: 3, village: "Vellore", contact: "+91 99876 54321" },
  { id: "PT-2406", name: "Selvam Arumugam", age: 66, diabetesDuration: 11, village: "Thanjavur", contact: "+91 93210 98765" },
];

const SEED_SCREENINGS: Screening[] = [
  { id: "SCR-001", patientId: "PT-2401", date: "2026-09-08", eye: "right", risk: "high", confidence: 91, referralStatus: "pending", workerName: "Priya Venkat" },
  { id: "SCR-002", patientId: "PT-2402", date: "2026-09-08", eye: "left", risk: "moderate", confidence: 78, referralStatus: "viewed", workerName: "Priya Venkat" },
  { id: "SCR-003", patientId: "PT-2403", date: "2026-09-07", eye: "right", risk: "low", confidence: 94, referralStatus: null, workerName: "Priya Venkat" },
  { id: "SCR-004", patientId: "PT-2404", date: "2026-09-06", eye: "right", risk: "high", confidence: 88, referralStatus: "reviewed", workerName: "Priya Venkat" },
  { id: "SCR-005", patientId: "PT-2405", date: "2026-09-05", eye: "left", risk: "low", confidence: 96, referralStatus: null, workerName: "Priya Venkat" },
  { id: "SCR-006", patientId: "PT-2406", date: "2026-09-04", eye: "right", risk: "moderate", confidence: 72, referralStatus: "under-review", workerName: "Priya Venkat" },
];

const SEED_REFERRALS: Referral[] = [
  { id: "REF-001", screeningId: "SCR-001", patientId: "PT-2401", date: "2026-09-08", risk: "high", confidence: 91, priority: "priority", status: "pending" },
  { id: "REF-002", screeningId: "SCR-002", patientId: "PT-2402", date: "2026-09-08", risk: "moderate", confidence: 78, priority: "urgent", status: "viewed" },
  { id: "REF-003", screeningId: "SCR-004", patientId: "PT-2404", date: "2026-09-06", risk: "high", confidence: 88, priority: "priority", status: "reviewed", doctorNotes: "Confirmed proliferative changes. Laser treatment advised. Follow-up in 4 weeks.", reviewDate: "2026-09-07" },
  { id: "REF-004", screeningId: "SCR-006", patientId: "PT-2406", date: "2026-09-04", risk: "moderate", confidence: 72, priority: "urgent", status: "under-review" },
];

function loadState<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    localStorage.setItem(key, JSON.stringify(seed));
  } catch {}
  return seed;
}

function saveState<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function getPatients(): Patient[] {
  return loadState("retina_patients", SEED_PATIENTS);
}

export function getScreenings(): Screening[] {
  return loadState("retina_screenings", SEED_SCREENINGS);
}

export function getReferrals(): Referral[] {
  return loadState("retina_referrals", SEED_REFERRALS);
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

export function getScreening(id: string): Screening | undefined {
  return getScreenings().find(s => s.id === id);
}

export function getReferral(id: string): Referral | undefined {
  return getReferrals().find(r => r.id === id);
}

export function addScreening(s: Screening): void {
  const screenings = getScreenings();
  screenings.unshift(s);
  saveState("retina_screenings", screenings);
}

export function addReferral(r: Referral): void {
  const referrals = getReferrals();
  referrals.unshift(r);
  saveState("retina_referrals", referrals);

  const screenings = getScreenings();
  const idx = screenings.findIndex(s => s.id === r.screeningId);
  if (idx >= 0) {
    screenings[idx].referralStatus = r.status;
    saveState("retina_screenings", screenings);
  }
}

export function updateReferral(id: string, updates: Partial<Referral>): void {
  const referrals = getReferrals();
  const idx = referrals.findIndex(r => r.id === id);
  if (idx >= 0) {
    referrals[idx] = { ...referrals[idx], ...updates };
    saveState("retina_referrals", referrals);

    const screenings = getScreenings();
    const sidx = screenings.findIndex(s => s.id === referrals[idx].screeningId);
    if (sidx >= 0) {
      screenings[sidx].referralStatus = referrals[idx].status;
      saveState("retina_screenings", screenings);
    }
  }
}

export function addPatient(p: Patient): void {
  const patients = getPatients();
  patients.unshift(p);
  saveState("retina_patients", patients);
}

export function resetStore(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("retina_patients");
    localStorage.removeItem("retina_screenings");
    localStorage.removeItem("retina_referrals");
  } catch {}
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
