import { useState, useMemo } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { healthHistory, studyLogs, resetData } = useAppContext();
  const [showResetModal, setShowResetModal] = useState(false);

  // Prepare data for Bar Chart (Last 7 Days dynamically)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const health = healthHistory.find(h => h.date === dateStr);
    const dayLogs = studyLogs.filter(log => log.date === dateStr);
    const studyHours = dayLogs.reduce((sum, log) => sum + log.hours, 0);
    
    const displayDate = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      name: displayDate,
      Study: studyHours,
      Sleep: health?.sleep || 0,
    };
  });

  // --- FORECAST LOGIC ---
  const calculateTrend = (data: any[], key: string) => {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let n = 0;
    data.forEach((d, i) => {
      if (d[key] > 0) {
        sumX += i;
        sumY += d[key];
        sumXY += i * d[key];
        sumX2 += i * i;
        n++;
      }
    });
    if (n < 2) {
      const lastVal = data.slice().reverse().find(d => d[key] > 0)?.[key] || 0;
      return { m: 0, b: lastVal };
    }
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    return { m, b };
  };

  const studyTrend = calculateTrend(chartData, 'Study');
  const sleepTrend = calculateTrend(chartData, 'Sleep');

  const forecastData = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    let projStudy = studyTrend.m * (6 + i) + studyTrend.b;
    let projSleep = sleepTrend.m * (6 + i) + sleepTrend.b;
    
    forecastData.push({
      name: dateStr,
      Study: Math.max(0, Math.min(24, Number(projStudy.toFixed(1)))),
      Sleep: Math.max(0, Math.min(24, Number(projSleep.toFixed(1))))
    });
  }

  let insightNote = "";
  if (studyTrend.m > 0.2 && sleepTrend.m < -0.2) {
    insightNote = "Trend: Study hours are increasing, but sleep is dropping. Watch out for burnout in the coming days!";
  } else if (studyTrend.m > 0.1 && sleepTrend.m >= -0.1) {
    insightNote = "Trend: Great job! You're increasing study time while maintaining sleep. Keep this balanced momentum.";
  } else if (studyTrend.m < -0.2 && sleepTrend.m > 0.1) {
    insightNote = "Trend: You're getting more rest, but study hours are trending down. Try to gently increase focus time tomorrow.";
  } else if (studyTrend.m < -0.2 && sleepTrend.m < -0.2) {
    insightNote = "Trend: Both study and sleep are trending down. Take a moment to reset your routine and prioritize your well-being.";
  } else {
    insightNote = "Trend: Your habits are relatively stable. Consistency is key, but ensure you're hitting your daily targets.";
  }

  // Calculate dynamic averages based on actual input days
  const daysWithSleep = healthHistory.filter(h => h.sleep > 0).length || 1;
  const avgSleep = healthHistory.reduce((acc, curr) => acc + curr.sleep, 0) / daysWithSleep;

  const uniqueStudyDays = new Set(studyLogs.map(log => log.date)).size || 1;
  const totalStudyHours = studyLogs.reduce((acc, curr) => acc + curr.hours, 0);
  const avgStudy = totalStudyHours / uniqueStudyDays;

  // Calculate Subject Distribution for Pie Chart
  const subjectDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    studyLogs.forEach(log => {
      if (distribution[log.subject]) {
        distribution[log.subject] += log.hours;
      } else {
        distribution[log.subject] = log.hours;
      }
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value);
  }, [studyLogs]);

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#84cc16'];

  const handleReset = () => {
    resetData();
    setShowResetModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis & Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your study and health metrics.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-colors"
          >
            <RefreshCw size={16} className="mr-2" /> Reset
          </button>
        </div>
      </div>

      {/* Report Container */}
      <motion.div 
        id="analysis-report" 
        className="space-y-6 p-2 bg-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <motion.div 
            className="glass-panel p-6 rounded-2xl lg:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study vs Sleep (Last 7 Days)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="Study" fill="#3b82f6" radius={[4, 4, 0, 0]} activeBar={{ stroke: '#60a5fa', strokeWidth: 2 }} />
                  <Bar dataKey="Sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} activeBar={{ stroke: '#a78bfa', strokeWidth: 2 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Forecast Chart */}
          <motion.div 
            className="glass-panel p-6 rounded-2xl flex flex-col"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 w-full text-left">3-Day Forecast</h3>
            <div className="h-48 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Study" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                  <Line type="monotone" dataKey="Sleep" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                {insightNote}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Distribution Pie Chart */}
          <motion.div 
            className="glass-panel p-6 rounded-2xl flex flex-col"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Distribution (All Time)</h3>
            <div className="h-64 w-full">
              {subjectDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                      formatter={(value: any) => [`${value} hrs`, 'Study Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No study data available yet.
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Avg Sleep', value: `${avgSleep.toFixed(1)}h`, color: 'text-purple-600' },
              { label: 'Avg Study', value: `${avgStudy.toFixed(1)}h`, color: 'text-blue-600' },
              { label: 'Water Intake', value: `${healthHistory.find(h => h.date === last7Days[6])?.water || 0} glasses`, color: 'text-cyan-600' },
              { label: 'Current Mood', value: healthHistory.find(h => h.date === last7Days[6])?.mood || 'N/A', color: 'text-yellow-600' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="glass-panel p-6 rounded-2xl flex flex-col justify-center"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Reset Analysis Data?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This will permanently delete all your study logs, health history, and tasks. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
