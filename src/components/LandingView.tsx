import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Smartphone, 
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';

import logoImg from '../assets/images/regenerated_image_1778553988012.png';

export function LandingView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Mynt" className="w-9 h-9 rounded-xl shadow-sm border border-slate-100" />
          <span className="text-xl font-bold font-display tracking-tight text-slate-900 italic">Mynt</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="text-[13px] font-bold text-slate-500 hover:text-emerald-600 transition-colors tracking-wide">Features</a>
          <a href="#security" className="text-[13px] font-bold text-slate-500 hover:text-emerald-600 transition-colors tracking-wide">Security</a>
          <a href="#company" className="text-[13px] font-bold text-slate-500 hover:text-emerald-600 transition-colors tracking-wide">Company</a>
        </div>

        <button 
          onClick={onGetStarted}
          className="bg-emerald-600 text-white px-7 py-2.5 rounded-full font-bold text-[13px] hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          Open Account
        </button>
      </nav>

      <section className="pt-48 pb-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col items-start max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[80px] md:text-[120px] font-bold font-display leading-[1.0] mb-12 tracking-tighter text-slate-900">
              Money that <span className="text-emerald-500 italic relative">moves<span className="absolute bottom-4 left-0 w-full h-[6px] bg-emerald-500/20 -z-10"></span><span className="absolute bottom-2 left-0 w-full h-[4px] bg-emerald-500"></span></span><br />
              as fast as you do.
            </h1>
            <p className="text-slate-400 text-2xl font-medium leading-relaxed mb-12 max-w-2xl">
              The next-gen financial ecosystem designed for the digital native, built on Stripe's global infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <button 
                onClick={onGetStarted}
                className="btn-primary px-12 py-5 text-lg rounded-full flex items-center justify-center gap-3 group bg-emerald-600 shadow-2xl shadow-emerald-500/30"
              >
                Join Mynt Now
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={<Zap />} title="Instant Payments" description="Send money anywhere in the world instantly." />
          <FeatureCard icon={<Shield />} title="Safe & Secure" description="Bank-grade encryption for every transaction." />
          <FeatureCard icon={<CheckCircle2 />} title="Built on Stripe" description="The most trusted financial infrastructure." />
        </div>
      </section>

      <footer className="bg-slate-900 py-12 px-6 md:px-12 text-white text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">WolfTech Innovations (DBA)</p>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-slate-900 mb-2">{value}</p>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 group">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 28, className: "text-emerald-600" })}
      </div>
      <h3 className="text-xl font-bold font-display mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
