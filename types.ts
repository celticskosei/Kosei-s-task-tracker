
export type Category = 'school' | 'work' | 'other';

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  importance: number;
  completed: boolean;
}

export interface Activity {
  id: string;
  description: string;
  category: Category;
  durationMinutes: number;
  timestamp: string; // ISO string
}

export interface AppState {
  tasks: Task[];
  activities: Activity[];
}
