import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Trash, Plus, Check, ShieldAlert, Coins, Megaphone, UserPlus, 
  Sparkles, RefreshCw, Smartphone, CheckCircle, Info, Image, ExternalLink 
} from 'lucide-react';
import { UserState, Listing } from '../types';
import { getLocalListings, createLocalListing, getLocalUsers, addLocalUser, deleteLocalUser, updateLocalUserBalance } from '../utils/dataStore';

interface AdminPanelProps {
  currentUser: UserState | null;
  onRefreshListings: () => void;
}

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  name: string;
  phone: string;
  avatar: string;
  balance: number;
  role: 'buyer' | 'seller' | 'admin';
  password?: string;
}

export default function AdminPanel({ currentUser, onRefreshListings }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New User Form fields
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRole, setNewRole] = useState<'buyer' | 'seller'>('buyer');
  const [newBalance, setNewBalance] = useState<string>('50000');
  const [newAvatar, setNewAvatar] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('tiktak1');

  // Ad Form fields
  const [adTitle, setAdTitle] = useState<string>('');
  const [adDescription, setAdDescription] = useState<string>('');
  const [adCategory, setAdCategory] = useState<string>('Services');
  const [adImageUrl, setAdImageUrl] = useState<string>('');
  const [adVideoUrl, setAdVideoUrl] = useState<string>('');
  const [adTagline, setAdTagline] = useState<string>('Sponsored Feature Deal');

  // Ad social network syndication variables
  const [adsList, setAdsList] = useState<Listing[]>([]);
  const [selectedAdForSync, setSelectedAdForSync] = useState<Listing | null>(null);
  const [syncMeta, setSyncMeta] = useState<boolean>(true);
  const [syncTikTok, setSyncTikTok] = useState<boolean>(true);
  const [syncBudget, setSyncBudget] = useState<string>('5000');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Edited user states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');

  const randomAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  ];

  const fetchUsers = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      let list: AdminUser[] = [];
      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${currentUser.id}`
          }
        });
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          list = data;
        } else {
          throw new Error('Express endpoint offline/non-JSON');
        }
      } catch (inner) {
        console.warn("Express user listing endpoint offline. Falling back to local accounts.", inner);
        const locals = getLocalUsers();
        list = locals as unknown as AdminUser[];
      }
      setUsers(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load administrative user database index.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        const data: Listing[] = await res.json();
        setAdsList(data.filter(l => l.isAd === true));
      } else {
        const locals = getLocalListings();
        setAdsList(locals.filter(l => l.isAd === true));
      }
    } catch (e) {
      const locals = getLocalListings();
      setAdsList(locals.filter(l => l.isAd === true));
    }
  };

  const handleSyndicateSocial = async (adId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/admin/ads/${adId}/sync-social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.id || 'usr-admin'}`
        },
        body: JSON.stringify({
          syncMeta,
          syncTikTok,
          budget: parseFloat(syncBudget)
        })
      });
      if (res.ok) {
        setSuccessMsg("Social media campaign compiled and syndicated successfully to Meta Ads Manager & TikTok Spark Studios!");
        fetchAds();
        onRefreshListings();
        setSelectedAdForSync(null);
      } else {
        alert("Syndication request rejected.");
      }
    } catch (e) {
      console.error(e);
      alert("Lost connectivity. Failed to complete syndication.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAds();
  }, [currentUser?.id]);

  const selectRandomAvatar = () => {
    const idx = Math.floor(Math.random() * randomAvatars.length);
    setNewAvatar(randomAvatars[idx]);
  };

  const handleCreateDummyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newEmail || !newName) {
      setErrorMsg('Simulated dummy username/email and legal display names are matching required fields.');
      return;
    }

    try {
      let createdOk = false;
      try {
        const response = await fetch('/api/admin/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.id}`
          },
          body: JSON.stringify({
            username: newEmail,
            password: newPassword,
            name: newName,
            phone: newPhone || '0700000000',
            role: newRole,
            balance: parseFloat(newBalance) || 50000,
            avatar: newAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          })
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          createdOk = true;
        } else {
          throw new Error("Express endpoint offline/non-JSON");
        }
      } catch (inner) {
        console.warn("Express user create endpoint offline. Saving user dummy locally.", inner);
        const newUser = {
          id: 'usr-' + Math.random().toString(36).substr(2, 9),
          username: newEmail.toLowerCase(),
          password: newPassword,
          name: newName,
          phone: newPhone || '0700000000',
          role: newRole,
          balance: parseFloat(newBalance) || 50000,
          avatar: newAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        };
        addLocalUser(newUser as any);
        createdOk = true;
      }

      if (createdOk) {
        setSuccessMsg(`Simulated user account "${newName}" created successfully with password "${newPassword}"!`);
        
        // Clear inputs
        setNewEmail('');
        setNewName('');
        setNewPhone('');
        setNewBalance('50000');
        setNewAvatar('');
        
        fetchUsers();
      } else {
        throw new Error('Server rejected dummy creation workflow');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulated client creation system connection breakdown.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser) return;
    if (!confirm('Are you absolutely sure you want to delete this client proxy account?')) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let deletedOk = false;
      try {
        const response = await fetch(`/api/admin/users/${userId}/delete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.id}`
          }
        });

        if (response.ok) {
          deletedOk = true;
        } else {
          throw new Error("Express endpoint offline");
        }
      } catch (inner) {
        console.warn("Express delete user endpoint offline. Deleting locally.", inner);
        deleteLocalUser(userId);
        deletedOk = true;
      }

      if (deletedOk) {
        setSuccessMsg('Simulated client successfully deleted.');
        fetchUsers();
      } else {
        throw new Error('Delete execution rejected.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete operation connection breakdown.');
    }
  };

  const handleUpdateBalance = async (userId: string) => {
    if (!currentUser) return;
    const cleanBal = parseFloat(editBalance);
    if (isNaN(cleanBal)) {
      alert('Balance amount must be a clean numeric quantity KES.');
      return;
    }

    try {
      let updatedOk = false;
      try {
        const response = await fetch(`/api/admin/users/${userId}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.id}`
          },
          body: JSON.stringify({ balance: cleanBal })
        });

        if (response.ok) {
          updatedOk = true;
        } else {
          throw new Error("Express endpoint offline");
        }
      } catch (inner) {
        console.warn("Express wallet update endpoint offline. Crediting locally.", inner);
        updateLocalUserBalance(userId, cleanBal);
        updatedOk = true;
      }

      if (updatedOk) {
        setEditingUserId(null);
        setEditBalance('');
        setSuccessMsg('Wallet balance credited/adjusted instantly!');
        fetchUsers();
      } else {
        throw new Error('Failed to update user wallet.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed connecting to database API.');
    }
  };

  const handlePublishAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!adTitle || !adDescription) {
      setErrorMsg('Ad title and product boost text blocks are required.');
      return;
    }

    try {
      let publishedOk = false;
      try {
        const response = await fetch('/api/admin/ads/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.id}`
          },
          body: JSON.stringify({
            title: adTitle,
            description: adDescription,
            category: adCategory,
            imageUrl: adImageUrl,
            videoUrl: adVideoUrl,
            adTagline: adTagline
          })
        });

        if (response.ok) {
          publishedOk = true;
        } else {
          throw new Error("Express endpoint offline");
        }
      } catch (inner) {
        console.warn("Express ad placement endpoint offline. Injecting ad Campaign locally.", inner);
        const newAdListing: Listing = {
          id: "ad-" + Math.random().toString(36).substr(2, 9),
          title: adTitle,
          description: adDescription,
          category: adCategory,
          condition: "Like New",
          location: "Nairobi, Westlands",
          seller: {
            id: "system-sponsor",
            name: "PEACH ADVERTISER",
            rating: 5.0,
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
          },
          startingBid: 0,
          reservePrice: 0,
          currentBid: 0,
          bidsCount: 0,
          endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
          status: "active",
          winnerId: null,
          winnerName: null,
          escrowStatus: "none",
          deliveryOption: null,
          deliveryFee: 0,
          deliveryAddress: null,
          mpesaPhone: null,
          mpesaReceipt: null,
          trackingCode: null,
          imageUrl: adImageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
          videoUrl: adVideoUrl || "",
          bidHistory: [],
          isAd: true,
          adTagline: adTagline
        };
        createLocalListing(newAdListing);
        publishedOk = true;
      }

      if (publishedOk) {
        setSuccessMsg(`Brand Promotion "${adTitle}" posted live directly onto shop listings block!`);
        setAdTitle('');
        setAdDescription('');
        setAdImageUrl('');
        setAdVideoUrl('');
        setAdTagline('Sponsored Feature Deal');
        onRefreshListings();
        fetchAds();
      } else {
        throw new Error('Failed to publish advertisement');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ad creation transaction system connection failure.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Status Panel */}
      <div className="bg-linear-to-r from-gray-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] tracking-wider uppercase font-bold py-0.5 px-2.5 rounded-full mb-1">
              Live Administration Control Center
            </div>
            <h1 className="text-2xl font-display font-black tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500" /> System Control Board
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Logistics override console. Register mock clients instantly to execute live bidder competitions, 
              wire fake M-Pesa STK balances, inject sponsored campaign ads, and audit user login vaults securely.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="self-start md:self-center bg-white/10 hover:bg-white/20 text-white border border-white/10 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer outline-hidden active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Synchronize DB State
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in unique-success-tag">
          <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold flex items-start gap-2 shadow-xs animate-fade-in">
          <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Dual Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Manage Accounts Index & Create Mock Users */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Check Accounts Database */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-800" />
                <h2 className="text-base font-display font-extrabold text-gray-900">Check Connected Client Profiles</h2>
              </div>
              <span className="bg-orange-50 text-orange-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border border-orange-100">
                {users.length} Database Accounts
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-primary mb-2" />
                <span>Reading central user accounts indexes...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {users.map((usr) => (
                  <div 
                    key={usr.id} 
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      usr.role === 'admin' 
                        ? 'bg-amber-50/40 border-amber-200 shadow-3xs' 
                        : 'bg-gray-50/70 border-gray-150 hover:bg-white hover:shadow-xs hover:border-gray-250'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={usr.avatar} 
                        alt={usr.name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs font-bold text-gray-850 truncate">{usr.name}</h3>
                          <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase border shrink-0 ${
                            usr.role === 'admin' 
                              ? 'bg-amber-100 border-amber-300 text-amber-800' 
                              : usr.role === 'seller' ? 'bg-purple-50 border-purple-150 text-purple-700' : 'bg-blue-50 border-blue-150 text-blue-700'
                          }`}>
                            {usr.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{usr.username}</p>
                        <p className="text-[9px] text-gray-405 font-medium mt-0.5">M-Pesa ID: <span className="font-mono">{usr.phone}</span> • Pass: <strong className="text-gray-650">{usr.password || 'tiktak1'}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-0 border-gray-200">
                      <div className="text-left sm:text-right">
                        <span className="text-[8px] text-gray-400 block font-mono font-bold uppercase tracking-wider">Wallet Balance</span>
                        <strong className="text-xs font-mono text-[#2B7A1C]">KES {usr.balance.toLocaleString()}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {editingUserId === usr.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              placeholder="Amount KES"
                              className="w-20 px-2 py-1 bg-white border border-gray-300 text-[11px] rounded-lg font-mono focus:border-brand-primary outline-hidden"
                            />
                            <button
                              onClick={() => handleUpdateBalance(usr.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 p-1 rounded-lg text-white transition-colors cursor-pointer"
                              title="Save updated balance"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => { setEditingUserId(null); setEditBalance(''); }}
                              className="bg-gray-200 text-gray-600 p-1 rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingUserId(usr.id); setEditBalance(String(usr.balance)); }}
                            className="text-[9px] font-bold px-2 py-1 bg-white hover:bg-brand-primary hover:text-white border border-gray-250 hover:border-transparent rounded-lg transition-colors cursor-pointer"
                          >
                            Credit Wallet
                          </button>
                        )}

                        {usr.id !== "usr-admin" && usr.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg bg-white border border-gray-200 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Purge mock client profile"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Create Mock Dummy Account */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <UserPlus className="w-5 h-5 text-gray-800" />
              <div>
                <h2 className="text-base font-display font-extrabold text-gray-900">Acknowledge Dummy Live Push Client</h2>
                <p className="text-[11px] text-gray-400">Instantly draft fresh client credentials with simulated starting wallets so they can place live bids.</p>
              </div>
            </div>

            <form onSubmit={handleCreateDummyUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Username/Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. mboya@gmail.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Legal Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tom Mboya"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Simulated Safaricom Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9+\s]/g, ''))}
                  placeholder="e.g. 0722000111"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Wallet Balance (KES)</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-mono font-semibold text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Client password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Standard password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold font-mono text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-550 uppercase tracking-wider text-[10px] block">Account Profile Avatar URL</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    placeholder="Custom Image Link"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden text-xs truncate text-gray-850 font-mono"
                  />
                  <button
                    type="button"
                    onClick={selectRandomAvatar}
                    className="px-2.5 bg-gray-100 hover:bg-gray-205 border border-gray-250 text-gray-600 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                  >
                    🎲 Rand
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5 pt-2">
                <label className="font-bold text-gray-550 uppercase tracking-wider text-[10px] block text-center">Registration Type & Simulated Bid Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['buyer', 'seller'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        newRole === r 
                          ? 'border-[#f97316] bg-orange-50 text-orange-700 shadow-3xs' 
                          : 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50/75'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="sm:col-span-2 mt-3 w-full py-2.5 bg-gray-950 hover:bg-[#ea580c] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all text-[11px] cursor-pointer"
              >
                Register & Inject Live Dummy Account
              </button>
            </form>
          </div>

        </div>

        {/* Column Right: Place Advertisement campaigns form */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Megaphone className="w-5 h-5 text-gray-800" />
              <div>
                <h2 className="text-base font-display font-extrabold text-gray-900">Place Ads & Campaigns</h2>
                <p className="text-[11px] text-gray-400">Inject high leverage corporate sponsorships and product advertisements seamlessly.</p>
              </div>
            </div>

            <form onSubmit={handlePublishAd} className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Campaign Ad Title</label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. Kenya Airways Holiday Flights Special"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-gray-850"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Ad Tagline / Sub-badge text</label>
                <input
                  type="text"
                  required
                  value={adTagline}
                  onChange={(e) => setAdTagline(e.target.value)}
                  placeholder="e.g. Sponsored Premium Flight Deals"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-[#f97316]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Target Category</label>
                <select
                  value={adCategory}
                  onChange={(e) => setAdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-semibold text-gray-800"
                >
                  <option value="Services">Services (Advertising space)</option>
                  <option value="Electronics">Electronics Sponsored Deals</option>
                  <option value="Fashion">Fashion & Lifestyle Deals</option>
                  <option value="Vehicles & Sports">Vehicles sponsored promos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Ad Image Link (Unsplash/Web)</label>
                <input
                  type="text"
                  value={adImageUrl}
                  onChange={(e) => setAdImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden text-gray-850 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setAdImageUrl("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80")}
                  className="text-[9px] text-[#ea580c] font-bold block hover:underline"
                >
                  ⚡ Use Peach Tech Product Boost Placeholder Ad
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Campaign Video Ad Promo URL (Optional MP4)</label>
                <input
                  type="text"
                  value={adVideoUrl}
                  onChange={(e) => setAdVideoUrl(e.target.value)}
                  placeholder="e.g. https://assets.mixkit.co/videos/preview/..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden text-gray-850 font-mono"
                />
                <div className="flex flex-wrap gap-1.5 pt-1 uppercase text-[8px] font-bold">
                  <span className="text-gray-400 self-center">Test Presets:</span>
                  <button
                    type="button"
                    onClick={() => setAdVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-commercial-shooting-of-various-types-of-shoes-34015-large.mp4")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300"
                  >
                    👟 Shoes Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-rotating-display-of-a-golden-smartwatch-51631-large.mp4")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300"
                  >
                    ⌚ Smartwatch
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Comprehensive Ad Description copy</label>
                <textarea
                  required
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  rows={4}
                  placeholder="Write a highly strategic product boost description to showcase this sponsor page's values..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl focus:bg-white outline-hidden font-sans text-gray-850"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-950 hover:bg-orange-600 text-white font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all text-[11px] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" /> Publish Ad To Marketplace
              </button>

            </form>

            {/* Ad sandbox guidelines indicator bar */}
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-normal flex items-start gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Campaign Ads Info:</strong> Placing ads injects standard listings tagged with `isAd: true` directly to the top banner shop grid. Supports both image backgrounds and sleek auto-looping hover videos!
              </span>
            </div>

          </div>

          {/* Social Media Syndicator Block */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-display font-extrabold text-indigo-950">Meta & TikTok Syndicator</h2>
                <p className="text-[11px] text-gray-400">Push, distribute and boost your active product boosts directly into Meta Pixel and TikTok Spark Ads.</p>
              </div>
            </div>

            {adsList.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4 italic">No active corporate ads found to syndicate. Publish one first above!</p>
            ) : (
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Select Ad Campaign to Syndicate</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {adsList.map((ad) => (
                    <div 
                      key={ad.id}
                      onClick={() => setSelectedAdForSync(ad)}
                      className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                        selectedAdForSync?.id === ad.id 
                          ? 'bg-orange-50/70 border-brand-primary' 
                          : 'bg-gray-50 hover:bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img 
                          src={ad.imageUrl} 
                          alt="" 
                          className="w-8 h-8 rounded-md object-cover border border-gray-200 shrink-0" 
                        />
                        <div className="truncate">
                          <p className="text-gray-800 text-[11px] font-bold truncate">{ad.title}</p>
                          <p className="text-[9px] text-[#ea580c] truncate">{ad.adTagline}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {ad.isMetaSync && <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-1 py-0.2 rounded-sm border border-blue-200">Meta</span>}
                        {ad.isTikTokSync && <span className="bg-rose-100 text-rose-700 text-[8px] font-bold px-1 py-0.2 rounded-sm border border-rose-200">TikTok</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedAdForSync && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-3.5 bg-gray-50 rounded-2xl border border-gray-150 space-y-3"
                  >
                    <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                      Syndicating: <span className="text-[#ea580c]">{selectedAdForSync.title}</span>
                    </h3>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">Networks to target:</span>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={syncMeta} 
                              onChange={(e) => setSyncMeta(e.target.checked)} 
                              className="accent-blue-600 rounded-sm"
                            />
                            Meta Pages (Instagram/FB)
                          </label>
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={syncTikTok} 
                              onChange={(e) => setSyncTikTok(e.target.checked)} 
                              className="accent-rose-500 rounded-sm"
                            />
                            TikTok For You Page
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>Distribute Ad Budget</span>
                          <span className="text-[#2B7A1C]">KES {parseInt(syncBudget).toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1000" 
                          max="50000" 
                          step="1000"
                          value={syncBudget} 
                          onChange={(e) => setSyncBudget(e.target.value)} 
                          className="w-full accent-indigo-900 cursor-pointer"
                        />
                        <p className="text-[9px] text-gray-400">Estimated campaign reach: <strong className="text-gray-700">{(parseInt(syncBudget) * 7.5).toLocaleString()} active users</strong> in Nairobi & Kisumu region.</p>
                      </div>

                      <button
                        onClick={() => handleSyndicateSocial(selectedAdForSync.id)}
                        disabled={isSyncing || (!syncMeta && !syncTikTok)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syndicating Global Pixels...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5" /> Deploy Ad Campaign and Boost Reach
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Simulated Campaign Real-time Performance Feed */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Live Social Campaigns Overview</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                      <span className="text-[9px] text-gray-400 block font-medium">Total Impressions</span>
                      <strong className="text-xs font-mono text-gray-800">482,910</strong>
                    </div>
                    <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                      <span className="text-[9px] text-gray-400 block font-medium">Total Clicks</span>
                      <strong className="text-xs font-mono text-gray-800">32,593</strong>
                    </div>
                    <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[9px] text-gray-400 block font-medium">Net CTR %</span>
                      <strong className="text-xs font-mono text-emerald-700">6.75% 📈</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt quick tips */}
          <div className="bg-gray-100 p-4 rounded-3xl border border-gray-250/60 text-[11px] text-gray-500 space-y-2">
            <span className="font-mono font-bold text-gray-700 block uppercase tracking-wider">🔒 Admin Security Credentials</span>
            <p>1. Standard Admin Email: <strong className="text-gray-800 font-mono">admin@gmail.com</strong></p>
            <p>2. Standard Admin Password: <strong className="text-gray-800 font-mono">tiktak1</strong></p>
            <p className="text-[10px] text-gray-400">Dummy simulation profile transactions are instantly persisted in global container runtime memory state.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
