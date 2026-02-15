
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Plus, Check, Edit2, X, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (name: string, dueDate: string, importance: number) => void;
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAddTask, onToggleTask, onUpdateTask }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [importance, setImportance] = useState(3);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImportance, setEditImportance] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTask(name, date, importance);
    setName('');
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditDate(task.dueDate);
    setEditImportance(task.importance);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateTask(editingId, {
        name: editName,
        dueDate: editDate,
        importance: editImportance,
      });
      setEditingId(null);
    }
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!groups[task.dueDate]) groups[task.dueDate] = [];
      groups[task.dueDate].push(task);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Minimal Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-2 border-b border-white/10 pb-4">
        <input
          type="text"
          placeholder="New Task..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-white transition-colors"
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-transparent text-[10px] text-gray-400 focus:outline-none mono"
          />
          <select 
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value))}
            className="bg-black border border-white/20 text-[10px] rounded p-1"
          >
            {[1,2,3,4,5].map(v => <option key={v} value={v}>P{v}</option>)}
          </select>
          <button type="submit" className="p-1 hover:text-blue-400 transition-colors">
            <Plus size={16} />
          </button>
        </div>
      </form>

      {/* Grouped Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {groupedTasks.length === 0 ? (
          <div className="text-gray-600 text-[10px] mono uppercase text-center mt-10 tracking-widest">
            Queue empty
          </div>
        ) : (
          groupedTasks.map(([dateKey, items]) => (
            <div key={dateKey} className="mb-6">
              {/* Divider Label */}
              <div className="flex items-center gap-2 mb-2">
                <span className="mono text-[9px] text-gray-500 whitespace-nowrap uppercase">
                  {format(parseISO(dateKey), 'MMMM d, yyyy · EEEE')}
                </span>
                <div className="h-px w-full bg-white/10" />
              </div>
              
              <div className="space-y-2">
                {items.map(task => (
                  <div 
                    key={task.id}
                    className={`flex flex-col p-2 rounded border-l-2 bg-white/[0.02] transition-all importance-${task.importance} ${
                      task.completed && !editingId ? 'opacity-30' : ''
                    }`}
                  >
                    {editingId === task.id ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-transparent border-b border-white/40 text-xs py-1 focus:outline-none focus:border-white"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-transparent text-[9px] text-gray-400 mono focus:outline-none flex-1"
                          />
                          <select 
                            value={editImportance}
                            onChange={(e) => setEditImportance(parseInt(e.target.value))}
                            className="bg-black border border-white/20 text-[9px] rounded p-0.5"
                          >
                            {[1,2,3,4,5].map(v => <option key={v} value={v}>P{v}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-400 hover:text-red-300">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            task.completed ? 'bg-white border-white text-black' : 'border-white/30 hover:border-white'
                          }`}
                        >
                          {task.completed && <Check size={10} strokeWidth={4} />}
                        </button>
                        <span className={`text-xs flex-1 truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {task.name}
                        </span>
                        <button 
                          onClick={() => startEditing(task)}
                          className="p-1 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
