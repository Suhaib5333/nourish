import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';

// Maps JS field names to DB column names
const FIELD_MAP = {
  food_map: {
    toDb: (item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      prep_method: item.prepMethod || '',
      what_i_like: item.whatILike || '',
      wouldnt_eat: item.wouldntEat || '',
      date_added: item.dateAdded || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      prepMethod: row.prep_method,
      whatILike: row.what_i_like,
      wouldntEat: row.wouldnt_eat,
      dateAdded: row.date_added,
    }),
  },
  bridges: {
    toDb: (item) => ({
      id: item.id,
      safe_food_name: item.safeFoodName || '',
      new_food_name: item.newFoodName || '',
      suggested_by: item.suggestedBy || 'Self',
      status: item.status || 'not-tried',
      attempts: JSON.stringify(item.attempts || []),
      therapist_note: item.therapistNote || '',
      created_at: item.createdAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      safeFoodName: row.safe_food_name,
      newFoodName: row.new_food_name,
      suggestedBy: row.suggested_by,
      status: row.status,
      attempts: typeof row.attempts === 'string' ? JSON.parse(row.attempts) : (row.attempts || []),
      therapistNote: row.therapist_note,
      createdAt: row.created_at,
    }),
  },
  triggers: {
    toDb: (item) => ({
      id: item.id,
      food: item.food,
      trigger_type: item.triggerType || '',
      description: item.description || '',
      avoided: item.avoided ?? true,
      meal_time: item.mealTime || '',
      date: item.date || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      food: row.food,
      triggerType: row.trigger_type,
      description: row.description,
      avoided: row.avoided,
      mealTime: row.meal_time,
      date: row.date,
    }),
  },
  ladders: {
    toDb: (item) => ({
      id: item.id,
      target_food: item.targetFood || '',
      steps: JSON.stringify(item.steps || []),
      created_by: item.createdBy || 'Self',
      created_at: item.createdAt || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      targetFood: row.target_food,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : (row.steps || []),
      createdBy: row.created_by,
      createdAt: row.created_at,
    }),
  },
  wins: {
    toDb: (item) => ({
      id: item.id,
      food: item.food,
      notes: item.notes || '',
      date: item.date || new Date().toISOString(),
      source: item.source || 'manual',
    }),
    fromDb: (row) => ({
      id: row.id,
      food: row.food,
      notes: row.notes,
      date: row.date,
      source: row.source,
    }),
  },
  moods: {
    toDb: (item) => ({
      id: item.id,
      meal: item.meal,
      meal_time: item.mealTime || '',
      mood_before: item.moodBefore || '',
      mood_after: item.moodAfter || '',
      comfort: item.comfort || 3,
      notes: item.notes || '',
      date: item.date || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      meal: row.meal,
      mealTime: row.meal_time,
      moodBefore: row.mood_before,
      moodAfter: row.mood_after,
      comfort: row.comfort,
      notes: row.notes,
      date: row.date,
    }),
  },
  session_notes: {
    toDb: (item) => ({
      id: item.id,
      session_type: item.sessionType || '',
      content: item.content || '',
      date: item.date || new Date().toISOString(),
    }),
    fromDb: (row) => ({
      id: row.id,
      sessionType: row.session_type,
      content: row.content,
      date: row.date,
    }),
  },
};

export function useSupabaseState(table, localStorageKey) {
  const [data, setDataState] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const mapper = FIELD_MAP[table];
  const prevDataRef = useRef(null);

  // Load from Supabase on mount, fall back to localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: rows, error } = await supabase.from(table).select('*');
        if (!cancelled && !error && rows) {
          const mapped = rows.map(mapper.fromDb);
          setDataState(mapped);
          // Also update localStorage as cache
          localStorage.setItem(localStorageKey, JSON.stringify(mapped));
        } else if (!cancelled) {
          // Fall back to localStorage
          const cached = localStorage.getItem(localStorageKey);
          if (cached) setDataState(JSON.parse(cached));
        }
      } catch {
        // Offline — use localStorage
        const cached = localStorage.getItem(localStorageKey);
        if (cached && !cancelled) setDataState(JSON.parse(cached));
      }
      if (!cancelled) setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [table, localStorageKey]);

  // Sync to Supabase whenever data changes
  const setData = useCallback(
    (valOrFn) => {
      setDataState((prev) => {
        const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;

        // Cache locally immediately
        localStorage.setItem(localStorageKey, JSON.stringify(next));

        // Sync to Supabase in background
        syncToSupabase(table, prev, next, mapper);

        return next;
      });
    },
    [table, localStorageKey, mapper]
  );

  return [data, setData, loaded];
}

// Diff-based sync: only send what changed
async function syncToSupabase(table, prev, next, mapper) {
  const prevIds = new Set(prev.map((p) => p.id));
  const nextIds = new Set(next.map((n) => n.id));

  // Deleted items
  const deleted = prev.filter((p) => !nextIds.has(p.id));
  if (deleted.length) {
    await supabase.from(table).delete().in('id', deleted.map((d) => d.id));
  }

  // New items
  const added = next.filter((n) => !prevIds.has(n.id));
  if (added.length) {
    await supabase.from(table).insert(added.map(mapper.toDb));
  }

  // Updated items (existed in both prev and next)
  const updated = next.filter((n) => {
    if (!prevIds.has(n.id)) return false;
    const old = prev.find((p) => p.id === n.id);
    return JSON.stringify(old) !== JSON.stringify(n);
  });
  for (const item of updated) {
    await supabase.from(table).update(mapper.toDb(item)).eq('id', item.id);
  }
}
