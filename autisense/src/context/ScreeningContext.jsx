import React, { createContext, useContext, useState } from 'react';

/**
 * ScreeningContext
 * Stores the last screening result + child info so ResultPage
 * can read real ML predictions instead of dummy data.
 */
const ScreeningContext = createContext(null);

export function ScreeningProvider({ children }) {
  const [result, setResult] = useState(null);
  // result shape:
  // {
  //   child:       { id, name, age, gender, avatar },
  //   answers:     number[],
  //   prediction:  0 | 1,
  //   probability: number,
  //   risk:        'Low' | 'Medium' | 'High',
  //   score:       number,
  //   total:       number,
  //   categories:  { Social, Communication, Behavior, Sensory, Routine },
  //   flagged:     string[],
  //   screened_at: string,   // ISO date
  // }

  return (
    <ScreeningContext.Provider value={{ result, setResult }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const ctx = useContext(ScreeningContext);
  if (!ctx) throw new Error('useScreening must be used inside <ScreeningProvider>');
  return ctx;
}
