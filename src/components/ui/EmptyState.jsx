import { motion } from 'framer-motion';

export default function EmptyState({ icon, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        padding: '48px 24px',
      }}
    >
      <span style={{ fontSize: 56, display: 'block', marginBottom: 12 }}>{icon}</span>
      <p style={{ color: 'var(--stone)', fontSize: 14, lineHeight: 1.5, maxWidth: 240, margin: '0 auto' }}>
        {text}
      </p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </motion.div>
  );
}
