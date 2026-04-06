import { Tab } from '@/app/page';
import { LayoutDashboard, BookOpen, HeartPulse, Scale, BrainCircuit, Bot, User, X, Palette, Target, Shield } from 'lucide-react';
import { useAppContext, Theme } from '@/app/context/AppContext';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { theme, setTheme, currentUser } = useAppContext();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'study', label: 'Study', icon: <BookOpen size={20} /> },
    { id: 'health', label: 'Health', icon: <HeartPulse size={20} /> },
    { id: 'balance', label: 'Balance', icon: <Scale size={20} /> },
    { id: 'goal', label: 'Goal Tracker', icon: <Target size={20} /> },
    { id: 'quiz', label: 'Quiz', icon: <BrainCircuit size={20} /> },
    { id: 'ai', label: 'AI Chat', icon: <Bot size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: <Shield size={20} /> });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent truncate" title="Student Wellness Tracking System">
            SW&HT.ai
          </span>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Palette size={16} className="mr-2" /> Themes
          </div>
          <div className="grid grid-cols-4 gap-2 px-2">
            {(['light', 'dark', 'green', 'peach', 'ocean', 'sunset', 'netflix'] as Theme[]).map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(t)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${theme === t ? 'border-blue-500' : 'border-transparent'} transition-colors`}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              >
                <div className={`w-8 h-8 rounded-full shadow-sm ${
                  t === 'light' ? 'bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-300' :
                  t === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' :
                  t === 'green' ? 'bg-gradient-to-br from-emerald-200 to-teal-300' :
                  t === 'peach' ? 'bg-gradient-to-br from-orange-200 to-amber-300' :
                  t === 'ocean' ? 'bg-gradient-to-br from-blue-200 to-cyan-300' :
                  t === 'netflix' ? 'bg-gradient-to-br from-red-600 to-black border border-red-900' :
                  'bg-gradient-to-br from-rose-200 to-pink-300'
                }`} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
