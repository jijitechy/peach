import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, ArrowLeft, Check, Hash } from 'lucide-react';
import { GeneratedAd } from './AdCreatorStudio';
import VideoPlayer from './VideoPlayer';
import BoostPanel from './BoostPanel';

interface AdPreviewPanelProps {
  ad: GeneratedAd;
  productImage: string | null;
  onBack: () => void;
  onRegenerate: () => void;
}

export default function AdPreviewPanel({ ad, productImage, onBack, onRegenerate }: AdPreviewPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const fullCaption = `${ad.caption}\n\n${ad.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pb-20">
      <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg glass-bright flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-300" />
        </button>
        <span className="font-display font-black text-base text-white">Your Ad is Ready 🔥</span>
        <button
          onClick={onRegenerate}
          className="ml-auto text-xs font-bold text-gray-400 hover:text-white glass border border-white/8 px-4 py-2 rounded-xl transition-all"
        >
          Create Another
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Video & Boost */}
        <div>
          {ad.operationName ? (
             <VideoPlayer operationName={ad.operationName} />
          ) : (
             <div className="w-full aspect-square glass rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-violet-950 opacity-50" />
                {productImage && <img src={productImage} alt="Product" className="absolute inset-0 w-full h-full object-contain" />}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <h2 className="font-display font-black text-2xl mb-1">{ad.headline}</h2>
                  <p className="text-gray-300 text-sm mb-3">{ad.subheadline}</p>
                </div>
             </div>
          )}
          
          <BoostPanel />
        </div>

        {/* RIGHT: Ad Copy */}
        <div className="space-y-4">
          <h3 className="font-display font-black text-lg text-white">Ad Copy</h3>
          <CopyCard label="Headline" value={ad.headline} copied={copiedField === 'headline'} onCopy={() => copyToClipboard(ad.headline, 'headline')} />
          <CopyCard label="Body Text" value={ad.bodyText} copied={copiedField === 'body'} onCopy={() => copyToClipboard(ad.bodyText, 'body')} multiline />
          <CopyCard label="Caption & Hashtags (ready to paste)" value={fullCaption} copied={copiedField === 'caption'} onCopy={() => copyToClipboard(fullCaption, 'caption')} multiline />
          
          {ad.videoScript && (
            <CopyCard label="🎬 Script / Storyboard" value={ad.videoScript} copied={copiedField === 'script'} onCopy={() => copyToClipboard(ad.videoScript!, 'script')} multiline accent />
          )}

          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Hash className="w-3 h-3" /> Hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {ad.hashtags.map((tag) => (
                <button key={tag} onClick={() => copyToClipboard(`#${tag.replace('#', '')}`, tag)} className="text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-colors">
                  #{tag.replace('#', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyCard({ label, value, copied, onCopy, multiline = false, accent = false }: { label: string; value: string; copied: boolean; onCopy: () => void; multiline?: boolean; accent?: boolean; }) {
  return (
    <div className={`glass rounded-xl border transition-all ${accent ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/8'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <button onClick={onCopy} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors">
          {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <div className="px-4 py-3">
        {multiline ? <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{value}</p> : <p className="text-sm font-bold text-white">{value}</p>}
      </div>
    </div>
  );
}
