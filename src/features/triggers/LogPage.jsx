import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { uid } from '../../utils/uid';
import { formatDate, formatTime, daysAgo } from '../../utils/dates';
import { getTopTrigger, getAverageComfort, getComfortTrend } from '../../utils/analytics';
import { TRIGGER_TYPES, MOODS, TRIGGER_WEATHER, MEAL_TIMES } from '../../utils/constants';
import { Cloud, Flower2, Plus, Utensils } from 'lucide-react';
import {
  Button,
  Card,
  BottomSheet,
  Input,
  Textarea,
  Select,
  Badge,
  ComfortPicker,
  SegmentedControl,
  EmptyState,
} from '../../components/ui';

/* ------------------------------------------------------------------ */
/*  CSS keyframes injected once                                        */
/* ------------------------------------------------------------------ */
const styleId = 'trigger-log-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const sheet = document.createElement('style');
  sheet.id = styleId;
  sheet.textContent = `
    @keyframes rain-fall {
      0%   { transform: translateY(-10px); opacity: 0; }
      10%  { opacity: 1; }
      100% { transform: translateY(120px); opacity: 0; }
    }
    @keyframes lightning-flash {
      0%, 90%, 100% { opacity: 0; }
      92%, 95% { opacity: 0.9; }
    }
    @keyframes cloud-drift {
      0%   { transform: translateX(0); }
      50%  { transform: translateX(12px); }
      100% { transform: translateX(0); }
    }
    @keyframes sun-pulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.08); }
    }
    @keyframes garden-sway {
      0%, 100% { transform: rotate(0deg); }
      50%      { transform: rotate(3deg); }
    }
  `;
  document.head.appendChild(sheet);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getWeekTriggerCount(triggers) {
  const weekAgo = Date.now() - 7 * 86400000;
  return triggers.filter((t) => new Date(t.date).getTime() > weekAgo).length;
}

function getForecast(count) {
  if (count === 0) return 'Clear skies ahead -- keep it up!';
  if (count <= 2) return 'Mostly clear with a slight chance of clouds.';
  if (count <= 4) return "A few storms this week -- let's talk to Fatima about patterns.";
  return "Heavy weather lately -- remember, storms always pass.";
}

/* ------------------------------------------------------------------ */
/*  Weather Scene                                                      */
/* ------------------------------------------------------------------ */
function WeatherScene({ count }) {
  let bg, label;
  if (count === 0) {
    bg = 'linear-gradient(180deg, #FFE082 0%, #FFF9C4 100%)';
    label = 'sunny';
  } else if (count <= 2) {
    bg = 'linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 100%)';
    label = 'partly-cloudy';
  } else if (count <= 4) {
    bg = 'linear-gradient(180deg, #B0BEC5 0%, #CFD8DC 100%)';
    label = 'cloudy';
  } else {
    bg = 'linear-gradient(180deg, #37474F 0%, #546E7A 60%, #78909C 100%)';
    label = 'stormy';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: bg,
        borderRadius: 'var(--radius-md)',
        height: 160,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Sun */}
      {(label === 'sunny' || label === 'partly-cloudy') && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 32,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: label === 'sunny' ? '#FDD835' : '#FFE082',
            boxShadow: `0 0 40px ${label === 'sunny' ? '#FFD600' : '#FFE08280'}`,
            animation: 'sun-pulse 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Clouds */}
      {label !== 'sunny' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: '15%',
              width: 80,
              height: 32,
              borderRadius: 20,
              background: label === 'stormy' ? '#455A64' : '#fff',
              opacity: label === 'stormy' ? 0.7 : 0.85,
              animation: 'cloud-drift 6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '22%',
              width: 50,
              height: 28,
              borderRadius: 16,
              background: label === 'stormy' ? '#455A64' : '#fff',
              opacity: label === 'stormy' ? 0.65 : 0.8,
              animation: 'cloud-drift 8s ease-in-out infinite',
            }}
          />
          {(label === 'cloudy' || label === 'stormy') && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: '20%',
                width: 90,
                height: 34,
                borderRadius: 22,
                background: label === 'stormy' ? '#37474F' : '#ECEFF1',
                opacity: 0.9,
                animation: 'cloud-drift 7s ease-in-out infinite reverse',
              }}
            />
          )}
        </>
      )}

      {/* Rain */}
      {label === 'stormy' &&
        Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 60,
              left: `${5 + Math.random() * 90}%`,
              width: 2,
              height: 14,
              borderRadius: 1,
              background: 'rgba(200,230,255,0.6)',
              animation: `rain-fall ${0.6 + Math.random() * 0.6}s linear infinite`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}

      {/* Lightning */}
      {label === 'stormy' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.8)',
            animation: 'lightning-flash 4s ease infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 16,
          color: label === 'stormy' ? '#ECEFF1' : 'var(--bark)',
          fontSize: 13,
          fontWeight: 600,
          opacity: 0.7,
        }}
      >
        This week: {count} trigger{count !== 1 ? 's' : ''}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trigger Log View                                                   */
/* ------------------------------------------------------------------ */
function TriggerLogView() {
  const { triggers, setTriggers } = useApp();
  const show = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ food: '', triggerType: '', mealTime: '', description: '', avoided: true });

  const weekCount = useMemo(() => getWeekTriggerCount(triggers), [triggers]);
  const topTrigger = useMemo(() => getTopTrigger(triggers), [triggers]);
  const forecast = useMemo(() => getForecast(weekCount), [weekCount]);
  const sorted = useMemo(
    () => [...triggers].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [triggers],
  );

  const resetForm = () => setForm({ food: '', triggerType: '', mealTime: '', description: '', avoided: true });

  const submit = () => {
    if (!form.food.trim() || !form.triggerType) return;
    setTriggers((prev) => [
      ...prev,
      {
        id: uid(),
        food: form.food.trim(),
        triggerType: form.triggerType,
        mealTime: form.mealTime,
        description: form.description.trim(),
        avoided: form.avoided,
        date: new Date().toISOString(),
      },
    ]);
    show('Trigger logged');
    resetForm();
    setOpen(false);
  };

  return (
    <>
      <WeatherScene count={weekCount} />

      {/* Insight card */}
      <Card style={{ marginBottom: 12 }}>
        {topTrigger ? (
          <div style={{ fontSize: 14, color: 'var(--bark)' }}>
            <span style={{ fontWeight: 700 }}>Most common storm:</span>{' '}
            {topTrigger.type} ({topTrigger.count}x)
          </div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--stone)' }}>No triggers logged yet.</div>
        )}
        <div style={{ fontSize: 13, color: 'var(--stone)', marginTop: 6 }}>{forecast}</div>
      </Card>

      {/* Trigger list */}
      {sorted.length === 0 ? (
        <EmptyState icon="🌤️" text="Clear skies so far! Log a trigger when one comes up — it helps spot patterns." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <AnimatePresence initial={false}>
            {sorted.map((t) => {
              const w = TRIGGER_WEATHER[t.triggerType] || TRIGGER_WEATHER.Other;
              return (
                <motion.div
                  key={t.id}
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
                          fontSize: 28,
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#F0EBE5',
                          borderRadius: 12,
                          flexShrink: 0,
                        }}
                      >
                        {w.icon}
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
                          {t.food}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <Badge text={t.triggerType} color="var(--stone)" />
                          <Badge
                            text={t.avoided ? 'Avoided' : 'Ate it'}
                            color={t.avoided ? 'var(--danger)' : 'var(--sage)'}
                          />
                          {t.mealTime && (
                            <Badge text={t.mealTime} color="#E8A317" />
                          )}
                        </div>
                        {t.description && (
                          <div style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.4 }}>
                            {t.description}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 6 }}>
                          {daysAgo(t.date)} &middot; {formatDate(t.date)} &middot; {formatTime(t.date)}
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
      <BottomSheet open={open} onClose={() => { setOpen(false); resetForm(); }} title="Log Trigger">
        <Input
          label="Food name"
          placeholder="What food triggered you?"
          value={form.food}
          onChange={(e) => setForm((f) => ({ ...f, food: e.target.value }))}
        />
        <Select
          label="Trigger type"
          options={TRIGGER_TYPES}
          value={form.triggerType}
          onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value }))}
        />
        <Select
          label="When did this happen?"
          options={MEAL_TIMES}
          value={form.mealTime}
          onChange={(e) => setForm((f) => ({ ...f, mealTime: e.target.value }))}
        />
        <Textarea
          label="Description (optional)"
          placeholder="What happened?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        {/* Avoided toggle */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5C4C', marginBottom: 8 }}
          >
            Did you avoid the food?
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: true, label: 'Yes, avoided', color: 'var(--danger)' },
              { val: false, label: 'No, I ate it', color: 'var(--sage)' },
            ].map((opt) => (
              <motion.button
                key={String(opt.val)}
                whileTap={{ scale: 0.95 }}
                onClick={() => setForm((f) => ({ ...f, avoided: opt.val }))}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${form.avoided === opt.val ? opt.color : 'var(--sand)'}`,
                  backgroundColor: form.avoided === opt.val ? opt.color + '18' : 'var(--white)',
                  color: form.avoided === opt.val ? opt.color : 'var(--stone)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        <Button onClick={submit} style={{ width: '100%', marginTop: 4 }}>
          Log Trigger
        </Button>
      </BottomSheet>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Garden Plant                                                       */
/* ------------------------------------------------------------------ */
function Plant({ comfort, index, total }) {
  const x = total <= 1 ? 50 : 12 + (index / (total - 1)) * 76;
  const stemH = comfort * 14;
  const color = ['#8BC34A', '#66BB6A', '#43A047', '#2E7D32', '#1B5E20'][comfort - 1] || '#8BC34A';
  const flowerColors = ['#FFD54F', '#FF8A65', '#CE93D8', '#4FC3F7', '#F06292'];
  const fc = flowerColors[index % flowerColors.length];

  return (
    <g transform={`translate(${x}, 0)`} style={{ animation: 'garden-sway 3s ease-in-out infinite', animationDelay: `${index * 0.2}s`, transformOrigin: `${x}px 130px` }}>
      {/* Stem */}
      {comfort >= 2 && (
        <motion.line
          x1={0}
          y1={130}
          x2={0}
          y2={130 - stemH}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        />
      )}

      {/* Seed (dot) for comfort 1 */}
      {comfort === 1 && <circle cx={0} cy={126} r={4} fill="#8D6E63" />}

      {/* Leaves for comfort >= 3 */}
      {comfort >= 3 && (
        <>
          <ellipse cx={-8} cy={130 - stemH * 0.5} rx={7} ry={4} fill={color} opacity={0.8} transform={`rotate(-30, -8, ${130 - stemH * 0.5})`} />
          <ellipse cx={8} cy={130 - stemH * 0.6} rx={7} ry={4} fill={color} opacity={0.8} transform={`rotate(30, 8, ${130 - stemH * 0.6})`} />
        </>
      )}

      {/* Flower for comfort >= 4 */}
      {comfort >= 4 && (
        <circle cx={0} cy={130 - stemH - 6} r={comfort >= 5 ? 9 : 6} fill={fc} opacity={0.9} />
      )}

      {/* Extra petals for comfort 5 */}
      {comfort === 5 && (
        <>
          <circle cx={-7} cy={130 - stemH - 3} r={5} fill={fc} opacity={0.6} />
          <circle cx={7} cy={130 - stemH - 3} r={5} fill={fc} opacity={0.6} />
          <circle cx={0} cy={130 - stemH - 12} r={5} fill={fc} opacity={0.6} />
        </>
      )}
    </g>
  );
}

function GardenScene({ recentMoods }) {
  const avgComfort = recentMoods.length ? recentMoods.reduce((s, m) => s + m.comfort, 0) / recentMoods.length : 3;
  const skyGreen = Math.round(180 + avgComfort * 15);
  const skyBlue = Math.round(200 + avgComfort * 10);
  const bg = `linear-gradient(180deg, rgb(${220 - avgComfort * 12}, ${skyGreen}, ${skyBlue}) 0%, #E8F5E9 70%, #8D6E63 90%, #6D4C41 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: bg,
        borderRadius: 'var(--radius-md)',
        height: 150,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <svg width="100%" height="150" viewBox="0 0 100 150" preserveAspectRatio="none">
        {/* Soil */}
        <rect x={0} y={130} width={100} height={20} fill="#6D4C41" />
        <rect x={0} y={128} width={100} height={4} fill="#8D6E63" rx={1} />

        {recentMoods.map((m, i) => (
          <Plant key={m.id || i} comfort={m.comfort} index={i} total={recentMoods.length} />
        ))}
      </svg>

      {recentMoods.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--stone)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Your garden is waiting to grow...
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mood + Meals View                                                  */
/* ------------------------------------------------------------------ */
function MoodMealsView() {
  const { moods, setMoods } = useApp();
  const show = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meal: '', mealTime: '', moodBefore: '', moodAfter: '', comfort: 3, notes: '' });

  const recent7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return moods
      .filter((m) => new Date(m.date).getTime() > cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
  }, [moods]);

  const avgComfort = useMemo(() => getAverageComfort(moods), [moods]);
  const trend = useMemo(() => getComfortTrend(moods), [moods]);
  const sorted = useMemo(
    () => [...moods].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [moods],
  );

  const resetForm = () => setForm({ meal: '', mealTime: '', moodBefore: '', moodAfter: '', comfort: 3, notes: '' });

  const submit = () => {
    if (!form.meal.trim() || !form.moodBefore || !form.moodAfter) return;
    setMoods((prev) => [
      ...prev,
      {
        id: uid(),
        meal: form.meal.trim(),
        mealTime: form.mealTime,
        moodBefore: form.moodBefore,
        moodAfter: form.moodAfter,
        comfort: form.comfort,
        notes: form.notes.trim(),
        date: new Date().toISOString(),
      },
    ]);
    show('Mood logged');
    resetForm();
    setOpen(false);
  };

  const moodLabel = (val) => {
    const m = MOODS.find((x) => x.value === val);
    return m ? `${m.icon} ${m.label}` : val;
  };

  return (
    <>
      <GardenScene recentMoods={recent7} />

      {/* Stats */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--bark)' }}>
              {moods.length ? avgComfort.toFixed(1) : '--'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--stone)' }}>Avg comfort /5</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--bark)' }}>{moods.length}</div>
            <div style={{ fontSize: 12, color: 'var(--stone)' }}>Meals logged</div>
          </div>
        </div>
      </Card>

      {/* Comfort trend chart */}
      {trend.length >= 2 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--bark)', marginBottom: 8 }}>
            Comfort Trend (14 days)
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={trend}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#A0A0A0' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--white)',
                  border: '1px solid var(--sand)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [v.toFixed(1), 'Comfort']}
                labelFormatter={(l) => formatDate(l)}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="var(--sage)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--sage)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Mood entries */}
      {sorted.length === 0 ? (
        <EmptyState icon="🌱" text="Your garden is ready for planting. Log your first meal to watch it grow!" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <AnimatePresence initial={false}>
            {sorted.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
              >
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--bark)', marginBottom: 4 }}>
                    {m.meal}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Badge text={`Before: ${moodLabel(m.moodBefore)}`} color="var(--stone)" />
                    <Badge text={`After: ${moodLabel(m.moodAfter)}`} color="var(--sage)" />
                    <Badge text={`${m.comfort}/5`} color="var(--bark)" />
                    {m.mealTime && (
                      <Badge text={m.mealTime} color="#E8A317" />
                    )}
                  </div>
                  {m.notes && (
                    <div style={{ fontSize: 13, color: 'var(--stone)', lineHeight: 1.4 }}>{m.notes}</div>
                  )}
                  <div style={{ fontSize: 12, color: '#A0A0A0', marginTop: 6 }}>
                    {daysAgo(m.date)} &middot; {formatDate(m.date)} &middot; {formatTime(m.date)}
                  </div>
                </Card>
              </motion.div>
            ))}
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
      <BottomSheet open={open} onClose={() => { setOpen(false); resetForm(); }} title="Log Mood & Meal">
        <Input
          label="Meal name"
          placeholder="What did you eat?"
          value={form.meal}
          onChange={(e) => setForm((f) => ({ ...f, meal: e.target.value }))}
        />
        <Select
          label="Meal time"
          options={MEAL_TIMES}
          value={form.mealTime}
          onChange={(e) => setForm((f) => ({ ...f, mealTime: e.target.value }))}
        />
        <Select
          label="Mood before eating"
          options={MOODS}
          value={form.moodBefore}
          onChange={(e) => setForm((f) => ({ ...f, moodBefore: e.target.value }))}
        />
        <Select
          label="Mood after eating"
          options={MOODS}
          value={form.moodAfter}
          onChange={(e) => setForm((f) => ({ ...f, moodAfter: e.target.value }))}
        />
        <ComfortPicker
          label="Comfort level"
          value={form.comfort}
          onChange={(v) => setForm((f) => ({ ...f, comfort: v }))}
        />
        <Textarea
          label="Notes (optional)"
          placeholder="How did the meal go?"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <Button onClick={submit} style={{ width: '100%', marginTop: 4 }}>
          Log Mood
        </Button>
      </BottomSheet>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Combined Log Page                                                  */
/* ------------------------------------------------------------------ */
export default function LogPage() {
  const [tab, setTab] = useState('triggers');

  return (
    <div style={{ padding: '16px 16px 100px' }}>
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
        <Cloud size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
        Log
      </motion.h1>

      <SegmentedControl
        options={[
          { value: 'triggers', label: 'Triggers' },
          { value: 'mood', label: 'Mood' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        {tab === 'triggers' ? (
          <motion.div
            key="triggers"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <TriggerLogView />
          </motion.div>
        ) : (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <MoodMealsView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
