import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmText = 'Confirm', danger = false }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                margin: 20,
                maxWidth: 320,
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--stone)', margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} style={{ flex: 1 }}>
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
