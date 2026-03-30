/**
 * AppContext — unified application state
 *
 * Replaces the old ActivityContext and centralises all mutable app data so
 * every component reads from (and writes to) a single source of truth.
 * Every piece of state is automatically persisted to localStorage via the
 * useLocalStorage hook, so changes survive page reloads.
 *
 * Special case: SourceFile.fileObject is a browser File instance that cannot
 * be JSON-serialised. We keep it in React state for the current session so
 * FilePreviewModal can use it, but we strip it before writing to localStorage.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  sourceFiles as defaultSourceFiles,
  historySessions as defaultHistorySessions,
  insightCategories as defaultInsightCategories,
  insightQuotes as defaultInsightQuotes,
  artifacts as defaultArtifacts,
  trackerPhases as defaultTrackerPhases,
  recentActivity as defaultActivities,
  type SourceFile,
  type HistorySession,
  type InsightQuote,
  type Artifact,
  type TrackerPhase,
  type ActivityEvent,
} from '../data/mockData';

// ─── Context shape ────────────────────────────────────────────────────────────

type AppContextType = {
  // Sources (left sidebar)
  sourceFiles: SourceFile[];
  setSourceFiles: React.Dispatch<React.SetStateAction<SourceFile[]>>;
  sourceCategories: string[];
  setSourceCategories: React.Dispatch<React.SetStateAction<string[]>>;

  // Tracker (right sidebar)
  trackerPhases: TrackerPhase[];
  setTrackerPhases: React.Dispatch<React.SetStateAction<TrackerPhase[]>>;

  // Activity feed (right sidebar bottom)
  activities: ActivityEvent[];
  addActivity: (message: string, highlight?: string, dotColor?: string) => void;

  // Chat history sessions
  historySessions: HistorySession[];
  setHistorySessions: React.Dispatch<React.SetStateAction<HistorySession[]>>;

  // Insights / quotes
  insightQuotes: InsightQuote[];
  setInsightQuotes: React.Dispatch<React.SetStateAction<InsightQuote[]>>;
  insightCategories: string[];
  setInsightCategories: React.Dispatch<React.SetStateAction<string[]>>;

  // Generated artifacts
  artifacts: Artifact[];
  setArtifacts: React.Dispatch<React.SetStateAction<Artifact[]>>;
};

// ─── Context + provider ───────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── sourceFiles ──────────────────────────────────────────────────────────
  // We initialise from localStorage but keep File objects alive in React state
  // for the current session. On every change we write a stripped copy back to
  // localStorage so the file list (names / sizes / categories) is durable.
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>(() => {
    try {
      const stored = window.localStorage.getItem('app_sourceFiles');
      return stored ? (JSON.parse(stored) as SourceFile[]) : defaultSourceFiles;
    } catch {
      return defaultSourceFiles;
    }
  });

  useEffect(() => {
    try {
      // Strip the non-serialisable File object before persisting
      const serialisable = sourceFiles.map(({ fileObject: _omit, ...rest }) => rest);
      window.localStorage.setItem('app_sourceFiles', JSON.stringify(serialisable));
    } catch (err) {
      console.error('[AppContext] Could not persist sourceFiles:', err);
    }
  }, [sourceFiles]);

  // ── remaining state (all fully serialisable) ─────────────────────────────
  const [sourceCategories, setSourceCategories] = useLocalStorage<string[]>(
    'app_sourceCategories',
    ['Research Papers', 'Interviews']
  );

  const [trackerPhases, setTrackerPhases] = useLocalStorage<TrackerPhase[]>(
    'app_trackerPhases',
    defaultTrackerPhases
  );

  const [activities, setActivities] = useLocalStorage<ActivityEvent[]>(
    'app_activities',
    defaultActivities
  );

  const addActivity = (
    message: string,
    highlight?: string,
    dotColor = '#818cf8'
  ) => {
    const newEvent: ActivityEvent = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      time: 'Just now',
      dotColor,
      highlight,
    };
    setActivities((prev) => [newEvent, ...prev].slice(0, 10));
  };

  const [historySessions, setHistorySessions] = useLocalStorage<HistorySession[]>(
    'app_historySessions',
    defaultHistorySessions
  );

  const [insightQuotes, setInsightQuotes] = useLocalStorage<InsightQuote[]>(
    'app_insightQuotes',
    defaultInsightQuotes
  );

  const [insightCategories, setInsightCategories] = useLocalStorage<string[]>(
    'app_insightCategories',
    defaultInsightCategories
  );

  const [artifacts, setArtifacts] = useLocalStorage<Artifact[]>(
    'app_artifacts',
    defaultArtifacts
  );

  return (
    <AppContext.Provider
      value={{
        sourceFiles,
        setSourceFiles,
        sourceCategories,
        setSourceCategories,
        trackerPhases,
        setTrackerPhases,
        activities,
        addActivity,
        historySessions,
        setHistorySessions,
        insightQuotes,
        setInsightQuotes,
        insightCategories,
        setInsightCategories,
        artifacts,
        setArtifacts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (ctx === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}

/** Backward-compatible alias kept so any code referencing the old
 *  ActivityContext hook continues to work without changes. */
export function useActivity() {
  const { activities, addActivity } = useAppContext();
  return { activities, addActivity };
}
