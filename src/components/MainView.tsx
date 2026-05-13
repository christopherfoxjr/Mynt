import React from 'react';
import { motion } from 'motion/react';
import { Plus, Send, ChevronRight, ArrowDownCircle, Download, Calendar, TrendingUp, TrendingDown, Wallet, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function MainView({ 
  transactions, 
  loading, 
  onSendClick,
  onAddClick,
  onActivityClick,
  onKYCClick
}: { 
  transactions: Transaction[], 
  loading: boolean,
  onSendClick: () => void,
  onAddClick: () => void,
  onActivityClick: () => void,
  onKYCClick: () => void
}) {
  const { user } = useAuth();
  const { notifications, clearAll } = useNotifications();

  const isRestricted = !user?.kycCompleted;

  const moneyIn = transactions
    .filter(tx => tx.type === 'receive')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const moneyOut = Math.abs(transactions
    .filter(tx => tx.type === 'spend' || tx.type === 'send')
    .reduce((sum, tx) => sum + tx.amount, 0));

  const netFlow = moneyIn - moneyOut;

  return (
    <div className="animate-in fade-in duration-500">
      {isRestricted && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Plus size={24} className="rotate-45" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Verification Required</h3>
              <p className="text-amber-700 text-sm font-medium">To unlock full banking features (Transfer, Deposit, Connect), please complete your identification.</p>
            </div>
          </div>
          <button 
            onClick={onKYCClick}
            className="whitespace-nowrap px-8 py-3.5 bg-amber-600 text-white font-bold rounded-2xl text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/10 active:scale-95"
          >
            Complete Setup
          </button>
        </motion.div>
      )}

      <header className="flex justify-between items-start mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-display tracking-tight text-slate-900"
          >
            Welcome, {user?.displayName || 'Alex'}
          </motion.h1>
        </div>
        
        <div className="relative group">
          <button className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50">
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Simple Dropdown for Notifications */}
          <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-900">Notifications</h4>
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Clear all</button>
              )}
            </div>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 font-medium text-center py-4">No new updates</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Balance Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0f172a] rounded-[48px] p-10 md:p-12 mb-10 relative overflow-hidden text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10 font-display">
          <div>
            <p className="text-slate-400 font-bold mb-4 uppercase tracking-[0.3em] text-[10px]">Current Mynt Balance</p>
            <div className="flex items-center gap-4">
              <span className="text-6xl md:text-8xl font-bold tracking-tighter leading-none italic">
                ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={onAddClick} className="px-10 py-5 bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-3 group hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              Deposit
            </button>
            <button onClick={onSendClick} className="px-10 py-5 bg-slate-800 text-white font-bold rounded-2xl flex items-center gap-3 hover:bg-slate-700 transition-all border border-slate-700 active:scale-95">
              <Send size={20} />
              Transfer
            </button>
          </div>
        </div>
      </motion.section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <section className="glass-panel p-6">
            <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-xl font-bold font-display">Recent Activity</h3>
              <button 
                onClick={onActivityClick}
                className="text-mynt-primary text-sm font-bold hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 4).map((tx, idx) => (
                  <TransactionItem key={tx.id} transaction={tx} delay={0.3 + (idx * 0.05)} />
                ))
              ) : (
                <div className="text-center py-10 text-mynt-muted">No recent transactions</div>
              )}
            </div>
          </section>

          {/* Budget Info Removed (No fake data) */}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <section className="glass-panel p-8">
            <h3 className="text-xl font-bold font-display mb-8">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4">
              <ActionButton icon={<Send className="rotate-[-45deg] translate-x-0.5 -translate-y-0.5" />} label="Send" primary onClick={onSendClick} />
              <ActionButton icon={<ArrowDownCircle />} label="Request" />
              <ActionButton icon={<Plus />} label="Add" onClick={onAddClick} />
              <ActionButton icon={<Download />} label="Deposit" />
            </div>
          </section>

          <section className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-display mb-2">Get paid up to 2 days early</h3>
              <p className="text-slate-400 text-sm mb-8 max-w-[220px] leading-relaxed font-medium">
                Set up direct deposit and get your paycheck sooner. Simple and free.
              </p>
              <button className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-sm transition-all active:scale-95">
                Set Up Now
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-white/10 group-hover:scale-110 transition-all duration-500">
              <Calendar size={160} strokeWidth={1} />
            </div>
          </section>

          <section className="glass-panel p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-display">Cash Flow</h3>
              <button className="text-mynt-primary text-[10px] font-bold flex items-center gap-1 px-3 py-2 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors uppercase tracking-widest">
                JUNE 2026
              </button>
            </div>
            
            <div className="space-y-6">
              <CashFlowItem 
                label="Inflow" 
                amount={moneyIn} 
                icon={<TrendingUp className="text-emerald-600" size={16} />} 
                color="primary"
              />
              <CashFlowItem 
                label="Outflow" 
                amount={moneyOut} 
                icon={<TrendingDown className="text-red-500" size={16} />} 
                color="red"
              />
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-mynt-muted text-[10px] font-bold uppercase tracking-wider mb-1">Net Flow</p>
                  <p className={cn("text-3xl font-bold font-display", netFlow >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <Wallet size={24} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction, delay }: { transaction: Transaction, delay: number, key?: any }) {
  const isPositive = transaction.type === 'receive';
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border transition-colors",
          isPositive ? "bg-emerald-50 border-emerald-100" : "bg-black text-white border-black"
        )}>
          {transaction.image ? (
            <img src={transaction.image} alt={transaction.name} className="w-full h-full object-cover" />
          ) : (
            isPositive ? <ArrowDownCircle className="text-emerald-600" size={20} /> : <Send size={18} />
          )}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-800">{transaction.name}</p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{transaction.category || (isPositive ? 'Income' : 'Transfer')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold text-base font-display", isPositive ? "text-emerald-600" : "text-slate-900")}>
          {isPositive ? '+' : '-'} ${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">{transaction.date}</p>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label, primary, onClick }: { icon: React.ReactNode, label: string, primary?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 bg-transparent group">
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
        primary 
          ? "bg-[#0f172a] text-white group-hover:shadow-md group-hover:scale-105" 
          : "bg-white border border-slate-200 text-slate-600 group-hover:bg-slate-50 group-hover:scale-105"
      )}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: primary ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{label}</span>
    </button>
  );
}

function CashFlowItem({ label, amount, icon, color }: { label: string, amount: number, icon: React.ReactNode, color: 'primary' | 'red' }) {
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          color === 'primary' ? "bg-emerald-50 group-hover:bg-emerald-100" : "bg-red-50 group-hover:bg-red-100"
        )}>
          {icon}
        </div>
        <span className="text-slate-500 font-bold text-sm tracking-tight">{label}</span>
      </div>
      <span className={cn("font-bold text-lg font-display", color === 'primary' ? "text-emerald-600" : "text-slate-900")}>
        {label.includes('Out') ? '-' : '+'}${amount.toFixed(2)}
      </span>
    </div>
  );
}
