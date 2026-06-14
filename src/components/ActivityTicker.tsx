import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp, Award, Radio } from "lucide-react";

interface Activity {
  id: string;
  type: 'bid_placed' | 'bid_won' | 'listing_created' | 'bid_selected';
  message: string;
  timestamp: string;
}

export default function ActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error("Error loading activities ticker:", e);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // refresh list every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4500); // rotate item every 4.5s
    return () => clearInterval(rotateInterval);
  }, [activities]);

  if (activities.length === 0) return null;
  const currentActivity = activities[currentIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case "bid_won":
        return <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case "bid_selected":
        return <Award className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case "listing_created":
        return <Sparkles className="w-3.5 h-3.5 text-[#f97316] shrink-0" />;
      case "bid_placed":
      default:
        return <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  const badgeBg = (type: string) => {
    switch (type) {
      case "bid_won":
        return "bg-emerald-100 text-emerald-900 border-emerald-205";
      case "bid_selected":
        return "bg-purple-100 text-purple-900 border-purple-205";
      case "listing_created":
        return "bg-orange-100 text-orange-950 border-orange-205";
      case "bid_placed":
      default:
        return "bg-amber-100 text-amber-900 border-amber-205";
    }
  };

  return (
    <div className="bg-gray-900 text-white select-none border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs overflow-hidden">
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]"></span>
          </span>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#f97316] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#f97316]" /> Peach Live Streams
          </span>
        </div>

        {/* Dynamic Activity message carousel */}
        <div className="flex-1 px-4 text-center md:text-left truncate">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentActivity.id + "-" + currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2.5 max-w-full justify-center md:justify-start"
            >
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${badgeBg(currentActivity.type)}`}>
                {currentActivity.type.replace("_", " ")}
              </span>
              
              <span className="text-gray-200 text-[11px] font-medium truncate tracking-tight inline-flex items-center gap-1.5">
                {getIcon(currentActivity.type)}
                {currentActivity.message}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action / Quick Activity feed modal trigger */}
        <div className="hidden md:flex items-center gap-3 font-mono text-[10px] text-gray-400">
          <span>Active Escrow Safety Vault ✔</span>
        </div>

      </div>
    </div>
  );
}
