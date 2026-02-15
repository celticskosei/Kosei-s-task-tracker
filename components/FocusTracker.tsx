
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Category } from '../types';
import { Play, Pause, Square, RotateCcw, Plus, Check } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { format, subDays, startOfToday, isSameDay } from 'date-fns';

interface FocusTrackerProps {
  activities: Activity[];
  onLogActivity: (description: string, category: Category, durationMinutes: number) => void;
}

const CAT_COLORS: Record<Category, string> = {
  school: '#10b981', // Emerald
  work: '#f97316',   // Orange
  other: '#94a3b8'   // Slate
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    const renderCategoryBreakdown = (cat: Category, color: string) => {
      const duration = data[cat];
      const details: Activity[] = data[`${cat}_details`];
      
      if (duration === 0) return null;

      const hrs = Math.floor(duration / 60);
      const mins = duration % 60;
      const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

      return (
        <div className="mt-2 border-t border-white/10 pt-2 first:mt-0 first:border-0 first:pt-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="mono text-[10px] font-bold uppercase" style={{ color }}>{cat} — {timeStr}</span>
          </div>
          <ul className="space-y-0.5">
            {details.map((act) => (
              <li key={act.id} className="mono text-[9px] text-gray-400 flex justify-between gap-4">
                <span className="truncate max-w-[120px]"> • {act.description}</span>
                <span className="shrink-0">{act.durationMinutes}m</span>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="bg-black border border-white/20 p-3 rounded-lg shadow-2xl min-w-[180px]">
        <div className="mono text-[9px] text-gray-500 mb-2 border-b border-white/10 pb-1">
          {format(data.fullDate, 'EEEE, MMM do')}
        </div>
        {renderCategoryBreakdown('school', CAT_COLORS.school)}
        {renderCategoryBreakdown('work', CAT_COLORS.work)}
        {renderCategoryBreakdown('other', CAT_COLORS.other)}
      </div>
    );
  }
  return null;
};

const FocusTracker: React.FC<FocusTrackerProps> = ({ activities, onLogActivity }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);

  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Category>('school');
  const [manualDuration, setManualDuration] = useState('60');

  useEffect(() => {
    let interval: any = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(startOfToday(), 6 - i);
      const dayActivities = activities.filter(a => isSameDay(new Date(a.timestamp), date));
      return {
        name: format(date, 'EEE'),
        school: dayActivities.filter(a => a.category === 'school').reduce((sum, a) => sum + a.durationMinutes, 0),
        work: dayActivities.filter(a => a.category === 'work').reduce((sum, a) => sum + a.durationMinutes, 0),
        other: dayActivities.filter(a => a.category === 'other').reduce((sum, a) => sum + a.durationMinutes, 0),
        school_details: dayActivities.filter(a => a.category === 'school'),
        work_details: dayActivities.filter(a => a.category === 'work'),
        other_details: dayActivities.filter(a => a.category === 'other'),
        fullDate: date
      };
    });
  }, [activities]);

  const handleFinish = () => {
    setIsActive(false);
    setShowLogModal(true);
  };

  const handleCommitLog = () => {
    if (!desc) return;
    const duration = Math.ceil(seconds / 60);
    onLogActivity(desc, cat, duration);
    setSeconds(0);
    setShowLogModal(false);
    setDesc('');
  };

  const handleManualCommit = () => {
    if (!desc) return;
    onLogActivity(desc, cat, parseInt(manualDuration) || 0);
    setManualModal(false);
    setDesc('');
  };

  return (
    <div className="flex h-full gap-6">
      {/* Stopwatch Section */}
      <div className="flex-1 flex flex-col border-r border-white/10 pr-6 justify-center">
        <div className="mono text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex justify-between items-center">
          <span>Active_Session</span>
          <button onClick={() => setManualModal(true)} className="p-1 hover:text-white transition-colors">
            <Plus size={14} />
          </button>
        </div>
        
        <div className="mono text-5xl font-bold tracking-tighter mb-8 text-center bg-white/5 py-4 rounded-xl border border-white/5 shadow-inner">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2 justify-center">
          {!isActive ? (
            <button 
              onClick={() => setIsActive(true)}
              className="px-6 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Lock In
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-white/10 rounded-lg hover:bg-white/20">
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button onClick={handleFinish} className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                <Check size={18} />
              </button>
              <button onClick={() => { setIsActive(false); setSeconds(0); }} className="p-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600 hover:text-white">
                <RotateCcw size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-[2] flex flex-col overflow-hidden">
        <div className="mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">Focus_Analysis (Last 7 Days)</div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="school" stackId="a" fill={CAT_COLORS.school} radius={[0, 0, 0, 0]} />
              <Bar dataKey="work" stackId="a" fill={CAT_COLORS.work} radius={[0, 0, 0, 0]} />
              <Bar dataKey="other" stackId="a" fill={CAT_COLORS.other} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center">
          {Object.entries(CAT_COLORS).map(([c, color]) => (
            <div key={c} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="mono text-[8px] text-gray-500 uppercase">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modals */}
      {(showLogModal || manualModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-white/20 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="mono text-sm font-bold uppercase mb-4 tracking-widest">Activity_Commit</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="mono text-[9px] text-gray-500 uppercase">Description</label>
                <input 
                  type="text" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white"
                  placeholder="What were you focusing on?"
                />
              </div>
              <div className="space-y-1">
                <label className="mono text-[9px] text-gray-500 uppercase">Category</label>
                <div className="flex gap-2">
                  {(['school', 'work', 'other'] as Category[]).map(c => (
                    <button 
                      key={c}
                      onClick={() => setCat(c)}
                      className={`flex-1 py-2 rounded text-[10px] mono uppercase border transition-all ${
                        cat === c ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {manualModal && (
                <div className="space-y-1">
                  <label className="mono text-[9px] text-gray-500 uppercase">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    value={manualDuration} 
                    onChange={e => setManualDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => { setShowLogModal(false); setManualModal(false); }}
                  className="flex-1 py-2 text-xs mono uppercase text-gray-500 hover:text-white"
                >
                  Discard
                </button>
                <button 
                  onClick={manualModal ? handleManualCommit : handleCommitLog}
                  className="flex-1 py-2 bg-white text-black text-xs font-bold rounded uppercase tracking-widest"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTracker;
