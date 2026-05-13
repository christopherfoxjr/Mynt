import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Plus, Calendar, Clock, DollarSign, Home, UtilityPole as Utility, ShieldCheck, ArrowRight, Zap, Coffee, ShoppingBag, MoreHorizontal, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function BillPayView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent' | 'payees'>('upcoming');
  const [bills, setBills] = useState<any[]>([]);
  const [payees, setPayees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch real bills and payees

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold font-display dark:text-white italic">Bill Pay</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Automated utility and merchant payments</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/20">
          <Plus size={20} />
          <span className="hidden md:inline">Add Payee</span>
        </button>
      </div>
      {/* ...rest of the UI will show loading or empty states... */}
      <div className="glass-panel p-20 text-center text-slate-500">
         No bills scheduled. Connect your accounts to start paying bills automatically.
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
        {['upcoming', 'recent', 'payees'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
               "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
               activeTab === tab 
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 xl:col-span-8 space-y-6">
           <AnimatePresence mode="wait">
               {activeTab === 'upcoming' && (
                <motion.div 
                    key="upcoming"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    {bills.length === 0 ? (
                        <div className="glass-panel p-10 text-center text-slate-500">
                           No upcoming bills.
                        </div>
                    ) : (
                        bills.map(bill => (
                            <BillCard 
                                 merchant={bill.merchant} 
                                 amount={bill.amount} 
                                 dueDate={bill.dueDate} 
                                 status={bill.status} 
                                 category={bill.category} 
                                 icon={bill.icon} 
                            />
                        ))
                    )}
                </motion.div>
              )}
           </AnimatePresence>

           <div className="glass-panel p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
                 <Calendar size={120} />
              </div>
              <div className="relative z-10 max-w-md">
                 <h3 className="text-2xl font-bold font-display italic mb-2">Automate Everything</h3>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Connect your online accounts to automatically fetch and pay your bills accurately, ensuring you never miss a late fee.</p>
                 <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl text-sm flex items-center gap-2 hover:gap-3 transition-all active:scale-95 shadow-xl">
                    Connect Merchants <ArrowRight size={18} />
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold mb-6 dark:text-white">Smart Insights</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                       <Clock size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm dark:text-white">Upcoming Total</h4>
                       <p className="text-2xl font-bold font-display italic dark:text-white mt-1">$424.49</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Due in next 14 days</p>
                    </div>
                 </div>

                 <div className="p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-2xl">
                    <p className="text-xs text-orange-800 dark:text-orange-200 font-medium leading-relaxed">
                       <b>Alert:</b> Rent is usually due on the 1st, but no payment is yet scheduled for June.
                    </p>
                 </div>

                 <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                    Review Recurring Items
                 </button>
              </div>
           </div>

           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold mb-6 dark:text-white">Quick Pay Payees</h3>
              <div className="space-y-4">
                 <PayeeRow name="Landlord" bank="Chase • 4421" />
                 <PayeeRow name="Credit Card" bank="AMEX • 1009" />
                 <PayeeRow name="Car Payment" bank="Ford Credit • 8821" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function BillCard({ merchant, amount, dueDate, status, category, icon }: { merchant: string, amount: number, dueDate: string, status: 'scheduled' | 'pending', category: string, icon: React.ReactNode }) {
    return (
        <div className="glass-panel p-6 group hover:border-emerald-100 dark:hover:border-emerald-500/20 transition-all">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-[22px] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div>
                        <p className="font-bold text-lg dark:text-white">{merchant}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto: {status === 'scheduled' ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div>
                        <p className="font-bold text-xl dark:text-white italic">${amount.toFixed(2)}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Due {dueDate}</p>
                    </div>
                    <button className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        status === 'scheduled' 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" 
                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg active:scale-95"
                    )}>
                        {status === 'scheduled' ? 'Scheduled' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PayeeRow({ name, bank }: { name: string, bank: string }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold italic text-xs uppercase tracking-tighter">
                   {name.substring(0, 2)}
                </div>
                <div>
                   <p className="font-bold text-sm dark:text-white">{name}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bank}</p>
                </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </div>
    );
}
