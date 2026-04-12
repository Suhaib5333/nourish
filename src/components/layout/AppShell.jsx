import { Outlet } from 'react-router';
import { useRole } from '../../context/RoleContext';
import BottomNav from './BottomNav';
import TherapistNav from './TherapistNav';
import Badge from '../ui/Badge';

export default function AppShell() {
  const { role, switchRole } = useRole();
  const isTherapist = role === 'therapist';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minHeight: '100dvh', position: 'relative', overflowX: 'hidden', maxWidth: 480, margin: '0 auto' }}>
      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid #E8E2DB',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--bark)' }}>
            🍃 Nourish
          </span>
          <Badge
            text={isTherapist ? 'Fatima' : 'Suhaib'}
            color={isTherapist ? '#7B68A8' : 'var(--sage)'}
          />
        </div>
        <button
          onClick={switchRole}
          style={{
            fontSize: 12,
            color: 'var(--stone)',
            border: '1px solid var(--sand)',
            borderRadius: 6,
            padding: '4px 10px',
            fontWeight: 600,
          }}
        >
          Switch
        </button>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '16px 16px 100px', overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      {isTherapist ? <TherapistNav /> : <BottomNav />}
    </div>
  );
}
