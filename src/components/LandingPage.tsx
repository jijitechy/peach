import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Video, Image, Mic, ArrowRight, Play, Star, Globe2, TrendingUp, Users } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const SAMPLE_ADS = [
  { label: '😂 Funny', color: 'from-yellow-500 to-orange-500', emoji: '😂', desc: 'Relatable Kenyan humour that stops the scroll' },
  { label: '💼 Serious', color: 'from-blue-600 to-indigo-700', emoji: '💼', desc: 'Professional, brand-forward business ads' },
  { label: '🎬 Cinematic', color: 'from-gray-800 to-gray-900', emoji: '🎬', desc: 'High-quality visual storytelling & drama' },
  { label: '🎨 Cartoon', color: 'from-pink-500 to-violet-600', emoji: '🎨', desc: 'Bold animated characters, African style' },
  { label: '💎 Luxury', color: 'from-amber-600 to-yellow-400', emoji: '💎', desc: 'Premium aesthetics for high-end products' },
  { label: '⚡ Flash Sale', color: 'from-red-600 to-orange-500', emoji: '⚡', desc: 'Urgent, high-energy promotional ads' },
];

const FEATURES = [
  { icon: Image, title: 'Upload Any Product Photo', desc: 'Drag-and-drop your product image and let the AI do the heavy lifting.', color: 'text-orange-400' },
  { icon: Sparkles, title: 'AI Generates Your Ad', desc: 'Get compelling copy, captions, CTAs and image variations instantly.', color: 'text-violet-400' },
  { icon: Users, title: 'Kenyan Characters & Vibes', desc: 'AI-generated people are African by default — relatable to your market.', color: 'text-cyan-400' },
  { icon: Video, title: 'Video & Image Output', desc: 'Get video scripts, storyboards and image ads ready for any platform.', color: 'text-green-400' },
  { icon: Mic, title: 'Add Your Own Audio', desc: 'Upload background music or a voiceover to personalize your ad.', color: 'text-pink-400' },
  { icon: Globe2, title: 'Multi-Platform Ready', desc: 'Sized for Instagram, TikTok, WhatsApp Status, Facebook & more.', color: 'text-amber-400' },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeStyle, setActiveStyle] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-lg text-white tracking-tight">AddSell</span>
            <span className="text-[10px] font-bold text-orange-400 border border-orange-400/30 rounded-full px-2 py-0.5 ml-1">AI</span>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-4 h-4" /> Create Ad Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background aurora */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-300 tracking-wide">Kenya's #1 AI Ad Creator</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6">
              Create Fire{' '}
              <span className="gradient-text">Kenyan Ads</span>
              <br />with AI in Seconds
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your product photo. Pick your vibe — funny, serious, cartoon, luxury.
              Get a scroll-stopping ad with African characters, Kenyan flavour.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="animate-glow-pulse bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-orange-500/30 flex items-center gap-3"
              >
                <Zap className="w-5 h-5" /> Start Creating — It's Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <button className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
                <div className="w-10 h-10 glass rounded-full flex items-center justify-center border border-white/10 hover:border-white/25 transition-colors">
                  <Play className="w-4 h-4 text-orange-400 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Loved by 2,000+ Kenyan sellers</span>
              <span className="hidden sm:block w-px h-4 bg-gray-700" />
              <span className="hidden sm:flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-400" /> 10,000+ Ads Generated</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Style Picker Showcase */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">Pick Your <span className="gradient-text">Ad Vibe</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto">From silly memes to cinematic product films — AddSell generates ads in every style your brand needs.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SAMPLE_ADS.map((style, i) => (
            <motion.div
              key={style.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveStyle(i)}
              className={`relative cursor-pointer rounded-2xl p-6 border transition-all ${
                activeStyle === i
                  ? 'border-orange-500/50 bg-orange-500/5 shadow-lg shadow-orange-500/10'
                  : 'border-white/5 glass hover:border-white/15'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {style.emoji}
              </div>
              <h3 className="font-bold text-white mb-1">{style.label}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{style.desc}</p>
              {activeStyle === i && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-orange-500" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">Everything You Need to <span className="gradient-text">Sell More</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto">One platform, all the tools to create Kenyan ads that actually convert.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:border-white/15 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-xl glass-bright flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{feat.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-orange-500/15 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-violet-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">Ready to Create Your First Ad?</h2>
            <p className="text-gray-400 mb-8">No account needed. Upload a photo, pick your style, get your ad.</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onGetStarted}
              className="bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-lg px-10 py-4 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-5 h-5" /> Create My Ad Now <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-gray-600">
        © 2026 AddSell AI — Made for Kenya 🇰🇪
      </footer>
    </div>
  );
}
