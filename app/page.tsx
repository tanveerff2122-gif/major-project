'use client';

import { useState } from 'react';
import { useAppContext } from './context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import StudyTracker from '@/components/StudyTracker';
import HealthTracker from '@/components/HealthTracker';
import HealthStudyBalance from '@/components/HealthStudyBalance';
import GoalTracker from '@/components/GoalTracker';
import Quiz from '@/components/Quiz';
import AIChat from '@/components/AIChat';
import Profile from '@/components/Profile';
import AuthPage from '@/components/AuthPage';
import AdminPanel from '@/components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';

export type Tab = 'dashboard' | 'study' | 'health' | 'balance' | 'goal' | 'quiz' | 'ai' | 'profile' | 'admin';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isHydrated, currentUser } = useAppContext();

  if (!isHydrated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'study': return <StudyTracker />;
      case 'health': return <HealthTracker />;
      case 'balance': return <HealthStudyBalance />;
      case 'goal': return <GoalTracker />;
      case 'quiz': return <Quiz />;
      case 'ai': return <AIChat />;
      case 'profile': return <Profile />;
      case 'admin': return currentUser.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
