import { createContext, useContext } from 'react';
import { useSupabaseState } from '../hooks/useSupabaseState';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [foodMap, setFoodMap, fmLoaded] = useSupabaseState('food_map', 'nourish-food-map');
  const [bridges, setBridges, brLoaded] = useSupabaseState('bridges', 'nourish-bridges');
  const [triggers, setTriggers, trLoaded] = useSupabaseState('triggers', 'nourish-triggers');
  const [ladders, setLadders, laLoaded] = useSupabaseState('ladders', 'nourish-ladders');
  const [wins, setWins, wiLoaded] = useSupabaseState('wins', 'nourish-wins');
  const [moods, setMoods, moLoaded] = useSupabaseState('moods', 'nourish-moods');
  const [sessionNotes, setSessionNotes, snLoaded] = useSupabaseState('session_notes', 'nourish-session-notes');

  const allLoaded = fmLoaded && brLoaded && trLoaded && laLoaded && wiLoaded && moLoaded && snLoaded;

  return (
    <AppContext.Provider
      value={{
        foodMap, setFoodMap,
        bridges, setBridges,
        triggers, setTriggers,
        ladders, setLadders,
        wins, setWins,
        moods, setMoods,
        sessionNotes, setSessionNotes,
        allLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
