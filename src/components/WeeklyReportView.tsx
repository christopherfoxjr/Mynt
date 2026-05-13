import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PieChart, TrendingDown, TrendingUp, ShoppingBag, Coffee, Home, Zap, Heart, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Transaction } from '../types';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function WeeklyReportView({ transactions, onBack }: { transactions: Transaction[], onBack: () => void }) {
  // Aggregate data for the "last week"
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= oneWeekAgo && txDate <= now;
  });

  const categoryTotals: Record<string, number> = {};
  let totalSpent = 0;

  weeklyTransactions.forEach(tx => {
    if (tx.amount < 0) {
      const cat = tx.category || 'General';
      const absAmount = Math.abs(tx.amount);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + absAmount;
      totalSpent += absAmount;
    }
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping': return <ShoppingBag size={18} />;
      case 'food': case 'dining': return <Coffee size={18} />;
      case 'housing': case 'rent': return <Home size={18} />;
      case 'utilities': return <Zap size={18} />;
      case 'health': return <Heart size={18} />;
      default: return <MoreHorizontal size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white italic">Weekly Insight</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your spending breakdown for last 7 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-12 xl:col-span-5 h-[400px] glass-panel p-8 flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RePie>
              <Pie
                data={chartData.length > 0 ? chartData : [{ name: 'No data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                {chartData.length === 0 && <Cell fill="#f1f5f9" />}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }} 
              />
            </RePie>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Spent</p>
            <p className="text-4xl font-black font-display text-slate-900 dark:text-white italic leading-none">
              ${totalSpent.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <div className="glass-panel p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-500" /> Top Spending Categories
            </h3>
            <div className="space-y-4">
              {chartData.length > 0 ? chartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/10" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                      {getCategoryIcon(item.name)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {((item.value / totalSpent) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white italic">${item.value.toFixed(2)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 font-medium italic">No spending recorded this week</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 border-emerald-100 dark:border-emerald-900/30">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                   <TrendingUp size={20} />
                 </div>
                 <h4 className="font-bold text-sm">Savings Potential</h4>
               </div>
               <p className="text-2xl font-bold font-display text-emerald-600 mb-2 italic">+$24.50</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                 Redirecting minor expenses from <b>Food & Drink</b> could boost your <span className="text-emerald-500">Emergency Vault</span> by 8% next month.
               </p>
            </div>

            <div className="glass-panel p-6 border-blue-100 dark:border-blue-900/30">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                   <PieChart size={20} />
                 </div>
                 <h4 className="font-bold text-sm">Wealth Health</h4>
               </div>
               <p className="text-2xl font-bold font-display text-blue-600 mb-2 italic">A+</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                 Your spending habits are better than <b>92%</b> of users in your age group. You are on track for your retirement goals.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
