import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, Badge, BottomSheet, SegmentedControl, EmptyState } from '../../components/ui';
import { formatDate, formatShortDate, formatTime } from '../../utils/dates';
import { getTopTrigger, getAverageComfort } from '../../utils/analytics';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  TRIGGER_WEATHER,
} from '../../utils/constants';
import { Database, Trophy, Utensils, Brain, CloudRain } from 'lucide-react';

const PURPLE = '#7B68A8';

const TABS = [
  { value: 'foods', label: 'Foods' },
  { value: 'wins', label: 'Wins' },
  { value: 'mood', label: 'Mood' },
  { value: 'triggers', label: 'Triggers' },
];

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.35, bounce: 0.1 } },
};

export default function PatientData() {
  const { foodMap, wins, moods, triggers } = useApp();
  const [tab, setTab] = useState('foods');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [foodDetail, setFoodDetail] = useState(null);

  const filteredFoods = useMemo(() => {
    if (categoryFilter === 'All') return foodMap;
    return foodMap.filter((f) => f.category === categoryFilter);
  }, [foodMap, categoryFilter]);

  const sortedWins = useMemo(
    () => [...wins].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [wins],
  );

  const sortedMoods = useMemo(
    () => [...moods].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [moods],
  );

  const sortedTriggers = useMemo(
    () => [...triggers].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [triggers],
  );

  const avgComfort = useMemo(() => getAverageComfort(moods), [moods]);
  const topTrigger = useMemo(() => getTopTrigger(triggers), [triggers]);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Database size={20} color={PURPLE} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--bark)', margin: 0 }}>
          Patient Data
        </h2>
      </div>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {/* ── Foods Tab ── */}
      {tab === 'foods' && (
        <div>
          {/* Stats bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10,
          }}>
            <Utensils size={14} />
            <span>{filteredFoods.length} safe food{filteredFoods.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Category filters — horizontal scroll */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12,
            WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none',
          }}>
            {['All', ...CATEGORIES].map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    flexShrink: 0, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: active ? PURPLE : '#F0EBE5',
                    color: active ? '#fff' : 'var(--bark)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}{cat}
                </button>
              );
            })}
          </div>

          {filteredFoods.length === 0 ? (
            <EmptyState icon="🍽️" text="No foods in this category." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {filteredFoods.map((food) => (
                <motion.div key={food.id} variants={item} initial="hidden" animate="show">
                  <Card
                    animate={false}
                    onClick={() => setFoodDetail(food)}
                    style={{ padding: 12, cursor: 'pointer', overflow: 'hidden', height: '100%' }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>
                      {CATEGORY_ICONS[food.category] || '🍽️'}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: 'var(--bark)', marginBottom: 4,
                      lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {food.name}
                    </div>
                    <Badge text={food.category} color={CATEGORY_COLORS[food.category] || '#B0BEC5'} />
                    {food.prepMethod && (
                      <div style={{
                        fontSize: 11, color: 'var(--stone)', marginTop: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {food.prepMethod}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <BottomSheet open={!!foodDetail} onClose={() => setFoodDetail(null)} title={foodDetail?.name}>
            {foodDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28 }}>{CATEGORY_ICONS[foodDetail.category] || '🍽️'}</span>
                  <Badge text={foodDetail.category} color={CATEGORY_COLORS[foodDetail.category] || '#B0BEC5'} />
                </div>
                {foodDetail.prepMethod && <DetailRow label="Prep Method" value={foodDetail.prepMethod} />}
                {foodDetail.whatILike && <DetailRow label="What I Like" value={foodDetail.whatILike} />}
                {foodDetail.wouldntEat && <DetailRow label="Wouldn't Eat If" value={foodDetail.wouldntEat} />}
                {foodDetail.dateAdded && <DetailRow label="Added" value={formatDate(foodDetail.dateAdded)} />}
              </div>
            )}
          </BottomSheet>
        </div>
      )}

      {/* ── Wins Tab ── */}
      {tab === 'wins' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10,
          }}>
            <Trophy size={14} />
            <span>{sortedWins.length} victor{sortedWins.length !== 1 ? 'ies' : 'y'}</span>
          </div>

          {sortedWins.length === 0 ? (
            <EmptyState icon="🏆" text="No wins recorded yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedWins.map((win) => (
                <motion.div key={win.id} variants={item} initial="hidden" animate="show">
                  <Card animate={false} style={{ padding: 12, overflow: 'hidden' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 8, marginBottom: 4,
                    }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: 'var(--bark)',
                        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        🎉 {win.food}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--stone)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {formatShortDate(win.date)}
                      </span>
                    </div>
                    {win.notes && (
                      <div style={{
                        fontSize: 12, color: '#6B7E6D', lineHeight: 1.4, marginBottom: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {win.notes}
                      </div>
                    )}
                    {win.source && win.source !== 'manual' && (
                      <Badge text={`from ${win.source}`} color={PURPLE} />
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mood Tab ── */}
      {tab === 'mood' && (
        <div>
          {/* Stats row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Brain size={14} />
              {sortedMoods.length} meal{sortedMoods.length !== 1 ? 's' : ''} logged
            </span>
            {sortedMoods.length > 0 && (
              <span>Avg comfort: <strong style={{ color: PURPLE }}>{avgComfort.toFixed(1)}/5</strong></span>
            )}
          </div>

          {sortedMoods.length === 0 ? (
            <EmptyState icon="🌱" text="No mood entries yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedMoods.map((mood) => (
                <motion.div key={mood.id} variants={item} initial="hidden" animate="show">
                  <Card animate={false} style={{ padding: 12, overflow: 'hidden' }}>
                    {/* Header: meal name + date */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 8, marginBottom: 6,
                    }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: 'var(--bark)',
                        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {mood.meal}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--stone)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {formatShortDate(mood.date)}
                      </span>
                    </div>
                    {/* Badges row */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                      {mood.mealTime && <Badge text={mood.mealTime} color="#4A90D9" />}
                      <Badge text={`${mood.comfort}/5`} color={PURPLE} />
                      {mood.moodBefore && <Badge text={`B: ${mood.moodBefore}`} color="#8A9A7B" />}
                      {mood.moodAfter && <Badge text={`A: ${mood.moodAfter}`} color="#2A9D8F" />}
                    </div>
                    {/* Notes */}
                    {mood.notes && (
                      <div style={{
                        fontSize: 12, color: '#6B7E6D', lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {mood.notes}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Triggers Tab ── */}
      {tab === 'triggers' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CloudRain size={14} />
              {sortedTriggers.length} trigger{sortedTriggers.length !== 1 ? 's' : ''}
            </span>
            {topTrigger && (
              <span>Top: <strong style={{ color: '#D32F2F' }}>{topTrigger.type}</strong></span>
            )}
          </div>

          {sortedTriggers.length === 0 ? (
            <EmptyState icon="☀️" text="No trigger entries yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedTriggers.map((t) => {
                const weather = TRIGGER_WEATHER[t.triggerType] || TRIGGER_WEATHER['Other'];
                return (
                  <motion.div key={t.id} variants={item} initial="hidden" animate="show">
                    <Card animate={false} style={{ padding: 12, overflow: 'hidden' }}>
                      {/* Header: food + date */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', gap: 8, marginBottom: 6,
                      }}>
                        <span style={{
                          fontSize: 14, fontWeight: 700, color: 'var(--bark)',
                          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {weather.icon} {t.food}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--stone)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {formatShortDate(t.date)}
                        </span>
                      </div>
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        <Badge text={t.triggerType} color="#D32F2F" />
                        <Badge
                          text={t.avoided ? 'Avoided' : 'Ate it'}
                          color={t.avoided ? '#E57373' : '#2A9D8F'}
                        />
                        {t.mealTime && <Badge text={t.mealTime} color="#4A90D9" />}
                      </div>
                      {/* Description */}
                      {t.description && (
                        <div style={{
                          fontSize: 12, color: '#6B7E6D', lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {t.description}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: PURPLE, textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color: 'var(--bark)', lineHeight: 1.5,
        wordBreak: 'break-word', overflowWrap: 'break-word',
      }}>
        {value}
      </div>
    </div>
  );
}
