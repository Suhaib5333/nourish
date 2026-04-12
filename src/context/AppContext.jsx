import { createContext, useContext } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [foodMap, setFoodMap, fmLoaded] = usePersistedState('nourish-food-map', []);
  const [bridges, setBridges, brLoaded] = usePersistedState('nourish-bridges', []);
  const [triggers, setTriggers, trLoaded] = usePersistedState('nourish-triggers', []);
  const [ladders, setLadders, laLoaded] = usePersistedState('nourish-ladders', []);
  const [wins, setWins, wiLoaded] = usePersistedState('nourish-wins', []);
  const [moods, setMoods, moLoaded] = usePersistedState('nourish-moods', []);
  const [sessionNotes, setSessionNotes, snLoaded] = usePersistedState('nourish-session-notes', []);

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
