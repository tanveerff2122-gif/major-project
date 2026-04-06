import { useState, useMemo } from 'react';
import { useAppContext, GoalSubject } from '@/app/context/AppContext';
import { Target, Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function GoalTracker() {
  const { goal, setGoal, studyLogs } = useAppContext();
  const [isEditing, setIsEditing] = useState(!goal);

  // Form State
  const [title, setTitle] = useState(goal?.title || '');
  const [field, setField] = useState(goal?.field || '');
  const [totalDays, setTotalDays] = useState(goal?.totalDays?.toString() || '30');
  const [subjects, setSubjects] = useState<GoalSubject[]>(goal?.subjects || []);

  const handleAddSubject = () => {
    setSubjects([...subjects, {
      id: Date.now().toString(),
      name: '',
      weightage: 0,
      dailyHours: 0,
      mode: 'parallel'
    }]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubjectChange = (id: string, field: keyof GoalSubject, value: any) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    if (!title || !field || !totalDays || subjects.length === 0) {
      alert('Please fill all fields and add at least one subject.');
      return;
    }
    
    const hasEmptySubject = subjects.some(s => !s.name || s.weightage <= 0 || s.dailyHours <= 0);
    if (hasEmptySubject) {
      alert('Please ensure all subjects have a name, weightage > 0, and daily hours > 0.');
      return;
    }

    const totalWeight = subjects.reduce((sum, s) => sum + Number(s.weightage), 0);
    if (totalWeight !== 100) {
      alert(`Total weightage must be exactly 100%. Current: ${totalWeight}%`);
      return;
    }

    setGoal({
      title,
      field,
      totalDays: Number(totalDays),
      startDate: goal?.startDate || new Date().toISOString().split('T')[0],
      subjects: subjects.map(s => ({
        ...s,
        weightage: Number(s.weightage),
        dailyHours: Number(s.dailyHours)
      }))
    });
    setIsEditing(false);
  };

  const progressData = useMemo(() => {
    if (!goal) return null;

    let overallProgress = 0;
    const subjectProgress = goal.subjects.map(subject => {
      // Filter study logs that match this subject's name exactly (case-insensitive)
      const logs = studyLogs.filter(log => log.subject.toLowerCase() === subject.name.toLowerCase());
      const loggedHours = logs.reduce((sum, log) => sum + log.hours, 0);
      
      const targetHours = subject.dailyHours * goal.totalDays;
      const progressPercent = targetHours > 0 ? Math.min(100, (loggedHours / targetHours) * 100) : 0;
      
      overallProgress += (progressPercent * (subject.weightage / 100));

      return {
        ...subject,
        loggedHours,
        targetHours,
        progressPercent
      };
    });

    return {
      overallProgress: Math.min(100, overallProgress),
      subjectProgress
    };
  }, [goal, studyLogs]);

  if (isEditing) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set Your Goal</h1>
          <p className="text-gray-500 dark:text-gray-400">Define what you want to achieve and plan your subjects.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AWS Solutions Architect"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specific Field</label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g., Cloud Computing"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Required (Days)</label>
              <input
                type="number"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                min="1"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subjects & Plan</h3>
              <button
                onClick={handleAddSubject}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 relative">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject Name</label>
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                      placeholder="e.g., Networking"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      value={subject.weightage}
                      onChange={(e) => handleSubjectChange(subject.id, 'weightage', e.target.value)}
                      min="1" max="100"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Daily Hrs</label>
                    <input
                      type="number"
                      value={subject.dailyHours}
                      onChange={(e) => handleSubjectChange(subject.id, 'dailyHours', e.target.value)}
                      min="0.5" step="0.5"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="w-full md:w-36">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Study Mode</label>
                    <select
                      value={subject.mode}
                      onChange={(e) => handleSubjectChange(subject.id, 'mode', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="parallel">Parallel</option>
                      <option value="sequential">Sequential</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveSubject(subject.id)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors h-fit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No subjects added yet. Click &quot;Add Subject&quot; to begin.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            {goal && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 mr-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!goal || !progressData) return null;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">Field: {goal.field} • Target: {goal.totalDays} Days</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm"
        >
          <Edit2 size={16} className="mr-2" /> Edit Goal
        </button>
      </div>

      {/* Overall Progress Slider */}
      <div className="glass-panel p-8 rounded-2xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Target className="mr-2 text-blue-500" size={24} /> Goal Completion
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Updates automatically based on your daily study logs.</p>
          </div>
          <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
            {progressData.overallProgress.toFixed(1)}%
          </div>
        </div>
        
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-6 shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{ width: `${progressData.overallProgress}%` }}
          >
            {progressData.overallProgress > 5 && (
              <div className="w-3 h-3 bg-white rounded-full opacity-75 shadow-sm"></div>
            )}
          </div>
        </div>
      </div>

      {/* Subjects Breakdown */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4">Subject Progress</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {progressData.subjectProgress.map((subject) => (
          <motion.div 
            key={subject.id} 
            className="glass-panel p-6 rounded-2xl flex flex-col"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-md font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen size={18} className="mr-2 text-gray-500" /> {subject.name}
                </h4>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {subject.weightage}% Weight
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    subject.mode === 'parallel' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {subject.mode === 'parallel' ? 'Parallel Study' : 'Sequential Study'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{subject.progressPercent.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subject.loggedHours.toFixed(1)} / {subject.targetHours} hrs
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-auto">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${subject.progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Target: {subject.dailyHours} hrs/day
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
