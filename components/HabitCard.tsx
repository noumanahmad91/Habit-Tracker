
import React, { useState } from 'react';
import { CheckCircle2, Trash2, Clock, Info, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  today: string;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, today }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isCompletedToday = habit.logs.find(log => log.date === today)?.completed || false;
  
  const completionRate = habit.logs.length > 0 
    ? Math.round((habit.logs.filter(l => l.completed).length / habit.logs.length) * 100)
    : 0;

  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/20' : ''}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: habit.color }}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onDelete(habit.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{habit.name}</h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-1">{habit.description || 'No description provided'}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>{habit.reminderTime}</span>
          </div>
          <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {completionRate}% Success
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onToggle(habit.id, today)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isCompletedToday 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            {isCompletedToday ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Completed
              </>
            ) : (
              'Complete Today'
            )}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          >
            {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 p-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {habit.aiSuggestion ? (
            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <Info className="h-3 w-3" />
                  AI Identity Statement
                </h4>
                <p className="text-indigo-900 font-medium bg-white p-3 rounded-lg border border-indigo-100">
                  "{habit.aiSuggestion.identityStatement}"
                </p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <Trophy className="h-3 w-3" />
                  Motivation
                </h4>
                <p className="text-gray-700 italic">"{habit.aiSuggestion.motivation}"</p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {habit.aiSuggestion.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic py-4">Generating AI insights...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HabitCard;
