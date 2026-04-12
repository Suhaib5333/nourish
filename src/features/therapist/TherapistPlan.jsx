import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import {
  Card,
  Button,
  BottomSheet,
  Input,
  Textarea,
  Select,
  SegmentedControl,
  Badge,
  EmptyState,
  ProgressBar,
  ConfirmDialog,
} from '../../components/ui';
import { uid } from '../../utils/uid';
import { formatShortDate } from '../../utils/dates';
import { Plus, MessageSquare, X, Target, Check, HelpCircle, Pencil, Trash2 } from 'lucide-react';

const PURPLE = '#7B68A8';

const TABS = [
  { value: 'bridges', label: 'Bridge Foods' },
  { value: 'ladders', label: 'Ladders' },
];

export default function TherapistPlan() {
  const [tab, setTab] = useState('bridges');

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: 'var(--bark)',
          margin: '0 0 16px',
        }}
      >
        <Target size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
        Treatment Plan
      </h2>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {tab === 'bridges' && <BridgesTab />}
      {tab === 'ladders' && <LaddersTab />}
    </div>
  );
}

function BridgesTab() {
  const { foodMap, bridges, setBridges } = useApp();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [noteSheet, setNoteSheet] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [editSheet, setEditSheet] = useState(null);
  const [editForm, setEditForm] = useState({ safeFood: '', targetFood: '', note: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({ safeFood: '', targetFood: '', note: '' });

  const safeFoodOptions = foodMap.map((f) => ({ value: f.name, label: f.name }));

  const handleCreate = () => {
    if (!form.safeFood || !form.targetFood.trim()) {
      toast('Please fill in safe food and target food', 'error');
      return;
    }
    const newBridge = {
      id: uid(),
      safeFoodName: form.safeFood,
      newFoodName: form.targetFood.trim(),
      suggestedBy: 'Fatima',
      status: 'not-tried',
      therapistNote: form.note.trim(),
      therapistNotes: [],
      attempts: [],
      createdAt: new Date().toISOString(),
    };
    setBridges((prev) => [newBridge, ...prev]);
    setForm({ safeFood: '', targetFood: '', note: '' });
    setSheetOpen(false);
    toast('Bridge food suggested');
  };

  const handleAddNote = (bridgeId) => {
    if (!noteText.trim()) return;
    setBridges((prev) =>
      prev.map((b) =>
        b.id === bridgeId
          ? {
              ...b,
              therapistNotes: [
                ...(b.therapistNotes || []),
                { id: uid(), text: noteText.trim(), date: new Date().toISOString() },
              ],
            }
          : b,
      ),
    );
    setNoteText('');
    setNoteSheet(null);
    toast('Note added');
  };

  const openEdit = (bridge) => {
    setEditForm({
      safeFood: bridge.safeFoodName,
      targetFood: bridge.newFoodName,
      note: bridge.therapistNote || '',
    });
    setEditSheet(bridge.id);
  };

  const handleEdit = () => {
    if (!editForm.safeFood || !editForm.targetFood.trim()) {
      toast('Please fill in safe food and target food', 'error');
      return;
    }
    setBridges((prev) =>
      prev.map((b) =>
        b.id === editSheet
          ? {
              ...b,
              safeFoodName: editForm.safeFood,
              newFoodName: editForm.targetFood.trim(),
              therapistNote: editForm.note.trim(),
            }
          : b,
      ),
    );
    setEditSheet(null);
    toast('Bridge updated!');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBridges((prev) => prev.filter((b) => b.id !== deleteTarget));
    setDeleteTarget(null);
    toast('Bridge removed');
  };

  const statusColor = (s) => {
    if (s === 'accepted') return '#4A7C59';
    if (s === 'rejected') return '#D32F2F';
    if (s === 'maybe') return '#E8A317';
    return 'var(--stone)';
  };

  return (
    <>
      <Button
        style={{ width: '100%', backgroundColor: PURPLE, marginBottom: 16 }}
        onClick={() => setSheetOpen(true)}
      >
        <Plus size={16} />
        Suggest New Bridge Food
      </Button>

      {bridges.length === 0 ? (
        <EmptyState icon="🌉" text="No bridge foods yet. Suggest one to get started." />
      ) : (
        <AnimatePresence>
          {bridges.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card
                animate={false}
                style={{
                  padding: 14,
                  borderLeft: b.status === 'maybe' ? '3px solid #E8A317' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)' }}>
                      {b.newFoodName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 2 }}>
                      from {b.safeFoodName} {b.suggestedBy && `- suggested by ${b.suggestedBy}`}
                    </div>
                  </div>
                  <Badge text={b.status} color={statusColor(b.status)} />
                </div>

                {b.therapistNote && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--stone)',
                      fontStyle: 'italic',
                      marginTop: 8,
                      padding: '6px 8px',
                      backgroundColor: '#F8F6FB',
                      borderRadius: 6,
                    }}
                  >
                    {b.therapistNote}
                  </div>
                )}

                {b.therapistNotes?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {b.therapistNotes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          fontSize: 12,
                          color: PURPLE,
                          padding: '4px 0',
                          borderTop: '1px solid #F0EBE5',
                        }}
                      >
                        <strong>{formatShortDate(n.date)}:</strong> {n.text}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => {
                      setNoteSheet(b.id);
                      setNoteText('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: PURPLE,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <MessageSquare size={13} />
                    Add note
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEdit(b)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: PURPLE,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Pencil size={16} color={PURPLE} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteTarget(b.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#D32F2F',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Trash2 size={16} color="#D32F2F" />
                    Delete
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Suggest Bridge Food">
        <Select
          label="Safe Food (starting point)"
          options={safeFoodOptions}
          value={form.safeFood}
          onChange={(e) => setForm((f) => ({ ...f, safeFood: e.target.value }))}
        />
        <Input
          label="Target Food"
          placeholder="e.g. Grilled chicken strips"
          value={form.targetFood}
          onChange={(e) => setForm((f) => ({ ...f, targetFood: e.target.value }))}
        />
        <Textarea
          label="Clinical Note (optional)"
          placeholder="Rationale or approach notes..."
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        />
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 8 }} onClick={handleCreate}>
          Create Bridge
        </Button>
      </BottomSheet>

      <BottomSheet open={!!noteSheet} onClose={() => setNoteSheet(null)} title="Add Therapist Note">
        <Textarea
          label="Note"
          placeholder="Observation or follow-up note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <Button
          style={{ width: '100%', backgroundColor: PURPLE, marginTop: 8 }}
          onClick={() => handleAddNote(noteSheet)}
        >
          Save Note
        </Button>
      </BottomSheet>

      <BottomSheet open={!!editSheet} onClose={() => setEditSheet(null)} title="Edit Bridge Food">
        <Select
          label="Safe Food (starting point)"
          options={safeFoodOptions}
          value={editForm.safeFood}
          onChange={(e) => setEditForm((f) => ({ ...f, safeFood: e.target.value }))}
        />
        <Input
          label="Target Food"
          placeholder="e.g. Grilled chicken strips"
          value={editForm.targetFood}
          onChange={(e) => setEditForm((f) => ({ ...f, targetFood: e.target.value }))}
        />
        <Textarea
          label="Clinical Note (optional)"
          placeholder="Rationale or approach notes..."
          value={editForm.note}
          onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
        />
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 8 }} onClick={handleEdit}>
          Save Changes
        </Button>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Bridge"
        message="This bridge food will be permanently removed. Are you sure?"
        confirmText="Delete"
        danger
      />
    </>
  );
}

function LaddersTab() {
  const { ladders, setLadders } = useApp();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [targetFood, setTargetFood] = useState('');
  const [steps, setSteps] = useState(['', '', '', '']);
  const placeholders = ['Look at the food', 'Smell the food', 'Touch / pick up', 'Taste a small bite'];

  const [editSheet, setEditSheet] = useState(null);
  const [editTarget, setEditTarget] = useState('');
  const [editSteps, setEditSteps] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const addStep = () => setSteps((s) => [...s, '']);

  const removeStep = (i) => {
    if (steps.length <= 2) return;
    setSteps((s) => s.filter((_, idx) => idx !== i));
  };

  const handleCreate = () => {
    if (!targetFood.trim()) {
      toast('Please enter a target food', 'error');
      return;
    }
    const filledSteps = steps.filter((s) => s.trim());
    if (filledSteps.length < 2) {
      toast('Add at least 2 steps', 'error');
      return;
    }
    const ladder = {
      id: uid(),
      targetFood: targetFood.trim(),
      createdBy: 'Fatima',
      steps: filledSteps.map((s, i) => ({
        id: uid(),
        label: s.trim(),
        order: i,
        done: false,
      })),
      createdAt: new Date().toISOString(),
    };
    setLadders((prev) => [ladder, ...prev]);
    setTargetFood('');
    setSteps(['', '', '', '']);
    setSheetOpen(false);
    toast('Ladder created');
  };

  const openEdit = (ladder) => {
    setEditTarget(ladder.targetFood);
    setEditSteps(ladder.steps.map((s) => s.label));
    setEditSheet(ladder.id);
  };

  const addEditStep = () => setEditSteps((s) => [...s, '']);

  const removeEditStep = (i) => {
    if (editSteps.length <= 2) return;
    setEditSteps((s) => s.filter((_, idx) => idx !== i));
  };

  const handleEdit = () => {
    if (!editTarget.trim()) {
      toast('Please enter a target food', 'error');
      return;
    }
    const filledSteps = editSteps.filter((s) => s.trim());
    if (filledSteps.length < 2) {
      toast('Add at least 2 steps', 'error');
      return;
    }
    setLadders((prev) =>
      prev.map((l) => {
        if (l.id !== editSheet) return l;
        const existingDone = {};
        l.steps.forEach((s) => { existingDone[s.label] = s.done; });
        return {
          ...l,
          targetFood: editTarget.trim(),
          steps: filledSteps.map((s, i) => ({
            id: uid(),
            label: s.trim(),
            order: i,
            done: existingDone[s.trim()] || false,
          })),
        };
      }),
    );
    setEditSheet(null);
    toast('Ladder updated!');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setLadders((prev) => prev.filter((l) => l.id !== deleteTarget));
    setDeleteTarget(null);
    toast('Ladder removed');
  };

  return (
    <>
      <Button
        style={{ width: '100%', backgroundColor: PURPLE, marginBottom: 16 }}
        onClick={() => setSheetOpen(true)}
      >
        <Plus size={16} />
        Create Ladder
      </Button>

      {ladders.length === 0 ? (
        <EmptyState icon="🪜" text="No exposure ladders yet. Create one to start." />
      ) : (
        ladders.map((l) => {
          const done = l.steps.filter((s) => s.done).length;
          const pct = l.steps.length > 0 ? Math.round((done / l.steps.length) * 100) : 0;
          return (
            <Card key={l.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)' }}>
                  {l.targetFood}
                </div>
                <span style={{ fontSize: 12, color: PURPLE, fontWeight: 600 }}>{pct}%</span>
              </div>
              {l.createdBy && (
                <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 8 }}>
                  Created by {l.createdBy}
                </div>
              )}
              <ProgressBar value={pct} color={PURPLE} style={{ marginBottom: 10 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {l.steps.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: s.done ? PURPLE : 'var(--stone)',
                      textDecoration: s.done ? 'line-through' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `2px solid ${s.done ? PURPLE : '#D6CEE8'}`,
                        backgroundColor: s.done ? PURPLE : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {s.done && '✓'}
                    </div>
                    <span>
                      {i + 1}. {s.label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #F0EBE5', paddingTop: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(l)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: PURPLE,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Pencil size={16} color={PURPLE} />
                  Edit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDeleteTarget(l.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#D32F2F',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Trash2 size={16} color="#D32F2F" />
                  Delete
                </motion.button>
              </div>
            </Card>
          );
        })
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Create Exposure Ladder">
        <Input
          label="Target Food"
          placeholder="e.g. Broccoli"
          value={targetFood}
          onChange={(e) => setTargetFood(e.target.value)}
        />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 8 }}>
          Steps (in order of exposure)
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--stone)', width: 18, textAlign: 'center' }}>
              {i + 1}
            </span>
            <input
              value={s}
              onChange={(e) => {
                const next = [...steps];
                next[i] = e.target.value;
                setSteps(next);
              }}
              placeholder={placeholders[i] || `Step ${i + 1}`}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--sand)',
                fontSize: 14,
                fontFamily: 'inherit',
                backgroundColor: '#FAFAF8',
                color: 'var(--bark)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {steps.length > 2 && (
              <button
                onClick={() => removeStep(i)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--stone)',
                  padding: 2,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addStep}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: PURPLE,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: 12,
          }}
        >
          + Add step
        </button>
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 4 }} onClick={handleCreate}>
          Create Ladder
        </Button>
      </BottomSheet>

      <BottomSheet open={!!editSheet} onClose={() => setEditSheet(null)} title="Edit Exposure Ladder">
        <Input
          label="Target Food"
          placeholder="e.g. Broccoli"
          value={editTarget}
          onChange={(e) => setEditTarget(e.target.value)}
        />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 8 }}>
          Steps (in order of exposure)
        </div>
        {editSteps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--stone)', width: 18, textAlign: 'center' }}>
              {i + 1}
            </span>
            <input
              value={s}
              onChange={(e) => {
                const next = [...editSteps];
                next[i] = e.target.value;
                setEditSteps(next);
              }}
              placeholder={placeholders[i] || `Step ${i + 1}`}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 8,
                border: '1.5px solid var(--sand)',
                fontSize: 14,
                fontFamily: 'inherit',
                backgroundColor: '#FAFAF8',
                color: 'var(--bark)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {editSteps.length > 2 && (
              <button
                onClick={() => removeEditStep(i)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--stone)',
                  padding: 2,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addEditStep}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: PURPLE,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: 12,
          }}
        >
          + Add step
        </button>
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 4 }} onClick={handleEdit}>
          Save Changes
        </Button>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Ladder"
        message="This exposure ladder will be permanently removed. Are you sure?"
        confirmText="Delete"
        danger
      />
    </>
  );
}
