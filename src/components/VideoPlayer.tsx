import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Download, Video, CheckCircle2 } from 'lucide-react';

interface VideoPlayerProps {
  operationName: string;
}

const LOADING_MESSAGES = [
  "🎬 Setting the scene in Nairobi...",
  "🎨 Adding African character styles...",
  "✨ Generating cinematic frames...",
  "⚡ Rendering your video ad...",
  "🔥 Almost done cooking..."
];

export default function VideoPlayer({ operationName }: VideoPlayerProps) {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (status === 'loading') {
      interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (!operationName) return;
    
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/ai/video-status/${encodeURIComponent(operationName)}`);
        if (!res.ok) throw new Error('Polling failed');
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (data.done) {
          if (data.video) {
            setVideoUrl(data.video);
            setStatus('done');
          } else {
            setErrorMsg(data.error?.message || 'Video generation failed.');
            setStatus('error');
          }
        } else {
          // Poll again in 10s
          setTimeout(poll, 10000);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Error checking video status');
        setStatus('error');
      }
    };
    
    poll();
    
    return () => { isMounted = false; };
  }, [operationName]);

  if (status === 'loading') {
    return (
      <div className="w-full aspect-[16/9] glass rounded-3xl border border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-violet-500/5" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 border border-orange-500/30">
            <Video className="w-8 h-8 text-orange-400 animate-pulse" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-white font-bold text-lg mb-4"
            >
              {LOADING_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>

          <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-pink-600 rounded-full animate-progress-bar" />
          </div>
          
          <p className="text-xs text-gray-500 mt-4 max-w-xs leading-relaxed">
            AI video generation usually takes 60–120 seconds. Feel free to copy your captions below while you wait.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full aspect-[16/9] glass rounded-3xl border border-red-500/20 flex flex-col items-center justify-center p-8 text-center bg-red-500/5">
        <p className="text-red-400 font-bold mb-2">Failed to generate video</p>
        <p className="text-sm text-gray-400">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden relative group shadow-2xl shadow-black/50 border border-white/10 bg-black">
      <video 
        src={videoUrl || undefined}
        className="w-full h-full object-cover"
        controls
        autoPlay
        loop
        playsInline
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={videoUrl || '#'} 
          download="addsell-ad.mp4"
          className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black/80 transition-colors"
        >
          <Download className="w-4 h-4" /> Download
        </a>
      </div>
    </div>
  );
}
