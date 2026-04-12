import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, SegmentedControl, EmptyState, ProgressBar } from '../../components/ui';
import {
  getComfortTrend,
  getTriggersByWeek,
  getBridgeSuccessRate,
} from '../../utils/analytics';
import { TRIGGER_TYPES } from '../../utils/constants';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PURPLE = '#7B68A8';
const PURPLE_LIGHT = '#9B8FC2';
const CHART_COLORS = ['#7B68A8', '#9B8FC2', '#BDB0DA', '#D6CEE8', '#E8A317', '#4A90D9', '#2A9D8F', '#E57373'];

const TABS = [
  { value: 'triggers', label: 'Triggers' },
  { value: 'mood', label: 'Mood' },
  { value: 'progress', label: 'Progress' },
];

const DATE_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

function filterByDateRange(items, range, dateField = 'date') {
  if (range === 'all') return items;
  const cutoff = Date.now() - Number(range) * 86400000;
  return items.filter((item) => new Date(item[dateField]).getTime() > cutoff);
}

export default function TherapistAnalysis() {
  const [tab, setTab] = useState('triggers');
  const [dateRange, setDateRange] = useState('all');
  const { triggers, moods, bridges, foodMap, ladders } = useApp();

  const filteredTriggers = useMemo(() => filterByDateRange(triggers, dateRange), [triggers, dateRange]);
  const filteredMoods = useMemo(() => filterByDateRange(moods, dateRange), [moods, dateRange]);
  const filteredBridges = useMemo(() => filterByDateRange(bridges, dateRange, 'createdAt'), [bridges, dateRange]);

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
        Analysis
      </h2>

      {/* Date range filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: dateRange === r.value ? PURPLE : '#F0EBE5',
              color: dateRange === r.value ? '#fff' : 'var(--stone)',
              transition: 'all 0.2s',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {tab === 'triggers' && <TriggersTab triggers={filteredTriggers} />}
      {tab === 'mood' && <MoodTab moods={filteredMoods} />}
      {tab === 'progress' && (
        <ProgressTab bridges={filteredBridges} foodMap={foodMap} ladders={ladders} />
      )}
    </div>
  );
}

function TriggersTab({ triggers }) {
  const byType = useMemo(() => {
    const counts = {};
    TRIGGER_TYPES.forEach((t) => (counts[t] = 0));
    triggers.forEach((t) => {
      counts[t.triggerType] = (counts[t.triggerType] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.replace(' issue', ''), fullName: name, count }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [triggers]);

  const weeklyData = useMemo(() => getTriggersByWeek(triggers, 8), [triggers]);

  const avoidedFoods = useMemo(() => {
    const counts = {};
    triggers.forEach((t) => {
      counts[t.food] = (counts[t.food] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [triggers]);

  if (!triggers.length) {
    return <EmptyState icon="📊" text="No trigger data yet." />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 12 }}>
          Triggers by Type
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byType} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2DB" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8A9A8C' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8A9A8C' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill={PURPLE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 12 }}>
          Weekly Trigger Frequency
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2DB" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: '#8A9A8C' }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fontSize: 11, fill: '#8A9A8C' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={PURPLE}
              strokeWidth={2}
              dot={{ fill: PURPLE, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 10 }}>
          Top Avoided Foods
        </div>
        {avoidedFoods.map(([food, count], i) => (
          <div
            key={food}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < avoidedFoods.length - 1 ? '1px solid #F0EBE5' : 'none',
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--bark)' }}>{food}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: PURPLE,
                backgroundColor: '#EDE8F5',
                padding: '2px 8px',
                borderRadius: 10,
              }}
            >
              {count}x
            </span>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

function MoodTab({ moods }) {
  const trendData = useMemo(() => getComfortTrend(moods, 30), [moods]);

  const avgComfort = useMemo(() => {
    if (!moods.length) return { overall: 0, first: 0, recent: 0 };
    const overall = moods.reduce((s, m) => s + m.comfort, 0) / moods.length;
    const sorted = [...moods].sort((a, b) => new Date(a.date) - new Date(b.date));
    const half = Math.floor(sorted.length / 2);
    const first = sorted.slice(0, Math.max(half, 1)).reduce((s, m) => s + m.comfort, 0) / Math.max(half, 1);
    const recent = sorted.slice(half).reduce((s, m) => s + m.comfort, 0) / Math.max(sorted.length - half, 1);
    return { overall, first, recent };
  }, [moods]);

  if (!moods.length) {
    return <EmptyState icon="📊" text="No mood data yet." />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 12 }}>
          Comfort Trend (30 days)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2DB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#8A9A8C' }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#8A9A8C' }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              formatter={(v) => [v.toFixed(1), 'Comfort']}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={PURPLE}
              strokeWidth={2}
              dot={{ fill: PURPLE, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 12 }}>
          Comfort Comparison
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 4 }}>Earlier Period</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--bark)', fontFamily: 'var(--font-display)' }}>
              {avgComfort.first.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--stone)' }}>/5</div>
          </div>
          <div
            style={{
              width: 1,
              backgroundColor: '#E8E2DB',
            }}
          />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--stone)', marginBottom: 4 }}>Recent Period</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: PURPLE, fontFamily: 'var(--font-display)' }}>
              {avgComfort.recent.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--stone)' }}>/5</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ProgressTab({ bridges, foodMap, ladders }) {
  const bridgeStats = useMemo(() => {
    const total = bridges.length;
    const accepted = bridges.filter((b) => b.status === 'accepted').length;
    const rejected = bridges.filter((b) => b.status === 'rejected').length;
    const maybe = bridges.filter((b) => b.status === 'maybe').length;
    const rate = getBridgeSuccessRate(bridges);
    return { total, accepted, rejected, maybe, rate };
  }, [bridges]);

  const ladderStats = useMemo(() => {
    if (!ladders.length) return { total: 0, avgCompletion: 0 };
    const completions = ladders.map((l) => {
      const done = l.steps.filter((s) => s.done).length;
      return l.steps.length > 0 ? (done / l.steps.length) * 100 : 0;
    });
    const avg = completions.reduce((s, v) => s + v, 0) / completions.length;
    return { total: ladders.length, avgCompletion: Math.round(avg) };
  }, [ladders]);

  const pieData = [
    { name: 'Accepted', value: bridgeStats.accepted, color: '#4A7C59' },
    { name: 'Rejected', value: bridgeStats.rejected, color: '#E57373' },
    { name: 'Maybe', value: bridgeStats.maybe, color: '#E8A317' },
    {
      name: 'Not tried',
      value: Math.max(0, bridgeStats.total - bridgeStats.accepted - bridgeStats.rejected - bridgeStats.maybe),
      color: '#B0BEC5',
    },
  ].filter((d) => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 12 }}>
          Bridge Food Outcomes
        </div>
        {bridgeStats.total === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--stone)', textAlign: 'center', padding: 20 }}>
            No bridges created yet.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 13, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--stone)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: 12,
                fontSize: 13,
                color: 'var(--stone)',
              }}
            >
              Success rate: <strong style={{ color: PURPLE }}>{bridgeStats.rate}%</strong>
            </div>
          </>
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 8 }}>
          Safe Food Growth
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: PURPLE,
            fontFamily: 'var(--font-display)',
          }}
        >
          {foodMap.length}
        </div>
        <div style={{ fontSize: 13, color: 'var(--stone)' }}>total safe foods</div>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bark)', marginBottom: 8 }}>
          Exposure Ladders
        </div>
        {ladderStats.total === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--stone)', padding: '8px 0' }}>
            No ladders created yet.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--stone)', marginBottom: 10 }}>
              {ladderStats.total} ladder{ladderStats.total !== 1 ? 's' : ''} - avg{' '}
              <strong style={{ color: PURPLE }}>{ladderStats.avgCompletion}%</strong> complete
            </div>
            <ProgressBar value={ladderStats.avgCompletion} color={PURPLE} />
          </>
        )}
      </Card>
    </motion.div>
  );
}
