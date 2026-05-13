import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Search, CheckCircle2, ChevronRight, AtSign, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { transferP2P, findUserByLeaf } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { BiometricAuth } from './BiometricAuth';

export function TransferModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState<'select' | 'amount' | 'verify' | 'success'>('select');
  const [recipient, setRecipient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshBalance } = useAuth();
  const { addNotification } = useNotifications();
  const { isFaceIDEnabled } = useTheme();

  // Search logic
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await findUserByLeaf(searchQuery);
          setRecipient(res);
        } catch (err) {
          setRecipient(null);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setRecipient(null);
    }
  }, [searchQuery]);

  const onConfirmAmount = () => {
    if (isFaceIDEnabled) {
      setStep('verify');
    } else {
      handleTransfer();
    }
  };

  const handleTransfer = async () => {
    if (!recipient) return;
    setLoading(true);
    try {
      const res = await transferP2P(parseFloat(amount), recipient.leaf, 'Direct transfer');
      if (res.success) {
        addNotification(
          'Transfer Complete',
          `You sent $${parseFloat(amount).toFixed(2)} to ${recipient.displayName}.`,
          'success'
        );
        refreshBalance();
        setStep('success');
      }
    } catch (err: any) {
      alert(err.message || 'Transfer failed. Please try again.');
      setStep('amount');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10">
          <X size={24} />
        </button>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-bold font-display mb-2 dark:text-white">Send Money</h3>
              <p className="text-slate-500 font-medium mb-8">Search for a Mynt user by Leaf (@tag)</p>
              
              <div className="relative mb-8">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 font-medium transition-all text-slate-900 dark:text-white"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-emerald-500" size={18} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search Result</p>
                {recipient ? (
                  <RecipientItem 
                    name={recipient.displayName} 
                    leaf={recipient.leaf} 
                    onClick={() => setStep('amount')} 
                  />
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                    <Search className="mx-auto text-slate-200 dark:text-slate-700 mb-2" size={32} />
                    <p className="text-slate-400 text-sm font-medium">Type a MyntTag to find someone</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-bold font-display mb-2 text-center dark:text-white">Amount to {recipient.displayName}</h3>
              <p className="text-slate-500 font-medium mb-12 text-center">Available: ${user?.balance.toFixed(2)}</p>
              
              <div className="relative flex items-center justify-center mb-12">
                <span className="text-4xl font-bold text-slate-400 mr-2">$</span>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-6xl md:text-7xl font-bold font-display text-slate-900 dark:text-white border-none bg-transparent focus:ring-0 w-[240px] text-center"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('select')} className="flex-1 btn-secondary py-4 rounded-2xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">Back</button>
                <button 
                  onClick={onConfirmAmount} 
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (user?.balance || 0) || loading}
                  className="flex-1 btn-primary py-4 rounded-2xl flex justify-center items-center gap-2"
                >
                  Confirm Send
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
              <BiometricAuth onVerify={handleTransfer} />
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-bold font-display mb-2 dark:text-white italic">Transfer Successful!</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                You've successfully sent <span className="text-slate-900 dark:text-white font-bold">${parseFloat(amount).toFixed(2)}</span> to <span className="text-slate-900 dark:text-white font-bold">{recipient.displayName}</span>.
              </p>
              <button onClick={onClose} className="w-full btn-primary py-4 rounded-2xl">Back to Dashboard</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RecipientItem({ name, leaf, onClick }: { name: string, leaf: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-emerald-50/50 rounded-[28px] border border-emerald-100/50 hover:bg-emerald-50 transition-all group animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <AtSign className="text-emerald-600" size={20} />
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-800">{name}</p>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">@{leaf}</p>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
        <ChevronRight size={18} className="text-emerald-500 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
