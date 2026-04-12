import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui';
import { getTopTrigger, getAverageComfort, getBridgeSuccessRate, getRecentActivity } from '../../utils/analytics';
import { daysAgo, formatShortDate } from '../../utils/dates';
import { Leaf, UtensilsCrossed, GitBranch, Trophy, Zap, SmilePlus, AlertTriangle, Flame, X } from 'lucide-react';

/* ─── Helpers ─── */

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function getLoggingStreak(foodMap, bridges, triggers, wins, moods) {
  const allDates = new Set();
  foodMap.forEach(f => { if (f.dateAdded) allDates.add(new Date(f.dateAdded).toISOString().split('T')[0]); });
  bridges.forEach(b => {
    if (b.createdAt) allDates.add(new Date(b.createdAt).toISOString().split('T')[0]);
    (b.attempts || []).forEach(a => { if (a.date) allDates.add(new Date(a.date).toISOString().split('T')[0]); });
  });
  triggers.forEach(t => { if (t.date) allDates.add(new Date(t.date).toISOString().split('T')[0]); });
  wins.forEach(w => { if (w.date) allDates.add(new Date(w.date).toISOString().split('T')[0]); });
  moods.forEach(m => { if (m.date) allDates.add(new Date(m.date).toISOString().split('T')[0]); });

  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (allDates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getWeeklyStats(foodMap, triggers, wins, moods) {
  const weekAgo = Date.now() - 7 * 86400000;
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const thisWeekFoods = foodMap.filter(f => new Date(f.dateAdded).getTime() > weekAgo).length;
  const thisWeekTriggers = triggers.filter(t => new Date(t.date).getTime() > weekAgo).length;
  const lastWeekTriggers = triggers.filter(t => {
    const ts = new Date(t.date).getTime();
    return ts > twoWeeksAgo && ts <= weekAgo;
  }).length;
  const thisWeekWins = wins.filter(w => new Date(w.date).getTime() > weekAgo).length;
  const thisWeekMoods = moods.filter(m => new Date(m.date).getTime() > weekAgo);
  const avgComfort = thisWeekMoods.length > 0
    ? thisWeekMoods.reduce((s, m) => s + m.comfort, 0) / thisWeekMoods.length
    : 0;
  return { thisWeekFoods, thisWeekTriggers, lastWeekTriggers, thisWeekWins, avgComfort };
}

function getMotivationalLine(stats) {
  if (stats.thisWeekWins > 0) return "You tried something new this week \u2014 that takes real courage \uD83D\uDCAA";
  if (stats.thisWeekTriggers < stats.lastWeekTriggers && stats.lastWeekTriggers > 0) return "Fewer storms this week \u2014 the skies are clearing \uD83C\uDF24\uFE0F";
  if (stats.avgComfort > 3) return "Your comfort is growing \u2014 keep nurturing it \uD83C\uDF31";
  return "Every step forward counts, even the small ones \uD83C\uDF43";
}

const MILESTONES = [5, 10, 25, 50];
const DAILY_MOODS = [
  { emoji: '\u2600\uFE0F', label: 'Great' },
  { emoji: '\uD83C\uDF24\uFE0F', label: 'Good' },
  { emoji: '\u2601\uFE0F', label: 'Okay' },
  { emoji: '\uD83C\uDF27\uFE0F', label: 'Anxious' },
  { emoji: '\u26C8\uFE0F', label: 'Stressed' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5, bounce: 0.15 } },
};

const ACTIVITY_ICONS = {
  food: '🍽️',
  bridge: '🌉',
  attempt: '🧪',
  trigger: '⚡',
  win: '🏆',
  mood: '😊',
};

export default function HomePage() {
  const { foodMap, bridges, triggers, wins, moods, allLoaded } = useApp();
  const navigate = useNavigate();

  // Daily mood check
  const [dailyMood, setDailyMood] = useState(() => {
    try { return localStorage.getItem(`nourish-daily-mood-${todayKey()}`) || null; } catch { return null; }
  });
  const handleDailyMood = (label) => {
    setDailyMood(label);
    try { localStorage.setItem(`nourish-daily-mood-${todayKey()}`, label); } catch {}
  };

  // Milestone dismissal
  const [dismissedMilestones, setDismissedMilestones] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nourish-dismissed-milestones') || '[]'); } catch { return []; }
  });
  const dismissMilestone = (m) => {
    const next = [...dismissedMilestones, m];
    setDismissedMilestones(next);
    try { localStorage.setItem('nourish-dismissed-milestones', JSON.stringify(next)); } catch {}
  };

  const safeFoodCount = foodMap.length;
  const activeBridges = bridges.filter(b => b.status !== 'accepted' && b.status !== 'rejected').length;
  const totalWins = wins.length;

  // Streak
  const streak = useMemo(
    () => getLoggingStreak(foodMap, bridges, triggers, wins, moods),
    [foodMap, bridges, triggers, wins, moods],
  );

  // Weekly stats
  const weeklyStats = useMemo(
    () => getWeeklyStats(foodMap, triggers, wins, moods),
    [foodMap, triggers, wins, moods],
  );

  // Current milestone
  const activeMilestone = useMemo(() => {
    const reached = MILESTONES.filter(m => totalWins >= m);
    if (reached.length === 0) return null;
    const highest = reached[reached.length - 1];
    return dismissedMilestones.includes(highest) ? null : highest;
  }, [totalWins, dismissedMilestones]);

  const recentActivity = useMemo(
    () => getRecentActivity(foodMap, bridges, triggers, wins, moods),
    [foodMap, bridges, triggers, wins, moods],
  );

  const insight = useMemo(() => {
    const parts = [];
    const topTrigger = getTopTrigger(triggers);
    if (topTrigger) {
      parts.push(`Your most common trigger is "${topTrigger.type}" (${topTrigger.count}x).`);
    }
    const avgComfort = getAverageComfort(moods);
    if (avgComfort > 0) {
      parts.push(`Average meal comfort is ${avgComfort.toFixed(1)}/5.`);
    }
    const rate = getBridgeSuccessRate(bridges);
    if (bridges.length > 0) {
      parts.push(`Bridge food success rate: ${rate}%.`);
    }
    if (!parts.length) {
      return 'Start logging foods, moods, and triggers to see personalized insights here.';
    }
    return parts.join(' ');
  }, [triggers, moods, bridges]);

  if (!allLoaded) return null;

  return (
    <div style={{ padding: '20px 16px 120px' }}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}
      >
        <motion.div
          animate={{ rotate: [0, 14, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          <Leaf size={28} color="var(--sage)" />
        </motion.div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            color: 'var(--bark)',
            margin: 0,
          }}>
            Welcome back, Suhaib
          </h1>
          <p style={{ fontSize: 13, color: 'var(--stone)', margin: 0 }}>
            Here's your overview
          </p>
        </div>
      </motion.div>

      {/* Milestone Celebration Banner */}
      <AnimatePresence>
        {activeMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #FFD54F 0%, #FFB74D 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(255,183,77,0.35)',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 15, fontWeight: 700, color: '#5D4037' }}
            >
              {'\uD83C\uDF89'} Milestone: {activeMilestone} foods conquered!
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => dismissMilestone(activeMilestone)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#5D4037',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Mood Check */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: 16 }}
      >
        <p style={{ fontSize: 13, color: 'var(--stone)', margin: '0 0 8px', textAlign: 'center' }}>
          How are you feeling right now?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {DAILY_MOODS.map((m) => (
            <motion.button
              key={m.label}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleDailyMood(m.label)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                border: dailyMood === m.label ? '2.5px solid var(--sage)' : '1.5px solid var(--sand)',
                backgroundColor: dailyMood === m.label ? 'var(--sage-light)' : 'var(--white)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                boxShadow: dailyMood === m.label ? '0 0 0 3px rgba(74,124,89,0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{m.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: dailyMood === m.label ? 'var(--sage)' : 'var(--stone)' }}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Streak Counter */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '8px 14px',
          backgroundColor: streak > 0 ? '#FFF3E0' : 'var(--white)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Flame size={20} color={streak > 0 ? '#FF6D00' : 'var(--stone)'} />
        <span style={{ fontSize: 14, fontWeight: 700, color: streak > 0 ? '#E65100' : 'var(--stone)' }}>
          {streak > 0 ? `${streak} day streak` : 'Start your streak today!'}
        </span>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}
      >
        {[
          { icon: <UtensilsCrossed size={18} />, label: 'Safe Foods', value: safeFoodCount, color: '#81C784' },
          { icon: <GitBranch size={18} />, label: 'Bridges', value: activeBridges, color: '#4FC3F7' },
          { icon: <Trophy size={18} />, label: 'Wins', value: totalWins, color: '#FFD54F' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 10px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: stat.color + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              color: stat.color,
            }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--bark)' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--stone)', fontWeight: 600 }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* This Week Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: 16 }}
      >
        <Card style={{
          background: 'var(--sage-light)',
          border: '1px solid rgba(74,124,89,0.15)',
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--bark)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {'\uD83D\uDCC5'} This Week
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--bark)' }}>{weeklyStats.thisWeekFoods}</span>
              <span style={{ fontSize: 12, color: 'var(--stone)', marginLeft: 4 }}>foods added</span>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--bark)' }}>{weeklyStats.thisWeekTriggers}</span>
              <span style={{ fontSize: 12, color: 'var(--stone)', marginLeft: 4 }}>triggers</span>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--bark)' }}>{weeklyStats.thisWeekWins}</span>
              <span style={{ fontSize: 12, color: 'var(--stone)', marginLeft: 4 }}>wins</span>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--bark)' }}>
                {weeklyStats.avgComfort > 0 ? weeklyStats.avgComfort.toFixed(1) : '--'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--stone)', marginLeft: 4 }}>avg comfort</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--bark)', margin: 0, lineHeight: 1.5, opacity: 0.85 }}>
            {getMotivationalLine(weeklyStats)}
          </p>
        </Card>
      </motion.div>

      {/* Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card style={{
          background: 'linear-gradient(135deg, #E8F5E9 0%, #FFF8E1 100%)',
          border: '1px solid #C8E6C9',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22 }}>💡</span>
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--bark)',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Insight
              </div>
              <p style={{ fontSize: 13, color: 'var(--bark)', margin: 0, lineHeight: 1.5, opacity: 0.85 }}>
                {insight}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          color: 'var(--bark)',
          margin: '20px 0 10px',
        }}>
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <Card>
            <p style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', margin: 0 }}>
              No activity yet. Start by adding a safe food!
            </p>
          </Card>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show">
            {recentActivity.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {ACTIVITY_ICONS[item.type] || '📌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      color: 'var(--bark)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>
                      {daysAgo(item.date)} &middot; {formatShortDate(item.date)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Floating Quick Actions */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        right: 'max(16px, calc(50% - 214px))',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 100,
      }}>
        {[
          { icon: <AlertTriangle size={18} />, label: 'Log trigger', color: '#E57373', path: '/log' },
          { icon: <SmilePlus size={18} />, label: 'Log mood', color: '#4FC3F7', path: '/log' },
          { icon: <Zap size={18} />, label: 'Log win', color: '#FFD54F', path: '/wins' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1, type: 'spring', bounce: 0.4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(action.path)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              border: 'none',
              backgroundColor: action.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${action.color}55`,
            }}
            title={action.label}
          >
            {action.icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
