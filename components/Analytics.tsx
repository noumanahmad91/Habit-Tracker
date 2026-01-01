
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { Habit } from '../types';
// Fixed missing Sparkles import
import { Trophy, TrendingUp, Calendar as CalendarIcon, Zap, Sparkles } from 'lucide-react';

interface AnalyticsProps {
  habits: Habit[];
}

const Analytics: React.FC<AnalyticsProps> = ({ habits }) => {
  const chartData = useMemo(() => {
    // Generate last 7 days for the chart
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = habits.reduce((acc, habit) => {
        const logged = habit.logs.find(l => l.date === dateStr);
        return acc + (logged?.completed ? 1 : 0);
      }, 0);
      
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count,
        fullDate: dateStr
      });
    }
    return data;
  }, [habits]);

  const habitComparisonData = useMemo(() => {
    return habits.map(h => ({
      name: h.name,
      completions: h.logs.filter(l => l.completed).length,
      color: h.color
    })).sort((a, b) => b.completions - a.completions);
  }, [habits]);

  const totalPossible = habits.length * 7;
  const totalCompletedLast7 = chartData.reduce((acc, curr) => acc + curr.completed, 0);
  const weeklyCompletionRate = totalPossible > 0 ? Math.round((totalCompletedLast7 / totalPossible) * 100) : 0;

  if (habits.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500">Add some habits to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-indigo-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Trophy className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Hits</p>
          <p className="text-2xl font-bold text-gray-900">{totalCompletedLast7}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Weekly Rate</p>
          <p className="text-2xl font-bold text-gray-900">{weeklyCompletionRate}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Habits</p>
          <p className="text-2xl font-bold text-gray-900">{habits.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tracking Since</p>
          <p className="text-sm font-bold text-gray-900 mt-2">
            {new Date(habits[0].createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Habits</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completions" radius={[0, 4, 4, 0]} barSize={20}>
                  {habitComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* AI Motivation Footer */}
      <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="flex-1 z-10">
          <h4 className="text-2xl font-bold mb-2">Keep the momentum going!</h4>
          <p className="text-indigo-100 opacity-90">
            Consistency is the engine of change. You've completed {totalCompletedLast7} habits this week. 
            Imagine who you'll be in 3 months if you stay the course.
          </p>
        </div>
        <div className="shrink-0 z-10">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest mb-1">Weekly Win</p>
            <p className="text-4xl font-black">{weeklyCompletionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
