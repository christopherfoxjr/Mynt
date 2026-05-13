import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Eye, EyeOff, ArrowRight, ChevronLeft, Shield, Fingerprint } from 'lucide-react';
import { BiometricGate } from './BiometricGate';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../lib/firebase';


const googleProvider  = new GoogleAuthProvider();
const githubProvider  = new GithubAuthProvider();

// ─── Types ──────────────────────────────────────────────────────────────────
type AuthMode = 'choose' | 'email-login' | 'email-register';

// ─── Component ──────────────────────────────────────────────────────────────
export function LoginView() {
  const [mode, setMode]         = useState<AuthMode>('choose');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [showBio, setShowBio] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => Promise<void> | null>(null);

  const wrap = async (label: string, fn: () => Promise<void>) => {
    setPendingAction(() => fn);
    setShowBio(true);
  };

  const handleGoogle        = () => wrap('google',   async () => { await signInWithPopup(auth, googleProvider); });
  const handleGitHub        = () => wrap('github',   async () => { await signInWithPopup(auth, githubProvider); });
  const handleEmailLogin    = () => wrap('email',    async () => { await signInWithEmailAndPassword(auth, email, password); });
  const handleEmailRegister = () => wrap('register', async () => { await createUserWithEmailAndPassword(auth, email, password); });

  const back = () => { setError(null); setMode('choose'); };

  const inputCls =
    'w-full bg-slate-50 border-2 border-slate-100 rounded-[18px] px-5 py-4 text-base font-medium outline-none focus:border-emerald-300 focus:bg-white transition-all placeholder:text-slate-300';

  const slide = {
    initial:    { opacity: 0, x: 24 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -24 },
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as any },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center overflow-hidden relative"
      >
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-5xl font-bold font-display tracking-tight italic">Mynt</h1>
          <p className="text-slate-400 mt-3 font-medium text-lg leading-relaxed">
            The next-generation neobank.<br />Securely access your private vault.
          </p>
        </div>

        <BiometricGate 
          isOpen={showBio}
          onSuccess={async () => {
             setShowBio(false);
             if (pendingAction) {
                setError(null);
                setLoading(true);
                try {
                  await pendingAction();
                } catch (err: any) {
                  console.error(`[auth]`, err);
                  setError(err.message || 'Something went wrong.');
                } finally {
                  setLoading(false);
                }
             }
          }}
          onCancel={() => setShowBio(false)}
        />

        <AnimatePresence mode="wait">

          {/* ── CHOOSE ──────────────────────────────────────────────────── */}
          {mode === 'choose' && (
            <motion.div key="choose" {...slide} className="space-y-3">

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-5 rounded-[24px] text-base font-bold hover:bg-slate-50 hover:border-emerald-200 transition-all shadow-sm disabled:opacity-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Connect with Google
              </button>

              {/* GitHub */}
              <button
                onClick={handleGitHub}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-[#24292e] border-2 border-[#24292e] py-5 rounded-[24px] text-base font-bold text-white hover:bg-[#1a1e22] transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 389.5 8 244.8 8z"/>
                </svg>
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Email */}
              <button
                onClick={() => setMode('email-login')}
                className="w-full flex items-center justify-center gap-4 bg-slate-50 border-2 border-slate-100 py-5 rounded-[24px] text-base font-bold hover:bg-slate-100 hover:border-emerald-200 transition-all shadow-sm"
              >
                <Mail className="w-5 h-5 text-slate-500" />
                Continue with Email
              </button>

              {error && <ErrorBox message={error} />}
            </motion.div>
          )}

          {/* ── EMAIL LOGIN ──────────────────────────────────────────────── */}
          {mode === 'email-login' && (
            <motion.div key="email-login" {...slide} className="space-y-3 text-left">
              <BackBtn onClick={back} />
              <h2 className="text-xl font-bold text-center mb-4">Sign in with Email</h2>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls + ' pr-14'}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <ErrorBox message={error} />}

              <PrimaryBtn onClick={handleEmailLogin} loading={loading} label="Sign In" />

              <button
                onClick={() => { setError(null); setMode('email-register'); }}
                className="w-full text-sm text-slate-400 hover:text-emerald-500 font-bold transition-colors pt-1"
              >
                No account? Create one →
              </button>
            </motion.div>
          )}

          {/* ── EMAIL REGISTER ───────────────────────────────────────────── */}
          {mode === 'email-register' && (
            <motion.div key="email-register" {...slide} className="space-y-3 text-left">
              <BackBtn onClick={() => { setError(null); setMode('email-login'); }} />
              <h2 className="text-xl font-bold text-center mb-4">Create Account</h2>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
              />

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Choose a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls + ' pr-14'}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <ErrorBox message={error} />}

              <PrimaryBtn onClick={handleEmailRegister} loading={loading} label="Create Account" />
            </motion.div>
          )}

        </AnimatePresence>

        <p className="border-t border-slate-100 pt-8 text-[11px] text-slate-300 mt-10 font-bold uppercase tracking-[0.3em]">
          Secured by Stripe & Firebase
        </p>
        <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-[0.2em]">
          WolfTech Innovations (DBA)
        </p>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium text-left">
      {message}
    </div>
  );
}

function PrimaryBtn({ onClick, loading, label }: {
  onClick: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-300 text-white py-5 rounded-[24px] text-base font-bold transition-all shadow-sm mt-1"
    >
      {loading
        ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : <>{label}<ArrowRight className="w-4 h-4" /></>
      }
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 font-bold transition-colors mb-2">
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  );
}