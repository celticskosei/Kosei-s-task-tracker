
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Activity, Category } from './types';
import TaskManager from './components/TaskManager';
import Calendar from './components/Calendar';
import FocusTracker from './components/FocusTracker';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('kosei_v3_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('kosei_v3_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('kosei_v3_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kosei_v3_activities', JSON.stringify(activities));
  }, [activities]);

  const addTask = (name: string, dueDate: string, importance: number) => {
    const newTask: Task = { id: crypto.randomUUID(), name, dueDate, importance, completed: false };
    setTasks(prev => [...prev, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t).sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addActivity = (description: string, category: Category, durationMinutes: number) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      description,
      category,
      durationMinutes,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [...prev, newActivity]);
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 bg-black overflow-hidden gap-4">
      {/* Top Bar */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 h-12">
        <h1 className="mono text-lg font-bold tracking-widest text-white uppercase">Kosei's task tracker</h1>
        <div className="mono text-sm text-gray-400">
          {format(currentTime, 'yyyy.MM.dd | HH:mm:ss')}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Task Queue */}
        <section className="col-span-3 flex flex-col h-full overflow-hidden border-r border-white/5 pr-4">
          <TaskManager tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onUpdateTask={updateTask} />
        </section>

        {/* Right Area: Calendar & Focus */}
        <div className="col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          {/* Top: Calendar */}
          <div className="flex-[0.4] min-h-0 bg-white/5 rounded-lg border border-white/10 p-4 overflow-hidden">
            <Calendar tasks={tasks} activities={activities} />
          </div>

          {/* Bottom: Focus Tracking */}
          <div className="flex-[0.6] min-h-0 bg-white/5 rounded-lg border border-white/10 p-4 overflow-hidden">
            <FocusTracker activities={activities} onLogActivity={addActivity} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
