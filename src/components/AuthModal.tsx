import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Phone, Lock, CheckCircle, ShieldCheck, ShoppingBag, Sparkles, Info, Users, Key } from 'lucide-react';
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
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [shopName, setShopName] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [kraPin, setKraPin] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/[^0-9+\s]/g, '');
    setPhone(clean);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please supply your email/username and password.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setErrorMsg('Please supply your full name.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please provide your Safaricom M-Pesa phone number.');
        return;
      }
      if (role === 'seller') {
        if (!shopName.trim()) {
          setErrorMsg('Merchant sellers must supply an official Shop Name.');
          return;
        }
        if (!nationalId.trim()) {
          setErrorMsg('Merchant registration requires National ID Card Number.');
          return;
        }
        if (!kraPin.trim()) {
          setErrorMsg('Merchant registration requires KRA Tax PIN number.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { username, password }
        : { username, password, name, phone, role, shopName, nationalId, kraPin };

      let loggedUser: UserState | null = null;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          loggedUser = data.user;
        } else {
          throw new Error('Express endpoint offline/non-JSON');
        }
      } catch (innerErr) {
        console.error('Server offline or request failed.', innerErr);
        throw new Error("Cannot connect to server. Ensure the backend is running.");
      }

      if (loggedUser) {
        setSuccessMsg(isLogin ? `Mambo Vipi, ${loggedUser.name}!` : `Account created! Welcome, ${loggedUser.name}!`);
        const target = loggedUser;
        setTimeout(() => {
          onAuthSuccess(target);
          onClose();
          setUsername('');
          setPassword('');
          setName('');
          setPhone('');
          setShopName('');
          setNationalId('');
          setKraPin('');
          setErrorMsg(null);
          setSuccessMsg(null);
        }, 1000);
      } else {
        throw new Error('Authentication failure');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect credentials. Check username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden w-full max-w-md my-8"
      >
        {/* Banner header element */}
        <div className="bg-linear-to-r from-[#f97316] to-[#ea580c] p-5 text-white text-center relative select-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all outline-hidden cursor-pointer"
            title="Close authentication"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex justify-center mb-2">
            <img src="/peachlogo.png" alt="Peach Logo" className="w-12 h-12 object-contain drop-shadow-md" />
          </div>
          <div className="inline-flex bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase mb-1">
            Peach Authentication
          </div>
          <h2 className="text-lg font-display font-extrabold tracking-tight">
            {isLogin ? 'Log into Recommerce Portal' : 'Register Peach Account'}
          </h2>
          <p className="text-[11px] text-white/85 mt-1 max-w-xs mx-auto">
            Secure marketplace bids and real-time M-Pesa simulation vault actions.
          </p>
        </div>

        {/* Action Toggle Tab selectors */}
        <div className="flex border-b border-gray-150 text-xs select-none">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider ${
              isLogin 
                ? 'text-brand-primary border-b-2 border-brand-primary bg-gray-50/40' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/10'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-center font-bold uppercase tracking-wider ${
              !isLogin 
                ? 'text-brand-primary border-b-2 border-brand-primary bg-gray-50/40' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/10'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content body container */}
        <div className="p-5 space-y-4">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-[11px] font-semibold leading-relaxed flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}



          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {!isLogin && (
              <>
                {/* Full Legal Name */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amos Mwangi"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-xs font-semibold text-gray-850"
                    />
                  </div>
                </div>

                {/* M-Pesa Mobile Code */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                    M-Pesa Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-xs font-semibold text-gray-850"
                    />
                  </div>
                </div>

                {/* Role Tabs selection */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                    Registration Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['buyer', 'seller'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-1.5 rounded-lg font-bold border capitalize transition-all text-[9.5px] ${
                          role === r 
                            ? 'border-[#f97316] bg-orange-50 text-orange-700' 
                            : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {r === 'buyer' ? 'Buyer / Bidder' : 'Seller / Merchant'}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'seller' && (
                  <div className="bg-orange-50/30 p-3 rounded-2xl border border-orange-100/60 space-y-3 animate-fadeIn">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-orange-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Jumia & Alibaba Business Validation
                    </span>

                    {/* Shop Name */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-[#7c2d12] uppercase tracking-wider text-[9px] block">
                        Registered Shop Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Mwangi Tech Electronics Ltd"
                        className="w-full px-3 py-1.5 bg-white border border-orange-200 focus:border-orange-500 rounded-xl outline-hidden text-xs font-semibold text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* ID Number */}
                      <div className="space-y-1">
                        <label className="font-extrabold text-[#7c2d12] uppercase tracking-wider text-[9px] block">
                          National ID Number
                        </label>
                        <input
                          type="text"
                          required
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 33445566"
                          className="w-full px-3 py-1.5 bg-white border border-orange-200 focus:border-orange-500 rounded-xl outline-hidden text-xs font-mono font-bold text-gray-800"
                        />
                      </div>

                      {/* KRA Pin */}
                      <div className="space-y-1">
                        <label className="font-extrabold text-[#7c2d12] uppercase tracking-wider text-[9px] block">
                          KRA TAX PIN
                        </label>
                        <input
                          type="text"
                          required
                          value={kraPin}
                          onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                          placeholder="e.g. A012345678Z"
                          className="w-full px-3 py-1.5 bg-white border border-orange-200 focus:border-orange-500 rounded-xl outline-hidden text-xs font-mono font-bold text-gray-800 animate-uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email or Username Info */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                Email Address or Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. joji@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-xs font-semibold text-gray-850"
                />
              </div>
            </div>

            {/* Password Info */}
            <div className="space-y-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. tiktak1"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-xs font-semibold text-gray-850"
                />
              </div>
            </div>

            {/* Promo banner alerting starting balance */}
            {!isLogin && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900 leading-normal text-[9px] flex items-start gap-1 font-semibold">
                <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sandbox Promo:</strong> Buyers/Bidders claim <strong>KES 75,000</strong> immediately.
                </span>
              </div>
            )}

            {/* Explicit Cancel & submit buttons */}
            <div className="flex items-center gap-2 pt-1 select-none">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-600 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-[10px] text-center"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-2.5 bg-gray-950 hover:bg-[#ea580c] disabled:bg-gray-400 text-white font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all text-[10px] cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : (isLogin ? 'Log into Peach' : 'Sign Up')}
              </button>
            </div>

          </form>

          {/* Secure Trust indicators */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 select-none">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Safe Escrow Protection
            </span>
            <span>M-Pesa API Integration Sandbox</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
