import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { auth, signInWithEmailAndPassword, signOut } from '../lib/firebase';

interface AdminLoginProps {
  onLogin: (email: string) => void;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function isAccidentalTestUser(user: any): Promise<boolean> {
  if (!user || !user.email) return false;
  const hash = await sha256Hex(user.email);
  // Primary admin account is never a test user
  if (hash === '6ab91b04378e7376c9c5d78fbe4af8a382e309130c28b37060a9f1abab92c979') {
    return false;
  }
  // Check if created during the temporary auto-registration window on 2026-10-11 (10:40 UTC - 11:15 UTC)
  const createdMs = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
  const windowStart = new Date('2026-10-11T10:40:00Z').getTime();
  const windowEnd = new Date('2026-10-11T11:15:00Z').getTime();
  return createdMs >= windowStart && createdMs <= windowEnd;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setHasError(true);
      return;
    }
    setHasError(false);
    setIsLoading(true);

    try {
      // Strictly sign in with Firebase Authentication ONLY (never create new users)
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // If this account was accidentally auto-created during the previous test, remove it and reject login
      if (await isAccidentalTestUser(user)) {
        try {
          await user.delete();
        } catch {
          await signOut(auth);
        }
        setHasError(true);
        return;
      }

      if (user.email) {
        onLogin(user.email);
        return;
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-8 sm:p-10">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20 border border-slate-800">
              <ShieldCheck size={32} className="text-emerald-400" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] mb-2 border border-emerald-100">
              <Sparkles size={12} /> Firebase Auth & Firestore Connected
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">YouSnap Admin Panel</h1>
            <p className="text-xs text-slate-500 mt-1">Login using your Firebase account credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 transition-colors ${hasError ? 'text-rose-600' : 'text-slate-700'}`}>
                Admin Gmail Account
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${hasError ? 'text-rose-500' : 'text-slate-400'}`}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Enter admin email"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    hasError
                      ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 placeholder-rose-400 focus:ring-rose-500 focus:bg-rose-50'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-slate-900 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold transition-colors ${hasError ? 'text-rose-600' : 'text-slate-700'}`}>
                  Password
                </label>
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${hasError ? 'text-rose-500' : 'text-slate-400'}`}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Enter password"
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    hasError
                      ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 placeholder-rose-400 focus:ring-rose-500 focus:bg-rose-50'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-slate-900 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${hasError ? 'text-rose-500 hover:text-rose-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {hasError && (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  Gmail account and password error
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Secured with Firebase Authentication & Firestore
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
