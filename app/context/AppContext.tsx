'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type UserRole = 'admin' | 'user';

export type User = {
  name: string;
  email: string;
  password?: string; // Stored in localStorage for simulation
  role: UserRole;
};

type Profile = {
  name: string;
  avatar: string;
  target: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type StudyLog = {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  hours: number;
};

export type GoalSubject = {
  id: string;
  name: string;
  weightage: number;
  dailyHours: number;
  mode: 'parallel' | 'sequential';
};

export type Goal = {
  title: string;
  field: string;
  totalDays: number;
  startDate: string;
  subjects: GoalSubject[];
} | null;

type HealthData = {
  date: string;
  water: number;
  sleep: number;
  mood: string;
  studyHours: number;
};

export type Theme = 'light' | 'dark' | 'green' | 'peach' | 'ocean' | 'sunset' | 'netflix';

type AppState = {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  studyLogs: StudyLog[];
  setStudyLogs: (logs: StudyLog[]) => void;
  healthHistory: HealthData[];
  setHealthHistory: (history: HealthData[]) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isHydrated: boolean;
  resetData: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  registeredUsers: User[];
  setRegisteredUsers: (users: User[]) => void;
};

const defaultProfile: Profile = {
  name: 'Student',
  avatar: 'https://picsum.photos/seed/avatar/150/150',
  target: 'GPA 4.0',
};

const generateMockHealthHistory = (): HealthData[] => {
  const history: HealthData[] = [];
  const moods = ['😐', '🙂', '😄', '😫', '😎'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    history.push({
      date: dateStr,
      water: Math.floor(Math.random() * 5) + 4,
      sleep: Math.floor(Math.random() * 4) + 5,
      mood: moods[Math.floor(Math.random() * moods.length)],
      studyHours: 0 // Will be computed from studyLogs
    });
  }
  return history;
};
const defaultHealthHistory = generateMockHealthHistory();

const generateMockStudyLogs = (): StudyLog[] => {
  const logs: StudyLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    logs.push({ id: `mock-${i}-1`, date: dateStr, subject: 'Computer Science', hours: Math.floor(Math.random() * 3) + 1 });
    logs.push({ id: `mock-${i}-2`, date: dateStr, subject: 'Mathematics', hours: Math.floor(Math.random() * 2) + 1 });
  }
  return logs;
};
const defaultStudyLogs = generateMockStudyLogs();

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile, profileHydrated] = useLocalStorage<Profile>('app_profile', defaultProfile);
  const [tasks, setTasks, tasksHydrated] = useLocalStorage<Task[]>('app_tasks', []);
  const [studyLogs, setStudyLogs, studyLogsHydrated] = useLocalStorage<StudyLog[]>('app_study_logs', defaultStudyLogs);
  const [healthHistory, setHealthHistory, healthHydrated] = useLocalStorage<HealthData[]>('app_health', defaultHealthHistory);
  const [goal, setGoal, goalHydrated] = useLocalStorage<Goal>('app_goal', null);
  const [theme, setTheme, themeHydrated] = useLocalStorage<Theme>('app_theme', 'light');
  const [currentUser, setCurrentUser, currentUserHydrated] = useLocalStorage<User | null>('app_current_user', null);
  const [registeredUsers, setRegisteredUsers, registeredUsersHydrated] = useLocalStorage<User[]>('app_registered_users', []);

  const isHydrated = profileHydrated && tasksHydrated && studyLogsHydrated && healthHydrated && themeHydrated && goalHydrated && currentUserHydrated && registeredUsersHydrated;

  const resetData = () => {
    setTasks([]);
    setStudyLogs([]);
    setHealthHistory([]);
    setGoal(null);
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        tasks,
        setTasks,
        studyLogs,
        setStudyLogs,
        healthHistory,
        setHealthHistory,
        goal,
        setGoal,
        theme,
        setTheme,
        isHydrated,
        resetData,
        currentUser,
        setCurrentUser,
        registeredUsers,
        setRegisteredUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
