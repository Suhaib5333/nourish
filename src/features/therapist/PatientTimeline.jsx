import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, Badge, EmptyState } from '../../components/ui';
import { getRecentActivity } from '../../utils/analytics';
import { formatDate, formatTime } from '../../utils/dates';

const TYPE_META = {
  food: { color: '#4A7C59', label: 'Food' },
  win: { color: '#4A7C59', label: 'Win' },
  trigger: { color: '#E8A317', label: 'Trigger' },
  mood: { color: '#4A90D9', label: 'Mood' },
  bridge: { color: '#7B68A8', label: 'Bridge' },
  attempt: { color: '#7B68A8', label: 'Attempt' },
  ladder: { color: '#2A9D8F', label: 'Ladder' },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'trigger', label: 'Triggers' },
  { key: 'mood', label: 'Mood' },
  { key: 'bridge', label: 'Bridges' },
  { key: 'win', label: 'Wins' },
];

const PURPLE = '#7B68A8';

function GroupedTimeline({ entries }) {
  const grouped = useMemo(() => {
    const groups = {};
    entries.forEach((entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    return Object.entries(groups);
  }, [entries]);

  return (
    <AnimatePresence mode="popLayout">
      {grouped.map(([dateLabel, items]) => (
        <div key={dateLabel}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: PURPLE,
              padding: '14px 0 6px',
              borderBottom: '1px solid #E8E2DB',
              marginBottom: 6,
            }}
          >
            {dateLabel}
          </div>
          {items.map((entry, i) => {
            const meta = TYPE_META[entry.type] || TYPE_META.food;
            return (
              <motion.div
                key={`${entry.type}-${entry.date}-${i}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
              >
                <Card animate={false} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: meta.color,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--bark)', fontWeight: 500, lineHeight: 1.4 }}>
                      {entry.label}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--stone)' }}>
                        {formatDate(entry.date)} &middot; {formatTime(entry.date)}
                      </span>
                      {entry.mealTime && (
                        <Badge text={entry.mealTime} color="#E8A317" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ))}
    </AnimatePresence>
  );
}

export default function PatientTimeline() {
  const { foodMap, bridges, triggers, wins, moods } = useApp();
  const [filter, setFilter] = useState('all');

  const allActivity = useMemo(
    () => getRecentActivity(foodMap, bridges, triggers, wins, moods, 50),
    [foodMap, bridges, triggers, wins, moods],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return allActivity;
    if (filter === 'bridge') return allActivity.filter((a) => a.type === 'bridge' || a.type === 'attempt');
    return allActivity.filter((a) => a.type === filter);
  }, [allActivity, filter]);

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
        Patient <span style={{ color: PURPLE }}>Timeline</span>
      </h2>

      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 8,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FILTER_OPTIONS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: active ? PURPLE : '#F0EBE5',
                color: active ? '#fff' : 'var(--stone)',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" text="No activity matches the selected filter." />
      ) : (
        <GroupedTimeline entries={filtered} />
      )}
    </div>
  );
}
