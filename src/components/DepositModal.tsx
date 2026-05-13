import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Plus, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPaymentIntent } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

import logoImg from '../assets/images/regenerated_image_1778553988012.png';

export function DepositModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState<'amount' | 'paying' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateBalance } = useAuth();
  const { addNotification } = useNotifications();

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    setStep('paying');
    
    try {
      // Create Payment Intent on the backend
      const res = await createPaymentIntent(parseFloat(amount) * 100);
      
      // In a production app, use Stripe Elements to confirm the payment
      // For this turn, we follow the backend processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      if (user) {
        updateBalance(user.balance + parseFloat(amount));
        addNotification(
          'Deposit Success',
          `$${parseFloat(amount).toFixed(2)} has been added to your vault.`,
          'success'
        );
      }
      setStep('success');
    } catch (err) {
      alert('Transaction failed. Encryption error or invalid card.');
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
          {step === 'amount' && (
            <motion.div 
              key="amount" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="py-4 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                <Plus size={32} />
              </div>
              <h3 className="text-3xl font-bold font-display mb-2 tracking-tight italic dark:text-white">Deposit Funds</h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Secured by Stripe</p>
              
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

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[50, 100, 500].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    +${val}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onClose} 
                  className="flex-1 btn-secondary py-5 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeposit} 
                  className="flex-[2] btn-primary py-5 rounded-2xl flex justify-center items-center gap-3 bg-emerald-600 text-white font-bold"
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Confirm Deposit
                  <CreditCard size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'paying' && (
            <motion.div 
              key="paying" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="flex justify-center mb-10">
                <Loader2 size={64} className="text-emerald-500 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold font-display mb-4 dark:text-white">Anchoring Deposit...</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium px-8 text-center italic">
                Verifying transaction through Stripe infrastructure.
              </p>
              <div className="mt-12 flex justify-center items-center gap-4 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <Landmark size={16} />
                <span>Encrypted Connection</span>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-bold font-display mb-2 dark:text-white">Deposit Successful!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed px-4">
                <span className="text-slate-900 dark:text-white font-bold">${parseFloat(amount).toFixed(2)}</span> has been added to your Mynt wallet.
              </p>
              <button onClick={onClose} className="w-full btn-primary py-4 rounded-2xl bg-black dark:bg-white dark:text-black">Back to Dashboard</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
