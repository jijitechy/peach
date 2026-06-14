import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Phone, Lock, CheckCircle, ShieldCheck, ShoppingBag, Sparkles, Info, Users } from 'lucide-react';
import { UserState } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserState) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'buyer' | 'bidder' | 'seller'>('bidder');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    // Only allow numbers, +, or spaces
    const clean = val.replace(/[^0-9+\s]/g, '');
    setPhone(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please supply a username and password.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setErrorMsg('Please supply your full legal name.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please provide a Safaricom M-Pesa registered phone number.');
        return;
      }
      // Simple phone check
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9) {
        setErrorMsg('Please specify a valid Kenyan phone number (e.g. 07XXXXXXXX).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { username, password }
        : { username, password, name, phone, role };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authenication pipeline error occurred');
      }

      setSuccessMsg(isLogin ? `Karibu Tena, ${data.user.name}!` : `Account created! Welcome, ${data.user.name}!`);
      
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
        // Reset states
        setUsername('');
        setPassword('');
        setName('');
        setPhone('');
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err.message || 'Connection breakdown occurred. Ensure server is active.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden w-full max-w-md"
      >
        {/* Banner with subtle accent */}
        <div className="bg-linear-to-r from-[#f97316] to-[#ea580c] p-6 text-white text-center relative select-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all outline-hidden"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="inline-flex bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase mb-2">
            Peach Authentication
          </div>
          <h2 className="text-xl font-display font-extrabold tracking-tight">
            {isLogin ? 'Log into Recommerce Portal' : 'Register Peach Account'}
          </h2>
          <p className="text-xs text-white/85 mt-2 max-w-xs mx-auto">
            {isLogin 
              ? 'Access Nairobi auction rooms, bids list, and checkout secure escrow wallets.'
              : 'Sign up as a Bidder, Buyer, or Seller today. Instant M-Pesa sandbox sync.'}
          </p>
        </div>

        {/* Auth Toggle tabs */}
        <div className="flex border-b border-gray-150 text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center font-bold uppercase tracking-wider ${
              isLogin 
                ? 'text-brand-primary border-b-2 border-brand-primary bg-gray-50/50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/20'
            }`}
          >
            Access Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center font-bold uppercase tracking-wider ${
              !isLogin 
                ? 'text-brand-primary border-b-2 border-brand-primary bg-gray-50/50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/20'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl mb-4 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl mb-4 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {!isLogin && (
              <>
                {/* Full Legal Name */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amos Mwangi"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold text-gray-850"
                    />
                  </div>
                </div>

                {/* Safaricom M-Pesa Mobile */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                      M-Pesa Registered Number
                    </label>
                    <span className="text-[9px] text-[#44B92C] font-semibold">Daraja SDK Sync</span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold text-gray-850"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400">Used for staging Safaricom sandbox STK secure pushes.</p>
                </div>

                {/* Role selection tab */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                    Your Primary Activity Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('bidder')}
                      className={`py-2 rounded-lg font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        role === 'bidder' 
                          ? 'border-[#f97316] bg-orange-50 text-orange-700' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[9px] leading-none">Bidder</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-2 rounded-lg font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        role === 'buyer' 
                          ? 'border-[#f97316] bg-orange-50 text-orange-700' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="text-[9px] leading-none">Buyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`py-2 rounded-lg font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        role === 'seller' 
                          ? 'border-[#f97316] bg-orange-50 text-orange-700' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[9px] leading-none">Seller</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Username */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                Username Profile ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mwangi89"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold text-gray-850"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                Secure Account Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold text-gray-850"
                />
              </div>
            </div>

            {/* Promo banner alerting starting balance */}
            {!isLogin && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-900 leading-normal text-[10px] flex items-start gap-1.5 font-semibold">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sandbox Reward:</strong> Bidders & Buyers immediately claim <strong className="text-brand-primary">KES 75,000</strong> simulation balance to test full escrow checkouts right inside this browser!
                </span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 bg-gray-950 hover:bg-[#ea580c] disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Processing request to Daraja...' : (isLogin ? 'Log into Peach' : 'Join Peach Ecosystem')}
            </button>
          </form>

          {/* Prompt info */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Escrow Secure Vault
            </span>
            <span>Made for Kenya</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
