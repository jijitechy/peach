import React from 'react';
import { Bot, ArrowUpRight, ArrowDownRight, Sparkles, Filter, ChevronDown } from 'lucide-react';

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const stats = [
    { label: 'Total Sales', value: 'KES 124,500', trend: '+18.4%', up: true },
    { label: 'Orders', value: '83', trend: '+12.5%', up: true },
    { label: 'Customers', value: '183', trend: '+24.3%', up: true },
    { label: 'Ad Spend', value: 'KES 8,430', trend: '-8.2%', up: false },
    { label: 'ROAS', value: '4.7x', trend: '+22.1%', up: true },
  ];

  const recentProducts = [
    { id: 1, name: 'HP EliteBook 840 G5', price: 'KES 30,000', stock: 'In Stock', views: 12, sold: 3, score: 88, img: 'https://images.unsplash.com/photo-1531297172864-fd87083bbd7c?w=400&h=300&fit=crop' },
    { id: 2, name: 'Black Sneakers', price: 'KES 4,500', stock: 'In Stock', views: 24, sold: 5, score: 78, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop' },
    { id: 3, name: 'iPhone 13', price: 'KES 48,000', stock: 'Low Stock', views: 18, sold: 2, score: 80, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Good afternoon, Nova! 👏
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's how your business is growing today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
          <span>May 12 – May 18, 2024</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-28">
            <p className="text-xs font-bold text-gray-500">{stat.label}</p>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">{stat.value}</h3>
              <p className={`text-[10px] font-bold flex items-center gap-1 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend} <span className="text-gray-400 font-normal">vs last 7 days</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-orange-100">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center shrink-0 text-[#FF6B35]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-orange-950 flex items-center gap-2">AI Growth Assistant</h3>
            <p className="text-sm text-orange-800/80 mt-0.5">Your HP laptops are performing 2.7x better than your other products.</p>
          </div>
        </div>
        <button className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#e85a24] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 transition-colors whitespace-nowrap">
          View Recommendation
        </button>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Recent Products</h3>
            <button onClick={() => onNavigate('products')} className="text-xs font-bold text-[#FF6B35] hover:text-[#e85a24]">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProducts.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="aspect-[4/3] bg-gray-50 relative">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-orange-900 text-[10px] font-black px-2 py-1 rounded-lg border border-orange-100 flex flex-col items-center leading-tight shadow-sm">
                    <span>AI Score</span>
                    <span className="text-[#FF6B35] text-xs">{p.score}/100</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{p.name}</h4>
                  <p className="text-base font-black text-gray-900 mb-2">{p.price}</p>
                  <p className={`text-[10px] font-bold mb-3 ${p.stock === 'In Stock' ? 'text-green-600 bg-green-50 w-max px-2 py-0.5 rounded' : 'text-orange-600 bg-orange-50 w-max px-2 py-0.5 rounded'}`}>
                    {p.stock}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium mt-auto border-t border-gray-100 pt-3">
                    <span>{p.views} Views</span>
                    <span>{p.sold} Sold</span>
                    <span className="text-[10px] font-black text-[#FF6B35]">AI Score {p.score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-[#FF6B35] mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">AI Ad Manager</h3>
            <p className="text-sm text-gray-500 mb-6">Create high-converting advertisements for your products in minutes.</p>
            <button onClick={() => onNavigate('studio')} className="w-full bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-orange-600/20">
              Create AI Ad
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6">Sales Funnel</h3>
            <div className="flex items-center gap-4">
              {/* Visual Funnel */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="w-full h-8 bg-orange-100 rounded-t-lg"></div>
                <div className="w-4/5 h-8 bg-orange-200"></div>
                <div className="w-3/5 h-8 bg-orange-300"></div>
                <div className="w-2/5 h-8 bg-orange-400"></div>
                <div className="w-1/4 h-8 bg-[#FF6B35] rounded-b-lg"></div>
                <Filter className="w-16 h-16 text-[#FF6B35] absolute opacity-10" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">6.4%</p>
                <p className="text-xs text-gray-500 font-bold">Conversion Rate</p>
                <p className="text-[10px] text-green-600 font-bold flex items-center justify-end gap-1 mt-1"><ArrowUpRight className="w-3 h-3" /> 1.2%</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
