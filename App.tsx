import React, { useState, useEffect } from 'react';
import { AppSection } from './types';
import { Sidebar } from './components/Sidebar';
import { ImageStudio } from './components/ImageStudio';
import { ProductFusion } from './components/ProductFusion';
import { Analysis } from './components/Analysis';
import { BrainAI } from './components/BrainAI';
import { RotationLab } from './components/RotationLab';
import { OutfitChanger } from './components/OutfitChanger';
import { Menu, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.IMAGE_STUDIO);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [renderSplash, setRenderSplash] = useState(true);

  // Handle Splash Screen Unmount
  useEffect(() => {
    if (!showSplash) {
      const timer = setTimeout(() => {
        setRenderSplash(false);
      }, 700); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppSection.PRODUCT_FUSION:
        return <ProductFusion />;
      case AppSection.OUTFIT_CHANGER:
        return <OutfitChanger />;
      case AppSection.ANALYSIS:
        return <Analysis />;
      case AppSection.BRAIN_AI:
        return <BrainAI />;
      case AppSection.ROTATION_LAB:
        return <RotationLab />;
      default:
        return <ImageStudio />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50" dir="rtl">
      
      {/* Global Splash Screen */}
      {renderSplash && (
        <div 
            className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out
            ${showSplash ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
            }}
        >
            <div className="text-center animate-fade-in flex flex-col items-center w-full max-w-4xl px-4 relative">
                
                {/* Circular Animation Container */}
                {/* Increased size to fit button comfortably inside */}
                <div className="relative w-[340px] h-[340px] md:w-[600px] md:h-[600px] flex items-center justify-center" dir="ltr">
                    
                    {/* 1. Rotating Ring Text (Background Layer) */}
                    <div className="absolute inset-0 animate-spin-slow pointer-events-none opacity-90">
                         <svg className="w-full h-full overflow-visible" viewBox="0 0 500 500">
                             <defs>
                                 <path id="textCircle" d="M 250, 250 m -200, 0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0" fill="none"/>
                                 <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#FFD700" />
                                    <stop offset="50%" stopColor="#FBF5B7" />
                                    <stop offset="100%" stopColor="#AA771C" />
                                </linearGradient>
                             </defs>
                             <text className="text-[14px] md:text-[17px] font-bold tracking-[3px] uppercase" fill="url(#goldGradient)">
                                 <textPath href="#textCircle" startOffset="0%">
                                     منصة تختصر عليك الوقت لتركز في تسويق منتجاتك ✦ أطلق العنان لرؤيتك، ودعنا نبتكر المشهد ✦
                                 </textPath>
                             </text>
                         </svg>
                    </div>
                    
                    {/* 2. Static Center Content (Foreground Layer) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4" dir="rtl">
                        
                        {/* Glowing Orb Background behind logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-80 md:h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse -z-10"></div>

                        {/* Logo */}
                        <img 
                            src="/Mariam_women_kids.jpg" 
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                            alt="Mariam Women & Kids" 
                            className="h-20 w-20 md:h-28 md:w-28 object-contain drop-shadow-2xl mb-2 rounded-full border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                        />
                        
                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg leading-tight tracking-tight mt-2">
                            MARIAM
                        </h1>
                        <span className="text-xs md:text-lg font-bold text-yellow-100 tracking-[0.3em] uppercase mb-8">
                            WOMEN & KIDS
                        </span>

                        {/* Start Button - Centered Inside the Ring */}
                        <button 
                            onClick={() => setShowSplash(false)}
                            className="group relative px-8 py-3 md:px-12 md:py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white rounded-full text-lg md:text-xl font-black shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] transition-all hover:scale-105 active:scale-95 overflow-hidden border border-yellow-300/30"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                ابدأ الآن <Sparkles size={20} className="animate-pulse"/>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>

                    </div>
                </div>

            </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-2">
            <img src="/Mariam_women_kids.jpg" className="h-10 w-10 object-cover rounded-full border border-yellow-200" alt="Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800">MARIAM W&K</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-40 top-0 right-0 h-full md:h-auto
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsMobileMenuOpen(false);
          }} 
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto md:mr-[280px] transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto animate-fade-in">
          
          {/* HEADER BANNER - Consistent across all pages */}
          <div 
            className="w-full h-[180px] md:h-[220px] rounded-[30px] mb-10 relative shadow-[0_20px_60px_rgba(191,149,63,0.15)] overflow-hidden bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#2a2a2a] border border-yellow-600/30 group"
          >
             {/* Content Container */}
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
                <h1 className="text-xs md:text-sm font-medium text-yellow-500/80 mb-2 tracking-[0.3em] uppercase">
                    مرحباً بالجميع مع
                </h1>
                
                <div className="flex items-center gap-4 md:gap-6 justify-center transition-transform duration-500 group-hover:scale-105">
                     <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <img 
                            src="/Mariam_women_kids.jpg" 
                            className="h-20 w-20 md:h-28 md:w-28 object-cover rounded-full border-2 border-yellow-500/50 relative z-10 shadow-2xl" 
                            alt="Logo"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                     </div>
                     <div className="flex flex-col items-start">
                        <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 tracking-tight drop-shadow-sm leading-none">
                            MARIAM
                        </span>
                        <span className="text-sm md:text-xl font-bold text-yellow-100 tracking-[0.4em] uppercase mt-1">
                            WOMEN & KIDS
                        </span>
                     </div>
                </div>
             </div>
             
             {/* Decorative Background Elements */}
             <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"></div>
             
             {/* Sparkles overlay */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          </div>

          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default App;