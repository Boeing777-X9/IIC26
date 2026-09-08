"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import { 
  Search, 
  User, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  AlertCircle, 
  ShieldAlert, 
  X, 
  ArrowRight,
  Activity,
  Trash2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import { 
  Patient, 
  Screening, 
  Worker, 
  getActiveWorker, 
  fetchPatientsApi, 
  createPatientApi, 
  deletePatientApi,
  deleteAllPatientsApi,
  fetchScreeningsApi 
} from "@/lib/store";

export default function Patients({ role = "worker" }: { role?: "worker" | "doctor" }) {
  const navigate = useNavigate();
  const [activeWorker, setActiveWorkerState] = useState<Worker | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("all");

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newVillage, setNewVillage] = useState("");
  const [newContact, setNewContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    const worker = getActiveWorker();
    setActiveWorkerState(worker);

    Promise.all([fetchPatientsApi(), fetchScreeningsApi()]).then(([pts, scs]) => {
      setPatients(pts);
      setScreenings(scs);
      setLoading(false);
    });
  }, []);

  const canRegister = activeWorker?.permissions?.can_register_patients ?? true;
  const canViewAll = activeWorker?.permissions?.can_view_all_patients ?? true;
  const allowedLocations = activeWorker?.permissions?.allowed_locations ?? [];

  // Filter patients based on location permissions and search
  const visiblePatients = patients.filter(p => {
    if (!canViewAll && allowedLocations.length > 0) {
      if (!allowedLocations.some(loc => loc.toLowerCase() === p.village.toLowerCase())) {
        return false;
      }
    }
    if (villageFilter !== "all" && p.village.toLowerCase() !== villageFilter.toLowerCase()) {
      return false;
    }
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      (p.contact && p.contact.includes(q))
    );
  });

  const uniqueVillages = Array.from(new Set(patients.map(p => p.village))).filter(Boolean);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAge.trim() || !newDuration.trim() || !newVillage.trim()) {
      setRegError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setRegError(null);

    try {
      const idNumber = Math.floor(1000 + Math.random() * 9000);
      const newPatient: Patient = {
        id: `P-${idNumber}`,
        name: newName.trim(),
        age: parseInt(newAge) || 45,
        diabetes_duration: parseInt(newDuration) || 0,
        village: newVillage.trim(),
        contact: newContact.trim() || "+91 90000 00000",
        registered_by: activeWorker?.name || "Healthcare Screener",
        created_at: new Date().toISOString()
      };

      const created = await createPatientApi(newPatient);
      setPatients(prev => [created, ...prev]);
      setShowRegisterModal(false);
      setNewName("");
      setNewAge("");
      setNewDuration("");
      setNewVillage("");
      setNewContact("");
    } catch (err) {
      setRegError("Failed to register patient. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Patient Directory" subtitle="Active patient roster & clinical histories" role={role} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header controls & Banner */}
          {!canViewAll && allowedLocations.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Restricted Location Scope:</strong> Your account is restricted by the Root Doctor to:{" "}
                <span className="font-semibold">{allowedLocations.join(", ")}</span>.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search and Filter */}
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  placeholder="Search by name, ID, village, or contact..."
                />
              </div>
              <select
                value={villageFilter}
                onChange={e => setVillageFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 shadow-sm"
              >
                <option value="all">All Villages ({uniqueVillages.length})</option>
                {uniqueVillages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {patients.length > 0 && (
                <button
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to remove all ${patients.length} patients and their associated records? This cannot be undone.`)) {
                      await deleteAllPatientsApi();
                      setPatients([]);
                      setScreenings([]);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  title="Remove all patient records"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              )}

              {/* Register Patient Button */}
              {canRegister ? (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all shrink-0"
                >
                  <Plus size={16} />
                  <span>Register New Patient</span>
                </button>
              ) : (
                <div 
                  title="Root Doctor has not granted you permission to register new patients"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs rounded-xl cursor-not-allowed shrink-0"
                >
                  <AlertCircle size={14} />
                  <span>Registration Restricted</span>
                </div>
              )}
            </div>
          </div>

          {/* Patient Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mr-2" />
              Loading patient records from database...
            </div>
          ) : visiblePatients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto my-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <User size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">No Patients Found</h3>
              <p className="text-xs text-slate-400 mb-4">
                {search || villageFilter !== "all" 
                  ? "Try changing your search keywords or village filter." 
                  : "No registered patients in the database. Register a new patient to begin screenings."}
              </p>
              {canRegister && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-xl"
                >
                  <Plus size={14} />
                  Register First Patient
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePatients.map(p => {
                const pScreenings = screenings.filter(s => s.patient_id === p.id || (s as any).patientId === p.id);
                const latest = pScreenings[0];
                const duration = p.diabetes_duration ?? (p as any).diabetesDuration ?? 0;

                return (
                  <div 
                    key={p.id} 
                    className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{p.id}</p>
                          </div>
                        </div>
                        {latest && <RiskBadge risk={latest.risk} size="sm" />}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 my-3">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>Age {p.age} · Diabetes for {duration} yrs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{p.village}</span>
                        </div>
                        {p.contact && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{p.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Activity size={12} className="text-emerald-500" />
                        <span>{pScreenings.length} screening{pScreenings.length !== 1 ? "s" : ""}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete patient ${p.name} (${p.id}) and all their screenings?`)) {
                              await deletePatientApi(p.id);
                              setPatients(prev => prev.filter(x => x.id !== p.id));
                              setScreenings(prev => prev.filter(x => x.patient_id !== p.id && (x as any).patientId !== p.id));
                            }
                          }}
                          title="Delete patient"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>

                        <button
                          onClick={() => navigate("/health-worker/screening/new")}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <span>Screen</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Register New Patient</h3>
                <p className="text-xs text-slate-500">Record demographic and clinical profile</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="p-6 space-y-4">
              {regError && (
                <div className="text-xs bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramanathan K."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 58"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diabetes Yrs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="80"
                    placeholder="e.g. 10"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Village / Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tirunelveli Rural"
                  value={newVillage}
                  onChange={e => setNewVillage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98401 23456"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
