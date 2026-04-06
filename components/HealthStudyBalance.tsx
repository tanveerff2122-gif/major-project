import { useAppContext } from '@/app/context/AppContext';
import { motion } from 'motion/react';
import { Scale, Brain, Heart } from 'lucide-react';

export default function HealthStudyBalance() {
  const { studyLogs, healthHistory } = useAppContext();

  // Calculate simple balance metrics
  const totalStudyHours = studyLogs.reduce((sum, log) => sum + log.hours, 0);
  const totalSleep = healthHistory.reduce((sum, log) => sum + log.sleep, 0);
  const totalWater = healthHistory.reduce((sum, log) => sum + log.water, 0);

  const studyScore = Math.min(100, (totalStudyHours / 10) * 100); // Assuming 10 hours is 100% for demo
  const healthScore = Math.min(100, ((totalSleep / 8) * 50) + ((totalWater / 8) * 50)); // Simple health score

  const balanceScore = Math.abs(studyScore - healthScore);
  let balanceStatus = 'Excellent';
  let balanceColor = 'text-green-500';
  if (balanceScore > 20) {
    balanceStatus = 'Good';
    balanceColor = 'text-blue-500';
  }
  if (balanceScore > 40) {
    balanceStatus = 'Needs Attention';
    balanceColor = 'text-yellow-500';
  }
  if (balanceScore > 60) {
    balanceStatus = 'Poor';
    balanceColor = 'text-red-500';
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Scale className="mr-3 text-purple-600" size={28} />
          Health & Study Balance
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze the harmony between your academic efforts and physical wellbeing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Brain size={48} className="text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Intensity</h3>
          <div className="text-3xl font-bold text-blue-600 mt-2">{studyScore.toFixed(0)}%</div>
        </motion.div>

        <motion.div 
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Scale size={48} className={balanceColor + " mb-4"} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Balance</h3>
          <div className={`text-2xl font-bold mt-2 ${balanceColor}`}>{balanceStatus}</div>
        </motion.div>

        <motion.div 
          className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Heart size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Index</h3>
          <div className="text-3xl font-bold text-red-600 mt-2">{healthScore.toFixed(0)}%</div>
        </motion.div>
      </div>
    </div>
  );
}
