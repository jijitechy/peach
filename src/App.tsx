import React, { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import DashboardView from "./views/DashboardView";
import ProductsView from "./views/ProductsView";
import AIAdStudioView from "./views/AIAdStudioView";

type View = "dashboard" | "products" | "studio" | "campaigns" | "orders" | "customers" | "analytics" | "finance" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={(view) => setCurrentView(view as View)} />;
      case "products":
        return <ProductsView />;
      case "studio":
        return <AIAdStudioView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
            <h2 className="text-xl font-bold mb-2 capitalize">{currentView} View</h2>
            <p className="text-sm">This view is currently under construction.</p>
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
