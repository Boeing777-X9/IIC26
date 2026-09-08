"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, Shield, CheckCircle2, XCircle, Edit3, Trash2,
  Database, MapPin, Phone, Mail, Stethoscope, Search, AlertCircle, Eye, Send, FileText, Check
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  Worker,
  WorkerPermissions,
  fetchWorkersApi,
  createWorkerApi,
  updateWorkerApi,
  deleteWorkerApi,
  fetchDbStatusApi,
  generateId,
  getWorkers
} from "@/lib/store";

const DEFAULT_PERMISSIONS: WorkerPermissions = {
  can_screen: true,
  can_refer: true,
  can_register_patients: true,
  can_view_all_patients: false,
  can_override_priority: false,
  can_export_data: true,
  allowed_locations: ["Tirunelveli"]
};

export default function WorkersManagement() {
  const [workers, setWorkers] = useState<Worker[]>(getWorkers());
  const [dbStatus, setDbStatus] = useState<{ engine: string; connected: boolean; database: string; message: string }>({
    engine: "loading...",
    connected: false,
    database: "retinagrid",
    message: "Checking database..."
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form State
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("Primary Health Screener");
  const [formClinic, setFormClinic] = useState("CHC Tirunelveli");
  const [formLocations, setFormLocations] = useState("Tirunelveli, Madurai");
  const [formPermissions, setFormPermissions] = useState<WorkerPermissions>(DEFAULT_PERMISSIONS);
  const [formStatus, setFormStatus] = useState<"active" | "suspended">("active");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkersApi().then(setWorkers);
    fetchDbStatusApi().then(setDbStatus);
  }, []);

  const openAddModal = () => {
    setEditingWorker(null);
    setFormId(generateId("HW"));
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Primary Health Screener");
    setFormClinic("CHC Tirunelveli");
    setFormLocations("Tirunelveli");
    setFormPermissions(DEFAULT_PERMISSIONS);
    setFormStatus("active");
    setShowModal(true);
  };

  const openEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormId(worker.id);
    setFormName(worker.name);
    setFormEmail(worker.email);
    setFormPhone(worker.phone);
    setFormRole(worker.role_title);
    setFormClinic(worker.clinic);
    setFormLocations((worker.permissions.allowed_locations || []).join(", "));
    setFormPermissions(worker.permissions);
    setFormStatus(worker.status);
    setShowModal(true);
  };

  const handleTogglePermission = (key: keyof Omit<WorkerPermissions, "allowed_locations">) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setIsSaving(true);
    const locations = formLocations
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Worker = {
      id: formId,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      role_title: formRole.trim(),
      clinic: formClinic.trim(),
      status: formStatus,
      permissions: {
        ...formPermissions,
        allowed_locations: locations.length > 0 ? locations : [formClinic]
      }
    };

    if (editingWorker) {
      const updated = await updateWorkerApi(editingWorker.id, payload);
      if (updated) {
        setWorkers(prev => prev.map(w => (w.id === updated.id ? updated : w)));
        setFeedbackMsg(`Updated permissions for ${updated.name}`);
      }
    } else {
      const created = await createWorkerApi(payload);
      setWorkers(prev => [created, ...prev.filter(w => w.id !== created.id)]);
      setFeedbackMsg(`Successfully registered ${created.name}`);
    }

    setIsSaving(false);
    setShowModal(false);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleStatus = async (worker: Worker) => {
    const newStatus = worker.status === "active" ? "suspended" : "active";
    const updated = await updateWorkerApi(worker.id, { status: newStatus });
    if (updated) {
      setWorkers(prev => prev.map(w => (w.id === updated.id ? updated : w)));
    }
  };

  const handleDelete = async (workerId: string) => {
    if (!confirm("Are you sure you want to deactivate and remove this healthcare worker?")) return;
    const ok = await deleteWorkerApi(workerId);
    if (ok) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      setFeedbackMsg("Healthcare worker access revoked.");
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = workers.filter(w => w.status === "active").length;
  const screenerCount = workers.filter(w => w.permissions.can_screen && w.status === "active").length;
  const referralCount = workers.filter(w => w.permissions.can_refer && w.status === "active").length;

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title="Root Doctors Portal"
          subtitle="Healthcare Worker Registry & Granular Access Governance"
          role="doctor"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Notification Alert */}
            {feedbackMsg && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 rounded-2xl px-5 py-3 text-emerald-900 text-sm animate-fade-in shadow-sm">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span className="font-medium">{feedbackMsg}</span>
              </div>
            )}

            {/* Header + Stats Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-emerald-700">Root Governance</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
                    <Database size={11} className={dbStatus.connected ? "text-emerald-500" : "text-amber-500"} />
                    <span className="capitalize">{dbStatus.engine}</span>: {dbStatus.database}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Healthcare Worker Portal & Permissions</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage authorized field screeners, govern access capabilities, and configure clinical screening boundaries.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm text-sm shrink-0"
              >
                <UserPlus size={16} /> Register Healthcare Worker
              </button>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Registered Staff</p>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-slate-900">{workers.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold">{activeCount} active</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Authorized Screeners</p>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-emerald-700">{screenerCount}</span>
                  <span className="text-xs text-slate-400">Can run PyTorch AI</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Referral Dispatches</p>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-blue-700">{referralCount}</span>
                  <span className="text-xs text-slate-400">Can flag to doctor</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Storage Policy</p>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-sm font-semibold text-slate-800">Metrics Only</span>
                  <span className="text-[11px] text-slate-400">Zero image persistence</span>
                </div>
              </div>
            </div>

            {/* Workers Table View */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by worker name, clinic, or ID..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  Showing {filteredWorkers.length} of {workers.length} registered workers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs font-medium uppercase tracking-wider text-left">
                      <th className="px-5 py-3.5">Healthcare Worker</th>
                      <th className="px-4 py-3.5">Clinic / Center</th>
                      <th className="px-4 py-3.5">Permissions Matrix</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkers.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {w.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{w.name}</span>
                                <span className="text-[11px] font-mono text-slate-400">{w.id}</span>
                              </div>
                              <p className="text-xs text-slate-500">{w.role_title}</p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1"><Mail size={10} /> {w.email}</span>
                                <span className="flex items-center gap-1"><Phone size={10} /> {w.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                            <MapPin size={13} className="text-slate-400" />
                            {w.clinic}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {(w.permissions.allowed_locations || []).join(", ") || "All"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {w.permissions.can_screen && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                                <Eye size={10} /> AI Screen
                              </span>
                            )}
                            {w.permissions.can_refer && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-1">
                                <Send size={10} /> Refer
                              </span>
                            )}
                            {w.permissions.can_register_patients && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                Register
                              </span>
                            )}
                            {w.permissions.can_view_all_patients && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                Cross-Clinic
                              </span>
                            )}
                            {w.permissions.can_override_priority && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-medium">
                                Priority Override
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleStatus(w)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 transition-all ${
                              w.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {w.status === "active" ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-600" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle size={12} className="text-slate-400" /> Suspended
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(w)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Edit worker & permissions"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(w.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete worker"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Registration & Permissions Manager Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <form onSubmit={handleSaveWorker} className="p-6 space-y-6">

              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingWorker ? "Edit Healthcare Worker & Permissions" : "Register Healthcare Worker"}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign role details and configure granular clinical actions for this staff member.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Identity Details */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Worker Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
                    <input
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Meenakshi Sundaram"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Staff ID</label>
                    <input
                      required
                      value={formId}
                      onChange={e => setFormId(e.target.value)}
                      placeholder="e.g. HW-102"
                      disabled={!!editingWorker}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 disabled:text-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="e.g. meenakshi@health.gov.in"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Phone Number</label>
                    <input
                      required
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 94876 12345"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Assigned Clinic / Health Center</label>
                    <input
                      required
                      value={formClinic}
                      onChange={e => setFormClinic(e.target.value)}
                      placeholder="e.g. PHC Madurai East"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Designation / Role Title</label>
                    <select
                      value={formRole}
                      onChange={e => setFormRole(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Primary Health Screener">Primary Health Screener</option>
                      <option value="Field Ophthalmic Assistant">Field Ophthalmic Assistant</option>
                      <option value="Community Health Officer (CHO)">Community Health Officer (CHO)</option>
                      <option value="Vision Center Technician">Vision Center Technician</option>
                      <option value="Senior Nurse Screener">Senior Nurse Screener</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Permissions Manager */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Permissions Governance</p>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    Strict Role-Based Access Control
                  </span>
                </div>

                <div className="space-y-2.5 bg-slate-50/70 border border-slate-200 rounded-xl p-4">

                  {/* Permission item 1 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Eye size={14} className="text-emerald-600" />
                        AI Retinal Screening Execution
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Authorizes worker to upload fundus images and run ResNet-152 deep learning inference.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_screen}
                      onChange={() => handleTogglePermission("can_screen")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <div className="border-t border-slate-200/60" />

                  {/* Permission item 2 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Send size={14} className="text-blue-600" />
                        Create Ophthalmology Referrals
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Authorizes dispatching high-risk/moderate cases directly to Dr. Arjun Rao’s review queue.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_refer}
                      onChange={() => handleTogglePermission("can_refer")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <div className="border-t border-slate-200/60" />

                  {/* Permission item 3 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Users size={14} className="text-slate-600" />
                        Register & Edit Patient Demographics
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Allows worker to register new diabetic patients and update clinical history.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_register_patients}
                      onChange={() => handleTogglePermission("can_register_patients")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <div className="border-t border-slate-200/60" />

                  {/* Permission item 4 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Shield size={14} className="text-purple-600" />
                        Cross-Clinic Patient Access
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Grants access to patient screening histories across all regional primary health centers.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_view_all_patients}
                      onChange={() => handleTogglePermission("can_view_all_patients")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <div className="border-t border-slate-200/60" />

                  {/* Permission item 5 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-red-600" />
                        Clinical Priority Override
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Allows worker to manually escalate routine cases to priority/urgent referral based on clinical observation.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_override_priority}
                      onChange={() => handleTogglePermission("can_override_priority")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <div className="border-t border-slate-200/60" />

                  {/* Permission item 6 */}
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-600" />
                        Data & Audit Log Export
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Authorizes exporting screening registries and statistical spreadsheets.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissions.can_export_data}
                      onChange={() => handleTogglePermission("can_export_data")}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Allowed Sub-Centers & Village Boundaries (Comma-separated)
                  </label>
                  <input
                    value={formLocations}
                    onChange={e => setFormLocations(e.target.value)}
                    placeholder="e.g. Tirunelveli, Alangulam, Tenkasi"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all"
                >
                  {isSaving ? "Saving..." : editingWorker ? "Save Permissions" : "Register Worker"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
