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
    { id: '1', role: 'model', text: `Hi ${profile.name}! I'm your AI Study & Health Assistant. How can I help you today?` }
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
    
    // User ka message screen par dikhana
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Bot ke message ke liye placeholder
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: 'Thinking...' }]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is missing!");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const todayData = healthHistory[healthHistory.length - 1] || { sleep: 0, water: 0, studyHours: 0 };
      const pendingTasks = tasks.filter(t => !t.completed).length;
      
      // STRICT INSTRUCTION: Faltu ka profile data har answer me ghusana ban hai
      const systemInstruction = `You are a smart, conversational AI Assistant for ${profile.name}.
      CRITICAL RULE: Answer the user's question directly, accurately, and naturally. Do NOT mention or talk about their target (${profile.target}), sleep (${todayData.sleep}h), water, or pending tasks (${pendingTasks}) unless they explicitly ask you a question regarding their health, studies, or daily schedule. Keep your tone helpful and friendly.`;

      // Stable model call
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7, // variety ke liye
        }
      });

      if (response.text) {
        setMessages(prev => 
          prev.map(msg => msg.id === botMessageId ? { ...msg, text: response.text as string } : msg)
        );
      } else {
        throw new Error("Gemini returned empty text");
      }

    } catch (error) {
      console.error("AI Chat Error Detailed:", error);
      setMessages(prev => 
        prev.map(msg => msg.id === botMessageId ? { ...msg, text: "Error aa raha hai bhai. Ek baar check karo ki Vercel par 'NEXT_PUBLIC_GEMINI_API_KEY' variable sahi se add kiya hai ya nahi." } : msg)
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini</p>
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
              <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
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
            placeholder="Ask anything..."
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
