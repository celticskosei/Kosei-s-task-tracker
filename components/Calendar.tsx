
import React from 'react';
import { Task, Activity } from '../types';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  tasks: Task[];
  activities: Activity[];
}

const Calendar: React.FC<CalendarProps> = ({ tasks, activities }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const getDayFocusDuration = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activities
      .filter(a => format(new Date(a.timestamp), 'yyyy-MM-dd') === dateStr)
      .reduce((sum, a) => sum + a.durationMinutes, 0);
  };

  const getGlowIntensity = (duration: number) => {
    if (duration === 0) return 'border-white/5';
    if (duration < 60) return 'border-white/20 bg-white/[0.02] shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]';
    if (duration < 180) return 'border-white/40 bg-white/[0.05] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]';
    return 'border-white/60 bg-white/[0.1] shadow-[inset_0_0_30px_rgba(255,255,255,0.2)]';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="mono text-xs font-bold text-gray-400 uppercase tracking-tighter">
          Time_Grid | {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:text-white text-gray-600"><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:text-white text-gray-600"><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="mono text-[8px] text-gray-600 text-center mb-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
          const focusDuration = getDayFocusDuration(day);
          const isToday = isSameDay(day, new Date());
          const isInMonth = isSameMonth(day, currentMonth);

          return (
            <div 
              key={i} 
              className={`min-h-[60px] p-1 border rounded flex flex-col gap-0.5 transition-all relative overflow-hidden ${
                isInMonth ? '' : 'opacity-10'
              } ${getGlowIntensity(focusDuration)} ${isToday ? 'ring-1 ring-white/50' : ''}`}
            >
              <span className={`text-[9px] mono font-bold ${isToday ? 'text-white' : 'text-gray-500'}`}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayTasks.map(t => (
                  <div key={t.id} className={`text-[8px] truncate px-1 rounded ${t.completed ? 'bg-white/5 text-gray-600' : 'bg-white/10 text-gray-300'}`}>
                    {t.name}
                  </div>
                ))}
              </div>
              {focusDuration > 0 && (
                <div className="absolute bottom-0 right-0 p-0.5 text-[8px] mono text-gray-400 opacity-50">
                  {focusDuration}m
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
