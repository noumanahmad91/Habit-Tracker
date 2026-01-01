
export interface HabitLog {
  date: string; // ISO format: YYYY-MM-DD
  completed: boolean;
}

export interface AISuggestion {
  identityStatement: string;
  motivation: string;
  tips: string[];
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly';
  reminderTime: string; // HH:mm format
  color: string;
  createdAt: string;
  logs: HabitLog[];
  aiSuggestion?: AISuggestion;
}

export interface UserStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
}
