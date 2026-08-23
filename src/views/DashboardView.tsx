import React from 'react';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const steps = [
    {
      icon: Sparkles,
      title: 'Describe Your Product',
      desc: 'Enter a product name or description — our AI does the rest.',
    },
    {
      icon: Zap,
      title: 'Generate Video Ads',
      desc: 'Choose a style and let AI create multiple high-converting video ads in seconds.',
    },
    {
      icon: TrendingUp,
      title: 'Boost to Social Media',
      desc: 'Publish and boost your ad directly to TikTok, Instagram, and Facebook.',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">

      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-[#FF6B35] text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Ad Generation
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
          Turn Any Product Into a<br />
          <span className="text-[#FF6B35]">Viral Video Ad</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          AddSell creates scroll-stopping video ads for your products and boosts them across social media — all with AI.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => onNavigate('studio')}
        className="bg-[#FF6B35] hover:bg-[#e85a24] text-white px-10 py-4 rounded-2xl text-base font-black shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-100 flex items-center gap-2 mb-16"
      >
        <Sparkles className="w-5 h-5" />
        Create Your First Ad
      </button>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35] mb-4">
              <step.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest mb-2">Step {i + 1}</p>
            <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
