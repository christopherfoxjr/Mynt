import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Calendar, Mail, UserCheck, Briefcase, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createConnectAccount, createAccountLink } from '../services/stripeService';
import { useNotifications } from '../context/NotificationContext';

export function KYCView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'welcome' | 'age' | 'guardian' | 'signature' | 'redirecting' | 'pending'>('welcome');
  const [birthDate, setBirthDate] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateKYCStatus } = useAuth();
  const { addNotification } = useNotifications();

  // If user already has an account but not fully verified
  React.useEffect(() => {
    if (user?.stripeAccountId && !user.kycCompleted) {
      setStep('pending');
    }
  }, [user]);

  const handleAgeCheck = () => {
    if (!birthDate) return;
    
    const birthTime = new Date(birthDate).getTime();
    const now = new Date().getTime();
    const age = (now - birthTime) / (1000 * 60 * 60 * 24 * 365.25);

    if (age < 13) {
      addNotification('Restricted', 'Users must be at least 13 years old to open a Mynt account.', 'error');
      return;
    }

    if (age < 18) {
      setStep('guardian');
    } else {
      setStep('signature');
    }
  };

  const handleSignature = () => {
    if (!signature || signature.length < 3) {
      addNotification('Invalid Signature', 'Please enter your full legal name as a signature.', 'error');
      return;
    }
    const age = (new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    createStripeAccount(age < 18 ? 'teen' : 'adult');
  };

  const createStripeAccount = async (type: 'adult' | 'teen') => {
    setLoading(true);
    try {
      const { accountId } = await createConnectAccount(user?.email || '', type, birthDate);
      const { url } = await createAccountLink(accountId);
      
      setStep('redirecting');
      // Redirect to Stripe Onboarding
      window.location.href = url;
    } catch (err: any) {
      addNotification('Error', err.message || 'Failed to start onboarding', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-slate-900 dark:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[48px] p-12 shadow-2xl border border-slate-100 dark:border-slate-800"
      >
        {step === 'welcome' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 dark:border-emerald-500/20">
              <Shield className="text-emerald-600" size={40} />
            </div>
            <h1 className="text-4xl font-bold font-display mb-4 italic">Secure Identity Check</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed font-medium">
              Mynt uses Stripe's banking infrastructure. To comply with federal regulations, we must verify your identity.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => setStep('age')}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-emerald-500/10"
              >
                Start Identification
                <ArrowRight size={24} />
              </button>
              <button 
                onClick={onBack}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 py-5 rounded-[24px] text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {step === 'age' && (
          <div>
            <button 
              onClick={() => setStep('welcome')}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h2 className="text-3xl font-bold font-display mb-8">When were you born?</h2>
            <div className="space-y-6">
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] py-5 pl-16 pr-6 focus:border-emerald-500 focus:outline-none font-bold text-xl dark:text-white"
                />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium px-2 italic">
                Your data is encrypted and handled securely via Stripe Connect.
              </p>
              <button 
                onClick={handleAgeCheck}
                disabled={!birthDate}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] text-lg font-bold disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'guardian' && (
          <div>
            <button 
              onClick={() => setStep('age')}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl flex gap-4">
              <UserCheck className="text-blue-600" size={28} />
              <p className="text-blue-900 dark:text-blue-200 text-sm font-medium leading-relaxed">
                <span className="font-bold">Teen Account detected.</span> Since you're under 18, we require a legal guardian to authorize your account and verify their identity alongside yours.
              </p>
            </div>
            <h3 className="text-2xl font-bold font-display mb-6">Parent or Guardian Email</h3>
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  type="email" 
                  placeholder="guardian@email.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] py-5 pl-16 pr-6 focus:border-emerald-500 focus:outline-none font-bold text-xl dark:text-white"
                />
              </div>
              <button 
                onClick={() => setStep('signature')}
                disabled={!guardianEmail}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] text-lg font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Continue to Authorization
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 'signature' && (
          <div>
            <button 
              onClick={() => {
                const age = (new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                setStep(age < 18 ? 'guardian' : 'age');
              }}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h2 className="text-3xl font-bold font-display mb-8">Digital Signature</h2>
            <div className="space-y-6">
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
                I hereby certify that the information provided is accurate and I agree to the <span className="text-emerald-600 font-bold">Banking Service Agreement</span>.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type full legal name</label>
                <div className="relative">
                  <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Legal Full Name"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] py-5 pl-16 pr-6 focus:border-emerald-500 focus:outline-none font-bold text-xl italic font-display dark:text-white"
                  />
                </div>
              </div>
              <button 
                onClick={handleSignature}
                disabled={!signature || loading}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] text-lg font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {loading ? 'Processing...' : 'Authorize & Open Vault'}
                {!loading && <ArrowRight size={24} />}
              </button>
            </div>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold font-display mb-4 italic dark:text-white">Securing your vault...</h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium italic">Redirecting you to Stripe Identity for secure document scanning.</p>
          </div>
        )}

        {step === 'pending' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100 dark:border-blue-500/20">
              <Clock className="text-blue-600" size={40} />
            </div>
            <h1 className="text-4xl font-bold font-display mb-4 italic italic dark:text-white">Under Review</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed font-medium">
              We've received your documents. Stripe is currently verifying your identity. This typically takes a few minutes but can take up to 24 hours.
            </p>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Status</span>
                <span className="text-blue-600 font-bold bg-blue-50 dark:bg-blue-500/20 px-3 py-1 rounded-full text-xs italic">Awaiting Approval</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  className="bg-blue-600 h-full relative"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </motion.div>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <button 
                onClick={() => {
                  setLoading(true);
                  updateKYCStatus().finally(() => setLoading(false));
                }}
                disabled={loading}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              >
                {loading ? 'Checking...' : 'Refresh Status'}
              </button>
              <button 
                onClick={onBack}
                className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
