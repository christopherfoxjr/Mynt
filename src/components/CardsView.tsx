import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Shield, Lock, Eye, EyeOff, Snowflake, Plus, Smartphone, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function CardsView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeCard, setActiveCard] = useState('Primary');

  const cardDetails = {
    number: "4532 9821 0012 4589",
    expiry: "05/29",
    cvv: "342",
    name: user?.displayName || "Alex Mynt"
  };

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
            <h2 className="text-3xl font-bold font-display dark:text-white italic">My Cards</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your physical and virtual spend</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/20">
          <Plus size={20} />
          <span className="hidden md:inline">New Virtual Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Card Visualization */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm h-64 md:h-72 relative perspective-1000">
            <motion.div 
              animate={{ rotateY: 0 }}
              className={cn(
                "w-full h-full rounded-[32px] p-8 relative overflow-hidden text-white shadow-2xl transition-all duration-700",
                isFrozen ? "grayscale" : "bg-gradient-to-br from-slate-900 to-slate-800"
              )}
            >
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-10 bg-white/10 rounded-lg flex items-center justify-center font-display font-black text-white/40 italic">MYNT</div>
              </div>

              <div className="absolute bottom-10 left-8 right-8">
                <div className="mb-8">
                  <div className="flex items-center gap-1 mb-2">
                     <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Card Number</p>
                     {isFrozen && <Lock size={10} className="text-white/40" />}
                  </div>
                  <p className="text-2xl font-mono font-bold tracking-[0.2em]">
                    {showDetails ? cardDetails.number : "•••• •••• •••• 4589"}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Card Holder</p>
                     <p className="font-bold text-sm uppercase tracking-widest">{cardDetails.name}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Expires</p>
                      <p className="font-bold text-xs">{cardDetails.expiry}</p>
                   </div>
                </div>
              </div>

              {isFrozen && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center">
                   <div className="bg-white text-slate-900 px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                     <Snowflake size={14} /> Card Frozen
                   </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex gap-4 mt-10 w-full max-w-sm">
            <CardActionIcon 
                icon={showDetails ? <EyeOff size={24} /> : <Eye size={24} />} 
                label={showDetails ? "Hide" : "Details"} 
                onClick={() => setShowDetails(!showDetails)}
            />
            <CardActionIcon 
                icon={<Snowflake size={24} />} 
                label={isFrozen ? "Unfreeze" : "Freeze"} 
                active={isFrozen}
                onClick={() => setIsFrozen(!isFrozen)}
            />
            <CardActionIcon 
                icon={<Smartphone size={24} />} 
                label="Add to Apple Wallet" 
            />
            <CardActionIcon 
                icon={<Settings size={24} />} 
                label="Settings" 
            />
          </div>
        </div>

        {/* Card Management */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Recent Purchases</h3>
              <div className="space-y-4">
                 <TransactionRow name="Apple Services" date="Today, 2:45 PM" amount={-14.99} category="Cloud Subscription" />
                 <TransactionRow name="Blue Bottle Coffee" date="Yesterday, 9:20 AM" amount={-7.25} category="Food & Drink" />
                 <TransactionRow name="Uber Trip" date="May 12, 11:15 PM" amount={-24.50} category="Transport" />
              </div>
              <button className="w-full mt-8 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all text-xs uppercase tracking-widest">
                 View all card activity
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 border-amber-100 dark:border-amber-900/30">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                        <Lock size={20} />
                    </div>
                    <h4 className="font-bold text-sm">Security Controls</h4>
                 </div>
                 <ul className="space-y-4">
                    <SecurityToggle label="International Payments" enabled={false} />
                    <SecurityToggle label="ATM Withdrawals" enabled={true} />
                    <SecurityToggle label="Online Purchases" enabled={true} />
                 </ul>
              </div>

              <div className="glass-panel p-8">
                 <h4 className="font-bold text-sm mb-6">Limits</h4>
                 <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                           <span>Daily Limit</span>
                           <span className="text-slate-900 dark:text-white">$1,500.00</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-1/3" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                           <span>ATM Limit</span>
                           <span className="text-slate-900 dark:text-white">$500.00</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-1/2" />
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function CardActionIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex-1 flex flex-col items-center gap-2 group"
        >
            <div className={cn(
                "w-full h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                active 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 group-hover:border-emerald-100 group-hover:text-emerald-600"
            )}>
                {icon}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-center">{label}</span>
        </button>
    );
}

function TransactionRow({ name, date, amount, category }: { name: string, date: string, amount: number, category: string }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-2xl transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <Shield size={18} />
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white italic">-${Math.abs(amount).toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{date}</p>
            </div>
        </div>
    );
}

function SecurityToggle({ label, enabled }: { label: string, enabled: boolean }) {
    const [isOn, setIsOn] = useState(enabled);
    return (
        <div className="flex justify-between items-center group cursor-pointer" onClick={() => setIsOn(!isOn)}>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
            <div className={cn(
                "w-10 h-5 rounded-full p-1 transition-all duration-300 relative",
                isOn ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
            )}>
                <div className={cn(
                    "w-3 h-3 bg-white rounded-full transition-all duration-300",
                    isOn && "translate-x-5"
                )} />
            </div>
        </div>
    );
}
