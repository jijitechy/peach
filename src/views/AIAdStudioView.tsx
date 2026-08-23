import React, { useState } from 'react';
import { Sparkles, ChevronDown, Check, Play, User, PlayCircle, Film, Diamond, TrendingUp, Loader2 } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

export default function AIAdStudioView() {
  const [selectedStyle, setSelectedStyle] = useState('ugc');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [operationName, setOperationName] = useState<string | null>(null);

  const styles = [
    { id: 'viral', label: 'Viral', icon: TrendingUp },
    { id: 'ugc', label: 'UGC', icon: User },
    { id: 'comedy', label: 'Comedy', icon: PlayCircle },
    { id: 'cinematic', label: 'Cinematic', icon: Film },
    { id: 'luxury', label: 'Luxury', icon: Diamond },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowResults(true);
    setOperationName(null);
    try {
      const vidRes = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "HP EliteBook 840 G5",
          style: selectedStyle,
          characterStyle: 'corporate_nairobi'
        }),
      });
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        setOperationName(vidData.operationName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Ad Studio</h1>
        <p className="text-sm text-gray-500">Turn your product into high-converting advertisements</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs">1</div>
            <h3 className="text-sm font-bold text-gray-900">Select Product</h3>
          </div>
          <div className="ml-9">
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-[#FF6B35] transition-colors shadow-sm">
                <option>HP EliteBook 840 G5 - Core i7, 16GB RAM, 512GB SSD</option>
                <option>Black Sneakers - Size 42</option>
                <option>iPhone 13 - 128GB Midnight</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs">2</div>
            <div className="flex-1 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Choose Ad Styles</h3>
              <span className="text-[10px] text-gray-500">Select the style of advertisements you want to create:</span>
            </div>
          </div>
          <div className="ml-9 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {styles.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedStyle === style.id
                    ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-[#FF6B35]" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedStyle === style.id ? 'bg-white/20' : 'bg-orange-50 text-[#FF6B35]'}`}>
                  <style.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#FF6B35] hover:bg-[#e85a24] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {isGenerating ? 'Generating...' : 'Generate Ads'} <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">AI Generated Advertisement Concepts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Generated Video (Live) */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-md border border-gray-100">
                {operationName ? (
                  <div className="absolute inset-0 w-full h-full [&>div]:h-full [&>div]:rounded-none [&>div]:border-none">
                    <VideoPlayer operationName={operationName} />
                  </div>
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mb-2" />
                    <p className="text-xs font-bold">Starting generation...</p>
                  </div>
                )}
                {!operationName && (
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded capitalize">{selectedStyle}</div>
                )}
              </div>
              <button className="w-full bg-[#fff3ee] border border-transparent hover:border-[#FF6B35] hover:text-[#FF6B35] text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors shadow-sm">
                Use This Ad
              </button>
            </div>

            {/* Ad Concept 2 */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-md border border-gray-100">
                <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=700&fit=crop" alt="Cinematic Video" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">Cinematic</div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-black text-xl leading-tight mb-2 tracking-wide uppercase text-center w-full">Power<br/>Meets<br/>Reliability</h4>
                </div>
              </div>
              <button className="w-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors shadow-sm">
                Use This Ad
              </button>
            </div>

            {/* Ad Concept 3 */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden group shadow-md border border-gray-100">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=700&fit=crop" alt="Comedy Video" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">Comedy / Meme</div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <h4 className="text-white font-bold text-sm leading-tight mb-1">When your laptop just works...</h4>
                  <p className="text-white/80 text-[10px]">No more freezing during Zoom calls 😭</p>
                </div>
              </div>
              <button className="w-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35] text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors shadow-sm">
                Use This Ad
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
