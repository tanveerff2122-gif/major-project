import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User } from 'lucide-react';
import { useAppContext } from '@/app/context/AppContext';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export default function AIChat() {
  const { profile, healthHistory, tasks } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `Hi ${profile.name}! I am your AI Assistant. You can ask me to analyze your dashboard, give performance tips, or ask me absolutely anything about the world (history, science, coding, etc.)!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: 'Thinking...' }]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing!");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });

      // Live Dashboard Data Calculations
      const totalLogsCount = healthHistory.length;
      const todayData = healthHistory[healthHistory.length - 1] || { sleep: 0, water: 0, studyHours: 0 };
      const avgSleep = totalLogsCount > 0 ? (healthHistory.reduce((acc, curr) => acc + (curr.sleep || 0), 0) / totalLogsCount).toFixed(1) : 0;
      const avgWater = totalLogsCount > 0 ? (healthHistory.reduce((acc, curr) => acc + (curr.water || 0), 0) / totalLogsCount).toFixed(1) : 0;
      const avgStudy = totalLogsCount > 0 ? (healthHistory.reduce((acc, curr) => acc + (curr.studyHours || 0), 0) / totalLogsCount).toFixed(1) : 0;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      const pendingTasks = totalTasks - completedTasks;

      // MULTI-PURPOSE SYSTEM INSTRUCTION (Dashboard + Global Knowledge)
      const systemInstruction = `You are an advanced, unrestricted, and highly intelligent AI Assistant built for ${profile.name} (Academic Target: ${profile.target}).

      YOUR KNOWLEDGE BASE & CAPABILITIES:
      1. GLOBAL KNOWLEDGE: You have full access to general knowledge, history (e.g., Akbar, Mughals, world history), science, coding, literature, and general chat. If the user asks about these external topics, answer them with high accuracy, deep details, and clear explanations.
      2. DASHBOARD DATA: You have background access to the user's dashboard data:
         - Sleep: Today ${todayData.sleep}h, Avg ${avgSleep}h
         - Water: Today ${todayData.water} glasses, Avg ${avgWater} glasses
         - Study: Today ${todayData.studyHours}h, Avg ${avgStudy}h
         - Tasks: Total ${totalTasks}, Pending ${pendingTasks}, Completed ${completedTasks}

      CRITICAL HANDLING RULES:
      - If the user asks general or extra questions (e.g., history, science, coding, advice), answer them directly, thoroughly, and comprehensively. DO NOT mention their dashboard data, GPA, sleep, or tasks in these answers. Keep it strictly relevant to their question.
      - ONLY analyze or bring up the dashboard stats/visuals if the user explicitly asks about their performance, stats, tracker logs, or tips regarding their habits.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      if (response.text) {
        setMessages(prev => 
          prev.map(msg => msg.id === botMessageId ? { ...msg, text: response.text as string } : msg)
        );
      } else {
        throw new Error("No text returned");
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => 
        prev.map(msg => msg.id === botMessageId ? { ...msg, text: "An error occurred. Please try again." } : msg)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart AI Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Connected to Dashboard & Global Knowledge</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700 ml-3' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mr-3'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-gray-600 dark:text-gray-300" /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (Dashboard performance or general topics)..."
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
