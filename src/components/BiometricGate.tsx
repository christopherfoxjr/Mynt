import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, Lock, Fingerprint } from 'lucide-react';
import { cn } from '../lib/utils';

interface BiometricGateProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
}

export function BiometricGate({ isOpen, onSuccess, onCancel, title = "Face ID Required" }: BiometricGateProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          setStatus('idle');
        }, 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onSuccess]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[48px] p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="mb-10 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] italic">
                {title}
              </div>

              <div className="relative w-32 h-32 mx-auto mb-10">
                {/* Face Scan Frame */}
                <div className="absolute inset-0 border-2 border-slate-100 dark:border-slate-800 rounded-[40px]" />
                
                <AnimatePresence mode="wait">
                  {status === 'scanning' ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Shield size={64} className="text-emerald-500/20" />
                      <motion.div 
                        animate={{ 
                          top: ['0%', '100%', '0%'],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20" 
                      />
                      <div className="absolute inset-4 rounded-[32px] overflow-hidden">
                         <div className="w-full h-full bg-emerald-500/5 animate-pulse" />
                      </div>
                    </motion.div>
                  ) : status === 'success' ? (
                    <motion.div 
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-emerald-500"
                    >
                      <CheckCircle2 size={80} strokeWidth={1.5} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <h3 className="text-2xl font-bold font-display italic dark:text-white mb-2">
                {status === 'scanning' ? "Verifying Identity..." : "Identity Verified"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-12">
                {status === 'scanning' ? "Scanning for Face ID signature" : "Authentication successful"}
              </p>

              <button 
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Background Accents */}
            <div className="absolute -left-10 -bottom-10 opacity-5 dark:opacity-10 rotate-12">
               <Fingerprint size={200} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
