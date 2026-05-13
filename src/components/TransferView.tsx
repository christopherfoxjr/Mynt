import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Users, 
  Landmark, 
  ChevronRight, 
  ArrowLeft,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AtSign,
  User as UserIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { findUserByLeaf, transferP2P } from '../services/stripeService';

type TransferType = 'p2p' | 'internal' | 'ach';

interface Pot {
  id: string;
  name: string;
  balance: number;
}

interface Recipient {
  uid: string;
  displayName: string;
  leaf: string;
  photoURL?: string;
}

export function TransferView({ onBack }: { onBack: () => void }) {
  const { user, refreshBalance } = useAuth();
  const [activeTab, setActiveTab] = useState<TransferType>('p2p');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientLeaf, setRecipientLeaf] = useState('');
  const [foundRecipient, setFoundRecipient] = useState<Recipient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [description, setDescription] = useState('');
  const [fromPotId, setFromPotId] = useState('main');
  const [toPotId, setToPotId] = useState('');
  const [pots, setPots] = useState<Pot[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.id}/pots`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const potsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pot));
      setPots(potsData);
    });
    return () => unsubscribe();
  }, [user]);

  // Handle Leaf Search
  useEffect(() => {
    if (recipientLeaf.length >= 3) {
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await findUserByLeaf(recipientLeaf);
          setFoundRecipient(res);
          setError(null);
        } catch (err: any) {
          setFoundRecipient(null);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setFoundRecipient(null);
    }
  }, [recipientLeaf]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (activeTab === 'p2p') {
        const leafToUse = foundRecipient ? foundRecipient.leaf : recipientLeaf;
        await transferP2P(parseFloat(amount), leafToUse, description);
      } else if (activeTab === 'internal') {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch('/api/transfer/internal', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ amount: parseFloat(amount), fromPotId, toPotId })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Transfer failed');
      } else if (activeTab === 'ach') {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch('/api/transfer/ach', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ amount: parseFloat(amount) })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Transfer failed');
      }

      setSuccess(true);
      setAmount('');
      setRecipientEmail('');
      setRecipientLeaf('');
      setFoundRecipient(null);
      setDescription('');
      refreshBalance();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-100">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-3 font-display">Transfer Successful</h3>
        <p className="text-slate-500 max-w-xs mx-auto mb-10 text-lg">
          Your funds have been moved. The updated balance will reflect shortly.
        </p>
        <button 
          onClick={onBack}
          className="bg-slate-900 text-white font-bold px-10 py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold font-display">Transfer</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100/50 rounded-2xl gap-1">
        {[
          { id: 'p2p', label: 'to contact', icon: Users },
          { id: 'internal', label: 'between pots', icon: ArrowRightLeft },
          { id: 'ach', label: 'to bank', icon: Landmark }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as TransferType); setError(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all capitalize",
              activeTab === tab.id 
                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleTransfer} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Amount</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                <DollarSign size={28} />
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-6 pl-16 rounded-[24px] text-3xl font-bold transition-all outline-none placeholder:text-slate-200"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'p2p' && (
              <motion.div
                key="p2p"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Recipient Leaf (MyntTag)</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                      <AtSign size={22} />
                    </div>
                    <input
                      type="text"
                      required
                      value={recipientLeaf}
                      onChange={(e) => setRecipientLeaf(e.target.value)}
                      placeholder="username"
                      className={cn(
                        "w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-5 pl-14 rounded-2xl font-bold transition-all outline-none",
                        foundRecipient && "border-emerald-500 bg-white"
                      )}
                    />
                    {isSearching && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-emerald-500" size={20} />
                      </div>
                    )}
                    {foundRecipient && (
                      <button 
                        type="button"
                        onClick={() => { setFoundRecipient(null); setRecipientLeaf(''); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {foundRecipient && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center overflow-hidden">
                          {foundRecipient.photoURL ? (
                            <img src={foundRecipient.photoURL} alt={foundRecipient.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-emerald-600" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900 text-sm">{foundRecipient.displayName}</p>
                          <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Verified Recipient</p>
                        </div>
                      </div>
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Lunch payment 🌯"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-5 rounded-2xl font-bold transition-all outline-none"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'internal' && (
              <motion.div
                key="internal"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">From</label>
                    <select
                      value={fromPotId}
                      onChange={(e) => setFromPotId(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-5 rounded-2xl font-bold transition-all outline-none cursor-pointer"
                    >
                      <option value="main">Main Account (${user?.balance.toFixed(2)})</option>
                      {pots.map(pot => (
                        <option key={pot.id} value={pot.id}>{pot.name} (${pot.balance.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">To</label>
                    <select
                      required
                      value={toPotId}
                      onChange={(e) => setToPotId(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-5 rounded-2xl font-bold transition-all outline-none cursor-pointer"
                    >
                      <option value="">Select Destination</option>
                      <option value="main">Main Account</option>
                      {pots.map(pot => (
                        <option key={pot.id} value={pot.id}>{pot.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ach' && (
              <motion.div
                key="ach"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100"
              >
                <div className="flex gap-4">
                  <Landmark className="text-emerald-600 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-emerald-900">External Bank Payout</h4>
                    <p className="text-emerald-700 text-sm mt-1">
                      Funds will be paid out to the bank account connected to your Stripe profile. 
                      Standard delivery takes 1-3 business days.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || (activeTab === 'internal' && (!toPotId || toPotId === fromPotId)) || (parseFloat(amount) > (user?.balance || 0))}
            className="w-full bg-slate-900 text-white font-bold py-6 rounded-[28px] text-xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale disabled:active:scale-100 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                {parseFloat(amount) > (user?.balance || 0) ? 'Insufficient Balance' : 'Confirm Transfer'}
                <ChevronRight size={24} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
