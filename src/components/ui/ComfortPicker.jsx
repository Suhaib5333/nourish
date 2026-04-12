import { motion } from 'framer-motion';

const LEVELS = [1, 2, 3, 4, 5];

export default function ComfortPicker({ value, onChange, label }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {LEVELS.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(n)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${value === n ? 'var(--sage)' : 'var(--sand)'}`,
              backgroundColor: value === n ? 'var(--sage)' : 'var(--white)',
              color: value === n ? '#fff' : 'var(--bark)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {n}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
