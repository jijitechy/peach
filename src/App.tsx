import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import AdCreatorStudio from "./components/AdCreatorStudio";
import AdPreviewPanel from "./components/AdPreviewPanel";
import type { GeneratedAd } from "./components/AdCreatorStudio";

type AppView = "landing" | "studio" | "preview";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);

  const handleAdGenerated = (ad: GeneratedAd, image: string | null) => {
    setGeneratedAd(ad);
    setProductImage(image);
    setView("preview");
  };

  const handleRegenerate = () => {
    setView("studio");
  };

  return (
    <>
      {view === "landing" && (
        <LandingPage onGetStarted={() => setView("studio")} />
      )}
      {view === "studio" && (
        <AdCreatorStudio onAdGenerated={handleAdGenerated} />
      )}
      {view === "preview" && generatedAd && (
        <AdPreviewPanel
          ad={generatedAd}
          productImage={productImage}
          onBack={() => setView("studio")}
          onRegenerate={handleRegenerate}
        />
      )}
    </>
  );
}
