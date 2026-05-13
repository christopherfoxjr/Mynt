import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Building2, Landmark, FileText, CheckCircle2, Copy, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function DirectDepositView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const accountInfo = {
    bankName: "Mynt Treasury (via Stripe)",
    routingNumber: "123456789", // Simulated
    accountNumber: "9876543210", // Simulated
    accountType: "Checking"
  };

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
          <h2 className="text-3xl font-bold font-display dark:text-white italic">Direct Deposit</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Get paid up to 2 days early with Mynt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="glass-panel p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Building2 size={32} />
                </div>
            </div>
            
            <h3 className="text-xl font-bold mb-8 dark:text-white">Payroll Information</h3>
            
            <div className="space-y-8">
              <InfoItem label="Bank Name" value={accountInfo.bankName} onCopy={() => copyToClipboard(accountInfo.bankName, 'Bank Name')} />
              <InfoItem label="Routing Number" value={accountInfo.routingNumber} onCopy={() => copyToClipboard(accountInfo.routingNumber, 'Routing Number')} />
              <InfoItem label="Account Number" value={accountInfo.accountNumber} onCopy={() => copyToClipboard(accountInfo.accountNumber, 'Account Number')} />
              <InfoItem label="Account Type" value={accountInfo.accountType} />
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
              <button className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95">
                <Download size={20} />
                Download Pre-filled PDF
              </button>
              <button className="flex-1 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                <Send size={20} />
                Email to Employer
              </button>
            </div>
          </div>

          <div className="glass-panel p-8 bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-blue-600" />
                Why use Mynt for Direct Deposit?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BenefitCard title="Paid Early" description="Get your paycheck up to 48 hours before your coworkers." />
                <BenefitCard title="Zero Fees" description="No monthly maintenance or overdraft fees, ever." />
                <BenefitCard title="Smart Sorting" description="Automatically put 10% into your Emergency Vault." />
                <BenefitCard title="High Yield" description="Earn 4.50% APY on deposits held in specialized vaults." />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-5">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-6 dark:text-white">How it works</h3>
            <div className="space-y-6">
              <Step number={1} title="Copy Details" description="Use the routing and account numbers provided on this page." />
              <Step number={2} title="Employer Setup" description="Provide these details to your employer's HR or payroll portal (like Workday)." />
              <Step number={3} title="Automatic Vaulting" description="Toggle round-ups or percentage-based savings in your settings." />
              <Step number={4} title="Enjoy Rewards" description="Unlock premium cashback tiers as soon as your first deposit hits." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, onCopy }: { label: string, value: string, onCopy?: () => void }) {
  return (
    <div className="group">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group-hover:border-emerald-200 transition-all">
        <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
        {onCopy && (
          <button onClick={onCopy} className="text-slate-300 hover:text-emerald-500 transition-colors">
            <Copy size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function BenefitCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function Step({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
