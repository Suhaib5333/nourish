import { motion } from 'framer-motion';

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: '#E8E2DB',
        borderRadius: 'var(--radius-sm)',
        padding: 3,
        marginBottom: 16,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            position: 'relative',
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            color: value === opt.value ? 'var(--bark)' : 'var(--stone)',
            backgroundColor: 'transparent',
            borderRadius: 6,
            zIndex: 1,
            transition: 'color 0.2s',
          }}
        >
          {value === opt.value && (
            <motion.div
              layoutId="segment-indicator"
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--white)',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                zIndex: -1,
              }}
            />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
