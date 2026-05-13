import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Gift, Star, Zap, ShoppingBag, Coffee, Car, Plane, Target, ChevronRight, Share2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export function RewardsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold font-display dark:text-white italic">Rewards Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Earn cash while you spend</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<Star className="text-amber-500" />} label="Lifetime Earned" value="$422.50" />
        <StatCard icon={<Gift className="text-emerald-500" />} label="Available Now" value="$12.80" />
        <StatCard icon={<Zap className="text-blue-500" />} label="Current Tier" value="Elite" />
        <StatCard icon={<Target className="text-red-500" />} label="Next Reward" value="$50.00" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-bold font-display dark:text-white">Active Boosts</h3>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">3 Boosters Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <BoostCard 
                    merchant="Starbucks" 
                    reward="15% Cash Back" 
                    icon={<Coffee className="text-orange-500" />} 
                    color="orange"
                 />
                 <BoostCard 
                    merchant="Uber & UberEats" 
                    reward="5% Cash Back" 
                    icon={<Car className="text-slate-800 dark:text-white" />} 
                    color="slate"
                 />
                 <BoostCard 
                    merchant="Apple" 
                    reward="3% Cash Back" 
                    icon={<Zap className="text-blue-500" />} 
                    color="blue"
                 />
                 <BoostCard 
                    merchant="Whole Foods" 
                    reward="10% Cash Back" 
                    icon={<ShoppingBag className="text-emerald-600" />} 
                    color="emerald"
                 />
              </div>
           </div>

           <div className="glass-panel p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                 <Sparkles size={120} />
              </div>
              <div className="relative z-10 max-w-md">
                 <h3 className="text-2xl font-bold font-display italic mb-2">Mynt Elite Perks</h3>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">As an Elite user, you get complimentary Lounge access, metal card upgrades, and increased cashback caps.</p>
                 <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl text-sm transition-all active:scale-95 shadow-xl">
                    View Elite Benefits
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/20">
              <div className="mb-8">
                 <Share2 size={32} className="mb-4" />
                 <h3 className="text-2xl font-bold font-display italic mb-2">Invite Friends</h3>
                 <p className="text-indigo-100 text-sm leading-relaxed font-medium">Give $50, Get $50. Refer a friend and we'll credit both your accounts when they spend $100.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 mb-6 font-mono text-center font-bold tracking-widest uppercase">
                 MYNT-ALEX-2026
              </div>
              <button className="w-full py-4 bg-white text-indigo-700 font-bold rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                 Share Referral Link
              </button>
           </div>

           <div className="glass-panel p-8">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Travel Deals</h3>
              <div className="space-y-4">
                 <TravelRow title="Expedia Hotel Sale" deal="Extra 7% Back" />
                 <TravelRow title="Delta Airlines" deal="$25 Off Flights" />
                 <TravelRow title="National Rental" deal="Elite Discount" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="glass-panel p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
                <p className="text-xl font-bold dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function BoostCard({ merchant, reward, icon, color }: { merchant: string, reward: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl group cursor-pointer hover:border-emerald-100 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-all">
                    {icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Plus size={16} />
                </div>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{merchant}</h4>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{reward}</p>
        </div>
    );
}

function TravelRow({ title, deal }: { title: string, deal: string }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer border-b border-slate-50 dark:border-slate-800 pb-3 hover:border-emerald-100 transition-all">
            <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">{deal}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
        </div>
    );
}
