import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LayoutDashboard, Clock, BarChart3, Route, StickyNote } from 'lucide-react';

const TABS = [
  { path: '/therapist', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { path: '/therapist/timeline', label: 'Timeline', Icon: Clock },
  { path: '/therapist/analysis', label: 'Analysis', Icon: BarChart3 },
  { path: '/therapist/plan', label: 'Plan', Icon: Route },
  { path: '/therapist/notes', label: 'Notes', Icon: StickyNote },
];

export default function TherapistNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'var(--white)',
        borderTop: '1px solid #E8E2DB',
        padding: '6px 0 calc(10px + var(--safe-bottom))',
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 100,
      }}
    >
      {TABS.map(({ path, label, Icon, exact }) => {
        const active = exact
          ? location.pathname === path
          : location.pathname.startsWith(path);
        return (
          <motion.button
            key={path}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 8px',
              opacity: active ? 1 : 0.4,
              transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} color={active ? '#7B68A8' : 'var(--bark)'} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: active ? '#7B68A8' : 'var(--bark)',
                letterSpacing: 0.3,
              }}
            >
              {label}
            </span>
            {active && (
              <motion.div
                layoutId="therapist-nav-indicator"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                style={{
                  position: 'absolute',
                  top: -7,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: '#7B68A8',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
