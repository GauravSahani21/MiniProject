import React, { createContext, useContext, useState, useCallback } from 'react';
import { PATIENTS } from '../data/dummyData';

/**
 * DoctorContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared state for the doctor's patient list.
 *
 * Both DoctorDashboard and PatientDetailPage read from — and write to — this
 * single source of truth, so a status change made inside PatientDetailPage is
 * immediately visible when the doctor navigates back to the dashboard.
 *
 * localStorage is used so the reviewed status survives a page refresh.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'autisense_reviewed_patients';

// Load any persisted "reviewed" IDs from localStorage
function loadReviewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Merge persisted reviewed status back into the base PATIENTS array
function buildInitialPatients() {
  const reviewedIds = loadReviewedIds();
  return PATIENTS.map(p =>
    reviewedIds.includes(p.id) ? { ...p, status: 'Reviewed' } : p
  );
}

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const [patients, setPatients] = useState(buildInitialPatients);

  /**
   * markReviewed(id)
   * Updates the patient's status to 'Reviewed' in shared state AND persists
   * the change to localStorage so it survives a page refresh.
   */
  const markReviewed = useCallback((id) => {
    setPatients(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, status: 'Reviewed' } : p
      );

      // Persist all currently-reviewed IDs
      const reviewedIds = updated
        .filter(p => p.status === 'Reviewed')
        .map(p => p.id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewedIds));
      } catch {
        // localStorage not available — state still updates in memory
      }

      return updated;
    });
  }, []);

  return (
    <DoctorContext.Provider value={{ patients, setPatients, markReviewed }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctor must be used inside <DoctorProvider>');
  return ctx;
}
