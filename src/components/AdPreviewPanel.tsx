import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Download, Share2, RefreshCw, Instagram, ArrowLeft, Check, Smartphone, Monitor, Hash } from 'lucide-react';
import { GeneratedAd } from './AdCreatorStudio';

interface AdPreviewPanelProps {
  ad: GeneratedAd;
  productImage: string | null;
  onBack: () => void;
  onRegenerate: () => void;
}

type PreviewMode = 'instagram' | 'story' | 'tiktok' | 'whatsapp';

const PREVIEW_MODES: { key: PreviewMode; label: string; icon: React.ElementType; aspect: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, aspect: 'aspect-square' },
  { key: 'story', label: 'Story', icon: Smartphone, aspect: 'aspect-[9/16]' },
  { key: 'tiktok', label: 'TikTok', icon: Smartphone, aspect: 'aspect-[9/16]' },
  { key: 'whatsapp', label: 'WhatsApp', icon: Monitor, aspect: 'aspect-[4/3]' },
];

export default function AdPreviewPanel({ ad, productImage, onBack, onRegenerate }: AdPreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('instagram');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const fullCaption = `${ad.caption}\n\n${ad.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg glass-bright flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-300" />
        </button>
        <span className="font-display font-black text-base text-white">Your Ad is Ready 🔥</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white glass border border-white/8 px-3 py-2 rounded-xl transition-all hover:border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Ad Preview */}
        <div>
          {/* Format picker */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {PREVIEW_MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setPreviewMode(mode.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                  previewMode === mode.key
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                    : 'border-white/8 glass text-gray-500 hover:text-white hover:border-white/15'
                }`}
              >
                <mode.icon className="w-3.5 h-3.5" /> {mode.label}
              </button>
            ))}
          </div>

          {/* Ad Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={previewMode}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 ${PREVIEW_MODES.find(m => m.key === previewMode)?.aspect}`}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-gray-900 to-violet-950">
                {productImage && (
                  <img
                    src={productImage}
                    alt="Product"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                {productImage && (
                  <div className="flex-1 flex items-center justify-center mb-4">
                    <img
                      src={productImage}
                      alt="Product"
                      className="max-h-48 max-w-full object-contain drop-shadow-2xl rounded-2xl"
                    />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mb-1">AddSell Ad</p>
                  <h2 className="font-display font-black text-white text-xl leading-tight mb-1">{ad.headline}</h2>
                  <p className="text-gray-300 text-xs mb-3 leading-relaxed">{ad.subheadline}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg">
                      {ad.cta}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">addsell.co.ke</span>
                  </div>
                </div>
              </div>

              {/* Platform watermark */}
              <div className="absolute top-4 right-4">
                <div className="glass px-2 py-1 rounded-lg text-[9px] font-bold text-white/60 uppercase tracking-wider">
                  {previewMode}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Download/Share buttons */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" /> Download Ad
            </button>
            <button className="flex-1 glass border border-white/10 hover:border-white/25 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* RIGHT: Ad Copy */}
        <div className="space-y-4">
          <h3 className="font-display font-black text-lg text-white">Ad Copy & Assets</h3>

          {/* Headline */}
          <CopyCard
            label="Headline"
            value={ad.headline}
            copied={copiedField === 'headline'}
            onCopy={() => copyToClipboard(ad.headline, 'headline')}
          />

          {/* Body */}
          <CopyCard
            label="Body Text"
            value={ad.bodyText}
            copied={copiedField === 'body'}
            onCopy={() => copyToClipboard(ad.bodyText, 'body')}
            multiline
          />

          {/* Caption + Hashtags */}
          <CopyCard
            label="Caption + Hashtags (ready to paste)"
            value={fullCaption}
            copied={copiedField === 'caption'}
            onCopy={() => copyToClipboard(fullCaption, 'caption')}
            multiline
          />

          {/* Video Script (if present) */}
          {ad.videoScript && (
            <CopyCard
              label="🎬 Video Script / Storyboard"
              value={ad.videoScript}
              copied={copiedField === 'script'}
              onCopy={() => copyToClipboard(ad.videoScript!, 'script')}
              multiline
              accent
            />
          )}

          {/* Hashtags chips */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Hashtags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ad.hashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => copyToClipboard(`#${tag.replace('#', '')}`, tag)}
                  className="text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  #{tag.replace('#', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Image Prompt (for manual generation) */}
          <CopyCard
            label="🖼️ AI Image Prompt (use in Midjourney / DALL-E)"
            value={ad.imagePrompt}
            copied={copiedField === 'imgPrompt'}
            onCopy={() => copyToClipboard(ad.imagePrompt, 'imgPrompt')}
            multiline
          />
        </div>
      </div>
    </div>
  );
}

function CopyCard({
  label, value, copied, onCopy, multiline = false, accent = false
}: {
  label: string; value: string; copied: boolean; onCopy: () => void; multiline?: boolean; accent?: boolean;
}) {
  return (
    <div className={`glass rounded-xl border transition-all ${accent ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/8'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <div className="px-4 py-3">
        {multiline ? (
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-sm font-bold text-white">{value}</p>
        )}
      </div>
    </div>
  );
}
