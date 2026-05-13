import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Scan, Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export function BiometricAuth({ onVerify, type = 'face' }: { onVerify: () => void, type?: 'face' | 'fingerprint' }) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  useEffect(() => {
    // Simulate biometric scanning
    const scan = async () => {
      setStatus('scanning');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      await new Promise(resolve => setTimeout(resolve, 500));
      onVerify();
    };
    scan();
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-8">
        <motion.div 
          animate={{ 
            scale: status === 'scanning' ? [1, 1.1, 1] : 1,
            opacity: status === 'scanning' ? [0.5, 1, 0.5] : 1
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-500",
            status === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          )}
        >
          {status === 'success' ? (
            <ShieldCheck size={64} className="animate-in zoom-in duration-300" />
          ) : type === 'face' ? (
            <Scan size={64} />
          ) : (
            <Fingerprint size={64} />
          )}
        </motion.div>
        
        {status === 'scanning' && (
          <motion.div 
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
          />
        )}
      </div>

      <h3 className="text-xl font-bold font-display dark:text-white">
        {status === 'scanning' ? `Authenticating ${type === 'face' ? 'FaceID' : 'Fingerprint'}...` : 'Identity Verified'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Securely authorizing your transaction</p>
    </div>
  );
}
