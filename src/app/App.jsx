import { Routes, Route, Navigate } from 'react-router';
import { useRole } from '../context/RoleContext';
import AppShell from '../components/layout/AppShell';
import RoleSelect from '../features/auth/RoleSelect';
import HomePage from '../features/home/HomePage';
import FoodsPage from '../features/food-map/FoodsPage';
import JourneyPage from '../features/bridge-foods/JourneyPage';
import LogPage from '../features/triggers/LogPage';
import WinsPage from '../features/wins/WinsPage';
import TherapistDashboard from '../features/therapist/TherapistDashboard';
import PatientTimeline from '../features/therapist/PatientTimeline';
import TherapistAnalysis from '../features/therapist/TherapistAnalysis';
import TherapistPlan from '../features/therapist/TherapistPlan';
import SessionNotes from '../features/therapist/SessionNotes';
import PatientData from '../features/therapist/PatientData';

function PatientGuard({ children }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/" replace />;
  if (role !== 'patient') return <Navigate to="/therapist" replace />;
  return children;
}

function TherapistGuard({ children }) {
  const { role, pinVerified } = useRole();
  if (!role) return <Navigate to="/" replace />;
  if (role !== 'therapist') return <Navigate to="/" replace />;
  if (!pinVerified) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { role, pinVerified } = useRole();

  const getHomeRedirect = () => {
    if (role === 'therapist' && pinVerified) return '/therapist';
    if (role === 'patient') return '/home';
    return null;
  };

  const homeRedirect = getHomeRedirect();

  return (
    <Routes>
      <Route path="/" element={homeRedirect ? <Navigate to={homeRedirect} replace /> : <RoleSelect />} />

      {/* Patient routes */}
      <Route element={<PatientGuard><AppShell /></PatientGuard>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/wins" element={<WinsPage />} />
      </Route>

      {/* Therapist routes */}
      <Route element={<TherapistGuard><AppShell /></TherapistGuard>}>
        <Route path="/therapist" element={<TherapistDashboard />} />
        <Route path="/therapist/timeline" element={<PatientTimeline />} />
        <Route path="/therapist/analysis" element={<TherapistAnalysis />} />
        <Route path="/therapist/plan" element={<TherapistPlan />} />
        <Route path="/therapist/data" element={<PatientData />} />
        <Route path="/therapist/notes" element={<SessionNotes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
