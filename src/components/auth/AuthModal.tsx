import React, { useState } from 'react';
import { Check, KeyRound, LogIn, LogOut, Shield, User, X, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_PERSONAS, UserRole } from '../../services/authService';
import { GlassCard } from '../ui/GlassCard';
import { TactileButton } from '../ui/TactileButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, isSupabaseLive, signIn, signUp, signOut } = useApp();
  const [mode, setMode] = useState<'switch' | 'login' | 'signup'>('switch');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = async (role: UserRole) => {
    await switchRole(role);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await signIn(email, password);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Autentikasi gagal.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await signUp(email, password, fullName);
    setIsSubmitting(false);
    if (res.success) {
      setMode('login');
      setErrorMsg('Pendaftaran berhasil! Silakan masuk.');
    } else {
      setErrorMsg(res.error || 'Pendaftaran gagal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg">
        <GlassCard variant="elevated" className="p-6 md:p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                VOLTARA Identity & Access
                {isSupabaseLive ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Supabase
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Demo Mode
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Akses multi-tenant dengan Row Level Security (RLS) PostgreSQL
              </p>
            </div>
          </div>

          {/* Current Identity Card */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {currentUser.fullName}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-emerald-400">
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {currentUser.email}
                  {currentUser.organizationName && ` · ${currentUser.organizationName}`}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3 mb-6">
            <button
              onClick={() => setMode('switch')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                mode === 'switch' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Persona Sandbox
            </button>
            <button
              onClick={() => setMode('login')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                mode === 'login' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Supabase Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Persona Switcher Mode */}
          {mode === 'switch' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                Pilih persona uji coba untuk memverifikasi isolasi tenant dan hak akses RLS:
              </p>
              {(Object.keys(DEMO_PERSONAS) as UserRole[]).map((r) => {
                const persona = DEMO_PERSONAS[r];
                const isActive = currentUser.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {persona.fullName}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                          {r}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {persona.organizationName ? `Org: ${persona.organizationName}` : 'Driver Individu'}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Login Mode */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <TactileButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Masuk ke Supabase'}
              </TactileButton>
            </form>
          )}

          {/* Signup Mode */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="I Wayan Sujana"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@domain.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Kata Sandi (Min. 6 Karakter)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <TactileButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Membuat Akun...' : 'Daftar Pengguna Baru'}
              </TactileButton>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
