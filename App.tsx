
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BarChart2, Calendar, Target, Sparkles, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { Habit, HabitLog, UserStats } from './types';
import HabitForm from './components/HabitForm';
import HabitCard from './components/HabitCard';
import Analytics from './components/Analytics';
import { generateHabitInsight, getDailyInspiration } from './services/geminiService';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'stats'>('habits');
  const [dailyQuote, setDailyQuote] = useState<string>('Loading inspiration...');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // Initialize data from LocalStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('gemini_habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }

    if (Notification.permission === 'granted') {
      setIsNotificationEnabled(true);
    }

    const fetchQuote = async () => {
      const saved = JSON.parse(savedHabits || '[]');
      const names = saved.map((h: Habit) => h.name);
      const quote = await getDailyInspiration(names);
      setDailyQuote(quote);
    };
    fetchQuote();
  }, []);

  // Sync data to LocalStorage
  useEffect(() => {
    localStorage.setItem('gemini_habits', JSON.stringify(habits));
  }, [habits]);

  // Reminder System
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
          if (Notification.permission === 'granted') {
            new Notification('Habit Reminder!', {
              body: `Time to work on your habit: ${habit.name}`,
              icon: 'https://picsum.photos/100/100'
            });
          } else {
            // Fallback for in-app alert
            console.log(`Reminder: ${habit.name}`);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [habits]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setIsNotificationEnabled(true);
    }
  };

  const handleAddHabit = async (newHabit: Partial<Habit>) => {
    const aiData = await generateHabitInsight(newHabit.name || '', newHabit.description || '');
    
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newHabit.name || 'Untitled',
      description: newHabit.description || '',
      frequency: newHabit.frequency || 'daily',
      reminderTime: newHabit.reminderTime || '09:00',
      color: newHabit.color || '#4f46e5',
      createdAt: new Date().toISOString(),
      logs: [],
      aiSuggestion: aiData || undefined,
    };

    setHabits(prev => [...prev, habit]);
    setIsFormOpen(false);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const toggleHabitCompletion = (id: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const existingIndex = habit.logs.findIndex(log => log.date === date);
        let newLogs = [...habit.logs];
        
        if (existingIndex > -1) {
          newLogs[existingIndex].completed = !newLogs[existingIndex].completed;
        } else {
          newLogs.push({ date, completed: true });
        }
        return { ...habit, logs: newLogs };
      }
      return habit;
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl px-6 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600 h-8 w-8" />
            Habit Flow
          </h1>
          <p className="text-gray-500 mt-1 italic">"{dailyQuote}"</p>
        </div>
        <div className="flex gap-2">
          {!isNotificationEnabled && (
            <button 
              onClick={requestNotificationPermission}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              title="Enable Reminders"
            >
              <Bell className="h-6 w-6" />
            </button>
          )}
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl px-6 flex-1">
        {activeTab === 'habits' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                  <Target className="h-12 w-12 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">No habits yet</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">
                  Start your journey by adding your first habit. Our AI will help you stay motivated!
                </p>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="mt-6 text-indigo-600 font-semibold hover:underline"
                >
                  Create Habit +
                </button>
              </div>
            ) : (
              habits.map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onToggle={toggleHabitCompletion}
                  onDelete={handleDeleteHabit}
                  today={today}
                />
              ))
            )}
          </div>
        ) : (
          <Analytics habits={habits} />
        )}
      </main>

      {/* Persistent Navigation (Mobile) */}
      <nav className="fixed bottom-0 w-full md:sticky md:top-4 md:mt-8 md:mb-12 md:bottom-auto bg-white border-t md:border md:rounded-2xl border-gray-100 px-6 py-4 flex justify-around max-w-lg md:max-w-xs shadow-xl md:shadow-md z-40">
        <button 
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'habits' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs font-medium">Habits</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <BarChart2 className="h-6 w-6" />
          <span className="text-xs font-medium">Stats</span>
        </button>
      </nav>

      {/* Modal */}
      {isFormOpen && (
        <HabitForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddHabit} 
        />
      )}
    </div>
  );
};

export default App;
