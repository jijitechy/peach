import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Sparkles, Image, Video, Mic, X, Loader2, ArrowRight,
  RefreshCw, Download, Share2, Music, FileVideo, Camera
} from 'lucide-react';

// --- Types ---
export type AdStyle = 'funny' | 'serious' | 'cinematic' | 'cartoon' | 'luxury' | 'flashsale';
export type CharacterStyle = 'nairobi_street' | 'corporate_nairobi' | 'coastal_mombasa' | 'rural_shamba' | 'gen_z_kenya';
export type OutputFormat = 'image' | 'video_script' | 'story' | 'tiktok';

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
}

interface AdCreatorStudioProps {
  onAdGenerated: (ad: GeneratedAd, productImage: string | null) => void;
}

const AD_STYLES: { key: AdStyle; label: string; emoji: string; desc: string; color: string }[] = [
  { key: 'funny', label: 'Funny', emoji: '😂', desc: 'Kenyan humour & memes', color: 'from-yellow-500 to-orange-400' },
  { key: 'serious', label: 'Serious', emoji: '💼', desc: 'Professional & trustworthy', color: 'from-blue-600 to-indigo-600' },
  { key: 'cinematic', label: 'Cinematic', emoji: '🎬', desc: 'Dramatic & high-quality', color: 'from-gray-700 to-gray-900' },
  { key: 'cartoon', label: 'Cartoon', emoji: '🎨', desc: 'African animated style', color: 'from-pink-500 to-violet-600' },
  { key: 'luxury', label: 'Luxury', emoji: '💎', desc: 'Premium & aspirational', color: 'from-amber-500 to-yellow-400' },
  { key: 'flashsale', label: 'Flash Sale', emoji: '⚡', desc: 'Urgent & high-energy', color: 'from-red-600 to-orange-500' },
];

const CHARACTER_STYLES: { key: CharacterStyle; label: string; desc: string }[] = [
  { key: 'nairobi_street', label: '🏙️ Nairobi Street', desc: 'Urban Kenyan youth energy' },
  { key: 'corporate_nairobi', label: '👔 Corporate Nairobi', desc: 'Professional CBD vibe' },
  { key: 'coastal_mombasa', label: '🌊 Coastal Mombasa', desc: 'Swahili coast culture' },
  { key: 'rural_shamba', label: '🌾 Rural / Shamba', desc: 'Authentic village setting' },
  { key: 'gen_z_kenya', label: '✨ Gen Z Kenya', desc: 'TikTok-era Kenyan youth' },
];

const OUTPUT_FORMATS: { key: OutputFormat; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'image', label: 'Image Ad', icon: Image, desc: 'Square/rectangular product ad' },
  { key: 'video_script', label: 'Video Script', icon: Video, desc: '15–30 sec video storyboard' },
  { key: 'story', label: 'Story Ad', icon: Camera, desc: 'Vertical for IG / WhatsApp Status' },
  { key: 'tiktok', label: 'TikTok Ad', icon: FileVideo, desc: 'Short-form viral format' },
];

export default function AdCreatorStudio({ onAdGenerated }: AdCreatorStudioProps) {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageName, setProductImageName] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<AdStyle>('funny');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterStyle>('nairobi_street');
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('image');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setProductImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, []);

  const handleGenerate = async () => {
    if (!productImage && !prompt.trim()) {
      setError('Please upload a product image or describe your product.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: productImage,
          prompt: prompt.trim(),
          style: selectedStyle,
          characterStyle: selectedCharacter,
          outputFormat: selectedFormat,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI generation failed');
      }

      const ad: GeneratedAd = await response.json();
      onAdGenerated(ad, productImage);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-display font-black text-base text-white">AddSell <span className="text-orange-400">Studio</span></span>
        <span className="ml-auto text-xs text-gray-500 font-medium">Kenya's AI Ad Creator</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Step 1: Upload */}
        <div>
          <SectionLabel number={1} label="Upload Product Photo or Describe It" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* Image Upload */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center min-h-[200px] ${
                isDragOver ? 'drop-zone-active' : 'border-white/10 hover:border-orange-500/40 hover:bg-orange-500/3'
              } ${productImage ? 'border-orange-500/40 bg-orange-500/5' : ''}`}
            >
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImageFile(f); }} />
              {productImage ? (
                <>
                  <img src={productImage} alt="Product" className="w-full max-h-40 object-contain rounded-xl mb-3" />
                  <span className="text-xs font-bold text-orange-400 truncate max-w-full">{productImageName}</span>
                  <button onClick={(e) => { e.stopPropagation(); setProductImage(null); setProductImageName(''); }} className="mt-2 text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4 border border-white/10">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-bold text-sm text-white">Drop product image here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse · PNG, JPG, WEBP</p>
                </>
              )}
            </div>

            {/* Prompt input */}
            <div className="flex flex-col gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Or describe your product...&#10;e.g. 'Sleek black leather handbag, made in Kenya, KES 2,500'"
                className="flex-1 w-full bg-white/3 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white placeholder:text-gray-600 resize-none outline-none focus:border-orange-500/50 focus:bg-white/5 transition-all min-h-[120px]"
              />
              {/* Audio upload */}
              <div
                onClick={() => audioInputRef.current?.click()}
                className="cursor-pointer rounded-xl border border-dashed border-white/10 hover:border-violet-500/40 p-4 flex items-center gap-3 transition-all hover:bg-violet-500/3"
              >
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAudioFile(f); }} />
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                  {audioFile ? <Music className="w-4 h-4 text-violet-400" /> : <Mic className="w-4 h-4 text-gray-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{audioFile ? audioFile.name : 'Add Audio (optional)'}</p>
                  <p className="text-[10px] text-gray-500">{audioFile ? 'Click to change' : 'Background music or voiceover · MP3, WAV'}</p>
                </div>
                {audioFile && <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="ml-auto text-gray-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Ad Style */}
        <div>
          <SectionLabel number={2} label="Choose Your Ad Vibe" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {AD_STYLES.map((style) => (
              <button
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                className={`rounded-2xl p-4 text-left border transition-all group ${
                  selectedStyle === style.key
                    ? 'border-orange-500/60 bg-orange-500/8 shadow-lg shadow-orange-500/10'
                    : 'border-white/5 glass hover:border-white/15'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-xl mb-3 shadow-md transition-transform group-hover:scale-110`}>
                  {style.emoji}
                </div>
                <p className="font-bold text-sm text-white">{style.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Character Style */}
        <div>
          <SectionLabel number={3} label="Kenyan Character Style" />
          <div className="flex flex-wrap gap-2 mt-3">
            {CHARACTER_STYLES.map((ch) => (
              <button
                key={ch.key}
                onClick={() => setSelectedCharacter(ch.key)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold border transition-all ${
                  selectedCharacter === ch.key
                    ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                    : 'border-white/8 glass text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{ch.label}</span>
                <span className="block text-[10px] font-normal text-gray-500 mt-0.5">{ch.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Output Format */}
        <div>
          <SectionLabel number={4} label="Output Format" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {OUTPUT_FORMATS.map((fmt) => (
              <button
                key={fmt.key}
                onClick={() => setSelectedFormat(fmt.key)}
                className={`rounded-xl p-4 text-center border transition-all ${
                  selectedFormat === fmt.key
                    ? 'border-cyan-500/50 bg-cyan-500/8 text-cyan-300'
                    : 'border-white/5 glass text-gray-400 hover:border-white/15 hover:text-white'
                }`}
              >
                <fmt.icon className="w-5 h-5 mx-auto mb-2" />
                <p className="text-xs font-bold">{fmt.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{fmt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2"
            >
              <X className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-orange-500 via-pink-600 to-violet-600 text-white font-black text-lg py-4 rounded-2xl shadow-2xl shadow-orange-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-glow-pulse"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> AI is cooking your ad...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate My Ad <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function SectionLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md shadow-orange-500/20">
        {number}
      </div>
      <span className="font-bold text-sm text-gray-200 uppercase tracking-wide">{label}</span>
    </div>
  );
}
