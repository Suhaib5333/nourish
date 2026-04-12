import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 480,
              zIndex: 1001,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                width: '100%',
                backgroundColor: 'var(--white)',
                borderRadius: '20px 20px 0 0',
                padding: '8px 20px 32px',
                maxHeight: '85vh',
                overflowY: 'auto',
                pointerEvents: 'auto',
              }}
            >
            <div
              style={{
                width: 36,
                height: 4,
                backgroundColor: 'var(--sand)',
                borderRadius: 2,
                margin: '0 auto 16px',
              }}
            />
            {title && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    color: 'var(--bark)',
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  style={{
                    fontSize: 20,
                    color: 'var(--stone)',
                    padding: 4,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
