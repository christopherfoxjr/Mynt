import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Download,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';
import { cn } from '../lib/utils';

export function ActivityView({ transactions, onBack }: { transactions: Transaction[], onBack?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'income' && tx.type === 'receive') || 
      (filter === 'outcome' && (tx.type === 'spend' || tx.type === 'send'));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-3xl font-bold font-display">Activity</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <Download size={20} />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <Calendar size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
          <FilterButton active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
          <FilterButton active={filter === 'income'} label="Income" onClick={() => setFilter('income')} />
          <FilterButton active={filter === 'outcome'} label="Outcome" onClick={() => setFilter('outcome')} />
        </div>
      </div>

      <div className="glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        tx.type === 'receive' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {tx.type === 'receive' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{tx.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {tx.category || (tx.type === 'receive' ? 'Income' : 'Transfer')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{tx.date}</td>
                  <td className={cn(
                    "px-6 py-5 text-right font-display font-bold text-lg",
                    tx.type === 'receive' ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {tx.type === 'receive' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium italic">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl text-xs font-bold transition-all",
        active 
          ? "bg-white text-emerald-600 shadow-sm" 
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {label}
    </button>
  );
}
