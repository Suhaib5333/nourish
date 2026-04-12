import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { uid } from '../../utils/uid';
import { daysAgo, formatShortDate, formatDate, formatTime } from '../../utils/dates';
import {
  Button,
  Card,
  BottomSheet,
  Input,
  Textarea,
  Select,
  Badge,
  ComfortPicker,
  EmptyState,
  SegmentedControl,
  ConfirmDialog,
} from '../../components/ui';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEGMENT_OPTIONS = [
  { value: 'bridges', label: 'Bridges' },
  { value: 'ladders', label: 'Ladders' },
];

const BRIDGE_STATUSES = {
  'not-tried': { label: 'Not tried', color: '#9E9E9E' },
  'in-progress': { label: 'In progress', color: 'var(--caution)' },
  accepted: { label: 'Accepted', color: 'var(--success)' },
  rejected: { label: 'Rejected', color: 'var(--danger)' },
  maybe: { label: 'Maybe', color: '#E8A317' },
};

const DEFAULT_LADDER_STEPS = [
  'Look at it',
  'Smell it',
  'Touch it',
  'Small taste',
];

const plankColor = (comfort) => {
  if (comfort <= 2) return '#DDD0B6';
  if (comfort === 3) return '#B8956A';
  return '#7A5C3A';
};

/* ------------------------------------------------------------------ */
/*  Bridge visual card                                                 */
/* ------------------------------------------------------------------ */

function BridgeCard({ bridge, onTap }) {
  const status = BRIDGE_STATUSES[bridge.status] || BRIDGE_STATUSES['not-tried'];
  const isFatima = bridge.suggestedBy === 'Fatima';

  return (
    <Card
      onClick={onTap}
      style={{
        padding: 0,
        overflow: 'hidden',
        border: isFatima ? '1.5px solid #C5AEE0' : '1.5px solid transparent',
        position: 'relative',
      }}
    >
      {isFatima && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontSize: 10,
            fontWeight: 700,
            color: '#8E6FBF',
            backgroundColor: '#F0EBF5',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            zIndex: 2,
          }}
        >
          Fatima suggests
        </div>
      )}

      {/* River scene */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #F5F0EB 0%, #D6ECF5 40%, #90C6E8 70%, #5DA8D4 100%)',
          padding: '18px 14px 14px',
          position: 'relative',
        }}
      >
        {/* Bridge visual row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
          {/* Left bank (safe food) */}
          <div
            style={{
              backgroundColor: '#6B8F71',
              borderRadius: '6px 6px 0 0',
              padding: '8px 10px',
              minWidth: 70,
              maxWidth: 100,
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.2, wordBreak: 'break-word' }}>
              {bridge.safeFoodName}
            </div>
          </div>

          {/* Planks */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'flex-end',
              gap: 2,
              padding: '0 2px',
              minHeight: 28,
            }}
          >
            {bridge.attempts && bridge.attempts.length > 0 ? (
              bridge.attempts.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', bounce: 0.3 }}
                  style={{
                    flex: 1,
                    maxWidth: 18,
                    height: 10,
                    backgroundColor: bridge.status === 'rejected' ? '#D32F2F' : plankColor(a.comfort),
                    borderRadius: 2,
                    transformOrigin: 'bottom',
                    opacity: bridge.status === 'rejected' ? 0.6 : 1,
                    transform: bridge.status === 'rejected' ? `rotate(${(i % 2 === 0 ? 1 : -1) * 12}deg)` : 'none',
                  }}
                />
              ))
            ) : (
              <div
                style={{
                  flex: 1,
                  height: 4,
                  borderBottom: '2px dashed #B0BEC5',
                  marginBottom: 3,
                }}
              />
            )}
          </div>

          {/* Right bank (new food) */}
          <div
            style={{
              backgroundColor: '#A8C5AE',
              borderRadius: '6px 6px 0 0',
              padding: '8px 10px',
              minWidth: 70,
              maxWidth: 100,
              textAlign: 'center',
              opacity: 0.85,
              zIndex: 1,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2D3A2E', lineHeight: 1.2, wordBreak: 'break-word' }}>
              {bridge.newFoodName}
            </div>
          </div>
        </div>

        {/* Water line */}
        <div
          style={{
            height: 6,
            background: 'linear-gradient(90deg, #5DA8D4, #7BAFD4, #5DA8D4)',
            borderRadius: 3,
            marginTop: -1,
          }}
        />
      </div>

      {/* Fatima's note */}
      {bridge.therapistNote && (
        <div style={{
          margin: '0 14px',
          padding: '8px 12px',
          backgroundColor: '#F3EDF9',
          borderLeft: '3px solid #C5AEE0',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          color: '#5E4B8B',
          lineHeight: 1.4,
        }}>
          <span style={{ fontWeight: 700 }}>Fatima's note:</span> {bridge.therapistNote}
        </div>
      )}

      {/* Card footer */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge text={status.label} color={status.color} />
          {bridge.createdAt && (
            <span style={{ fontSize: 10, color: '#A0A0A0' }}>
              {formatShortDate(bridge.createdAt)}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--stone)' }}>
          {bridge.attempts?.length || 0} attempt{bridge.attempts?.length === 1 ? '' : 's'}
        </span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Bridge detail sheet                                                */
/* ------------------------------------------------------------------ */

function BridgeDetailSheet({ bridge, open, onClose, onLogAttempt, onStatus, onLogWin, onEdit, onDelete, onDeleteAttempt }) {
  const [reaction, setReaction] = useState('');
  const [comfort, setComfort] = useState(3);
  const [showLog, setShowLog] = useState(false);
  const [confirmWin, setConfirmWin] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editSafe, setEditSafe] = useState('');
  const [editNew, setEditNew] = useState('');
  const [editSuggestedBy, setEditSuggestedBy] = useState('Self');
  const [confirmDeleteBridge, setConfirmDeleteBridge] = useState(false);

  if (!bridge) return null;

  const status = BRIDGE_STATUSES[bridge.status] || BRIDGE_STATUSES['not-tried'];

  const handleSubmitAttempt = () => {
    if (!reaction.trim()) return;
    onLogAttempt(bridge.id, { reaction: reaction.trim(), comfort, date: new Date().toISOString() });
    setReaction('');
    setComfort(3);
    setShowLog(false);
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'accepted') {
      setPendingStatus(newStatus);
      setConfirmWin(true);
    } else {
      onStatus(bridge.id, newStatus);
    }
  };

  const openEdit = () => {
    setEditSafe(bridge.safeFoodName);
    setEditNew(bridge.newFoodName);
    setEditSuggestedBy(bridge.suggestedBy || 'Self');
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editSafe.trim() || !editNew.trim()) return;
    onEdit(bridge.id, { safeFoodName: editSafe.trim(), newFoodName: editNew.trim(), suggestedBy: editSuggestedBy });
    setEditing(false);
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={`${bridge.safeFoodName} \u2192 ${bridge.newFoodName}`}>
        <Badge text={status.label} color={status.color} style={{ marginBottom: 14 }} />

        {bridge.suggestedBy === 'Fatima' && (
          <div style={{ fontSize: 12, color: '#8E6FBF', fontWeight: 600, marginBottom: 12 }}>
            Suggested by Fatima
          </div>
        )}

        {/* Status buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {['accepted', 'rejected', 'maybe'].map((s) => (
            <Button
              key={s}
              variant={bridge.status === s ? 'primary' : 'secondary'}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                ...(s === 'accepted' && bridge.status === s ? { backgroundColor: 'var(--success)' } : {}),
                ...(s === 'rejected' && bridge.status === s ? { backgroundColor: 'var(--danger)', color: '#fff' } : {}),
                ...(s === 'maybe' && bridge.status === s ? { backgroundColor: '#E8A317', color: '#fff' } : {}),
              }}
              onClick={() => handleStatusChange(s)}
            >
              {BRIDGE_STATUSES[s].label}
            </Button>
          ))}
        </div>

        {/* Edit / Delete bridge buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button variant="secondary" onClick={openEdit} style={{ flex: 1, fontSize: 13 }}>
            <Pencil size={14} style={{ marginRight: 4 }} /> Edit Bridge
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmDeleteBridge(true)}
            style={{ flex: 1, fontSize: 13, color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            <Trash2 size={14} style={{ marginRight: 4 }} /> Delete Bridge
          </Button>
        </div>

        {/* Inline edit form */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16 }}>
              <Input label="Safe food name" value={editSafe} onChange={(e) => setEditSafe(e.target.value)} />
              <Input label="New food name" value={editNew} onChange={(e) => setEditNew(e.target.value)} />
              <Select label="Suggested by" options={['Self', 'Fatima']} value={editSuggestedBy} onChange={(e) => setEditSuggestedBy(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button onClick={handleSaveEdit} style={{ flex: 1 }}>Save</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attempt history */}
        <h4 style={{ fontSize: 15, margin: '0 0 10px' }}>Attempt history</h4>
        {bridge.attempts && bridge.attempts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {bridge.attempts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  backgroundColor: '#FAFAF8',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  borderLeft: `3px solid ${plankColor(a.comfort)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--bark)' }}>
                    Comfort: {a.comfort}/5
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--stone)' }}>
                      {formatDate(a.date)} &middot; {formatTime(a.date)}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onDeleteAttempt(bridge.id, i)}
                      style={{ padding: 2, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--bark)', margin: 0, lineHeight: 1.4 }}>
                  {a.reaction}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--stone)', marginBottom: 16 }}>No attempts yet.</p>
        )}

        {/* Log attempt */}
        {!showLog ? (
          <Button onClick={() => setShowLog(true)} style={{ width: '100%', marginBottom: 8 }}>
            Log an attempt
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Textarea
              label="Reaction"
              placeholder="How did it go?"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
            <ComfortPicker label="Comfort level" value={comfort} onChange={setComfort} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowLog(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAttempt} style={{ flex: 1 }}>
                Submit
              </Button>
            </div>
          </motion.div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirmWin}
        title="Log as a win?"
        message={`You accepted ${bridge.newFoodName}! Would you like to log this as a win?`}
        confirmText="Yes, log win!"
        onConfirm={() => {
          onStatus(bridge.id, 'accepted');
          onLogWin(bridge);
          setConfirmWin(false);
        }}
        onCancel={() => {
          onStatus(bridge.id, 'accepted');
          setConfirmWin(false);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteBridge}
        title="Remove this bridge?"
        message="This will delete the bridge and all its attempts."
        confirmText="Remove"
        danger
        onConfirm={() => {
          onDelete(bridge.id);
          setConfirmDeleteBridge(false);
        }}
        onCancel={() => setConfirmDeleteBridge(false)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Add bridge sheet                                                   */
/* ------------------------------------------------------------------ */

function AddBridgeSheet({ open, onClose, onAdd, foodMap }) {
  const [safeFoodId, setSafeFoodId] = useState('');
  const [newFoodName, setNewFoodName] = useState('');
  const [suggestedBy, setSuggestedBy] = useState('Self');

  const safeFoodOptions = useMemo(
    () => foodMap.map((f) => ({ value: f.id, label: f.name })),
    [foodMap],
  );

  const handleAdd = () => {
    const safeFood = foodMap.find((f) => f.id === safeFoodId);
    if (!safeFood || !newFoodName.trim()) return;
    onAdd({
      id: uid(),
      safeFoodId: safeFood.id,
      safeFoodName: safeFood.name,
      newFoodName: newFoodName.trim(),
      suggestedBy,
      status: 'not-tried',
      attempts: [],
      createdAt: new Date().toISOString(),
    });
    setSafeFoodId('');
    setNewFoodName('');
    setSuggestedBy('Self');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="New bridge food">
      <Select
        label="Safe food (starting point)"
        options={safeFoodOptions}
        placeholder="Pick a safe food..."
        value={safeFoodId}
        onChange={(e) => setSafeFoodId(e.target.value)}
      />
      <Input
        label="New food (destination)"
        placeholder="e.g. Grilled chicken"
        value={newFoodName}
        onChange={(e) => setNewFoodName(e.target.value)}
      />
      <Select
        label="Suggested by"
        options={['Self', 'Fatima']}
        value={suggestedBy}
        onChange={(e) => setSuggestedBy(e.target.value)}
      />
      <Button onClick={handleAdd} style={{ width: '100%', marginTop: 8 }}>
        Build this bridge
      </Button>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Bridges view                                                       */
/* ------------------------------------------------------------------ */

function BridgeFoodsView({ addOpen, onCloseAdd }) {
  const { bridges, setBridges, foodMap, wins, setWins } = useApp();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(null);

  const selected = bridges.find((b) => b.id === selectedId) || null;

  const handleAdd = (bridge) => {
    setBridges((prev) => [bridge, ...prev]);
    toast('Bridge created!', 'success');
  };

  const handleLogAttempt = (id, attempt) => {
    setBridges((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, attempts: [...(b.attempts || []), attempt], status: b.status === 'not-tried' ? 'in-progress' : b.status }
          : b,
      ),
    );
    toast('Attempt logged', 'success');
  };

  const handleStatus = (id, status) => {
    setBridges((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast(`Marked as ${BRIDGE_STATUSES[status].label}`, 'success');
  };

  const handleLogWin = (bridge) => {
    setWins((prev) => [
      {
        id: uid(),
        food: `Accepted ${bridge.newFoodName}`,
        notes: `Bridge from ${bridge.safeFoodName}`,
        source: 'bridge',
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    toast('Win logged!', 'success');
  };

  const handleEditBridge = (id, updates) => {
    setBridges((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    toast('Bridge updated!', 'success');
  };

  const handleDeleteBridge = (id) => {
    setBridges((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
    toast('Bridge removed', 'success');
  };

  const handleDeleteAttempt = (bridgeId, attemptIdx) => {
    setBridges((prev) =>
      prev.map((b) =>
        b.id === bridgeId
          ? { ...b, attempts: b.attempts.filter((_, i) => i !== attemptIdx) }
          : b,
      ),
    );
    toast('Attempt removed', 'success');
  };

  return (
    <>
      {bridges.length === 0 ? (
        <EmptyState
          icon="🌉"
          text="Every bridge starts with a single plank. Pick a safe food and build from there!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bridges.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <BridgeCard bridge={b} onTap={() => setSelectedId(b.id)} />
            </motion.div>
          ))}
        </div>
      )}

      <AddBridgeSheet open={addOpen} onClose={onCloseAdd} onAdd={handleAdd} foodMap={foodMap} />

      <BridgeDetailSheet
        bridge={selected}
        open={!!selected}
        onClose={() => setSelectedId(null)}
        onLogAttempt={handleLogAttempt}
        onStatus={handleStatus}
        onLogWin={handleLogWin}
        onEdit={handleEditBridge}
        onDelete={handleDeleteBridge}
        onDeleteAttempt={handleDeleteAttempt}
      />
    </>
  );
}

/* ================================================================== */
/*  EXPOSURE LADDER VIEW                                               */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Ladder visual                                                      */
/* ------------------------------------------------------------------ */

function LadderVisual({ ladder, onToggleRung, onEditStepLabel }) {
  const [editingStepIdx, setEditingStepIdx] = useState(null);
  const [editingStepValue, setEditingStepValue] = useState('');
  const steps = ladder.steps || [];
  const completedCount = steps.filter((s) => s.done).length;
  const pct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const allDone = steps.length > 0 && completedCount === steps.length;
  const highestDoneIdx = steps.reduce((acc, s, i) => (s.done ? i : acc), -1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ position: 'relative' }}
    >
      <Card
        style={{
          padding: 0,
          overflow: 'hidden',
          ...(allDone
            ? { boxShadow: '0 0 20px rgba(240,199,94,0.4)', border: '1.5px solid var(--win-gold)' }
            : {}),
        }}
      >
        {/* Target food at top */}
        <motion.div
          animate={allDone ? { scale: [1, 1.04, 1] } : {}}
          transition={allDone ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
          style={{
            background: allDone
              ? 'linear-gradient(135deg, #FFF8E1, #FFECB3)'
              : 'linear-gradient(135deg, #F5F0EB, #E8E2DB)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Target
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--bark)', fontFamily: 'var(--font-display)' }}>
              {ladder.targetFood}
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: allDone ? '#E8A317' : 'var(--stone)' }}>
            {pct}%
          </div>
        </motion.div>

        {/* Ladder visual */}
        <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 0 }}>
          {/* Left rail */}
          <div style={{ width: 6, backgroundColor: 'var(--ladder-wood)', borderRadius: 3, flexShrink: 0 }} />

          {/* Rungs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: 0 }}>
            {steps.map((step, i) => {
              const isHighest = i === highestDoneIdx;
              return (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onToggleRung(ladder.id, i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Rung bar */}
                  <motion.div
                    animate={{
                      backgroundColor: step.done ? '#6B8F71' : '#DDD0B6',
                      scaleX: step.done ? 1 : 0.92,
                    }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
                    style={{
                      position: 'absolute',
                      left: -4,
                      right: -4,
                      top: '50%',
                      height: 6,
                      borderRadius: 3,
                      transform: 'translateY(-50%)',
                      zIndex: 0,
                    }}
                  />

                  {/* Avatar on highest done rung */}
                  {isHighest && (
                    <motion.div
                      layoutId="ladder-avatar"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: 'var(--sage)',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        position: 'absolute',
                        left: -16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                      }}
                    >
                      {allDone ? '\u{2B50}' : '\u{1F9D7}'}
                    </motion.div>
                  )}

                  {/* Step label */}
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {editingStepIdx === i ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editingStepValue}
                          onChange={(e) => setEditingStepValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingStepValue.trim()) onEditStepLabel(ladder.id, i, editingStepValue.trim());
                              setEditingStepIdx(null);
                            } else if (e.key === 'Escape') {
                              setEditingStepIdx(null);
                            }
                          }}
                          onBlur={() => {
                            if (editingStepValue.trim()) onEditStepLabel(ladder.id, i, editingStepValue.trim());
                            setEditingStepIdx(null);
                          }}
                          style={{
                            flex: 1,
                            fontSize: 13,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--sage)',
                            fontFamily: 'inherit',
                            backgroundColor: '#fff',
                            color: 'var(--bark)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: step.done ? 700 : 500,
                            color: step.done ? 'var(--bark)' : 'var(--stone)',
                            backgroundColor: step.done ? 'var(--sage-light)' : '#FAFAF8',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {step.label}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStepIdx(i);
                            setEditingStepValue(step.label);
                          }}
                          style={{ padding: 2, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                        >
                          <Pencil size={11} />
                        </motion.button>
                      </div>
                    )}
                    {step.done && step.completedAt && editingStepIdx !== i && (
                      <span style={{ fontSize: 9, color: '#A0A0A0', paddingLeft: 10, marginTop: 1 }}>
                        {formatShortDate(step.completedAt)} &middot; {formatTime(step.completedAt)}
                      </span>
                    )}
                  </div>

                  {/* Check */}
                  <AnimatePresence>
                    {step.done && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        style={{ position: 'relative', zIndex: 1, fontSize: 16, marginLeft: 'auto' }}
                      >
                        \u2705
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Right rail */}
          <div style={{ width: 6, backgroundColor: 'var(--ladder-wood)', borderRadius: 3, flexShrink: 0 }} />
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add ladder sheet                                                   */
/* ------------------------------------------------------------------ */

function AddLadderSheet({ open, onClose, onAdd }) {
  const [targetFood, setTargetFood] = useState('');
  const [steps, setSteps] = useState(DEFAULT_LADDER_STEPS.map((s) => s));

  const updateStep = (i, val) => {
    setSteps((prev) => prev.map((s, j) => (j === i ? val : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, '']);

  const removeStep = (i) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, j) => j !== i));
  };

  const handleAdd = () => {
    if (!targetFood.trim()) return;
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) return;
    onAdd({
      id: uid(),
      targetFood: targetFood.trim(),
      steps: validSteps.map((s) => ({ label: s.trim(), done: false })),
      createdAt: new Date().toISOString(),
    });
    setTargetFood('');
    setSteps(DEFAULT_LADDER_STEPS.map((s) => s));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="New exposure ladder">
      <Input
        label="Target food"
        placeholder="e.g. Broccoli"
        value={targetFood}
        onChange={(e) => setTargetFood(e.target.value)}
      />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 5 }}>
          Steps (bottom to top)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--stone)', minWidth: 20, textAlign: 'center' }}>
                {i + 1}
              </span>
              <input
                value={s}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--sand)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  backgroundColor: '#FAFAF8',
                  color: 'var(--bark)',
                  outline: 'none',
                }}
              />
              {steps.length > 1 && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => removeStep(i)}
                  style={{ padding: 4, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </div>
          ))}
        </div>
        <Button variant="ghost" onClick={addStep} style={{ marginTop: 8, fontSize: 12 }}>
          <Plus size={14} /> Add step
        </Button>
      </div>

      <Button onClick={handleAdd} style={{ width: '100%' }}>
        Build this ladder
      </Button>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Ladders view                                                       */
/* ------------------------------------------------------------------ */

function EditLadderSheet({ ladder, open, onClose, onSave }) {
  const [targetFood, setTargetFood] = useState('');
  const [steps, setSteps] = useState([]);

  // Re-sync whenever a different ladder is opened
  const [prevId, setPrevId] = useState(null);
  if (ladder && ladder.id !== prevId) {
    setPrevId(ladder.id);
    setTargetFood(ladder.targetFood);
    setSteps(ladder.steps.map((s) => ({ ...s })));
  }

  const updateStepLabel = (i, val) => {
    setSteps((prev) => prev.map((s, j) => (j === i ? { ...s, label: val } : s)));
  };

  const removeStep = (i) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, j) => j !== i));
  };

  const addStep = () => setSteps((prev) => [...prev, { label: '', done: false }]);

  const handleSave = () => {
    if (!targetFood.trim()) return;
    const validSteps = steps.filter((s) => s.label.trim());
    if (validSteps.length === 0) return;
    onSave(ladder.id, { targetFood: targetFood.trim(), steps: validSteps.map((s, i) => ({ ...s, label: s.label.trim(), order: i })) });
    onClose();
  };

  if (!ladder) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit ladder">
      <Input label="Target food" value={targetFood} onChange={(e) => setTargetFood(e.target.value)} />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 5 }}>
          Steps (bottom to top)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--stone)', minWidth: 20, textAlign: 'center' }}>
                {i + 1}
              </span>
              <input
                value={s.label}
                onChange={(e) => updateStepLabel(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--sand)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  backgroundColor: '#FAFAF8',
                  color: 'var(--bark)',
                  outline: 'none',
                }}
              />
              {steps.length > 1 && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => removeStep(i)}
                  style={{ padding: 4, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </div>
          ))}
        </div>
        <Button variant="ghost" onClick={addStep} style={{ marginTop: 8, fontSize: 12 }}>
          <Plus size={14} /> Add step
        </Button>
      </div>

      <Button onClick={handleSave} style={{ width: '100%' }}>
        Save ladder
      </Button>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Ladders view                                                       */
/* ------------------------------------------------------------------ */

function ExposureLadderView({ addOpen, onCloseAdd }) {
  const { ladders, setLadders, wins, setWins } = useApp();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [celebrateId, setCelebrateId] = useState(null);
  const [confirmWin, setConfirmWin] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingLadder, setEditingLadder] = useState(null);

  const handleAdd = (ladder) => {
    setLadders((prev) => [ladder, ...prev]);
    toast('Ladder created!', 'success');
  };

  const handleToggleRung = (ladderId, stepIdx) => {
    let allDoneAfter = false;
    let ladderRef = null;

    setLadders((prev) =>
      prev.map((l) => {
        if (l.id !== ladderId) return l;
        const newSteps = l.steps.map((s, i) => (i === stepIdx ? { ...s, done: !s.done, completedAt: !s.done ? new Date().toISOString() : null } : s));
        const updated = { ...l, steps: newSteps };
        allDoneAfter = newSteps.every((s) => s.done);
        ladderRef = updated;
        return updated;
      }),
    );

    if (allDoneAfter && ladderRef) {
      setCelebrateId(ladderId);
      setTimeout(() => {
        setConfirmWin(ladderRef);
        setCelebrateId(null);
      }, 800);
    }
  };

  const handleDelete = (id) => {
    setLadders((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelete(null);
    toast('Ladder removed', 'success');
  };

  const handleLogWin = (ladder) => {
    setWins((prev) => [
      {
        id: uid(),
        food: `Completed ${ladder.targetFood} ladder`,
        notes: `All ${ladder.steps.length} steps done!`,
        source: 'ladder',
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    toast('Win logged!', 'success');
    setConfirmWin(null);
  };

  const handleEditLadder = (id, updates) => {
    setLadders((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    toast('Ladder updated!', 'success');
  };

  const handleEditStepLabel = (ladderId, stepIdx, newLabel) => {
    setLadders((prev) =>
      prev.map((l) =>
        l.id === ladderId
          ? { ...l, steps: l.steps.map((s, i) => (i === stepIdx ? { ...s, label: newLabel } : s)) }
          : l,
      ),
    );
  };

  return (
    <>
      {ladders.length === 0 ? (
        <EmptyState
          icon="🪜"
          text="One rung at a time. Create your first ladder with Fatima!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ladders.map((l) => (
            <div key={l.id}>
              {/* Ladder header (collapsible) */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: expandedId === l.id ? 4 : 0,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18 }}>{l.steps.every((s) => s.done) ? '\u{2B50}' : '\u{1FA9C}'}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)' }}>{l.targetFood}</span>
                  <Badge
                    text={`${l.steps.filter((s) => s.done).length}/${l.steps.length}`}
                    color="var(--sage)"
                  />
                  {l.createdAt && (
                    <span style={{ fontSize: 10, color: '#A0A0A0' }}>
                      {formatShortDate(l.createdAt)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLadder(l);
                    }}
                    style={{ padding: 4, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Pencil size={15} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(l.id);
                    }}
                    style={{ padding: 4, color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                  {expandedId === l.id ? <ChevronUp size={16} color="var(--stone)" /> : <ChevronDown size={16} color="var(--stone)" />}
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedId === l.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <LadderVisual ladder={l} onToggleRung={handleToggleRung} onEditStepLabel={handleEditStepLabel} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AddLadderSheet open={addOpen} onClose={onCloseAdd} onAdd={handleAdd} />

      <EditLadderSheet
        ladder={editingLadder}
        open={!!editingLadder}
        onClose={() => setEditingLadder(null)}
        onSave={handleEditLadder}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove ladder?"
        message="This will permanently delete this exposure ladder and all its progress."
        confirmText="Remove"
        danger
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={!!confirmWin}
        title="You did it!"
        message={confirmWin ? `All steps of ${confirmWin.targetFood} completed! Log this as a win?` : ''}
        confirmText="Yes, log win!"
        onConfirm={() => handleLogWin(confirmWin)}
        onCancel={() => setConfirmWin(null)}
      />
    </>
  );
}

/* ================================================================== */
/*  JOURNEY PAGE (main export)                                         */
/* ================================================================== */

export default function JourneyPage() {
  const [tab, setTab] = useState('bridges');
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        background:
          tab === 'bridges'
            ? 'linear-gradient(to bottom, #F5F0EB 0%, #D6ECF5 60%, #A8D4E8 100%)'
            : 'var(--cream)',
        transition: 'background 0.5s ease',
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: 'var(--bark)',
            margin: '0 0 14px',
          }}
        >
          <GitBranch size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
          Journey
        </motion.h1>

        <SegmentedControl options={SEGMENT_OPTIONS} value={tab} onChange={setTab} />
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          {tab === 'bridges' ? (
            <motion.div
              key="bridges"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <BridgeFoodsView addOpen={addOpen} onCloseAdd={() => setAddOpen(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="ladders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExposureLadderView addOpen={addOpen} onCloseAdd={() => setAddOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setAddOpen(true)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 'calc(50% - 210px)',
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: 'var(--sage)',
          color: '#fff',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer',
        }}
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}
