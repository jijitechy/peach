import React, { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import DashboardView from "./views/DashboardView";
import AIAdStudioView from "./views/AIAdStudioView";

type View = "dashboard" | "studio" | "campaigns" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={(view) => setCurrentView(view as View)} />;
      case "studio":
        return <AIAdStudioView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
            <h2 className="text-xl font-bold mb-2 capitalize">{currentView}</h2>
            <p className="text-sm">Coming soon.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout currentView={currentView} onNavigate={(view) => setCurrentView(view as View)}>
      {renderView()}
    </DashboardLayout>
  );
}
