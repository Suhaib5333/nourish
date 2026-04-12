import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import {
  Card,
  Button,
  BottomSheet,
  Textarea,
  Select,
  Badge,
  EmptyState,
  ConfirmDialog,
} from '../../components/ui';
import { uid } from '../../utils/uid';
import { formatDate } from '../../utils/dates';
import { SESSION_TYPES } from '../../utils/constants';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';

const PURPLE = '#7B68A8';

const SESSION_COLORS = {
  'Initial Assessment': '#7B68A8',
  'Follow-up': '#4A90D9',
  'Check-in': '#2A9D8F',
  'Crisis': '#D32F2F',
};

export default function SessionNotes() {
  const { sessionNotes, setSessionNotes } = useApp();
  const toast = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ type: '', content: '' });
  const [expanded, setExpanded] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editSheet, setEditSheet] = useState(null);
  const [editForm, setEditForm] = useState({ type: '', content: '' });

  const sorted = [...sessionNotes].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleCreate = () => {
    if (!form.type) {
      toast('Please select a session type', 'error');
      return;
    }
    if (!form.content.trim()) {
      toast('Please enter note content', 'error');
      return;
    }
    const note = {
      id: uid(),
      sessionType: form.type,
      content: form.content.trim(),
      date: new Date().toISOString(),
    };
    setSessionNotes((prev) => [note, ...prev]);
    setForm({ type: '', content: '' });
    setSheetOpen(false);
    toast('Session note added');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSessionNotes((prev) => prev.filter((n) => n.id !== deleteTarget));
    setDeleteTarget(null);
    toast('Note deleted');
  };

  const openEdit = (note) => {
    setEditForm({ type: note.sessionType, content: note.content });
    setEditSheet(note.id);
  };

  const handleEdit = () => {
    if (!editForm.type) {
      toast('Please select a session type', 'error');
      return;
    }
    if (!editForm.content.trim()) {
      toast('Please enter note content', 'error');
      return;
    }
    setSessionNotes((prev) =>
      prev.map((n) =>
        n.id === editSheet
          ? { ...n, sessionType: editForm.type, content: editForm.content.trim() }
          : n,
      ),
    );
    setEditSheet(null);
    toast('Note updated!');
  };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--bark)',
            margin: 0,
          }}
        >
          <ClipboardList size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
          Session Notes
        </h2>
        <Button
          style={{ backgroundColor: PURPLE, padding: '8px 14px' }}
          onClick={() => setSheetOpen(true)}
        >
          <Plus size={16} />
          Add
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon="📝"
          text="No session notes yet. Add your first note after a session."
          action={
            <Button style={{ backgroundColor: PURPLE }} onClick={() => setSheetOpen(true)}>
              Add Note
            </Button>
          }
        />
      ) : (
        <AnimatePresence>
          {sorted.map((note) => {
            const isExpanded = expanded === note.id;
            const preview =
              note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content;

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
              >
                <Card
                  animate={false}
                  onClick={() => setExpanded(isExpanded ? null : note.id)}
                  style={{ padding: 14, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Badge
                          text={note.sessionType}
                          color={SESSION_COLORS[note.sessionType] || PURPLE}
                        />
                        <span style={{ fontSize: 12, color: 'var(--stone)' }}>
                          {formatDate(note.date)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--bark)',
                          lineHeight: 1.5,
                          whiteSpace: isExpanded ? 'pre-wrap' : 'normal',
                        }}
                      >
                        {isExpanded ? note.content : preview}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                      {isExpanded ? (
                        <ChevronUp size={16} color="var(--stone)" />
                      ) : (
                        <ChevronDown size={16} color="var(--stone)" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ marginTop: 10, borderTop: '1px solid #F0EBE5', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(note);
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
                        <Pencil size={16} color={PURPLE} />
                        Edit note
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(note.id);
                        }}
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
                        Delete note
                      </motion.button>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="New Session Note">
        <Select
          label="Session Type"
          options={SESSION_TYPES}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        />
        <Textarea
          label="Note Content"
          placeholder="Document session observations, patient progress, goals discussed..."
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          style={{ minHeight: 120 }}
        />
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 8 }} onClick={handleCreate}>
          Save Note
        </Button>
      </BottomSheet>

      <BottomSheet open={!!editSheet} onClose={() => setEditSheet(null)} title="Edit Session Note">
        <Select
          label="Session Type"
          options={SESSION_TYPES}
          value={editForm.type}
          onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
        />
        <Textarea
          label="Note Content"
          placeholder="Document session observations, patient progress, goals discussed..."
          value={editForm.content}
          onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
          style={{ minHeight: 120 }}
        />
        <Button style={{ width: '100%', backgroundColor: PURPLE, marginTop: 8 }} onClick={handleEdit}>
          Save Changes
        </Button>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="This session note will be permanently deleted. Are you sure?"
        confirmText="Delete"
        danger
      />
    </div>
  );
}
