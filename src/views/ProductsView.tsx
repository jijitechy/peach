import React from 'react';
import { Upload, Sparkles, MoveRight } from 'lucide-react';

export default function ProductsView() {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10 max-w-2xl mx-auto">
        <div className="flex items-center text-indigo-600 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2 text-xs">1</div>
          Upload Product
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center text-gray-400 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-2 text-xs">2</div>
          AI Analysis
        </div>
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        <div className="flex items-center text-gray-400 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-2 text-xs">3</div>
          Review & Publish
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Image Upload Area */}
          <div className="p-8 border-r border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-full max-w-sm aspect-[4/3] bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors group relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1531297172864-fd87083bbd7c?w=600&h=450&fit=crop" alt="Laptop" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             
             <button className="mt-6 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl px-6 py-2 bg-white hover:bg-gray-50 flex items-center gap-2">
               <Upload className="w-4 h-4" /> Upload Another Product
             </button>
          </div>

          {/* Right: AI Form */}
          <div className="p-8 relative">
             <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase border border-orange-200">
               <Sparkles className="w-3 h-3" /> AI PRE-FILL ACTIVE
             </div>
             
             <div className="mb-6 mt-2">
               <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">AI</div>
                 AI is Analyzing Your Product...
               </h3>
               <div className="mt-4 space-y-2 text-sm text-gray-600">
                 <p className="flex items-center gap-2"><span className="text-indigo-600">✓</span> Identifying product details...</p>
                 <p className="flex items-center gap-2"><span className="text-indigo-600">✓</span> Detecting brand and model...</p>
                 <p className="flex items-center gap-2"><span className="text-indigo-600">✓</span> Extracting specifications...</p>
                 <p className="flex items-center gap-2"><span className="text-indigo-600">✓</span> Generating description...</p>
               </div>
             </div>

             <div className="h-px w-full bg-gray-100 my-8"></div>

             <h4 className="text-lg font-bold text-gray-900 mb-6">AI Generated Product Information</h4>
             
             <div className="space-y-5 text-sm">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Product Title</label>
                   <input type="text" className="w-full border-b border-gray-200 py-1 font-medium text-gray-900 focus:outline-none focus:border-indigo-600 bg-transparent" defaultValue="HP EliteBook 840 G5 - Core i7, 16GB RAM, 512GB SSD - Business Laptop" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                   <select className="w-full border-b border-gray-200 py-1 font-medium text-gray-900 focus:outline-none focus:border-indigo-600 bg-transparent">
                     <option>Electronics &gt; Laptops</option>
                   </select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Condition</label>
                   <select className="w-full border-b border-gray-200 py-1 font-medium text-gray-900 focus:outline-none focus:border-indigo-600 bg-transparent">
                     <option>Good</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Brand</label>
                   <input type="text" className="w-full border-b border-gray-200 py-1 font-medium text-gray-900 focus:outline-none focus:border-indigo-600 bg-transparent" defaultValue="HP" />
                 </div>
               </div>

               <div>
                 <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Product Description</label>
                 <textarea rows={4} className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-indigo-600 bg-gray-50/50 resize-none" defaultValue="The HP EliteBook 840 G5 is a premium business laptop designed for performance and reliability. Powered by an Intel Core i7 processor, 16GB RAM and 512GB SSD, it delivers fast and smooth performance for work, study and everyday use. With its slim and durable design, long battery life and professional build quality, it's the perfect laptop for business users and students." />
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Key Specifications</label>
                   <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                     <li>Processor: Intel Core i7</li>
                     <li>RAM: 16GB</li>
                     <li>Storage: 512GB SSD</li>
                     <li>Display: 14-inch</li>
                     <li>Operating System: Windows 10/11</li>
                     <li>Condition: Good</li>
                   </ul>
                 </div>
                 <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Suggested Price</label>
                      <input type="text" className="w-full border-b border-gray-200 py-1 font-black text-indigo-900 text-lg focus:outline-none focus:border-indigo-600 bg-transparent" defaultValue="KES 28,000 - 32,000" />
                    </div>
                    <div className="mt-4">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Advertisement Copy</label>
                      <p className="text-xs text-gray-600 border border-gray-100 bg-gray-50 p-2 rounded-lg italic">"Power. Performance. Reliability. Get the HP EliteBook 840 G5 today - perfect for work and study."</p>
                    </div>
                 </div>
               </div>

               <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                 <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors">
                   Publish Listing <MoveRight className="w-4 h-4" />
                 </button>
               </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
