import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Landing from "./pages/Landing";
import ThemePreview from "./pages/ThemePreview";
import WorkerDashboard from "./pages/HealthWorker/Dashboard";
import NewScreening from "./pages/HealthWorker/NewScreening";
import Patients from "./pages/HealthWorker/Patients";
import Referrals from "./pages/HealthWorker/Referrals";
import History from "./pages/HealthWorker/History";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import Cases from "./pages/Doctor/Cases";
import CaseReview from "./pages/Doctor/CaseReview";
import Analytics from "./pages/Doctor/Analytics";
import Settings from "./pages/Settings";

function RootHandler() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  if (role === "worker") {
    return <Navigate to="/health-worker" replace />;
  }
  if (role === "doctor") {
    return <Navigate to="/doctor" replace />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootHandler />} />

        {/* Healthcare Worker */}
        <Route path="/health-worker" element={<WorkerDashboard />} />
        <Route path="/health-worker/screening/new" element={<NewScreening />} />
        <Route path="/health-worker/patients" element={<Patients />} />
        <Route path="/health-worker/history" element={<History />} />
        <Route path="/health-worker/referrals" element={<Referrals />} />
        <Route path="/health-worker/settings" element={<Settings role="worker" />} />

        {/* Doctor */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/cases" element={<Cases />} />
        <Route path="/doctor/cases/:id" element={<CaseReview />} />
        <Route path="/doctor/patients" element={<Patients />} />
        <Route path="/doctor/history" element={<History />} />
        <Route path="/doctor/reviewed" element={<Cases />} />
        <Route path="/doctor/analytics" element={<Analytics />} />
        <Route path="/doctor/settings" element={<Settings role="doctor" />} />

        <Route path="/themes" element={<ThemePreview />} />

        {/* Compatibility Aliases */}
        <Route path="/worker" element={<Navigate to="/health-worker" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/abdm" element={<Navigate to="/health-worker/history" replace />} />
        <Route path="/audit" element={<Navigate to="/doctor/analytics" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
