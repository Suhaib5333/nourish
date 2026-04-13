import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Badge, BottomSheet, EmptyState } from '../../components/ui';
import { formatDate, formatShortDate } from '../../utils/dates';
import { getTopTrigger, getAverageComfort } from '../../utils/analytics';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  TRIGGER_WEATHER,
} from '../../utils/constants';
import {
  Database, Trophy, Utensils, Brain, CloudRain,
  Salad, Zap, Award,
} from 'lucide-react';

const PURPLE = '#7B68A8';
const PURPLE_BG = '#F3EFF8';

/* ── Tab config ── */
const TABS = [
  { id: 'foods', label: 'Foods', Icon: Salad },
  { id: 'wins', label: 'Wins', Icon: Award },
  { id: 'mood', label: 'Mood', Icon: Brain },
  { id: 'triggers', label: 'Triggers', Icon: Zap },
];

/* ── Stagger animation ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.3, bounce: 0 } },
};

/* ═══════════════════════════════════════════ */
/*  Main Component                             */
/* ═══════════════════════════════════════════ */
export default function PatientData() {
  const { foodMap, wins, moods, triggers } = useApp();
  const [tab, setTab] = useState('foods');
  const [catFilter, setCatFilter] = useState('All');
  const [detail, setDetail] = useState(null);

  const foods = useMemo(() => {
    if (catFilter === 'All') return foodMap;
    return foodMap.filter((f) => f.category === catFilter);
  }, [foodMap, catFilter]);

  const sortedWins = useMemo(() => [...wins].sort((a, b) => new Date(b.date) - new Date(a.date)), [wins]);
  const sortedMoods = useMemo(() => [...moods].sort((a, b) => new Date(b.date) - new Date(a.date)), [moods]);
  const sortedTriggers = useMemo(() => [...triggers].sort((a, b) => new Date(b.date) - new Date(a.date)), [triggers]);
  const avgComfort = useMemo(() => getAverageComfort(moods), [moods]);
  const topTrigger = useMemo(() => getTopTrigger(triggers), [triggers]);

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, backgroundColor: PURPLE_BG,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Database size={16} color={PURPLE} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--bark)', margin: 0 }}>
          Patient Data
        </h2>
      </div>

      {/* ── Custom Tab Bar ── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        backgroundColor: '#EAE5DF', borderRadius: 10, padding: 3,
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '7px 4px', borderRadius: 8, border: 'none',
                backgroundColor: active ? '#fff' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                color: active ? PURPLE : 'var(--stone)',
                cursor: 'pointer', transition: 'all 0.2s',
                fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── FOODS ── */}
      {tab === 'foods' && (
        <>
          <StatBar icon={<Utensils size={13} />} text={`${foods.length} safe food${foods.length !== 1 ? 's' : ''}`} />

          {/* Filters — wrapping, not scrolling */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {['All', ...CATEGORIES].map((cat) => {
              const active = catFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  style={{
                    padding: '4px 10px', fontSize: 10, fontWeight: 700,
                    borderRadius: 20, border: 'none', cursor: 'pointer',
                    backgroundColor: active ? PURPLE : '#EAE5DF',
                    color: active ? '#fff' : 'var(--bark)',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat !== 'All' ? `${CATEGORY_ICONS[cat]} ${cat}` : 'All'}
                </button>
              );
            })}
          </div>

          {foods.length === 0 ? (
            <EmptyState icon="🍽️" text="No foods in this category." />
          ) : (
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
            >
              {foods.map((f) => (
                <motion.div key={f.id} variants={fadeUp} style={{ minWidth: 0 }}>
                  <div
                    onClick={() => setDetail(f)}
                    style={{
                      backgroundColor: '#fff', borderRadius: 12, padding: 12,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      height: 130, overflow: 'hidden',
                    }}
                  >
                    <div style={{ fontSize: 22, lineHeight: 1 }}>
                      {CATEGORY_ICONS[f.category] || '🍽️'}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: 'var(--bark)',
                      marginTop: 6, lineHeight: 1.25,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                    }}>
                      {f.name}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                      <Badge text={f.category} color={CATEGORY_COLORS[f.category] || '#B0BEC5'} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <BottomSheet open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
            {detail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 32 }}>{CATEGORY_ICONS[detail.category] || '🍽️'}</span>
                  <Badge text={detail.category} color={CATEGORY_COLORS[detail.category] || '#B0BEC5'} />
                </div>
                {detail.prepMethod && <DetailSection label="Preparation" value={detail.prepMethod} />}
                {detail.whatILike && <DetailSection label="What I Like" value={detail.whatILike} />}
                {detail.wouldntEat && <DetailSection label="Won't Eat If" value={detail.wouldntEat} />}
                {detail.dateAdded && <DetailSection label="Added" value={formatDate(detail.dateAdded)} />}
              </div>
            )}
          </BottomSheet>
        </>
      )}

      {/* ── WINS ── */}
      {tab === 'wins' && (
        <>
          <StatBar icon={<Trophy size={13} />} text={`${sortedWins.length} victor${sortedWins.length !== 1 ? 'ies' : 'y'}`} />

          {sortedWins.length === 0 ? (
            <EmptyState icon="🏆" text="No wins recorded yet." />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedWins.map((w) => (
                <motion.div key={w.id} variants={fadeUp}>
                  <DataCard>
                    <CardHeader title={`🎉 ${w.food}`} date={formatShortDate(w.date)} />
                    {w.notes && <CardBody text={w.notes} />}
                    {w.source && w.source !== 'manual' && (
                      <div style={{ marginTop: 6 }}><Badge text={`from ${w.source}`} color={PURPLE} /></div>
                    )}
                  </DataCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ── MOOD ── */}
      {tab === 'mood' && (
        <>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
            fontSize: 12, color: 'var(--stone)', fontWeight: 600, marginBottom: 12,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Brain size={13} /> {sortedMoods.length} meal{sortedMoods.length !== 1 ? 's' : ''}
            </span>
            {sortedMoods.length > 0 && (
              <span style={{
                padding: '2px 8px', borderRadius: 12,
                backgroundColor: PURPLE_BG, color: PURPLE, fontWeight: 700,
              }}>
                Avg {avgComfort.toFixed(1)}/5
              </span>
            )}
          </div>

          {sortedMoods.length === 0 ? (
            <EmptyState icon="🌱" text="No mood entries yet." />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedMoods.map((m) => (
                <motion.div key={m.id} variants={fadeUp}>
                  <DataCard>
                    <CardHeader title={m.meal} date={formatShortDate(m.date)} />
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
                      {m.mealTime && <MicroBadge text={m.mealTime} bg="#E3F2FD" fg="#1976D2" />}
                      <MicroBadge text={`${m.comfort}/5`} bg={PURPLE_BG} fg={PURPLE} />
                      {m.moodBefore && <MicroBadge text={`B: ${m.moodBefore}`} bg="#E8F5E9" fg="#388E3C" />}
                      {m.moodAfter && <MicroBadge text={`A: ${m.moodAfter}`} bg="#E0F2F1" fg="#00796B" />}
                    </div>
                    {m.notes && <CardBody text={m.notes} />}
                  </DataCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ── TRIGGERS ── */}
      {tab === 'triggers' && (
        <>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
            fontSize: 12, color: 'var(--stone)', fontWeight: 600, marginBottom: 12,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CloudRain size={13} /> {sortedTriggers.length} trigger{sortedTriggers.length !== 1 ? 's' : ''}
            </span>
            {topTrigger && (
              <span style={{
                padding: '2px 8px', borderRadius: 12,
                backgroundColor: '#FDECEC', color: '#D32F2F', fontWeight: 700,
              }}>
                Top: {topTrigger.type}
              </span>
            )}
          </div>

          {sortedTriggers.length === 0 ? (
            <EmptyState icon="☀️" text="No trigger entries yet." />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedTriggers.map((t) => {
                const w = TRIGGER_WEATHER[t.triggerType] || TRIGGER_WEATHER['Other'];
                return (
                  <motion.div key={t.id} variants={fadeUp}>
                    <DataCard>
                      <CardHeader title={`${w.icon} ${t.food}`} date={formatShortDate(t.date)} />
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
                        <MicroBadge text={t.triggerType} bg="#FDECEC" fg="#D32F2F" />
                        <MicroBadge
                          text={t.avoided ? 'Avoided' : 'Ate it'}
                          bg={t.avoided ? '#FFF3E0' : '#E8F5E9'}
                          fg={t.avoided ? '#E65100' : '#2E7D32'}
                        />
                        {t.mealTime && <MicroBadge text={t.mealTime} bg="#E3F2FD" fg="#1976D2" />}
                      </div>
                      {t.description && <CardBody text={t.description} />}
                    </DataCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  Sub-components                             */
/* ═══════════════════════════════════════════ */

function StatBar({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: 'var(--stone)', fontWeight: 600, marginBottom: 10,
    }}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function DataCard({ children }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 10, padding: '10px 12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden',
      width: '100%', boxSizing: 'border-box',
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, date }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 8, width: '100%', overflow: 'hidden',
    }}>
      <span style={{
        fontSize: 13, fontWeight: 700, color: 'var(--bark)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        flex: 1, minWidth: 0,
      }}>
        {title}
      </span>
      <span style={{
        fontSize: 10, color: 'var(--stone)', flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        {date}
      </span>
    </div>
  );
}

function CardBody({ text }) {
  return (
    <div style={{
      fontSize: 11, color: '#7A8A7C', lineHeight: 1.4, marginTop: 4,
      overflow: 'hidden', textOverflow: 'ellipsis',
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      wordBreak: 'break-word',
    }}>
      {text}
    </div>
  );
}

function MicroBadge({ text, bg, fg }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px',
      borderRadius: 10, backgroundColor: bg, color: fg,
      whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>
      {text}
    </span>
  );
}

function DetailSection({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: PURPLE, textTransform: 'uppercase',
        letterSpacing: 0.8, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color: 'var(--bark)', lineHeight: 1.5,
        wordBreak: 'break-word', overflowWrap: 'break-word',
        backgroundColor: '#FAFAF8', borderRadius: 8, padding: '8px 10px',
      }}>
        {value}
      </div>
    </div>
  );
}
