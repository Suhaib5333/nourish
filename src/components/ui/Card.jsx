import { motion } from 'framer-motion';

export default function Card({ children, style, onClick, animate = true }) {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', duration: 0.4, bounce: 0.15 },
      }
    : {};

  return (
    <Comp
      {...animProps}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        marginBottom: 10,
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </Comp>
  );
}
