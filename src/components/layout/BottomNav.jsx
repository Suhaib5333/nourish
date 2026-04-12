import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Compass, MapPin, BrickWall, CloudSun, Trophy } from 'lucide-react';

const TABS = [
  { path: '/home', label: 'Home', Icon: Compass },
  { path: '/foods', label: 'Foods', Icon: MapPin },
  { path: '/journey', label: 'Journey', Icon: BrickWall },
  { path: '/log', label: 'Log', Icon: CloudSun },
  { path: '/wins', label: 'Wins', Icon: Trophy },
];

export default function BottomNav() {
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
      {TABS.map(({ path, label, Icon }) => {
        const active = location.pathname.startsWith(path);
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
              padding: '4px 12px',
              opacity: active ? 1 : 0.4,
              transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} color={active ? 'var(--sage)' : 'var(--bark)'} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: active ? 'var(--sage)' : 'var(--bark)',
                letterSpacing: 0.3,
              }}
            >
              {label}
            </span>
            {active && (
              <motion.div
                layoutId="nav-indicator"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                style={{
                  position: 'absolute',
                  top: -7,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: 'var(--sage)',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
