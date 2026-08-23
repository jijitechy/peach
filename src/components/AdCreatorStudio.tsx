import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Sparkles, Image as ImageIcon, Video, Mic, X, Loader2, ArrowRight,
  Camera, FileVideo, Check
} from 'lucide-react';

export type AdStyle = 'funny' | 'serious' | 'cinematic' | 'cartoon' | 'luxury' | 'flashsale';
export type CharacterStyle = 'nairobi_street' | 'corporate_nairobi' | 'coastal_mombasa' | 'rural_shamba' | 'gen_z_kenya';
export type OutputFormat = 'video' | 'image' | 'story' | 'tiktok';

export interface GeneratedAd {
  headline: string;
  subheadline: string;
  bodyText: string;
  caption: string;
  cta: string;
  hashtags: string[];
  videoScript?: string;
  imagePrompt: string;
  generatedImageBase64?: string;
  operationName?: string;
}

interface AdCreatorStudioProps {
  onAdGenerated: (ad: GeneratedAd, productImage: string | null) => void;
}

const SMART_TEMPLATES = [
  { icon: '👗', label: 'Fashion', prompt: 'New arrival! A stunning Ankara print maxi dress for ladies. Made in Kenya. Selling for KES 3,500.' },
  { icon: '🍔', label: 'Food', prompt: 'Delicious nyama choma and ugali platter with kachumbari. Perfect for a Friday out in Nairobi.' },
  { icon: '📱', label: 'Electronics', prompt: 'Brand new iPhone 15 Pro, 256GB. Available at our shop in CBD. We deliver countrywide via G4S.' },
  { icon: '💆', label: 'Beauty', prompt: 'Professional knotless braids service in Nairobi. Clean salon, fast workers. Book your appointment.' },
  { icon: '🏠', label: 'Real Estate', prompt: 'Spacious 3 bedroom apartment for rent in Kilimani, Nairobi. Includes pool and gym. KES 80k/month.' },
  { icon: '🚗', label: 'Vehicles', prompt: 'Fresh import! 2018 Mazda Demio, low mileage, zero faults. Perfect first car or Uber.' },
];

const AD_STYLES = [
  { key: 'funny', label: 'Funny', emoji: '😂', desc: 'Kenyan humour', color: 'from-yellow-500 to-orange-400' },
  { key: 'serious', label: 'Serious', emoji: '💼', desc: 'Professional', color: 'from-blue-600 to-indigo-600' },
  { key: 'cinematic', label: 'Cinematic', emoji: '🎬', desc: 'Dramatic', color: 'from-gray-700 to-gray-900' },
  { key: 'cartoon', label: 'Cartoon', emoji: '🎨', desc: 'Animated', color: 'from-pink-500 to-violet-600' },
  { key: 'luxury', label: 'Luxury', emoji: '💎', desc: 'Premium', color: 'from-amber-500 to-yellow-400' },
  { key: 'flashsale', label: 'Flash Sale', emoji: '⚡', desc: 'Urgent deals', color: 'from-red-600 to-orange-500' },
] as const;

const CHARACTER_STYLES = [
  { key: 'nairobi_street', label: '🏙️ Nairobi Street' },
  { key: 'corporate_nairobi', label: '👔 Corporate' },
  { key: 'coastal_mombasa', label: '🌊 Coastal' },
  { key: 'rural_shamba', label: '🌾 Shamba' },
  { key: 'gen_z_kenya', label: '✨ Gen Z' },
] as const;

export default function AdCreatorStudio({ onAdGenerated }: AdCreatorStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageName, setProductImageName] = useState<string>('');
  
  const [selectedStyle, setSelectedStyle] = useState<AdStyle>('funny');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterStyle>('nairobi_street');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('video');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setProductImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productImage && !prompt.trim()) {
      setError('Please describe your product or upload an image.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      // 1. Generate text copy (fast)
      const textRes = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: productImage, prompt: prompt.trim(), style: selectedStyle, characterStyle: selectedCharacter, outputFormat: selectedFormat }),
      });
      if (!textRes.ok) throw new Error('AI copy generation failed');
      const ad: GeneratedAd = await textRes.json();

      // 2. Kick off video generation (slow) in parallel
      let operationName = undefined;
      if (selectedFormat !== 'image') {
        const vidRes = await fetch('/api/ai/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: productImage, prompt: prompt.trim(), style: selectedStyle, characterStyle: selectedCharacter }),
        });
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          operationName = vidData.operationName;
        }
      }
      
      onAdGenerated({ ...ad, operationName }, productImage);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Step 1: Prompt First */}
        <div>
           <h2 className="text-xl font-display font-black text-white flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
               1
             </div>
             Describe Your Product
           </h2>
           
           <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
             {SMART_TEMPLATES.map(t => (
               <button 
                 key={t.label} 
                 onClick={() => setPrompt(t.prompt)}
                 className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold glass border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all shrink-0"
               >
                 {t.icon} {t.label}
               </button>
             ))}
           </div>
           
           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="e.g. 'Brand new iPhone 15 Pro, 256GB. Available at our shop in CBD...'"
             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-white placeholder:text-gray-500 resize-none outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all min-h-[140px] shadow-inner"
           />
           
           {/* Optional Image */}
           <div className="mt-4">
             {productImage ? (
                <div className="relative inline-block group">
                  <img src={productImage} alt="Product" className="h-24 w-24 object-cover rounded-xl border border-orange-500/40" />
                  <button onClick={() => setProductImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
             ) : (
                <button onClick={() => imageInputRef.current?.click()} className="text-sm text-gray-400 hover:text-orange-400 flex items-center gap-2 transition-colors">
                  <ImageIcon className="w-4 h-4" /> Add Product Photo (optional)
                </button>
             )}
             <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImageFile(f); }} />
           </div>
        </div>

        {/* Step 2: Vibe & Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <h2 className="text-xl font-display font-black text-white flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                 2
               </div>
               Ad Style
             </h2>
             <div className="grid grid-cols-3 gap-2">
               {AD_STYLES.map((style) => (
                 <button
                   key={style.key}
                   onClick={() => setSelectedStyle(style.key)}
                   className={`rounded-xl p-3 text-center border transition-all ${
                     selectedStyle === style.key
                       ? 'border-orange-500/60 bg-orange-500/8 text-white'
                       : 'border-white/5 glass text-gray-400 hover:text-white'
                   }`}
                 >
                   <div className="text-2xl mb-1">{style.emoji}</div>
                   <p className="text-xs font-bold">{style.label}</p>
                 </button>
               ))}
             </div>
          </div>
          <div>
             <h2 className="text-xl font-display font-black text-white flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                 3
               </div>
               Settings
             </h2>
             <div className="space-y-4">
               <div>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-2">Character Style</p>
                 <div className="flex flex-wrap gap-2">
                   {CHARACTER_STYLES.map((ch) => (
                     <button
                       key={ch.key}
                       onClick={() => setSelectedCharacter(ch.key)}
                       className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                         selectedCharacter === ch.key ? 'bg-orange-500/15 border-orange-500/50 text-orange-300' : 'border-white/8 glass text-gray-400 hover:text-white'
                       }`}
                     >
                       {ch.label}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 uppercase mb-2">Output Format</p>
                 <div className="flex gap-2">
                   <button onClick={() => setSelectedFormat('video')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedFormat === 'video' ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300' : 'border-white/8 glass text-gray-400'}`}>
                     <Video className="w-4 h-4" /> Video (Recommended)
                   </button>
                   <button onClick={() => setSelectedFormat('image')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedFormat === 'image' ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300' : 'border-white/8 glass text-gray-400'}`}>
                     <ImageIcon className="w-4 h-4" /> Image Only
                   </button>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Generate */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-xl py-5 rounded-2xl shadow-2xl shadow-orange-500/25 flex items-center justify-center gap-3 disabled:opacity-50 transition-all animate-glow-pulse mt-8"
        >
          {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> AI is cooking...</> : <><Sparkles className="w-5 h-5" /> Generate Ad</>}
        </motion.button>
      </div>
    </div>
  );
}
