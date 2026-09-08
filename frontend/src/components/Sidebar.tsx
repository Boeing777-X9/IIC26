import { NavLink, useNavigate } from "react-router-dom";
import { Eye, LayoutDashboard, UserPlus, Users, History, Send, BarChart2, Settings, LogOut, Stethoscope, ClipboardList, ChevronRight } from "lucide-react";

type Role = "worker" | "doctor";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const workerNav: NavItem[] = [
  { to: "/health-worker", icon: <LayoutDashboard size={16} />, label: "Overview" },
  { to: "/health-worker/screening/new", icon: <UserPlus size={16} />, label: "New Screening" },
  { to: "/health-worker/patients", icon: <Users size={16} />, label: "Patients" },
  { to: "/health-worker/history", icon: <History size={16} />, label: "Screening History" },
  { to: "/health-worker/referrals", icon: <Send size={16} />, label: "Referrals" },
  { to: "/health-worker/settings", icon: <Settings size={16} />, label: "Settings" },
];

const doctorNav: NavItem[] = [
  { to: "/doctor", icon: <LayoutDashboard size={16} />, label: "Overview" },
  { to: "/doctor/cases", icon: <ClipboardList size={16} />, label: "Cases Awaiting Review" },
  { to: "/doctor/patients", icon: <Users size={16} />, label: "Patients" },
  { to: "/doctor/history", icon: <History size={16} />, label: "Screening History" },
  { to: "/doctor/reviewed", icon: <Stethoscope size={16} />, label: "Reviewed Cases" },
  { to: "/doctor/analytics", icon: <BarChart2 size={16} />, label: "Analytics" },
  { to: "/doctor/settings", icon: <Settings size={16} />, label: "Settings" },
];

interface Props {
  role: Role;
}

export default function Sidebar({ role }: Props) {
  const navigate = useNavigate();
  const nav = role === "worker" ? workerNav : doctorNav;
  const label = role === "worker" ? "Healthcare Worker" : "Ophthalmologist";
  const initial = role === "worker" ? "PV" : "DR";
  const name = role === "worker" ? "Priya Venkat" : "Dr. Arjun Rao";

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Eye size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">RetinaGrid</span>
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-slate-100">
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{label}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {nav.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/health-worker" || item.to === "/doctor"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={12} className="ml-auto text-emerald-500" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            title="Sign out"
            className="ml-auto text-slate-300 hover:text-slate-600 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
