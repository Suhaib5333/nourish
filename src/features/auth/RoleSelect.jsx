import { motion } from 'framer-motion';
import { useRole } from '../../context/RoleContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export default function RoleSelect() {
  const { setRole, verifyPin } = useRole();
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const selectPatient = () => {
    setRole('patient');
    navigate('/home');
  };

  const selectTherapist = () => {
    const hasPin = localStorage.getItem('nourish-therapist-pin');
    if (!hasPin) {
      setShowPin(true);
    } else {
      setShowPin(true);
    }
  };

  const submitPin = () => {
    if (pin.length < 4) return;
    const ok = verifyPin(pin);
    if (ok) {
      setRole('therapist');
      navigate('/therapist');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
      setPin('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--cream)',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4, delay: 0.1 }}
          style={{ fontSize: 64, marginBottom: 8 }}
        >
          🍃
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            color: 'var(--bark)',
            margin: 0,
            letterSpacing: -1,
          }}
        >
          Nourish
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 13,
            color: 'var(--stone)',
            marginTop: 4,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          ARFID Companion
        </motion.p>

        {!showPin ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={selectPatient}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '18px 20px',
                borderRadius: 14,
                border: '1.5px solid var(--sand)',
                backgroundColor: 'var(--white)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 28, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--sage-light)', borderRadius: 12 }}>
                🧑
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--bark)' }}>I'm Suhaib</strong>
                <span style={{ fontSize: 13, color: 'var(--stone)' }}>Log foods, triggers, and progress</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={selectTherapist}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '18px 20px',
                borderRadius: 14,
                border: '1.5px solid var(--sand)',
                backgroundColor: 'var(--white)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 28, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EBF5', borderRadius: 12 }}>
                👩‍⚕️
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--bark)' }}>I'm Fatima</strong>
                <span style={{ fontSize: 13, color: 'var(--stone)' }}>View data and guide treatment</span>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 48 }}
          >
            <p style={{ fontSize: 14, color: 'var(--stone)', marginBottom: 20 }}>
              {localStorage.getItem('nourish-therapist-pin')
                ? 'Enter your PIN to continue'
                : 'Set a 4-digit PIN for therapist access'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={pinError ? { x: [-4, 4, -4, 4, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    border: `2px solid ${pinError ? 'var(--danger)' : pin.length > i ? 'var(--sage)' : 'var(--sand)'}`,
                    backgroundColor: pin.length > i ? 'var(--sage-light)' : 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--bark)',
                    transition: 'all 0.2s',
                  }}
                >
                  {pin[i] ? '•' : ''}
                </motion.div>
              ))}
            </div>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const v = e.target.value.slice(0, 4);
                setPin(v);
                if (v.length === 4) {
                  setTimeout(() => {
                    const ok = verifyPin(v);
                    if (ok) {
                      setRole('therapist');
                      navigate('/therapist');
                    } else {
                      setPinError(true);
                      setTimeout(() => setPinError(false), 1500);
                      setPin('');
                    }
                  }, 200);
                }
              }}
              autoFocus
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 240, margin: '0 auto' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((n, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (n === null) return;
                    if (n === 'del') {
                      setPin((p) => p.slice(0, -1));
                    } else if (pin.length < 4) {
                      const next = pin + n;
                      setPin(next);
                      if (next.length === 4) {
                        setTimeout(() => {
                          const ok = verifyPin(next);
                          if (ok) {
                            setRole('therapist');
                            navigate('/therapist');
                          } else {
                            setPinError(true);
                            setTimeout(() => setPinError(false), 1500);
                            setPin('');
                          }
                        }, 200);
                      }
                    }
                  }}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: n === null ? 'transparent' : '#F0EBE5',
                    fontSize: n === 'del' ? 14 : 20,
                    fontWeight: 600,
                    color: 'var(--bark)',
                    cursor: n === null ? 'default' : 'pointer',
                  }}
                >
                  {n === null ? '' : n === 'del' ? '⌫' : n}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => { setShowPin(false); setPin(''); }}
              style={{ marginTop: 20, fontSize: 13, color: 'var(--stone)', fontWeight: 600 }}
            >
              ← Back
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
