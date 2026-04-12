import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/ui';
import { getBridgeSuccessRate, getAverageComfort, getComfortTrend, getTriggersByWeek, getRecentActivity } from '../../utils/analytics';
import {
  ShieldCheck,
  GitBranch,
  Smile,
  AlertTriangle,
  Zap,
  ClipboardList,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

const PURPLE = '#7B68A8';
const PURPLE_LIGHT = '#EDE8F5';
const AMBER = '#E8A317';
const AMBER_LIGHT = '#FEF3CD';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.45, bounce: 0.12 } },
};

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { foodMap, bridges, triggers, moods, wins } = useApp();

  const stats = useMemo(() => {
    const safeCount = foodMap.length;
    const bridgeRate = getBridgeSuccessRate(bridges);
    const avgComfort = getAverageComfort(moods);
    const weekTriggers = getTriggersByWeek(triggers, 1);
    const triggersThisWeek = weekTriggers.reduce((s, w) => s + w.count, 0);
    return { safeCount, bridgeRate, avgComfort, triggersThisWeek };
  }, [foodMap, bridges, moods, triggers]);

  const alerts = useMemo(() => {
    const list = [];
    const activity = getRecentActivity(foodMap, bridges, triggers, wins, moods, 1);
    if (activity.length > 0) {
      const lastDate = new Date(activity[0].date);
      const daysSince = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
      if (daysSince >= 3) {
        list.push({ id: 'inactive', text: `No logs in ${daysSince} days`, icon: AlertTriangle });
      }
    } else {
      list.push({ id: 'no-data', text: 'No patient activity yet', icon: AlertTriangle });
    }

    const trend = getComfortTrend(moods, 14);
    if (trend.length >= 4) {
      const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
      const secondHalf = trend.slice(Math.floor(trend.length / 2));
      const avgFirst = firstHalf.reduce((s, d) => s + d.avg, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, d) => s + d.avg, 0) / secondHalf.length;
      if (avgSecond < avgFirst - 0.3) {
        list.push({ id: 'comfort-down', text: 'Comfort trending down', icon: AlertTriangle });
      }
    }

    const recentTriggers = getTriggersByWeek(triggers, 2);
    if (recentTriggers.length >= 2) {
      const sorted = recentTriggers.sort((a, b) => a.week.localeCompare(b.week));
      const last = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      if (last.count > prev.count * 1.5) {
        list.push({ id: 'trigger-spike', text: 'New trigger pattern', icon: Zap });
      }
    }

    return list;
  }, [foodMap, bridges, triggers, wins, moods]);

  const statCards = [
    { label: 'Safe Foods', value: stats.safeCount, Icon: ShieldCheck },
    { label: 'Bridge Success', value: `${stats.bridgeRate}%`, Icon: GitBranch },
    { label: 'Avg Comfort', value: stats.avgComfort.toFixed(1), Icon: Smile },
    { label: 'Triggers This Week', value: stats.triggersThisWeek, Icon: AlertTriangle },
  ];

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          color: 'var(--bark)',
          margin: '0 0 4px',
        }}
      >
        Welcome, <span style={{ color: PURPLE }}>Fatima</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ fontSize: 14, color: 'var(--stone)', margin: '0 0 20px' }}
      >
        Patient overview
      </motion.p>

      {/* Ideas Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: 20 }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #EDE8F5 0%, #F5F0FF 100%)',
            border: '1px solid #D4CBE5',
            borderRadius: 16,
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Lightbulb size={22} color={PURPLE} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)', marginBottom: 6 }}>
                This app is a work in progress!
              </div>
              <p style={{ fontSize: 13, color: 'var(--bark)', margin: 0, lineHeight: 1.55, opacity: 0.85 }}>
                Fatima, any idea you have — I can make it happen. Features, layouts, flows — if you can dream it, we can build it. Feel free to suggest ways to improve this app and we'll work on it together.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {statCards.map(({ label, value, Icon }) => (
          <motion.div key={label} variants={item}>
            <Card animate={false} style={{ textAlign: 'center', padding: 16 }}>
              <Icon size={22} color={PURPLE} style={{ marginBottom: 6 }} />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--bark)',
                  lineHeight: 1.1,
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--stone)', marginTop: 2 }}>{label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {alerts.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ marginBottom: 20 }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--stone)', marginBottom: 8 }}>
            Alerts
          </div>
          {alerts.map((a) => (
            <motion.div key={a.id} variants={item}>
              <Card
                animate={false}
                style={{
                  backgroundColor: AMBER_LIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                }}
              >
                <a.icon size={18} color={AMBER} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#7A5F00' }}>{a.text}</span>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--stone)', marginBottom: 8 }}>
        Quick Actions
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          style={{ flex: 1, backgroundColor: PURPLE }}
          onClick={() => navigate('/therapist/plan')}
        >
          <ClipboardList size={16} />
          Suggest Bridge
        </Button>
        <Button
          variant="secondary"
          style={{ flex: 1 }}
          onClick={() => navigate('/therapist/plan')}
        >
          Create Ladder
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
