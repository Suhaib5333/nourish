import { useState, useEffect, useCallback } from "react";

const TABS = [
  { id: "map", label: "Food Map", icon: "🗺️" },
  { id: "bridge", label: "Bridge Foods", icon: "🌉" },
  { id: "triggers", label: "Triggers", icon: "⚡" },
  { id: "ladder", label: "Exposure Ladder", icon: "🪜" },
  { id: "library", label: "Safe Foods", icon: "📚" },
  { id: "wins", label: "Wins", icon: "🏆" },
  { id: "mood", label: "Mood + Meals", icon: "🧠" },
];

const CATEGORIES = ["Protein", "Carbs", "Vegetables", "Fruits", "Snacks", "Drinks", "Dairy", "Other"];
const TRIGGER_TYPES = ["Unexpected ingredient", "Cross-contamination", "Texture issue", "Visual issue", "Unknown food", "Wrong preparation", "Food combination", "Other"];
const MOODS = ["😊 Great", "🙂 Good", "😐 Neutral", "😟 Anxious", "😣 Stressed"];
const COMFORT = [1, 2, 3, 4, 5];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Storage helper
const store = {
  async get(key) {
    try {
      const r = await window.storage.get(key, true);
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      await window.storage.set(key, JSON.stringify(val), true);
    } catch (e) { console.error("Storage error:", e); }
  }
};

function usePersistedState(key, initial) {
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    store.get(key).then(v => {
      if (v !== null) setData(v);
      setLoaded(true);
    });
  }, [key]);

  const update = useCallback((valOrFn) => {
    setData(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      store.set(key, next);
      return next;
    });
  }, [key]);

  return [data, update, loaded];
}

// Shared Components
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={styles.empty}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <p style={styles.emptyText}>{text}</p>
    </div>
  );
}

function Card({ children, style: s, onClick }) {
  return <div style={{ ...styles.card, ...s }} onClick={onClick}>{children}</div>;
}

function Badge({ text, color = "#6B8F71" }) {
  return <span style={{ ...styles.badge, backgroundColor: color + "22", color }}>{text}</span>;
}

function Input({ label, ...props }) {
  return (
    <div style={styles.fieldGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <input style={styles.input} {...props} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={styles.fieldGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea style={{ ...styles.input, minHeight: 80, resize: "vertical" }} {...props} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={styles.fieldGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <select style={styles.input} {...props}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", ...props }) {
  const s = variant === "primary" ? styles.btnPrimary : variant === "danger" ? styles.btnDanger : styles.btnSecondary;
  return <button style={s} {...props}>{children}</button>;
}

// ==================== FOOD MAP ====================
function FoodMap({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Protein", prepMethod: "", whatILike: "", wouldntEat: "" });
  const [viewing, setViewing] = useState(null);

  const add = () => {
    if (!form.name.trim()) return;
    setData(d => [...d, { ...form, id: uid(), dateAdded: new Date().toISOString() }]);
    setForm({ name: "", category: "Protein", prepMethod: "", whatILike: "", wouldntEat: "" });
    setOpen(false);
  };

  const remove = (id) => {
    setData(d => d.filter(x => x.id !== id));
    setViewing(null);
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = data.filter(d => d.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Food Map</h2>
          <p style={styles.sectionSub}>Everything you eat and how you like it</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ Add</Btn>
      </div>

      {data.length === 0 && <EmptyState icon="🗺️" text="Start mapping your foods — add your first safe food" />}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <h4 style={styles.catLabel}>{cat}</h4>
          {items.map(item => (
            <Card key={item.id} onClick={() => setViewing(item)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={styles.cardName}>{item.name}</strong>
                <Badge text={cat} />
              </div>
              {item.prepMethod && <p style={styles.cardDetail}>Prep: {item.prepMethod}</p>}
            </Card>
          ))}
        </div>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Food">
        <Input label="Food name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grilled Chicken" />
        <Select label="Category" options={CATEGORIES} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <Textarea label="How do you want it prepared?" value={form.prepMethod} onChange={e => setForm({ ...form, prepMethod: e.target.value })} placeholder="e.g. Grilled, no sauce, well done" />
        <Textarea label="What do you like about it?" value={form.whatILike} onChange={e => setForm({ ...form, whatILike: e.target.value })} placeholder="e.g. Familiar taste, right texture" />
        <Textarea label="How would you NOT eat it?" value={form.wouldntEat} onChange={e => setForm({ ...form, wouldntEat: e.target.value })} placeholder="e.g. Not with onion pieces, not in a curry" />
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Save Food</Btn>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || ""}>
        {viewing && (
          <div>
            <Badge text={viewing.category} />
            <div style={styles.detailBlock}>
              <p style={styles.detailLabel}>Preparation</p>
              <p style={styles.detailText}>{viewing.prepMethod || "Not specified"}</p>
            </div>
            <div style={styles.detailBlock}>
              <p style={styles.detailLabel}>What I like</p>
              <p style={styles.detailText}>{viewing.whatILike || "Not specified"}</p>
            </div>
            <div style={styles.detailBlock}>
              <p style={styles.detailLabel}>How I wouldn't eat it</p>
              <p style={styles.detailText}>{viewing.wouldntEat || "Not specified"}</p>
            </div>
            <Btn variant="danger" onClick={() => remove(viewing.id)} style={{ width: "100%", marginTop: 16 }}>Remove</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ==================== BRIDGE FOODS ====================
function BridgeFoods({ data, setData, foodMap }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ safeFood: "", bridgeFood: "", suggestedBy: "Fatima", status: "Not tried" });
  const [logId, setLogId] = useState(null);
  const [attempt, setAttempt] = useState({ reaction: "", comfortLevel: 3 });

  const add = () => {
    if (!form.safeFood.trim() || !form.bridgeFood.trim()) return;
    setData(d => [...d, { ...form, id: uid(), attempts: [], dateAdded: new Date().toISOString() }]);
    setForm({ safeFood: "", bridgeFood: "", suggestedBy: "Fatima", status: "Not tried" });
    setOpen(false);
  };

  const logAttempt = () => {
    setData(d => d.map(x => x.id === logId ? {
      ...x,
      attempts: [...x.attempts, { ...attempt, date: new Date().toISOString() }]
    } : x));
    setAttempt({ reaction: "", comfortLevel: 3 });
    setLogId(null);
  };

  const updateStatus = (id, status) => setData(d => d.map(x => x.id === id ? { ...x, status } : x));

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Bridge Foods</h2>
          <p style={styles.sectionSub}>Small steps from safe foods to new ones</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ Add</Btn>
      </div>

      {data.length === 0 && <EmptyState icon="🌉" text="No bridge foods yet — Fatima can suggest your first one" />}

      {data.map(item => (
        <Card key={item.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={styles.cardName}>{item.bridgeFood}</strong>
            <Badge text={item.status} color={item.status === "Accepted" ? "#4CAF50" : item.status === "Rejected" ? "#E57373" : "#FFA726"} />
          </div>
          <p style={styles.cardDetail}>Bridge from: <strong>{item.safeFood}</strong></p>
          <p style={styles.cardDetail}>Suggested by: {item.suggestedBy}</p>
          {item.attempts.length > 0 && (
            <p style={styles.cardDetail}>{item.attempts.length} attempt{item.attempts.length > 1 ? "s" : ""} logged</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Btn variant="secondary" onClick={() => setLogId(item.id)}>Log Attempt</Btn>
            <Btn variant="secondary" onClick={() => updateStatus(item.id, "Accepted")}>✓ Accept</Btn>
            <Btn variant="secondary" onClick={() => updateStatus(item.id, "Rejected")}>✗ Reject</Btn>
            <Btn variant="secondary" onClick={() => updateStatus(item.id, "Maybe")}>~ Maybe</Btn>
          </div>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Bridge Food">
        <Select label="Safe food (starting point)" options={foodMap.map(f => f.name)} value={form.safeFood} onChange={e => setForm({ ...form, safeFood: e.target.value })} />
        <Input label="New food to try" value={form.bridgeFood} onChange={e => setForm({ ...form, bridgeFood: e.target.value })} placeholder="e.g. Chicken Shawarma" />
        <Select label="Suggested by" options={["Fatima", "Self"]} value={form.suggestedBy} onChange={e => setForm({ ...form, suggestedBy: e.target.value })} />
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Save</Btn>
      </Modal>

      <Modal open={!!logId} onClose={() => setLogId(null)} title="Log Attempt">
        <Textarea label="How did it go?" value={attempt.reaction} onChange={e => setAttempt({ ...attempt, reaction: e.target.value })} placeholder="Describe your experience..." />
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Comfort level (1-5)</label>
          <div style={{ display: "flex", gap: 8 }}>
            {COMFORT.map(n => (
              <button key={n} onClick={() => setAttempt({ ...attempt, comfortLevel: n })}
                style={{ ...styles.comfortBtn, ...(attempt.comfortLevel === n ? styles.comfortActive : {}) }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <Btn onClick={logAttempt} style={{ width: "100%", marginTop: 12 }}>Log</Btn>
      </Modal>
    </div>
  );
}

// ==================== TRIGGER LOG ====================
function TriggerLog({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ food: "", triggerType: "", description: "", avoided: true });

  const add = () => {
    if (!form.food.trim()) return;
    setData(d => [{ ...form, id: uid(), date: new Date().toISOString() }, ...d]);
    setForm({ food: "", triggerType: "", description: "", avoided: true });
    setOpen(false);
  };

  const typeCounts = data.reduce((acc, t) => { acc[t.triggerType] = (acc[t.triggerType] || 0) + 1; return acc; }, {});
  const topTrigger = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Trigger Log</h2>
          <p style={styles.sectionSub}>Track what causes food avoidance</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ Log</Btn>
      </div>

      {data.length > 0 && topTrigger && (
        <Card style={{ backgroundColor: "#FFF3E0", borderLeft: "4px solid #FFA726" }}>
          <p style={styles.cardDetail}>Most common trigger: <strong>{topTrigger[0]}</strong> ({topTrigger[1]}x)</p>
        </Card>
      )}

      {data.length === 0 && <EmptyState icon="⚡" text="No triggers logged yet — log one next time you avoid a food" />}

      {data.map(item => (
        <Card key={item.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={styles.cardName}>{item.food}</strong>
            <Badge text={item.avoided ? "Avoided" : "Ate it"} color={item.avoided ? "#E57373" : "#4CAF50"} />
          </div>
          <Badge text={item.triggerType} color="#7986CB" />
          {item.description && <p style={styles.cardDetail}>{item.description}</p>}
          <p style={styles.cardMeta}>{new Date(item.date).toLocaleDateString()}</p>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Log Trigger">
        <Input label="What food?" value={form.food} onChange={e => setForm({ ...form, food: e.target.value })} placeholder="e.g. Butter Chicken" />
        <Select label="Trigger type" options={TRIGGER_TYPES} value={form.triggerType} onChange={e => setForm({ ...form, triggerType: e.target.value })} />
        <Textarea label="What happened?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the situation..." />
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Did you avoid it?</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setForm({ ...form, avoided: true })}
              style={{ ...styles.comfortBtn, ...(form.avoided ? { backgroundColor: "#E57373", color: "#fff" } : {}) }}>Yes</button>
            <button onClick={() => setForm({ ...form, avoided: false })}
              style={{ ...styles.comfortBtn, ...(!form.avoided ? { backgroundColor: "#4CAF50", color: "#fff" } : {}) }}>No</button>
          </div>
        </div>
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Save</Btn>
      </Modal>
    </div>
  );
}

// ==================== EXPOSURE LADDER ====================
function ExposureLadder({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ targetFood: "", steps: ["", "", "", ""] });

  const add = () => {
    if (!form.targetFood.trim()) return;
    setData(d => [...d, {
      id: uid(),
      targetFood: form.targetFood,
      steps: form.steps.filter(s => s.trim()).map((s, i) => ({ id: uid(), description: s, completed: false, date: null, order: i })),
      dateAdded: new Date().toISOString()
    }]);
    setForm({ targetFood: "", steps: ["", "", "", ""] });
    setOpen(false);
  };

  const toggleStep = (ladderId, stepId) => {
    setData(d => d.map(l => l.id === ladderId ? {
      ...l,
      steps: l.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed, date: !s.completed ? new Date().toISOString() : null } : s)
    } : l));
  };

  const removeLadder = (id) => setData(d => d.filter(l => l.id !== id));

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Exposure Ladder</h2>
          <p style={styles.sectionSub}>Step-by-step plans for target foods</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ New Ladder</Btn>
      </div>

      {data.length === 0 && <EmptyState icon="🪜" text="No ladders yet — create one with Fatima for a food you want to try" />}

      {data.map(ladder => {
        const done = ladder.steps.filter(s => s.completed).length;
        const pct = ladder.steps.length ? Math.round((done / ladder.steps.length) * 100) : 0;
        return (
          <Card key={ladder.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={styles.cardName}>🎯 {ladder.targetFood}</strong>
              <span style={{ fontSize: 13, color: "#6B8F71", fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${pct}%` }} />
            </div>
            {ladder.steps.map((step, i) => (
              <div key={step.id} style={styles.stepRow} onClick={() => toggleStep(ladder.id, step.id)}>
                <span style={{ ...styles.stepCheck, ...(step.completed ? styles.stepDone : {}) }}>
                  {step.completed ? "✓" : i + 1}
                </span>
                <span style={{ ...styles.stepText, ...(step.completed ? { textDecoration: "line-through", opacity: 0.5 } : {}) }}>
                  {step.description}
                </span>
              </div>
            ))}
            <Btn variant="danger" onClick={() => removeLadder(ladder.id)} style={{ marginTop: 10, fontSize: 12, padding: "6px 12px" }}>Remove</Btn>
          </Card>
        );
      })}

      <Modal open={open} onClose={() => setOpen(false)} title="New Exposure Ladder">
        <Input label="Target food" value={form.targetFood} onChange={e => setForm({ ...form, targetFood: e.target.value })} placeholder="e.g. Sushi" />
        <p style={styles.label}>Steps (in order of difficulty)</p>
        {form.steps.map((s, i) => (
          <Input key={i} placeholder={`Step ${i + 1}: e.g. ${["Look at it", "Smell it", "Touch it", "Small taste"][i] || "..."}`}
            value={s} onChange={e => { const ns = [...form.steps]; ns[i] = e.target.value; setForm({ ...form, steps: ns }); }} />
        ))}
        <button style={styles.addStepBtn} onClick={() => setForm({ ...form, steps: [...form.steps, ""] })}>+ Add step</button>
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Create Ladder</Btn>
      </Modal>
    </div>
  );
}

// ==================== SAFE FOOD LIBRARY ====================
function SafeLibrary({ data, setData }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...CATEGORIES];
  const filtered = filter === "All" ? data : data.filter(d => d.category === filter);

  const remove = (id) => setData(d => d.filter(x => x.id !== id));

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Safe Food Library</h2>
          <p style={styles.sectionSub}>{data.length} safe food{data.length !== 1 ? "s" : ""} cataloged</p>
        </div>
      </div>

      <div style={styles.filterRow}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ ...styles.filterBtn, ...(filter === c ? styles.filterActive : {}) }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon="📚" text={data.length === 0 ? "Your Food Map entries will appear here as your safe food library" : "No foods in this category"} />}

      <div style={styles.libraryGrid}>
        {filtered.map(item => (
          <div key={item.id} style={styles.libraryCard}>
            <div style={styles.libraryIcon}>{
              item.category === "Protein" ? "🍗" :
              item.category === "Carbs" ? "🍞" :
              item.category === "Vegetables" ? "🥦" :
              item.category === "Fruits" ? "🍎" :
              item.category === "Snacks" ? "🍿" :
              item.category === "Drinks" ? "🥤" :
              item.category === "Dairy" ? "🧀" : "🍽️"
            }</div>
            <strong style={{ fontSize: 14, color: "#2D3A2E" }}>{item.name}</strong>
            <span style={{ fontSize: 11, color: "#8A9B8E" }}>{item.category}</span>
            {item.prepMethod && <span style={{ fontSize: 11, color: "#6B8F71", marginTop: 2 }}>{item.prepMethod.slice(0, 40)}{item.prepMethod.length > 40 ? "..." : ""}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== WINS BOARD ====================
function WinsBoard({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ food: "", notes: "" });

  const add = () => {
    if (!form.food.trim()) return;
    setData(d => [{ ...form, id: uid(), date: new Date().toISOString() }, ...d]);
    setForm({ food: "", notes: "" });
    setOpen(false);
  };

  const streak = data.length;

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Wins Board</h2>
          <p style={styles.sectionSub}>Every new food you accept is a victory</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ Log Win</Btn>
      </div>

      {streak > 0 && (
        <Card style={{ background: "linear-gradient(135deg, #6B8F71, #4A7C59)", color: "#fff", textAlign: "center" }}>
          <p style={{ fontSize: 48, margin: 0, fontWeight: 800 }}>{streak}</p>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>total win{streak !== 1 ? "s" : ""} 🎉</p>
        </Card>
      )}

      {data.length === 0 && <EmptyState icon="🏆" text="No wins yet — log your first one when you try something new!" />}

      {data.map(item => (
        <Card key={item.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={styles.cardName}>🎉 {item.food}</strong>
            <span style={styles.cardMeta}>{new Date(item.date).toLocaleDateString()}</span>
          </div>
          {item.notes && <p style={styles.cardDetail}>{item.notes}</p>}
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Log a Win!">
        <Input label="What new food did you eat?" value={form.food} onChange={e => setForm({ ...form, food: e.target.value })} placeholder="e.g. Chicken Shawarma" />
        <Textarea label="How did it go?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about the experience..." />
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Save Win 🏆</Btn>
      </Modal>
    </div>
  );
}

// ==================== MOOD + MEALS ====================
function MoodMeals({ data, setData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meal: "", moodBefore: "", moodAfter: "", comfort: 3, notes: "" });

  const add = () => {
    if (!form.meal.trim()) return;
    setData(d => [{ ...form, id: uid(), date: new Date().toISOString() }, ...d]);
    setForm({ meal: "", moodBefore: "", moodAfter: "", comfort: 3, notes: "" });
    setOpen(false);
  };

  const avgComfort = data.length ? (data.reduce((s, d) => s + d.comfort, 0) / data.length).toFixed(1) : "—";

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Mood + Meals</h2>
          <p style={styles.sectionSub}>Track how meals affect your mood</p>
        </div>
        <Btn onClick={() => setOpen(true)}>+ Log</Btn>
      </div>

      {data.length > 0 && (
        <Card style={{ textAlign: "center", backgroundColor: "#F3F8F4" }}>
          <p style={{ fontSize: 13, color: "#6B8F71", margin: 0 }}>Average comfort</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: "#2D3A2E", margin: "4px 0" }}>{avgComfort} <span style={{ fontSize: 14 }}>/ 5</span></p>
          <p style={{ fontSize: 12, color: "#8A9B8E", margin: 0 }}>{data.length} meal{data.length !== 1 ? "s" : ""} logged</p>
        </Card>
      )}

      {data.length === 0 && <EmptyState icon="🧠" text="Start tracking how your mood connects to meals" />}

      {data.map(item => (
        <Card key={item.id}>
          <strong style={styles.cardName}>{item.meal}</strong>
          <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
            {item.moodBefore && <span style={styles.cardDetail}>Before: {item.moodBefore}</span>}
            {item.moodAfter && <span style={styles.cardDetail}>After: {item.moodAfter}</span>}
            <span style={styles.cardDetail}>Comfort: {item.comfort}/5</span>
          </div>
          {item.notes && <p style={styles.cardDetail}>{item.notes}</p>}
          <p style={styles.cardMeta}>{new Date(item.date).toLocaleDateString()}</p>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Log Mood + Meal">
        <Input label="What did you eat?" value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })} placeholder="e.g. Grilled chicken with rice" />
        <Select label="Mood before eating" options={MOODS} value={form.moodBefore} onChange={e => setForm({ ...form, moodBefore: e.target.value })} />
        <Select label="Mood after eating" options={MOODS} value={form.moodAfter} onChange={e => setForm({ ...form, moodAfter: e.target.value })} />
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Comfort level (1-5)</label>
          <div style={{ display: "flex", gap: 8 }}>
            {COMFORT.map(n => (
              <button key={n} onClick={() => setForm({ ...form, comfort: n })}
                style={{ ...styles.comfortBtn, ...(form.comfort === n ? styles.comfortActive : {}) }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any observations..." />
        <Btn onClick={add} style={{ width: "100%", marginTop: 12 }}>Save</Btn>
      </Modal>
    </div>
  );
}

// ==================== ROLE SELECT ====================
function RoleSelect({ onSelect }) {
  return (
    <div style={styles.roleContainer}>
      <div style={styles.roleInner}>
        <div style={styles.logoMark}>🍃</div>
        <h1 style={styles.roleTitle}>Nourish</h1>
        <p style={styles.roleSubtitle}>ARFID Therapy Companion</p>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <button style={styles.roleBtn} onClick={() => onSelect("patient")}>
            <span style={{ fontSize: 24 }}>🧑</span>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>I'm the Patient</strong>
              <span style={{ fontSize: 13, opacity: 0.7 }}>Log foods, triggers, and progress</span>
            </div>
          </button>
          <button style={styles.roleBtn} onClick={() => onSelect("therapist")}>
            <span style={{ fontSize: 24 }}>👩‍⚕️</span>
            <div>
              <strong style={{ display: "block", fontSize: 16 }}>I'm the Therapist</strong>
              <span style={{ fontSize: 13, opacity: 0.7 }}>View data and guide treatment</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("map");

  const [foodMap, setFoodMap, fmLoaded] = usePersistedState("nourish-food-map", []);
  const [bridges, setBridges, brLoaded] = usePersistedState("nourish-bridges", []);
  const [triggers, setTriggers, trLoaded] = usePersistedState("nourish-triggers", []);
  const [ladders, setLadders, laLoaded] = usePersistedState("nourish-ladders", []);
  const [wins, setWins, wiLoaded] = usePersistedState("nourish-wins", []);
  const [moods, setMoods, moLoaded] = usePersistedState("nourish-moods", []);

  const allLoaded = fmLoaded && brLoaded && trLoaded && laLoaded && wiLoaded && moLoaded;

  if (!role) return <RoleSelect onSelect={setRole} />;

  if (!allLoaded) return (
    <div style={{ ...styles.roleContainer, backgroundColor: "#F5F0EB" }}>
      <p style={{ color: "#6B8F71", fontSize: 16 }}>Loading your data...</p>
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case "map": return <FoodMap data={foodMap} setData={setFoodMap} />;
      case "bridge": return <BridgeFoods data={bridges} setData={setBridges} foodMap={foodMap} />;
      case "triggers": return <TriggerLog data={triggers} setData={setTriggers} />;
      case "ladder": return <ExposureLadder data={ladders} setData={setLadders} />;
      case "library": return <SafeLibrary data={foodMap} setData={setFoodMap} />;
      case "wins": return <WinsBoard data={wins} setData={setWins} />;
      case "mood": return <MoodMeals data={moods} setData={setMoods} />;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <div>
          <span style={styles.topLogo}>🍃 Nourish</span>
          <Badge text={role === "patient" ? "Patient" : "Therapist"} color="#6B8F71" />
        </div>
        <button onClick={() => setRole(null)} style={styles.switchBtn}>Switch</button>
      </div>

      <div style={styles.content}>
        {renderTab()}
      </div>

      <div style={styles.tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabActive : {}) }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={styles.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  app: {
    fontFamily: "'DM Sans', 'Nunito', -apple-system, sans-serif",
    backgroundColor: "#F5F0EB",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "#2D3A2E",
    maxWidth: 480,
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #E8E2DB",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topLogo: { fontWeight: 800, fontSize: 18, color: "#2D3A2E", marginRight: 10 },
  switchBtn: { fontSize: 12, color: "#8A9B8E", background: "none", border: "1px solid #D4CDC4", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  content: { flex: 1, padding: "16px 16px 100px", overflowY: "auto" },
  tabBar: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTop: "1px solid #E8E2DB",
    padding: "6px 0 10px",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 480,
    margin: "0 auto",
    zIndex: 100,
    overflowX: "auto",
  },
  tabBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 6px",
    opacity: 0.4,
    transition: "opacity 0.2s",
    minWidth: 50,
  },
  tabActive: { opacity: 1 },
  tabLabel: { fontSize: 9, marginTop: 2, color: "#2D3A2E", fontWeight: 600 },

  // Section
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 800, margin: 0, color: "#2D3A2E", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: 13, color: "#8A9B8E", margin: "2px 0 0" },
  catLabel: { fontSize: 13, fontWeight: 700, color: "#6B8F71", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  cardName: { fontSize: 15, fontWeight: 700, color: "#2D3A2E" },
  cardDetail: { fontSize: 13, color: "#6B7E6D", margin: "4px 0 0", lineHeight: 1.4 },
  cardMeta: { fontSize: 11, color: "#A8B5AA", margin: "6px 0 0" },

  // Badge
  badge: { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block" },

  // Empty
  empty: { textAlign: "center", padding: "40px 20px" },
  emptyText: { color: "#A8B5AA", fontSize: 14, marginTop: 8 },

  // Forms
  fieldGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#4A5C4C", marginBottom: 5 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #D4CDC4",
    fontSize: 14,
    fontFamily: "inherit",
    backgroundColor: "#FAFAF8",
    color: "#2D3A2E",
    boxSizing: "border-box",
    outline: "none",
  },

  // Buttons
  btnPrimary: {
    backgroundColor: "#6B8F71",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSecondary: {
    backgroundColor: "#F0EBE5",
    color: "#4A5C4C",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnDanger: {
    backgroundColor: "#FDECEC",
    color: "#D32F2F",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Comfort buttons
  comfortBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "1.5px solid #D4CDC4",
    backgroundColor: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    color: "#2D3A2E",
  },
  comfortActive: {
    backgroundColor: "#6B8F71",
    color: "#fff",
    borderColor: "#6B8F71",
  },

  // Modal
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "20px 20px 0 0",
    padding: "20px 20px 32px",
    width: "100%",
    maxWidth: 480,
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 800, margin: 0, color: "#2D3A2E" },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8A9B8E", padding: 4 },

  // Detail view
  detailBlock: { marginTop: 14 },
  detailLabel: { fontSize: 12, fontWeight: 700, color: "#6B8F71", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 4px" },
  detailText: { fontSize: 14, color: "#2D3A2E", margin: 0, lineHeight: 1.5 },

  // Progress
  progressBar: { height: 6, backgroundColor: "#E8E2DB", borderRadius: 3, marginBottom: 14, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#6B8F71", borderRadius: 3, transition: "width 0.3s" },

  // Steps
  stepRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" },
  stepCheck: {
    width: 28, height: 28, borderRadius: 14, border: "2px solid #D4CDC4",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#8A9B8E", flexShrink: 0,
  },
  stepDone: { backgroundColor: "#6B8F71", borderColor: "#6B8F71", color: "#fff" },
  stepText: { fontSize: 14, color: "#2D3A2E" },
  addStepBtn: { background: "none", border: "none", color: "#6B8F71", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0" },

  // Filter
  filterRow: { display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 },
  filterBtn: {
    padding: "6px 14px", borderRadius: 20, border: "1.5px solid #D4CDC4",
    backgroundColor: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
    color: "#6B7E6D", whiteSpace: "nowrap", fontFamily: "inherit",
  },
  filterActive: { backgroundColor: "#6B8F71", color: "#fff", borderColor: "#6B8F71" },

  // Library grid
  libraryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  libraryCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, display: "flex",
    flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  libraryIcon: { fontSize: 32, marginBottom: 4 },

  // Role select
  roleContainer: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: "#F5F0EB", padding: 24,
  },
  roleInner: { textAlign: "center", maxWidth: 340, width: "100%" },
  logoMark: { fontSize: 56, marginBottom: 8 },
  roleTitle: { fontSize: 36, fontWeight: 900, color: "#2D3A2E", margin: 0, letterSpacing: "-1px" },
  roleSubtitle: { fontSize: 14, color: "#8A9B8E", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" },
  roleBtn: {
    display: "flex", alignItems: "center", gap: 14, width: "100%",
    padding: "16px 20px", borderRadius: 14, border: "1.5px solid #D4CDC4",
    backgroundColor: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
    transition: "box-shadow 0.2s",
  },
};
