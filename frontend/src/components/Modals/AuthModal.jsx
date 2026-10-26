import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, CheckCircle2, ShieldCheck, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, currentUser, setCurrentUser, switchRole, addToast } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(email, selectedRole);
        if (res.user) {
          setCurrentUser(res.user);
          switchRole(res.user.role);
          addToast(`Logged in as ${res.user.full_name}`, 'success');
          setIsAuthOpen(false);
        }
      } else {
        const res = await api.register({
          email,
          full_name: name,
          phone,
          role: selectedRole
        });
        if (res.user) {
          setCurrentUser(res.user);
          switchRole(res.user.role);
          addToast(`Account created for ${res.user.full_name}!`, 'success');
          setIsAuthOpen(false);
        }
      }
    } catch {
      addToast('Authentication action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {mode === 'login' ? 'Welcome to LocalConnect' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Sign in to review, save favorites, or manage business' : 'Join thousands of verified local shoppers'}
            </p>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Login Switcher Buttons */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            ⚡ Quick Demo Accounts (1-Click Switch)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                switchRole('customer');
                setIsAuthOpen(false);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-center border border-slate-200 dark:border-slate-600 hover:border-brand-500"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => {
                switchRole('owner');
                setIsAuthOpen(false);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-semibold text-center border border-slate-200 dark:border-slate-600 hover:border-amber-500"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => {
                switchRole('admin');
                setIsAuthOpen(false);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 font-semibold text-center border border-slate-200 dark:border-slate-600 hover:border-purple-500"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Priya Narayanan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Account Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="customer">Customer / Local Shopper</option>
              <option value="owner">Business Owner / Merchant</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
