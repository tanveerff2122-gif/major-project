import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { Droplets, Moon, Smile, Frown, Meh, Angry } from 'lucide-react';
import { motion } from 'motion/react';

export default function HealthTracker() {
  const { healthHistory, setHealthHistory } = useAppContext();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [mood, setMood] = useState('😐');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const data = healthHistory.find(h => h.date === selectedDate) || { water: 0, sleep: 0, mood: '😐' };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWater(data.water);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSleep(data.sleep);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMood(data.mood);
  }, [selectedDate, healthHistory]);

  const moods = [
    { emoji: '😄', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😫', label: 'Tired' },
    { emoji: '😡', label: 'Stressed' },
  ];

  const handleSave = () => {
    const currentData = healthHistory.find(h => h.date === selectedDate) || { studyHours: 0 };
    const newData = { date: selectedDate, water, sleep, mood, studyHours: currentData.studyHours };
    
    let newHistory = [...healthHistory];
    const existingIndex = newHistory.findIndex(h => h.date === selectedDate);
    
    if (existingIndex >= 0) {
      newHistory[existingIndex] = newData;
    } else {
      newHistory.push(newData);
      newHistory.sort((a, b) => a.date.localeCompare(b.date));
    }
    
    setHealthHistory(newHistory);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div 
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Health Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Log your daily wellness metrics.</p>
        <input
          type="date"
          value={selectedDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      <motion.div 
        className="glass-panel p-8 rounded-2xl space-y-8 relative"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
            Saved successfully!
          </div>
        )}

        {/* Water Intake */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="text-cyan-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Water Intake (Glasses)</h3>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setWater(Math.max(0, water - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >-</button>
            <span className="text-3xl font-bold text-gray-900 dark:text-white w-12 text-center">{water}</span>
            <button 
              onClick={() => setWater(water + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >+</button>
          </div>
        </div>

        {/* Sleep */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Moon className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hours of Sleep</h3>
          </div>
          <input 
            type="range" 
            min="0" 
            max="14" 
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
          />
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{sleep} hours</div>
        </div>

        {/* Mood */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Smile className="text-yellow-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Mood</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.emoji)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  mood === m.emoji 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 scale-110 border-2' 
                    : 'bg-gray-50 border-transparent dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-2'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Save Health Data
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  );
}
