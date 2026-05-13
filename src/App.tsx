import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Clock, 
  DollarSign, 
  Landmark, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Shield,
  ArrowRightLeft,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { LandingView } from './components/LandingView';
import { LoginView } from './components/LoginView';
import { MainView } from './components/MainView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { BankingView } from './components/BankingView';
import { KYCView } from './components/KYCView';
import { AdminView } from './components/AdminView';
import { TransferView } from './components/TransferView';
import { TransferModal } from './components/TransferModal';
import { DepositModal } from './components/DepositModal';
import { Transaction } from './types';
import { fetchTransactions } from './services/stripeService';

import logoImg from './assets/images/regenerated_image_1778553988012.png';

function AppContent() {
  const { user, loading: authLoading, isAdmin, logout, refreshBalance } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showKYC, setShowKYC] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user && !user.kycCompleted) {
      setShowKYC(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.kycCompleted) {
      loadData();
    }
  }, [user]);

  // Check for onboarding success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'success') {
      // Clear URL and refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function loadData() {
    setDataLoading(true);
    try {
      await refreshBalance();
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load real data:', err);
    } finally {
      setDataLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showLogin) return <LoginView />;
    return <LandingView onGetStarted={() => setShowLogin(true)} />;
  }

  if (!user.kycCompleted && showKYC) {
    return <KYCView onBack={() => setShowKYC(false)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Mynt" className="w-8 h-8 rounded-lg shadow-lg" />
          <span className="text-xl font-bold font-display italic">Mynt</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-72 border-r border-slate-200 flex flex-col p-8 hidden md:flex shrink-0 bg-white">
        <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer" onClick={() => setActiveTab('Home')}>
          <img src={logoImg} alt="Mynt" className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold tracking-tight font-display text-slate-900 italic">Mynt</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<Home size={20} />} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
          <SidebarItem icon={<Clock size={20} />} label="Activity" active={activeTab === 'Activity'} onClick={() => setActiveTab('Activity')} />
          <SidebarItem icon={<ArrowRightLeft size={20} />} label="Transfer" active={activeTab === 'Transfer'} onClick={() => setActiveTab('Transfer')} />
          <SidebarItem icon={<Landmark size={20} />} label="Banking" active={activeTab === 'Banking'} onClick={() => setActiveTab('Banking')} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          {isAdmin && (
            <SidebarItem icon={<Shield size={20} />} label="Admin" active={activeTab === 'Admin'} onClick={() => setActiveTab('Admin')} />
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => setActiveTab('Settings')}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=10b981&color=fff`} 
              className="w-10 h-10 rounded-full border border-white shadow-sm" 
              alt="Avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user.displayName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.accountType === 'teen' ? 'Teen Account' : 'Checking Account'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-white z-50 p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <img src={logoImg} alt="Mynt" className="w-10 h-10 rounded-xl shadow-lg" />
                <span className="text-2xl font-bold font-display italic">Mynt</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={32} />
              </button>
            </div>
            <nav className="space-y-6 flex-1">
              <SidebarItem icon={<Home size={28} />} label="Home" active={activeTab === 'Home'} onClick={() => { setActiveTab('Home'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Clock size={28} />} label="Activity" active={activeTab === 'Activity'} onClick={() => { setActiveTab('Activity'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<ArrowRightLeft size={28} />} label="Transfer" active={activeTab === 'Transfer'} onClick={() => { setActiveTab('Transfer'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Landmark size={28} />} label="Banking" active={activeTab === 'Banking'} onClick={() => { setActiveTab('Banking'); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Settings size={28} />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }} />
              {isAdmin && (
                <SidebarItem icon={<Shield size={28} />} label="Admin" active={activeTab === 'Admin'} onClick={() => { setActiveTab('Admin'); setIsMobileMenuOpen(false); }} />
              )}
            </nav>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-8">
              <div className="flex items-center gap-4">
                 <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=10b981&color=fff`} 
                  className="w-12 h-12 rounded-full" 
                  alt="Avatar"
                />
                <div>
                  <p className="font-bold">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-2xl">
                <LogOut size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-12 lg:p-16 mt-16 md:mt-0">
        <div className="max-w-[1200px] mx-auto">
          {activeTab === 'Home' && (
            <MainView 
              transactions={transactions} 
              loading={dataLoading} 
              onSendClick={() => setActiveTab('Transfer')}
              onAddClick={() => setIsDepositModalOpen(true)}
              onActivityClick={() => setActiveTab('Activity')}
              onKYCClick={() => setShowKYC(true)}
            />
          )}
          {activeTab === 'Activity' && <ActivityView transactions={transactions} onBack={() => setActiveTab('Home')} />}
          {activeTab === 'Transfer' && <TransferView onBack={() => setActiveTab('Home')} />}
          {activeTab === 'Banking' && <BankingView onBack={() => setActiveTab('Home')} />}
          {activeTab === 'Settings' && <SettingsView onBack={() => setActiveTab('Home')} />}
          {activeTab === 'Admin' && isAdmin && <AdminView onBack={() => setActiveTab('Home')} />}
        </div>
      </main>

      {/* Modals */}
      <DepositModal isOpen={isDepositModalOpen} onClose={() => { setIsDepositModalOpen(false); loadData(); }} />

      {/* Desktop Footer */}
      <footer className="fixed bottom-0 left-72 right-0 hidden md:flex items-center justify-between px-16 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Vault Secured</span>
        </div>
        <div className="text-[10px] text-slate-400 font-bold font-display uppercase tracking-widest italic">
          v1.5.2-stable
        </div>
      </footer>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-5 py-4 w-full text-left rounded-2xl transition-all font-bold text-sm group",
        active 
          ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100" 
          : "text-slate-400 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      <span className={cn("transition-transform duration-300", active && "scale-110")}>{icon}</span>
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="ml-auto w-1 h-6 bg-emerald-500 rounded-full"
        />
      )}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
