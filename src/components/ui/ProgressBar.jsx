import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, color = 'var(--sage)', height = 6, style }) {
  return (
    <div
      style={{
        height,
        backgroundColor: '#E8E2DB',
        borderRadius: height / 2,
        overflow: 'hidden',
        ...style,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </div>
  );
}
