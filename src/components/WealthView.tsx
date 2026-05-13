import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, PieChart, Info, Plus, ChevronRight, Activity, DollarSign, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

export function WealthView({ onBack }: { onBack: () => void }) {
  const [activeSegment, setActiveSegment] = useState<'stocks' | 'crypto' | 'index'>('stocks');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     // TODO: Replace with real Firestore listener for user assets
     setLoading(false);
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + (a.price * a.quantity), 0);
  const totalChange = assets.reduce((sum, a) => sum + (a.change * a.quantity), 0);

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
            <h2 className="text-3xl font-bold font-display dark:text-white italic">Wealth</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Investments and long-term equity</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/20">
          <Plus size={20} />
          <span className="hidden md:inline">Buy Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Portfolio Summary */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
           <div className="glass-panel p-10 relative overflow-hidden bg-slate-900 text-white">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <PieChart size={160} strokeWidth={1} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 italic">Total Portfolio Value</p>
                    <div className="flex items-baseline gap-4">
                       <h3 className="text-5xl md:text-7xl font-black font-display italic tracking-tight">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                       <p className={cn("text-xl font-bold font-display italic", totalChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {totalChange >= 0 ? '+' : '-'}${Math.abs(totalChange).toFixed(2)}
                       </p>
                    </div>
                    <div className="flex items-center gap-4 mt-8">
                       <Metric label="Day Return" value="+2.4%" positive />
                       <Metric label="Total Return" value="+18.5%" positive />
                       <Metric label="Buying Power" value="$421.50" />
                    </div>
                 </div>
                 <div className="w-full md:w-48 h-24 bg-slate-800 rounded-3xl p-4 flex items-end gap-1">
                    {[40, 60, 35, 75, 55, 90, 85].map((h, i) => (
                       <div key={i} className="flex-1 bg-emerald-500/40 rounded-t-md relative group transition-all hover:bg-emerald-500" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                             $924
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-8 px-2">
                 <h3 className="text-xl font-bold font-display dark:text-white">Your Assets</h3>
                 <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {['stocks', 'crypto', 'index'].map(s => (
                       <button 
                          key={s}
                          onClick={() => setActiveSegment(s as any)}
                          className={cn(
                             "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                             activeSegment === s ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                          )}
                       >
                          {s}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 {assets.map((asset, i) => (
                    <AssetRow asset={asset} />
                 ))}
              </div>
           </div>
        </div>

        {/* Market Insights */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-8">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold mb-6 dark:text-white">Market Pulse</h3>
              <div className="space-y-6">
                 <MarketIndex label="S&P 500" value="5,241.05" change="+0.45%" positive />
                 <MarketIndex label="NASDAQ" value="16,423.10" change="+1.02%" positive />
                 <MarketIndex label="DJIA" value="39,210.45" change="-0.12%" positive={false} />
              </div>
           </div>

           <div className="glass-panel p-8 bg-blue-600 text-white relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                 <Briefcase size={140} />
              </div>
              <h3 className="text-2xl font-bold font-display italic mb-3">Auto-Invest</h3>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">Set up recurring purchases to build your wealth automatically. Dollar-cost averaging is the best way to win.</p>
              <button className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:gap-3 transition-all active:scale-95 shadow-xl">
                 Enable Recurring <ChevronRight size={16} />
              </button>
           </div>

           <div className="glass-panel p-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Trending News</h4>
              <div className="space-y-6">
                 <NewsItem title="Mynt Elite users gain access to Pre-IPO shares" time="2h ago" />
                 <NewsItem title="Tech sector rally continues for 4th day" time="5h ago" />
                 <NewsItem title="Fed signals potential rate cuts in late 2026" time="8h ago" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, positive }: { label: string, value: string, positive?: boolean }) {
   return (
      <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{label}</p>
         <p className={cn("font-bold text-lg italic", positive ? "text-emerald-400" : "text-white")}>{value}</p>
      </div>
   );
}

function AssetRow({ asset }: { asset: any }) {
   return (
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-100 transition-all cursor-pointer group">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm shadow-sm group-hover:scale-110 transition-transform">
               {asset.symbol.substring(0, 2)}
            </div>
            <div>
               <p className="font-bold text-slate-900 dark:text-white">{asset.name}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.quantity} Shares</p>
            </div>
         </div>
         <div className="text-right">
            <p className="font-bold text-slate-900 dark:text-white italic">${(asset.price * asset.quantity).toLocaleString()}</p>
            <p className={cn("text-[10px] font-black uppercase tracking-widest", asset.change >= 0 ? "text-emerald-500" : "text-red-500")}>
               {asset.change >= 0 ? '+' : ''}{asset.change}%
            </p>
         </div>
      </div>
   );
}

function MarketIndex({ label, value, change, positive }: { label: string, value: string, change: string, positive: boolean }) {
   return (
      <div className="flex justify-between items-center">
         <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</p>
            <p className="text-lg font-black font-display italic dark:text-white">{value}</p>
         </div>
         <div className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
            positive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"
         )}>
            {change}
         </div>
      </div>
   );
}

function NewsItem({ title, time }: { title: string, time: string }) {
   return (
      <div className="group cursor-pointer">
         <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed group-hover:text-emerald-500 transition-colors">{title}</p>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{time}</p>
      </div>
   );
}
