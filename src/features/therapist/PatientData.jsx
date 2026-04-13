import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, Badge, BottomSheet, SegmentedControl, EmptyState } from '../../components/ui';
import { formatDate, formatTime } from '../../utils/dates';
import { getTopTrigger, getAverageComfort } from '../../utils/analytics';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  TRIGGER_WEATHER,
} from '../../utils/constants';
import { Database } from 'lucide-react';

const PURPLE = '#7B68A8';

const TABS = [
  { value: 'foods', label: 'Foods' },
  { value: 'wins', label: 'Wins' },
  { value: 'mood', label: 'Mood' },
  { value: 'triggers', label: 'Triggers' },
];

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.12 } },
};

export default function PatientData() {
  const { foodMap, wins, moods, triggers } = useApp();
  const [tab, setTab] = useState('foods');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [foodDetail, setFoodDetail] = useState(null);

  // Foods
  const filteredFoods = useMemo(() => {
    if (categoryFilter === 'All') return foodMap;
    return foodMap.filter((f) => f.category === categoryFilter);
  }, [foodMap, categoryFilter]);

  // Wins sorted newest first
  const sortedWins = useMemo(
    () => [...wins].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [wins],
  );

  // Moods sorted newest first
  const sortedMoods = useMemo(
    () => [...moods].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [moods],
  );

  // Triggers sorted newest first
  const sortedTriggers = useMemo(
    () => [...triggers].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [triggers],
  );

  const avgComfort = useMemo(() => getAverageComfort(moods), [moods]);
  const topTrigger = useMemo(() => getTopTrigger(triggers), [triggers]);

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
        <Database
          size={20}
          style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }}
        />
        Patient Data
      </h2>

      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      {/* ── Foods Tab ── */}
      {tab === 'foods' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10 }}>
            {filteredFoods.length} safe food{filteredFoods.length !== 1 ? 's' : ''}
          </div>

          {/* Category filter chips */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 12,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {['All', ...CATEGORIES].map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: active ? PURPLE : '#F0EBE5',
                    color: active ? '#fff' : 'var(--bark)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}
                  {cat}
                </button>
              );
            })}
          </div>

          {filteredFoods.length === 0 ? (
            <EmptyState icon="🍽️" text="No foods in this category." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filteredFoods.map((food) => (
                <motion.div key={food.id} variants={item} initial="hidden" animate="show">
                  <Card
                    animate={false}
                    onClick={() => setFoodDetail(food)}
                    style={{ padding: 14, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>
                      {CATEGORY_ICONS[food.category] || '🍽️'}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--bark)',
                        marginBottom: 6,
                        lineHeight: 1.3,
                      }}
                    >
                      {food.name}
                    </div>
                    <Badge
                      text={food.category}
                      color={CATEGORY_COLORS[food.category] || '#B0BEC5'}
                    />
                    {food.prepMethod && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--stone)',
                          marginTop: 6,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {food.prepMethod}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Food detail bottom sheet */}
          <BottomSheet
            open={!!foodDetail}
            onClose={() => setFoodDetail(null)}
            title={foodDetail?.name}
          >
            {foodDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28 }}>
                    {CATEGORY_ICONS[foodDetail.category] || '🍽️'}
                  </span>
                  <Badge
                    text={foodDetail.category}
                    color={CATEGORY_COLORS[foodDetail.category] || '#B0BEC5'}
                  />
                </div>
                {foodDetail.prepMethod && (
                  <DetailRow label="Prep Method" value={foodDetail.prepMethod} />
                )}
                {foodDetail.whatILike && (
                  <DetailRow label="What I Like" value={foodDetail.whatILike} />
                )}
                {foodDetail.wouldntEat && (
                  <DetailRow label="Wouldn't Eat If" value={foodDetail.wouldntEat} />
                )}
                {foodDetail.dateAdded && (
                  <DetailRow label="Added" value={formatDate(foodDetail.dateAdded)} />
                )}
              </div>
            )}
          </BottomSheet>
        </div>
      )}

      {/* ── Wins Tab ── */}
      {tab === 'wins' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--stone)', fontWeight: 600, marginBottom: 10 }}>
            {sortedWins.length} victor{sortedWins.length !== 1 ? 'ies' : 'y'}
          </div>

          {sortedWins.length === 0 ? (
            <EmptyState icon="🏆" text="No wins recorded yet." />
          ) : (
            <AnimatePresence>
              {sortedWins.map((win) => (
                <motion.div
                  key={win.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                >
                  <Card animate={false} style={{ padding: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)', flex: 1 }}
                      >
                        {win.food}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--stone)', flexShrink: 0 }}>
                        {formatDate(win.date)}
                      </span>
                    </div>
                    {win.notes && (
                      <div style={{ fontSize: 13, color: 'var(--bark)', lineHeight: 1.5 }}>
                        {win.notes}
                      </div>
                    )}
                    {win.source && (
                      <Badge
                        text={win.source}
                        color={PURPLE}
                        style={{ marginTop: 6 }}
                      />
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* ── Mood Tab ── */}
      {tab === 'mood' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 13,
              color: 'var(--stone)',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            <span>
              {sortedMoods.length} meal{sortedMoods.length !== 1 ? 's' : ''} logged
            </span>
            {sortedMoods.length > 0 && (
              <span>Avg comfort: {avgComfort.toFixed(1)}/5</span>
            )}
          </div>

          {sortedMoods.length === 0 ? (
            <EmptyState icon="😊" text="No mood entries yet." />
          ) : (
            <AnimatePresence>
              {sortedMoods.map((mood) => (
                <motion.div
                  key={mood.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                >
                  <Card animate={false} style={{ padding: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)' }}>
                        {mood.meal}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--stone)', flexShrink: 0 }}>
                        {formatDate(mood.date)} {formatTime(mood.date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {mood.mealTime && <Badge text={mood.mealTime} color="#4A90D9" />}
                      {mood.moodBefore && (
                        <Badge text={`Before: ${mood.moodBefore}`} color="#8A9A7B" />
                      )}
                      {mood.moodAfter && (
                        <Badge text={`After: ${mood.moodAfter}`} color="#2A9D8F" />
                      )}
                      {mood.comfort != null && (
                        <Badge text={`Comfort: ${mood.comfort}/5`} color={PURPLE} />
                      )}
                    </div>
                    {mood.notes && (
                      <div
                        style={{ fontSize: 13, color: 'var(--bark)', lineHeight: 1.5 }}
                      >
                        {mood.notes}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* ── Triggers Tab ── */}
      {tab === 'triggers' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 13,
              color: 'var(--stone)',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            <span>
              {sortedTriggers.length} trigger{sortedTriggers.length !== 1 ? 's' : ''} logged
            </span>
            {topTrigger && <span>Top: {topTrigger}</span>}
          </div>

          {sortedTriggers.length === 0 ? (
            <EmptyState icon="🌧️" text="No trigger entries yet." />
          ) : (
            <AnimatePresence>
              {sortedTriggers.map((t) => {
                const weather = TRIGGER_WEATHER[t.triggerType] || TRIGGER_WEATHER['Other'];
                return (
                  <motion.div
                    key={t.id}
                    variants={item}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                  >
                    <Card animate={false} style={{ padding: 14 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--bark)' }}>
                          {t.food}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--stone)', flexShrink: 0 }}>
                          {formatDate(t.date)} {formatTime(t.date)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <Badge
                          text={`${weather.icon} ${t.triggerType}`}
                          color="#D32F2F"
                        />
                        {t.avoided != null && (
                          <Badge
                            text={t.avoided ? 'Avoided' : 'Ate it'}
                            color={t.avoided ? '#E57373' : '#2A9D8F'}
                          />
                        )}
                        {t.mealTime && <Badge text={t.mealTime} color="#4A90D9" />}
                      </div>
                      {t.description && (
                        <div
                          style={{ fontSize: 13, color: 'var(--bark)', lineHeight: 1.5 }}
                        >
                          {t.description}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stone)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--bark)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
