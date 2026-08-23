import React, { useState } from 'react';
import { Share2, Instagram, Facebook, Send, Copy, Check, Megaphone, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function BoostPanel() {
  const [activeTab, setActiveTab] = useState<'share' | 'boost'>('share');
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState(7);
  const [boostStatus, setBoostStatus] = useState<'idle' | 'success'>('idle');

  const handleShare = (platform: string) => {
    // In a real app, uses Web Share API or deep links
    if (navigator.share) {
      navigator.share({
        title: 'Check out my ad created with AddSell',
        text: 'Generated an amazing AI ad!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Sharing to ${platform} is not supported on this browser.`);
    }
  };

  const handleBoost = () => {
    setBoostStatus('success');
    setTimeout(() => setBoostStatus('idle'), 4000);
  };

  return (
    <div className="mt-8 glass rounded-3xl border border-white/10 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('share')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'share' ? 'text-white border-b-2 border-orange-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center justify-center gap-2"><Share2 className="w-4 h-4" /> Free Share</div>
        </button>
        <button
          onClick={() => setActiveTab('boost')}
          className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'boost' ? 'text-white border-b-2 border-orange-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
           <div className="flex items-center justify-center gap-2"><Megaphone className="w-4 h-4" /> Boost with AddSell</div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'share' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center mb-6">Share your generated ad directly to your social platforms.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button onClick={() => handleShare('WhatsApp')} className="glass border-white/5 hover:bg-[#25D366]/20 hover:border-[#25D366]/50 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group">
                <Smartphone className="w-6 h-6 text-gray-400 group-hover:text-[#25D366]" />
                <span className="text-xs font-bold text-gray-300">WhatsApp</span>
              </button>
              <button onClick={() => handleShare('Instagram')} className="glass border-white/5 hover:bg-[#E1306C]/20 hover:border-[#E1306C]/50 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group">
                <Instagram className="w-6 h-6 text-gray-400 group-hover:text-[#E1306C]" />
                <span className="text-xs font-bold text-gray-300">Instagram</span>
              </button>
              <button onClick={() => handleShare('Facebook')} className="glass border-white/5 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group">
                <Facebook className="w-6 h-6 text-gray-400 group-hover:text-[#1877F2]" />
                <span className="text-xs font-bold text-gray-300">Facebook</span>
              </button>
              <button onClick={() => handleShare('TikTok')} className="glass border-white/5 hover:bg-[#00f2fe]/20 hover:border-[#00f2fe]/50 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group">
                <Send className="w-6 h-6 text-gray-400 group-hover:text-[#00f2fe]" />
                <span className="text-xs font-bold text-gray-300">TikTok</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-400">Let AddSell run this ad for you across Kenyan networks to drive real sales.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300">Budget</span>
                  <span className="text-xs font-bold text-orange-400">KES {budget.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="50000" 
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-300">Duration</span>
                  <span className="text-xs font-bold text-orange-400">{duration} Days</span>
                </div>
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map(d => (
                    <button 
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${duration === d ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'glass border-white/10 text-gray-400 hover:text-white'}`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/5">
               <p className="text-xs text-gray-400 mb-2 font-bold">Estimated Reach</p>
               <p className="text-2xl font-black text-white">
                 {Math.round(budget * 0.4).toLocaleString()} - {Math.round(budget * 1.2).toLocaleString()} <span className="text-sm font-normal text-gray-500">people in Kenya</span>
               </p>
            </div>

            {boostStatus === 'idle' ? (
              <button 
                onClick={handleBoost}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Megaphone className="w-5 h-5" /> Start Boost Campaign
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-green-500/20 border border-green-500/30 text-green-300 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-2"><Check className="w-5 h-5" /> Request Sent!</div>
                <span className="text-[10px] text-green-400/80 font-normal">Our team will contact you via WhatsApp shortly to confirm targeting.</span>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
