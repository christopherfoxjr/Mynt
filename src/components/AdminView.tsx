import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';

interface PendingUser {
  id: string;
  email: string;
  displayName: string;
  accountType: string;
  birthDate: string;
}

export function AdminView({ onBack }: { onBack: () => void }) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/kyc/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch pending KYC:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingId(userId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/kyc/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId, status: action })
      });
      if (response.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold font-display">Admin Panel</h2>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
        <Shield className="text-emerald-600 shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-bold text-emerald-900">KYC Verification Queue</h3>
          <p className="text-emerald-700 text-sm mt-1">
            Manual review of users awaiting account activation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="font-medium">Loading queue...</p>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-16 text-center">
          <CheckCircle size={64} className="text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900">All clear!</h3>
          <p className="text-slate-500 mt-2">No pending KYC requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {pendingUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <User size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{user.displayName || 'Anonymous'}</h4>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                      <Mail size={14} />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Type</span>
                    <span className="text-slate-900 font-bold capitalize">{user.accountType}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Birth Date</span>
                    <span className="text-slate-900 font-bold flex items-center gap-1.5">
                      <Calendar size={14} />
                      {user.birthDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">User ID</span>
                    <span className="text-slate-500 font-mono text-xs">{user.id.substring(0, 12)}...</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled={processingId === user.id}
                    onClick={() => handleVerify(user.id, 'approve')}
                    className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-600 transition-all shadow-emerald-200 shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {processingId === user.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    Approve
                  </button>
                  <button
                    disabled={processingId === user.id}
                    onClick={() => handleVerify(user.id, 'reject')}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
