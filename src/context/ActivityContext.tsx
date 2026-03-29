import React, { createContext, useContext, useState, ReactNode } from 'react';
import { recentActivity as initialActivities, type ActivityEvent } from '../data/mockData';

type ActivityContextType = {
  activities: ActivityEvent[];
  addActivity: (message: string, highlight?: string, dotColor?: string) => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities);

  const addActivity = (message: string, highlight?: string, dotColor: string = '#818cf8') => {
    const newActivity: ActivityEvent = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        time: 'Just now',
        dotColor,
        highlight
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
