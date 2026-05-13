import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Wallet, ChevronRight, Mail, Phone, MapPin, ArrowLeft, AtSign, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { fetchUserProfile, claimLeaf } from '../services/stripeService';

export function SettingsView({ onBack }: { onBack?: () => void }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [profile, setProfile] = useState<any>(null);
  const [leafInput, setLeafInput] = useState('');
  const [isSavingLeaf, setIsSavingLeaf] = useState(false);
  const [leafError, setLeafError] = useState('');
  const [leafSuccess, setLeafSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setProfile(data);
      if (data.leaf) setLeafInput(data.leaf);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const handleClaimLeaf = async () => {
    if (!leafInput) return;
    setIsSavingLeaf(true);
    setLeafError('');
    setLeafSuccess(false);
    try {
      await claimLeaf(leafInput);
      setLeafSuccess(true);
      await loadProfile();
    } catch (err: any) {
      setLeafError(err.message || "Failed to claim Leaf");
    } finally {
      setIsSavingLeaf(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-3xl font-bold font-display">Settings</h2>
        </div>
        <button 
          onClick={logout}
          className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <SettingsSection 
            icon={<User size={18} />} 
            title="Profile" 
            active={activeTab === 'Profile'} 
            onClick={() => setActiveTab('Profile')}
          />
          <SettingsSection 
            icon={<Bell size={18} />} 
            title="Notifications" 
            active={activeTab === 'Notifications'} 
            onClick={() => setActiveTab('Notifications')}
          />
          <SettingsSection 
            icon={<Shield size={18} />} 
            title="Security" 
            active={activeTab === 'Security'} 
            onClick={() => setActiveTab('Security')}
          />
          <SettingsSection 
            icon={<Wallet size={18} />} 
            title="Bank Accounts" 
            active={activeTab === 'Banking'} 
            onClick={() => setActiveTab('Banking')}
          />
        </div>

        <div className="lg:col-span-8">
          <div className="glass-panel p-8 space-y-10">
            <div>
              <h3 className="text-lg font-bold mb-8">Personal Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SettingInput label="Full Name" value={user?.displayName || ''} icon={<User size={16} />} />
                  <SettingInput label="Email Address" value={user?.email || ''} icon={<Mail size={16} />} disabled />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Unique Leaf (MyntTag)</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <AtSign size={16} />
                      </div>
                      <input 
                        type="text" 
                        value={leafInput}
                        onChange={(e) => setLeafInput(e.target.value)}
                        placeholder="yourname"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 font-bold text-sm transition-all shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={handleClaimLeaf}
                      disabled={isSavingLeaf || leafInput === profile?.leaf}
                      className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingLeaf ? <Loader2 className="animate-spin" size={18} /> : (profile?.leaf ? 'Update' : 'Claim')}
                    </button>
                  </div>
                  {leafError && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{leafError}</p>}
                  {leafSuccess && (
                    <p className="text-xs text-emerald-600 font-bold mt-1 ml-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Leaf successfully updated!
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium ml-1">
                    Your Leaf is how other Mynt users find you to send money instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <SettingInput label="Phone Number" value="+1 (555) 123-4567" icon={<Phone size={16} />} />
                  <SettingInput label="Location" value="New York, USA" icon={<MapPin size={16} />} />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100">
              <h3 className="text-lg font-bold mb-8">App Preferences</h3>
              <div className="space-y-6">
                <PreferenceToggle title="Dark Mode" description="Use darker colors for the user interface" enabled={false} />
                <PreferenceToggle title="Face ID" description="Require biometric authentication for transfers" enabled={true} />
                <PreferenceToggle title="Push Notifications" description="Get notified about every transaction" enabled={true} />
                <PreferenceToggle title="Weekly Reports" description="Receive email summaries of your spending" enabled={false} />
              </div>
            </div>

            <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4">
              <button className="btn-secondary">Cancel</button>
              <button className="btn-primary px-10">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon, title, active, onClick }: { icon: React.ReactNode, title: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm",
        active 
          ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100" 
          : "text-slate-500 hover:bg-slate-50 border border-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg", active ? "bg-emerald-100" : "bg-slate-100")}>{icon}</div>
        <span>{title}</span>
      </div>
      <ChevronRight size={16} className={cn("transition-transform", active ? "translate-x-1" : "opacity-30")} />
    </button>
  );
}

function SettingInput({ label, value, icon, disabled }: { label: string, value: string, icon: React.ReactNode, disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <input 
          type="text" 
          defaultValue={value}
          disabled={disabled}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 font-bold text-sm transition-all shadow-sm",
            disabled && "opacity-60 cursor-not-allowed bg-slate-100"
          )}
        />
      </div>
    </div>
  );
}

function PreferenceToggle({ title, description, enabled }: { title: string, description: string, enabled: boolean }) {
  const [isOn, setIsOn] = useState(enabled);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      </div>
      <div 
        onClick={() => setIsOn(!isOn)}
        className={cn(
          "w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer shadow-inner",
          isOn ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
          isOn && "translate-x-6"
        )} />
      </div>
    </div>
  );
}
