import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { uid } from '../../utils/uid';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '../../utils/constants';
import { formatShortDate, formatDate } from '../../utils/dates';
import { SegmentedControl, BottomSheet, Button, Input, Textarea, Select, Badge, ConfirmDialog, EmptyState } from '../../components/ui';
import { Plus, MapPin, BookOpen, Utensils } from 'lucide-react';

/* ─── Zone layout for the terrain map ─── */
const ZONE_DEFS = {
  Protein:    { cx: 310, cy: 70,  rx: 70, ry: 50, label: 'Protein Peninsula' },
  Carbs:      { cx: 100, cy: 160, rx: 75, ry: 55, label: 'Carb Canyon' },
  Vegetables: { cx: 90,  cy: 310, rx: 70, ry: 50, label: 'Veggie Valley' },
  Fruits:     { cx: 310, cy: 330, rx: 65, ry: 50, label: 'Fruit Forest' },
  Snacks:     { cx: 200, cy: 50,  rx: 65, ry: 40, label: 'Snack Summit' },
  Drinks:     { cx: 370, cy: 200, rx: 50, ry: 60, label: 'Drink Delta' },
  Dairy:      { cx: 70,  cy: 60,  rx: 60, ry: 45, label: 'Dairy Dunes' },
  Other:      { cx: 210, cy: 370, rx: 45, ry: 35, label: 'Other Outpost' },
};

/* pseudo-random position within zone bounds, seeded by string */
function pinPos(name, zone) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const dist = (Math.abs(hash >> 8) % 60) / 100;
  return {
    x: zone.cx + Math.cos(angle) * zone.rx * dist,
    y: zone.cy + Math.sin(angle) * zone.ry * dist,
  };
}

/* blob path for a zone */
function blobPath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy}
    C ${cx - rx} ${cy - ry * 0.8}, ${cx - rx * 0.5} ${cy - ry}, ${cx} ${cy - ry}
    C ${cx + rx * 0.5} ${cy - ry}, ${cx + rx} ${cy - ry * 0.8}, ${cx + rx} ${cy}
    C ${cx + rx} ${cy + ry * 0.8}, ${cx + rx * 0.5} ${cy + ry}, ${cx} ${cy + ry}
    C ${cx - rx * 0.5} ${cy + ry}, ${cx - rx} ${cy + ry * 0.8}, ${cx - rx} ${cy}
    Z`;
}

/* ─── Food Map View (terrain map) ─── */
function FoodMapView({ foods, onPinClick }) {
  const foodsByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c] = []; });
    foods.forEach(f => {
      if (map[f.category]) map[f.category].push(f);
    });
    return map;
  }, [foods]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 430 420"
        style={{
          width: '100%',
          maxWidth: 430,
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FAF6EE',
          boxShadow: 'inset 0 0 40px rgba(139,111,71,0.08)',
        }}
      >
        {/* Subtle grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D7CFC2" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="430" height="420" fill="url(#grid)" opacity="0.4" />

        {/* Zone blobs */}
        {CATEGORIES.map(cat => {
          const zone = ZONE_DEFS[cat];
          const color = CATEGORY_COLORS[cat];
          const isEmpty = foodsByCategory[cat].length === 0;
          return (
            <g key={cat}>
              <path
                d={blobPath(zone.cx, zone.cy, zone.rx, zone.ry)}
                fill={color}
                opacity={isEmpty ? 0.08 : 0.18}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={isEmpty ? 0.15 : 0.35}
              />
              {/* Fog overlay for empty zones */}
              {isEmpty && (
                <path
                  d={blobPath(zone.cx, zone.cy, zone.rx, zone.ry)}
                  fill="#F5F0E8"
                  opacity={0.55}
                />
              )}
            </g>
          );
        })}

        {/* Zone labels with floating animation */}
        {CATEGORIES.map((cat, i) => {
          const zone = ZONE_DEFS[cat];
          return (
            <g key={`label-${cat}`}>
              <motion.g
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <text
                  x={zone.cx}
                  y={zone.cy - zone.ry + 14}
                  textAnchor="middle"
                  fill="#6B5B4F"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="var(--font-display)"
                  opacity={0.7}
                >
                  {CATEGORY_ICONS[cat]} {zone.label}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Food pins */}
        {CATEGORIES.map(cat =>
          foodsByCategory[cat].map(food => {
            const zone = ZONE_DEFS[cat];
            const pos = pinPos(food.name, zone);
            const color = CATEGORY_COLORS[cat];
            return (
              <g
                key={food.id}
                onClick={() => onPinClick(food)}
                style={{ cursor: 'pointer' }}
              >
                {/* Shadow */}
                <ellipse cx={pos.x} cy={pos.y + 4} rx={5} ry={2} fill="rgba(0,0,0,0.12)" />
                {/* Pin */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: Math.random() * 0.3 }}
                  whileHover={{ scale: 1.4 }}
                />
                <text
                  x={pos.x}
                  y={pos.y - 10}
                  textAnchor="middle"
                  fill="#4A3F35"
                  fontSize="7"
                  fontWeight="600"
                  opacity={0.8}
                >
                  {food.name.length > 10 ? food.name.slice(0, 9) + '..' : food.name}
                </text>
                {food.dateAdded && (
                  <text
                    x={pos.x}
                    y={pos.y + 14}
                    textAnchor="middle"
                    fill="#8A9A8C"
                    fontSize="5"
                    opacity={0.7}
                  >
                    {formatShortDate(food.dateAdded)}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

/* ─── Safe Library View (bookshelf) ─── */
function SafeLibraryView({ foods, onBookClick }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...CATEGORIES];

  const filtered = useMemo(() => {
    if (filter === 'All') return foods;
    return foods.filter(f => f.category === filter);
  }, [foods, filter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [filtered]);

  const shelfStyle = {
    background: 'linear-gradient(180deg, #A0845C 0%, #8B6F47 4%, #7A6040 8%, #8B6F47 10%)',
    borderRadius: 4,
    height: 6,
    marginTop: 2,
    boxShadow: '0 2px 6px rgba(80,50,20,0.3)',
  };

  return (
    <div>
      {/* Filter chips */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 12,
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.92 }}
            onClick={() => setFilter(cat)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filter === cat ? 'var(--sage)' : '#F0EBE5',
              color: filter === cat ? '#fff' : 'var(--bark)',
              transition: 'all 0.2s',
            }}
          >
            {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}{cat}
          </motion.button>
        ))}
      </div>

      {/* Bookshelf */}
      <div style={{
        backgroundColor: '#F5EDE0',
        borderRadius: 'var(--radius-md)',
        padding: '16px 12px',
        minHeight: 200,
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49.5%, rgba(139,111,71,0.04) 49.5%, rgba(139,111,71,0.04) 50.5%, transparent 50.5%)',
      }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📚</span>
            <p style={{ fontSize: 13, color: 'var(--stone)' }}>No books on the shelf yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catFoods]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#8B6F47',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {CATEGORY_ICONS[cat]} {cat}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end', minHeight: 90 }}>
                <AnimatePresence>
                  {catFoods.map(food => (
                    <motion.div
                      key={food.id}
                      layout
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ y: -6, rotateZ: -2 }}
                      whileTap={{ scale: 1.05, rotateZ: -8 }}
                      onClick={() => onBookClick(food)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                    <div
                      style={{
                        width: 32,
                        height: 80 + (food.name.length % 3) * 8,
                        backgroundColor: CATEGORY_COLORS[food.category],
                        borderRadius: '3px 5px 5px 3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '2px 1px 4px rgba(0,0,0,0.15), inset -2px 0 4px rgba(0,0,0,0.1)',
                        borderLeft: `3px solid ${CATEGORY_COLORS[food.category]}dd`,
                      }}
                    >
                      {/* Spine text */}
                      <span style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: 8,
                        fontWeight: 700,
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        letterSpacing: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: '90%',
                        whiteSpace: 'nowrap',
                      }}>
                        {food.name}
                      </span>
                    </div>
                    {food.dateAdded && (
                      <span style={{ fontSize: 7, color: '#8B6F47', marginTop: 2, whiteSpace: 'nowrap' }}>
                        {formatShortDate(food.dateAdded)}
                      </span>
                    )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Shelf */}
              <div style={shelfStyle} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Add Food Form ─── */
function AddFoodForm({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [prep, setPrep] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !category) return;
    onSubmit({
      id: uid(),
      name: name.trim(),
      category,
      prepMethod: prep.trim(),
      whatILike: likes.trim(),
      wouldntEat: dislikes.trim(),
      dateAdded: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label={<><Utensils size={13} style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.7 }} />Food name</>}
        placeholder="e.g. Chicken nuggets"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <Select
        label="Category"
        options={CATEGORIES}
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
      />
      <Textarea
        label="Prep method"
        placeholder="How do you like it prepared?"
        value={prep}
        onChange={e => setPrep(e.target.value)}
      />
      <Textarea
        label="What I like about it"
        placeholder="Texture, taste, temperature..."
        value={likes}
        onChange={e => setLikes(e.target.value)}
      />
      <Textarea
        label="Wouldn't eat if..."
        placeholder="e.g. Too crunchy, wrong brand..."
        value={dislikes}
        onChange={e => setDislikes(e.target.value)}
      />
      <Button type="submit" style={{ width: '100%', marginTop: 8 }}>
        Add to Map
      </Button>
    </form>
  );
}

/* ─── Edit Food Form ─── */
function EditFoodForm({ food, onSubmit, onClose }) {
  const [name, setName] = useState(food.name);
  const [category, setCategory] = useState(food.category);
  const [prep, setPrep] = useState(food.prepMethod || '');
  const [likes, setLikes] = useState(food.whatILike || '');
  const [dislikes, setDislikes] = useState(food.wouldntEat || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !category) return;
    onSubmit({
      ...food,
      name: name.trim(),
      category,
      prepMethod: prep.trim(),
      whatILike: likes.trim(),
      wouldntEat: dislikes.trim(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label={<><Utensils size={13} style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.7 }} />Food name</>}
        placeholder="e.g. Chicken nuggets"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <Select
        label="Category"
        options={CATEGORIES}
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
      />
      <Textarea
        label="Prep method"
        placeholder="How do you like it prepared?"
        value={prep}
        onChange={e => setPrep(e.target.value)}
      />
      <Textarea
        label="What I like about it"
        placeholder="Texture, taste, temperature..."
        value={likes}
        onChange={e => setLikes(e.target.value)}
      />
      <Textarea
        label="Wouldn't eat if..."
        placeholder="e.g. Too crunchy, wrong brand..."
        value={dislikes}
        onChange={e => setDislikes(e.target.value)}
      />
      <Button type="submit" style={{ width: '100%', marginTop: 8 }}>
        Save Changes
      </Button>
    </form>
  );
}

/* ─── Food Detail Sheet ─── */
function FoodDetail({ food, onEdit, onDelete }) {
  if (!food) return null;
  const color = CATEGORY_COLORS[food.category];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: color + '22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}>
          {CATEGORY_ICONS[food.category]}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bark)' }}>{food.name}</div>
          <Badge text={food.category} color={color} />
        </div>
      </div>
      {food.prepMethod && (
        <DetailRow label="Prep method" value={food.prepMethod} />
      )}
      {food.whatILike && (
        <DetailRow label="What I like" value={food.whatILike} />
      )}
      {food.wouldntEat && (
        <DetailRow label="Wouldn't eat if" value={food.wouldntEat} />
      )}
      {food.dateAdded && (
        <DetailRow label="Added" value={formatDate(food.dateAdded)} />
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button onClick={() => onEdit(food)} style={{ flex: 1 }}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(food)} style={{ flex: 1 }}>Delete</Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--bark)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function FoodsPage() {
  const { foodMap, setFoodMap, allLoaded } = useApp();
  const show = useToast();

  const [view, setView] = useState('map');
  const [addOpen, setAddOpen] = useState(false);
  const [detailFood, setDetailFood] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);

  const handleAddFood = useCallback((food) => {
    setFoodMap(prev => [...prev, food]);
    show('Food added to map!');
  }, [setFoodMap, show]);

  const handlePinClick = useCallback((food) => {
    setDetailFood(food);
  }, []);

  const handleEditFood = useCallback((updated) => {
    setFoodMap(prev => prev.map(f => f.id === updated.id ? updated : f));
    setDetailFood(null);
    show('Food updated!');
  }, [setFoodMap, show]);

  const handleDeleteFood = useCallback(() => {
    if (!deletingFood) return;
    setFoodMap(prev => prev.filter(f => f.id !== deletingFood.id));
    setDeletingFood(null);
    setDetailFood(null);
    show('Food removed');
  }, [deletingFood, setFoodMap, show]);

  if (!allLoaded) return null;

  return (
    <div style={{ padding: '20px 16px 120px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          color: 'var(--bark)',
          margin: '0 0 16px',
        }}
      >
        <MapPin size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, opacity: 0.7 }} />
        My Foods
      </motion.h1>

      <SegmentedControl
        options={[
          { value: 'map', label: 'Map' },
          { value: 'library', label: 'Library' },
        ]}
        value={view}
        onChange={setView}
      />

      <AnimatePresence mode="wait">
        {view === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {foodMap.length === 0 ? (
              <EmptyState
                icon="🗺️"
                text="Your food world is waiting to be explored. Drop your first pin and start mapping!"
                action={
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus size={16} /> Add First Food
                  </Button>
                }
              />
            ) : (
              <FoodMapView foods={foodMap} onPinClick={handlePinClick} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {foodMap.length === 0 ? (
              <EmptyState
                icon="📚"
                text="Your food world is waiting to be explored. Drop your first pin and start mapping!"
                action={
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus size={16} /> Add First Food
                  </Button>
                }
              />
            ) : (
              <SafeLibraryView foods={foodMap} onBookClick={handlePinClick} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating add button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3, bounce: 0.4 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setAddOpen(true)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 'max(16px, calc(50% - 214px))',
          width: 54,
          height: 54,
          borderRadius: 16,
          border: 'none',
          backgroundColor: 'var(--sage)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(74,124,89,0.35)',
          zIndex: 100,
        }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Add food sheet */}
      <BottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Safe Food"
      >
        <AddFoodForm onSubmit={handleAddFood} onClose={() => setAddOpen(false)} />
      </BottomSheet>

      {/* Food detail sheet */}
      <BottomSheet
        open={!!detailFood}
        onClose={() => setDetailFood(null)}
        title={detailFood?.name || 'Food Details'}
      >
        <FoodDetail
          food={detailFood}
          onEdit={(food) => { setDetailFood(null); setEditingFood(food); }}
          onDelete={(food) => setDeletingFood(food)}
        />
      </BottomSheet>

      {/* Edit food sheet */}
      <BottomSheet
        open={!!editingFood}
        onClose={() => setEditingFood(null)}
        title="Edit Food"
      >
        {editingFood && (
          <EditFoodForm
            food={editingFood}
            onSubmit={handleEditFood}
            onClose={() => setEditingFood(null)}
          />
        )}
      </BottomSheet>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingFood}
        title={`Remove ${deletingFood?.name}?`}
        message="This will remove it from your food map and library."
        confirmText="Remove"
        danger
        onConfirm={handleDeleteFood}
        onCancel={() => setDeletingFood(null)}
      />
    </div>
  );
}
