import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export default function StudyTracker() {
  const { studyLogs, setStudyLogs } = useAppContext();
  
  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Study Log State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState<number | ''>('');

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
      if (mode === 'work') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode('break');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimeLeft(5 * 60);
        alert('Pomodoro finished! Take a break.');
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode('work');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimeLeft(25 * 60);
        alert('Break finished! Back to work.');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Study Log Handlers
  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !hours || isNaN(Number(hours))) return;
    setStudyLogs([...studyLogs, {
      id: Date.now().toString(),
      date: selectedDate,
      subject: subject.trim(),
      hours: Number(hours)
    }]);
    setSubject('');
    setHours('');
  };

  const deleteLog = (id: string) => {
    setStudyLogs(studyLogs.filter(log => log.id !== id));
  };

  // --- Charts Data Preparation ---

  // 1. Pie Chart (Selected Date Distribution)
  const selectedLogs = studyLogs.filter(log => log.date === selectedDate);
  const subjectTotals = selectedLogs.reduce((acc, log) => {
    acc[log.subject] = (acc[log.subject] || 0) + log.hours;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(subjectTotals).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

  // 2. Bar Chart (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const barData = last7Days.map(dateStr => {
    const dayLogs = studyLogs.filter(log => log.date === dateStr);
    const totalHours = dayLogs.reduce((sum, log) => sum + log.hours, 0);
    const displayDate = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { date: displayDate, hours: totalHours };
  });

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your focus time and log your study hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <motion.div 
          className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => switchMode('work')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'work' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Work (25m)
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'break' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Break (5m)
            </button>
          </div>

          <div className="text-7xl font-bold text-gray-900 dark:text-white mb-8 tabular-nums tracking-tight">
            {formatTime(timeLeft)}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full text-white transition-colors ${
                isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </motion.div>

        {/* Study Log Form & List */}
        <motion.div 
          className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Study Hours</h3>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          
          <form onSubmit={addLog} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value) || '')}
              placeholder="Hours"
              min="0.5"
              step="0.5"
              className="w-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {selectedLogs.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">No logs for this date.</p>
            ) : (
              selectedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {log.subject}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                      {log.hours}h
                    </span>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Selected Date Distribution */}
        <motion.div 
          className="glass-panel p-6 rounded-2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Distribution ({new Date(selectedDate).toLocaleDateString()})</h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              Add logs above to see distribution
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                    formatter={(value: any) => [`${value} hours`, 'Study Time']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Bar Chart: Last 7 Days Contribution */}
        <motion.div 
          className="glass-panel p-6 rounded-2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Last 7 Days Study Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                />
                <Bar dataKey="hours" name="Total Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} activeBar={{ stroke: '#60a5fa', strokeWidth: 2 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
