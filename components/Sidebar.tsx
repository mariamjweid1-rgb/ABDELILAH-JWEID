import React from 'react';
import { AppSection } from '../types';
import { Camera, ShoppingBag, Search, BrainCircuit, RotateCw, Shirt, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  
  const navItems = [
    { id: AppSection.IMAGE_STUDIO, label: 'استوديو الصور', icon: Camera, desc: 'توليد وتعديل الصور' },
    { id: AppSection.PRODUCT_FUSION, label: 'دمج المنتجات', icon: ShoppingBag, desc: 'دمج ذكي للمنتجات' },
    { id: AppSection.OUTFIT_CHANGER, label: 'تبديل الملابس', icon: Shirt, desc: 'تجربة ملابس افتراضية' },
    { id: AppSection.ROTATION_LAB, label: 'مختبر تدوير', icon: RotateCw, desc: 'أدوات التدوير والـ 3D' },
    { id: AppSection.ANALYSIS, label: 'التحليل الذكي', icon: Search, desc: 'فحص وتحليل الصور' },
    { id: AppSection.BRAIN_AI, label: 'العقل المبدع', icon: BrainCircuit, desc: 'هندسة البرومبت' },
  ];

  return (
    <div className="w-[280px] h-screen bg-white border-l border-gray-200 flex flex-col p-6 shadow-xl md:shadow-none fixed right-0 top-0 overflow-y-auto z-50">
      
      {/* Branding Section */}
      <div className="mb-10 flex flex-col items-center gap-4 pt-8 pb-8 border-b border-dashed border-gray-100">
        <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-yellow-400/50 overflow-hidden p-1 relative group transform hover:scale-105 transition-transform">
             <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 to-white opacity-50 group-hover:opacity-0 transition-opacity"></div>
             <img 
                src="/Mariam_women_kids.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {e.currentTarget.style.display = 'none';}} 
             />
             {/* Fallback Text if image fails */}
             <div className="absolute inset-0 flex items-center justify-center -z-0">
                <span className="text-5xl font-black text-yellow-500">M</span>
             </div>
        </div>
        <div className="text-center w-full">
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700 mb-2 leading-none drop-shadow-sm">MARIAM</h1>
            <span className="text-xs font-bold text-white tracking-[0.25em] uppercase block bg-yellow-500 px-3 py-1.5 rounded-full shadow-md mx-auto w-fit">
                Women & Kids
            </span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gray-900 text-white shadow-lg translate-x-[-5px]' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon size={22} className={`${isActive ? 'text-yellow-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <div className="text-right">
                <div className="font-bold text-base">{item.label}</div>
                <div className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>{item.desc}</div>
              </div>
              {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100 text-center shadow-sm">
            <p className="text-xs text-yellow-700 font-semibold mb-1">مدعوم بواسطة</p>
            <p className="text-sm font-bold text-gray-800 flex items-center justify-center gap-1">
                 Gemini 2.5 <Sparkles size={12} className="text-yellow-500"/>
            </p>
        </div>
      </div>
    </div>
  );
};