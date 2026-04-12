import { motion } from 'framer-motion';

const variants = {
  primary: {
    backgroundColor: 'var(--sage)',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#F0EBE5',
    color: 'var(--bark)',
  },
  danger: {
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--sage)',
  },
};

export default function Button({ children, variant = 'primary', style, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{
        ...variants[variant],
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 18px',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
