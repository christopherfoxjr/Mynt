import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Landmark, 
  Plus, 
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  Target,
  Copy,
  ArrowDownToLine,
  ExternalLink,
  PieChart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';
import { 
  fetchVaults, 
  createVault as apiCreateVault, 
  setupFinancialAccount, 
  fetchAccountNumbers,
  depositFunds 
} from '../services/stripeService';

interface Vault {
  id: string;
  name: string;
  balance: number;
  goal: number;
}

interface AccountDetails {
  routingNumber: string;
  accountNumber: string;
  bankName: string;
}

export function BankingView({ onBack }: { onBack: () => void }) {
  const { addNotification } = useNotifications();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loadingVaults, setLoadingVaults] = useState(false);
  const [isCreateVaultVisible, setIsCreateVaultVisible] = useState(false);
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    loadVaults();
    loadAccountDetails();
  }, []);

  async function loadVaults() {
    setLoadingVaults(true);
    try {
      const data = await fetchVaults();
      setVaults(data);
    } catch (err) {
      console.error('Failed to load vaults:', err);
    } finally {
      setLoadingVaults(false);
    }
  }

  async function loadAccountDetails() {
    try {
      const data = await fetchAccountNumbers();
      setAccountDetails(data);
    } catch (err) {
      console.warn('Account details not ready or not found');
    }
  }

  const handleSetupTreasury = async () => {
    setIsSettingUp(true);
    try {
      await setupFinancialAccount();
      addNotification('Success', 'Your Treasury account is being provisioned.', 'success');
      await loadAccountDetails();
    } catch (err: any) {
      addNotification('Setup Failed', err.message, 'error');
    } finally {
      setIsSettingUp(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('Copied', `${label} copied to clipboard`, 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-slate-900 mb-2 italic">Banking Center</h1>
          <p className="text-slate-500 font-medium">Actual Stripe-powered financial accounts.</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsDepositVisible(true)}
            className="btn-primary bg-slate-900 px-8 py-4 rounded-xl flex items-center gap-2 italic hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ArrowDownToLine size={18} />
            <span>Deposit Funds</span>
          </button>
          <button 
            onClick={() => setIsCreateVaultVisible(true)}
            className="btn-primary bg-emerald-600 px-8 py-4 rounded-xl flex items-center gap-2 italic hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            <span>New Pot</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Real Account Details Card */}
          <div className="glass-panel p-10 relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-100">
             <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-bold font-display italic mb-1">Financial Account</h3>
                  <p className="text-slate-500 text-sm font-medium">Your direct ACH & Wire details.</p>
                </div>
                <div className="bg-emerald-100/50 p-3 rounded-2xl text-emerald-600">
                   <Landmark size={24} />
                </div>
             </div>

             {accountDetails ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Routing Number</p>
                   <div className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-xl group hover:border-emerald-200 transition-colors">
                      <span className="font-mono text-xl font-bold text-slate-700 tracking-tighter">{accountDetails.routingNumber}</span>
                      <button onClick={() => copyToClipboard(accountDetails.routingNumber, 'Routing Number')} className="text-slate-300 hover:text-emerald-500 transition-colors">
                        <Copy size={16} />
                      </button>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Account Number</p>
                   <div className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-xl group hover:border-emerald-200 transition-colors">
                      <span className="font-mono text-xl font-bold text-slate-700 tracking-tighter">{accountDetails.accountNumber}</span>
                      <button onClick={() => copyToClipboard(accountDetails.accountNumber, 'Account Number')} className="text-slate-300 hover:text-emerald-500 transition-colors">
                        <Copy size={16} />
                      </button>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 italic font-bold">FA</div>
                  <h4 className="text-lg font-bold font-display italic text-slate-900 mb-2">No active treasury account</h4>
                  <p className="text-sm text-slate-500 mb-8 max-w-xs">Set up your individual financial account to start receiving ACH and Wire transfers directly into your Mynt balance.</p>
                  <button 
                    onClick={handleSetupTreasury}
                    disabled={isSettingUp}
                    className="btn-primary bg-emerald-600 px-10 py-4 rounded-xl italic font-black shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSettingUp ? <Loader2 className="animate-spin" size={20} /> : 'Setup Financial Account'}
                  </button>
               </div>
             )}

             <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Live Treasury Environment</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Provided by {accountDetails?.bankName || 'Mynt Bank'}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-display">
            {loadingVaults ? (
              [1, 2].map(i => <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-[32px] animate-pulse" />)
            ) : vaults.length > 0 ? (
              vaults.map((vault, i) => (
                <VaultCard 
                  key={vault.id}
                  name={vault.name} 
                  balance={vault.balance} 
                  goal={vault.goal} 
                  color={i % 2 === 0 ? 'emerald' : 'blue'} 
                />
              ))
            ) : (
              <div className="md:col-span-2 p-16 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                <Target size={48} className="mx-auto text-slate-200 mb-4" />
                <h4 className="text-xl font-bold font-display italic text-slate-400">No savings pots yet</h4>
                <p className="text-sm text-slate-400 font-medium mt-2">Create sub-pots to track specific savings goals.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">Swift Transfer</h4>
              <ExternalLink size={14} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Use your routing and account numbers to push funds from legacy banks like Chase, BofA, or Wells Fargo.
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <ul className="space-y-4">
                 <li className="flex items-center gap-3 text-xs font-bold text-slate-600 italic">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   Standard ACH (1-3 days)
                 </li>
                 <li className="flex items-center gap-3 text-xs font-bold text-slate-600 italic">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   Wire Transfer (Same day)
                 </li>
                 <li className="flex items-center gap-3 text-xs font-bold text-slate-600 italic">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   Real-time Inbound (RTP)
                 </li>
               </ul>
            </div>
          </div>

          <div className="p-8 bg-emerald-600 rounded-[32px] text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10">
               <h4 className="text-xl font-bold font-display italic mb-2">Treasury Yield</h4>
               <p className="text-emerald-100 text-sm font-medium mb-6">Earn 4.2% APY on all stabilized treasury balances.</p>
               <div className="flex items-center gap-2">
                 <span className="text-2xl font-black italic">4.2%</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Annual Return</span>
               </div>
            </div>
            <Landmark size={180} className="absolute -right-12 -bottom-12 text-white/5 rotate-12" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCreateVaultVisible && (
          <CreateVaultModal 
            onClose={() => setIsCreateVaultVisible(false)} 
            onSuccess={() => {
              setIsCreateVaultVisible(false);
              loadVaults();
            }}
          />
        )}
        {isDepositVisible && (
          <DepositModal 
            onClose={() => setIsDepositVisible(false)} 
            onSuccess={() => {
              setIsDepositVisible(false);
              addNotification('Deposit Initialized', 'Your inbound transfer has been successfully queued.', 'success');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DepositModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      await depositFunds(parseFloat(amount), 'pm_card_visa'); 
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-sm bg-white rounded-[40px] p-10 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-600 transform active:scale-90 transition-all">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-inner">
             <ArrowDownToLine size={32} />
           </div>
           <h3 className="text-2xl font-bold font-display italic">Deposit Funds</h3>
           <p className="text-slate-500 text-sm font-medium mt-1">Move real money into Mynt.</p>
        </div>

        <form onSubmit={handleDeposit} className="space-y-8">
           <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">$</span>
              <input 
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-6 pl-14 pr-6 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-all text-slate-800"
                required
              />
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full btn-primary py-5 rounded-2xl bg-emerald-600 flex items-center justify-center gap-3 italic font-black shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
             Confirm Deposit
           </button>
        </form>
      </motion.div>
    </div>
  );
}

function CreateVaultModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { addNotification } = useNotifications();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !goal) return;
    setLoading(true);
    try {
      await apiCreateVault(name, parseFloat(goal));
      addNotification('Vault Created', `Successfully created ${name} pot.`, 'success');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
            <Plus size={24} />
          </div>
          <h3 className="text-3xl font-bold font-display italic">New Savings Pot</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-3">Pot Name</label>
            <input 
              type="text" 
              autoFocus
              placeholder="e.g. Travel Fund"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500 font-bold transition-all shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-3">Target Goal ($)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-emerald-500 font-bold transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-5 rounded-2xl bg-emerald-600 flex items-center justify-center gap-3 italic font-black shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Create Pot
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function VaultCard({ name, balance, goal, color }: { name: string, balance: number, goal: number, color: 'emerald' | 'blue', key?: any }) {
  const progress = Math.min((balance / goal) * 100, 100);
  return (
    <div className="glass-panel p-8 space-y-8 group transition-all hover:translate-y-[-4px] hover:shadow-2xl shadow-emerald-500/0">
      <div className="flex justify-between items-start">
        <div className={cn(
          "w-14 h-14 rounded-[24px] flex items-center justify-center transition-transform group-hover:rotate-12",
          color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : "bg-blue-50 text-blue-600 shadow-blue-500/10"
        )}>
          <Wallet size={24} />
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic mb-1">{name}</p>
          <p className="text-3xl font-bold font-display italic leading-none">${balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
          <span className="text-slate-400">Progress</span>
          <span className={cn(color === 'emerald' ? "text-emerald-600" : "text-blue-600")}>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] relative overflow-hidden",
              color === 'emerald' ? "bg-emerald-500" : "bg-blue-500"
            )}
          >
             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </motion.div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center shadow-sm">
                <Target size={14} className="text-slate-300" />
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest italic transition-colors">
            Automate <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
