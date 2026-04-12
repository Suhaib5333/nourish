import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { uid } from '../../utils/uid';
import { formatDate, daysAgo } from '../../utils/dates';
import { Trophy, Plus } from 'lucide-react';
import {
  Button,
  Card,
  BottomSheet,
  Input,
  Textarea,
  Badge,
  EmptyState,
} from '../../components/ui';

/* ------------------------------------------------------------------ */
/*  CSS keyframes                                                      */
/* ------------------------------------------------------------------ */
const styleId = 'wins-page-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const sheet = document.createElement('style');
  sheet.id = styleId;
  sheet.textContent = `
    @keyframes confetti-fall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    @keyframes trophy-glow {
      0%, 100% { filter: drop-shadow(0 0 12px rgba(255,215,0,0.3)); }
      50%      { filter: drop-shadow(0 0 28px rgba(255,215,0,0.6)); }
    }
    @keyframes shine-sweep {
      0%   { transform: translateX(-100%) rotate(25deg); }
      100% { transform: translateX(200%) rotate(25deg); }
    }
  `;
  document.head.appendChild(sheet);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getTrophyEmoji(index) {
  if (index >= 25) return '\uD83D\uDC8E'; // diamond
  if (index >= 10) return '\uD83E\uDD47'; // gold
  if (index >= 5) return '\uD83E\uDD48';  // silver
  return '\uD83E\uDD49'; // bronze
}

function getMilestoneBadge(count) {
  const milestones = [
    { at: 50, label: 'Diamond', bg: 'linear-gradient(135deg, #B2EBF2, #E0F7FA)', color: '#00838F', border: '#4DD0E1' },
    { at: 25, label: 'Gold', bg: 'linear-gradient(135deg, #FFD54F, #FFF8E1)', color: '#F57F17', border: '#FFD54F' },
    { at: 10, label: 'Silver', bg: 'linear-gradient(135deg, #CFD8DC, #ECEFF1)', color: '#455A64', border: '#B0BEC5' },
    { at: 5, label: 'Bronze', bg: 'linear-gradient(135deg, #FFCCBC, #FBE9E7)', color: '#BF360C', border: '#FFAB91' },
  ];
  return milestones.find((m) => count >= m.at) || null;
}

const CONFETTI_COLORS = [
  '#FFD54F', '#FF8A65', '#CE93D8', '#4FC3F7', '#81C784',
  '#F06292', '#FFB74D', '#A5D6A7', '#EF5350', '#42A5F5',
];

/* ------------------------------------------------------------------ */
/*  Confetti                                                           */
/* ------------------------------------------------------------------ */
function ConfettiOverlay({ active }) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.6,
      duration: 1.4 + Math.random() * 0.8,
      rotate: Math.random() * 360,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (Math.random() > 0.5 ? 0.6 : 1),
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            animation: `confetti-fall ${p.duration}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trophy Case Hero                                                   */
/* ------------------------------------------------------------------ */
function TrophyCaseHero({ count }) {
  const milestone = getMilestoneBadge(count);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 40%, #FFCC80 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '28px 20px 24px',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Glass overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-md)',
        }}
      />

      {/* Shine sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            width: '40%',
            height: '200%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            animation: 'shine-sweep 4s ease-in-out infinite',
          }}
        />
      </div>

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.7, bounce: 0.4, delay: 0.15 }}
          style={{ fontSize: 56, marginBottom: 4, animation: 'trophy-glow 3s ease-in-out infinite' }}
        >
          {'\uD83C\uDFC6'}
        </motion.div>

        {/* Count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: '#5D4037',
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
          }}
        >
          {count}
        </motion.div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8D6E63', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
          total victories
        </div>

        {/* Milestone badge */}
        {milestone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'inline-block',
              marginTop: 12,
              padding: '5px 16px',
              borderRadius: 20,
              background: milestone.bg,
              color: milestone.color,
              fontSize: 12,
              fontWeight: 800,
              border: `1.5px solid ${milestone.border}`,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {milestone.label} Tier
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Win Streak                                                         */
/* ------------------------------------------------------------------ */
function WinStreak({ count }) {
  if (count === 0) return null;

  return (
    <Card style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #FFD54F, #FFB300)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {'\uD83D\uDD25'}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--bark)' }}>{count} wins</div>
        <div style={{ fontSize: 12, color: 'var(--stone)' }}>Keep the streak going!</div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Milestone Markers                                                  */
/* ------------------------------------------------------------------ */
function MilestoneMarkers({ count }) {
  const milestones = [
    { at: 5, label: 'Bronze', emoji: '\uD83E\uDD49', bg: '#FFCCBC', color: '#BF360C', border: '#FFAB91' },
    { at: 10, label: 'Silver', emoji: '\uD83E\uDD48', bg: '#ECEFF1', color: '#455A64', border: '#B0BEC5' },
    { at: 25, label: 'Gold', emoji: '\uD83E\uDD47', bg: '#FFF8E1', color: '#F57F17', border: '#FFD54F' },
    { at: 50, label: 'Diamond', emoji: '\uD83D\uDC8E', bg: '#E0F7FA', color: '#00838F', border: '#4DD0E1' },
  ];

  const relevant = milestones.filter((m) => m.at <= count || m.at <= count + 5);
  if (relevant.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
      {relevant.map((m) => {
        const reached = count >= m.at;
        return (
          <motion.div
            key={m.at}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.4 }}
            style={{
              flex: '0 0 auto',
              padding: '8px 14px',
              borderRadius: 12,
              background: reached ? m.bg : '#F5F5F5',
              border: `1.5px solid ${reached ? m.border : '#E0E0E0'}`,
              textAlign: 'center',
              opacity: reached ? 1 : 0.5,
              minWidth: 72,
            }}
          >
            <div style={{ fontSize: 22 }}>{m.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: reached ? m.color : '#9E9E9E', marginTop: 2 }}>
              {m.at} wins
            </div>
            <div style={{ fontSize: 10, color: reached ? m.color : '#BDBDBD', fontWeight: 600 }}>
              {reached ? 'Unlocked!' : 'Locked'}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wins Page                                                          */
/* ------------------------------------------------------------------ */
export default function WinsPage() {
  const { wins, setWins } = useApp();
  const show = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ food: '', notes: '' });
  const [confetti, setConfetti] = useState(false);

  const sorted = useMemo(
    () => [...wins].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [wins],
  );

  const resetForm = () => setForm({ food: '', notes: '' });

  const submit = useCallback(() => {
    if (!form.food.trim()) return;
    setWins((prev) => [
      ...prev,
      {
        id: uid(),
        food: form.food.trim(),
        notes: form.notes.trim(),
        date: new Date().toISOString(),
        source: 'manual',
      },
    ]);
    show('Victory added!');
    resetForm();
    setOpen(false);

    // Confetti
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
  }, [form, setWins, show]);

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <ConfettiOverlay active={confetti} />

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          color: 'var(--bark)',
          margin: '0 0 16px',
        }}
      >
        <Trophy size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
        Wins
      </motion.h1>

      <TrophyCaseHero count={wins.length} />
      <WinStreak count={wins.length} />
      <MilestoneMarkers count={wins.length} />

      {/* Win cards */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={'\uD83C\uDFC6'}
          text="Your trophy case is ready and waiting. Every new food you try is a victory worth celebrating!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <AnimatePresence initial={false}>
            {sorted.map((w, i) => {
              const globalIndex = wins.length - 1 - i;
              const emoji = getTrophyEmoji(globalIndex);
              return (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
                >
                  <Card>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          fontSize: 26,
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #FFF8E1, #FFE0B2)',
                          borderRadius: 12,
                          flexShrink: 0,
                        }}
                      >
                        {emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: 'var(--bark)',
                            marginBottom: 4,
                          }}
                        >
                          {w.food}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                          {w.source && w.source !== 'manual' && (
                            <Badge
                              text={w.source === 'bridge' ? 'From Bridge' : w.source === 'ladder' ? 'From Ladder' : w.source}
                              color="var(--sage)"
                            />
                          )}
                        </div>
                        {w.notes && (
                          <div style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.4 }}>
                            {w.notes}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 6 }}>
                          {daysAgo(w.date)} &middot; {formatDate(w.date)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 88,
          right: 'max(24px, calc(50% - 210px))',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--sage)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(74,124,89,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Bottom sheet form */}
      <BottomSheet open={open} onClose={() => { setOpen(false); resetForm(); }} title="Add Victory">
        <Input
          label="Food name"
          placeholder="What's your win?"
          value={form.food}
          onChange={(e) => setForm((f) => ({ ...f, food: e.target.value }))}
        />
        <Textarea
          label="Notes (optional)"
          placeholder="Tell us about this victory!"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <Button onClick={submit} style={{ width: '100%', marginTop: 4 }}>
          Celebrate Win
        </Button>
      </BottomSheet>
    </div>
  );
}
