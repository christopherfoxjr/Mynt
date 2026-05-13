import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Send, ChevronRight, ArrowDownCircle, Download, Calendar, TrendingUp, TrendingDown, Wallet, Bell, CreditCard, PieChart, Info, FileText, Briefcase } from 'lucide-react';
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
  onKYCClick,
  onAnalyticsClick,
  onCardsClick,
  onBillPayClick,
  onDirectDepositClick,
  onWealthClick
}: { 
  transactions: Transaction[], 
  loading: boolean,
  onSendClick: () => void,
  onAddClick: () => void,
  onActivityClick: () => void,
  onKYCClick: () => void,
  onAnalyticsClick: () => void,
  onCardsClick: () => void,
  onBillPayClick: () => void,
  onDirectDepositClick: () => void,
  onWealthClick: () => void
}) {
  const { user } = useAuth();
  const { notifications, clearAll } = useNotifications();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return ['Good morning', 'Top of the morning', 'Rise and grind'][Math.floor(Math.random() * 3)];
    if (hour < 18) return ['Good afternoon', 'Hope your day is going well', 'Afternoon hustle'][Math.floor(Math.random() * 3)];
    return ['Good evening', 'Winding down?', 'Night owl mode on'][Math.floor(Math.random() * 3)];
  }, []);

  const isRestricted = !user?.kycCompleted;
  const hasStripeAccount = !!user?.stripeAccountId;
  
  const moneyIn = transactions
    .filter(tx => (tx.type as string) === 'receive' || (tx.type as string) === 'deposit')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const moneyOut = Math.abs(transactions
    .filter(tx => (tx.type as string) === 'spend' || (tx.type as string) === 'send' || (tx.type as string) === 'withdrawal')
    .reduce((sum, tx) => sum + tx.amount, 0));

  const netFlow = moneyIn - moneyOut;

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {isRestricted && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100">Verification Required</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">Link your bank to unlock deposits, transfers, and high-yield vaults.</p>
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
            className="text-4xl md:text-5xl font-bold font-display tracking-tight text-slate-900 dark:text-white"
          >
            <span className="text-emerald-500">{greeting},</span><br />
            {user?.displayName || 'Alex'}
          </motion.h1>
        </div>
        
        <div className="relative group">
          <button className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50 dark:border-slate-900">
                {notifications.length}
              </span>
            )}
          </button>
          
          <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl transition-all z-50 p-6 hidden group-hover:block animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-900 dark:text-white">Notifications</h4>
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
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 whitespace-pre-wrap">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 font-medium text-center py-4">All caught up!</p>
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
        className="bg-slate-900 dark:bg-slate-900 rounded-[48px] p-10 md:p-12 mb-10 relative overflow-hidden text-white shadow-2xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10 font-display">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Current Net Worth</p>
              {!hasStripeAccount && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-tighter rounded-full border border-amber-500/30">Connect Stripe</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">
                ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onAddClick} 
              className={cn(
                "px-10 py-5 font-bold rounded-2xl flex items-center gap-3 transition-all shadow-xl active:scale-95",
                hasStripeAccount ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20" : "bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed"
              )}
            >
              <Plus size={24} />
              Add Money
            </button>
            <button 
              onClick={onSendClick} 
              className={cn(
                "px-10 py-5 font-bold rounded-2xl flex items-center gap-3 transition-all border active:scale-95",
                hasStripeAccount ? "bg-white text-slate-900 hover:bg-slate-100 border-white shadow-lg" : "bg-slate-800 text-slate-400 border-slate-700 opacity-50 cursor-not-allowed"
              )}
            >
              <Send size={20} />
              Send
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
              <h3 className="text-xl font-bold font-display dark:text-white">Recent Activity</h3>
              <button 
                onClick={onActivityClick}
                className="text-emerald-500 text-sm font-bold hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx, idx) => (
                  <TransactionItem key={tx.id} transaction={tx} delay={0.3 + (idx * 0.05)} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 italic">No activity yet</div>
              )}
            </div>
          </section>

          <section 
            onClick={onAnalyticsClick}
            className="bg-emerald-600 rounded-[40px] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-600/20"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-display mb-2 italic">Weekly Report Available</h3>
              <p className="text-emerald-50/80 text-sm mb-6 max-w-[280px] font-medium leading-relaxed">
                Your spending has decreased by 12% compared to last week. See where your money went.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onAnalyticsClick(); }}
                className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-2xl text-sm transition-all active:scale-95 flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                <PieChart size={18} /> View Analytics
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:text-white/20 group-hover:scale-110 transition-all duration-700">
              <PieChart size={180} strokeWidth={1} />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <section className="glass-panel p-8">
            <h3 className="text-xl font-bold font-display mb-8">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4">
              <ActionButton icon={<Send className="rotate-[-45deg] translate-x-0.5 -translate-y-0.5 text-white" />} label="Send" primary onClick={onSendClick} />
              <ActionButton icon={<Briefcase />} label="Wealth" onClick={onWealthClick} />
              <ActionButton icon={<Plus />} label="Deposit" onClick={onAddClick} />
              <ActionButton icon={<FileText />} label="Payroll" onClick={onDirectDepositClick} />
            </div>
          </section>

          <section className="glass-panel p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-display dark:text-white">Financial Pulse</h3>
              <button className="text-[10px] font-bold flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-widest">
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
              
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Net Flow</p>
                  <p className={cn("text-3xl font-bold font-display", netFlow >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
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

function TransactionItem({ transaction, delay }: { transaction: Transaction, delay: number, key?: string }) {
  const isPositive = (transaction.type as string) === 'receive' || (transaction.type as string) === 'deposit';
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border transition-colors",
          isPositive ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" : "bg-slate-900 border-slate-900 dark:bg-black dark:border-slate-800 text-white"
        )}>
          {isPositive ? <ArrowDownCircle className="text-emerald-600" size={20} /> : <Send size={18} className="rotate-[-45deg] translate-x-0.5 -translate-y-0.5" />}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{transaction.name}</p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{transaction.category || (isPositive ? 'Income' : 'Payment')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold text-base font-display", isPositive ? "text-emerald-600" : "text-slate-900 dark:text-slate-100")}>
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
          ? "bg-slate-900 dark:bg-emerald-600 text-white group-hover:shadow-md group-hover:scale-105" 
          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 group-hover:scale-105"
      )}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: primary ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function CashFlowItem({ label, amount, icon, color }: { label: string, amount: number, icon: React.ReactNode, color: 'primary' | 'red' }) {
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors font-bold",
          color === 'primary' ? "bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100" : "bg-red-50 dark:bg-red-500/10 group-hover:bg-red-100"
        )}>
          {icon}
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">{label}</span>
      </div>
      <span className={cn("font-bold text-lg font-display", color === 'primary' ? "text-emerald-600" : "text-slate-900 dark:text-slate-100")}>
        {label.includes('Out') ? '-' : '+'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
