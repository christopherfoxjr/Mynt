import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle, ChevronRight, Search, FileText, LifeBuoy } from 'lucide-react';
import { cn } from '../lib/utils';

export function SupportView({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { q: "How do I unfreeze my card?", a: "Go to the 'Cards' tab, select your card, and tap the snowflake icon to toggle freeze status." },
    { q: "When will my direct deposit arrive?", a: "Mynt usually processes payroll 2 days early. Arrival varies by employer but typically hits by 9 AM EST." },
    { q: "Are there any hidden fees?", a: "No. Mynt has no monthly, overdraft, or minimum balance fees. We make money when you spend at merchants." }
  ];

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
          <h2 className="text-3xl font-bold font-display dark:text-white italic">Help Center</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Standard support 24/7 for Mynt Elite</p>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input 
          type="text"
          placeholder="How can we help you today?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-6 pl-16 pr-8 text-lg font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-sm shadow-slate-100 dark:shadow-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SupportCard 
            icon={<MessageSquare className="text-emerald-500" />} 
            title="Live Chat" 
            description="Average response: 2 mins" 
        />
        <SupportCard 
            icon={<Phone className="text-blue-500" />} 
            title="Call Us" 
            description="Available 9am - 6pm EST" 
        />
        <SupportCard 
            icon={<Mail className="text-amber-500" />} 
            title="Email" 
            description="Replies within 24 hours" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold mb-8 dark:text-white flex items-center gap-2">
                 <HelpCircle size={24} className="text-emerald-500" /> Frequent Questions
              </h3>
              <div className="space-y-4">
                 {faqs.map((faq, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl cursor-pointer hover:border-emerald-100 transition-all group"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{faq.q}</h4>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="glass-panel p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                 <LifeBuoy size={120} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold font-display italic mb-2">Emergency?</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Instantly lock your cards and accounts from the Mynt app settings to prevent unauthorized access.</p>
              <button className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-red-500/20">
                 Lock App Now
              </button>
           </div>

           <div className="glass-panel p-8">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Legal Docs</h3>
              <div className="space-y-4">
                 <DocLink title="Terms of Service" />
                 <DocLink title="Privacy Policy" />
                 <DocLink title="Account Agreement" />
                 <DocLink title="Fee Schedule" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="glass-panel p-8 flex flex-col items-center text-center group cursor-pointer hover:border-emerald-100 transition-all active:scale-95">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{description}</p>
        </div>
    );
}

function DocLink({ title }: { title: string }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer border-b border-slate-50 dark:border-slate-800 pb-3 hover:border-emerald-100 transition-all">
            <div className="flex items-center gap-3">
                <FileText size={18} className="text-slate-300" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{title}</span>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
        </div>
    );
}
