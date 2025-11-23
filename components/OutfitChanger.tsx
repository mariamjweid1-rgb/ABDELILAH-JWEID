import React, { useState, useRef, useEffect } from 'react';
import { changeOutfit } from '../services/geminiService';
import { Download, Shirt, Upload, Check, AlertTriangle, RefreshCw } from 'lucide-react';

export const OutfitChanger: React.FC = () => {
  // --- State ---
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [clothesFile, setClothesFile] = useState<File | null>(null);
  
  const [gender, setGender] = useState('رجالي');
  const [background, setBackground] = useState('نفس الخلفية الأصلية');
  const [hiddenModel, setHiddenModel] = useState('غير مفعل');
  const [userPrompt, setUserPrompt] = useState('');
  const [dlQuality, setDlQuality] = useState('2048');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([]); // Null means failed/placeholder
  const [errors, setErrors] = useState<string[]>([]); // To track errors per pose
  
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [clothesPreview, setClothesPreview] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // For Slider Width Calculation using ResizeObserver
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const personInputRef = useRef<HTMLInputElement>(null);
  const clothesInputRef = useRef<HTMLInputElement>(null);

  // Define the poses labels mapping
  const posesLabels = ["وضعية وقوف (Standing)", "وضعية جلوس (Sitting)", "وضعية استعراضية (Showcase)"];

  const mainResult = results.length > 0 ? results[activeResultIndex] : null;

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mainResult, personPreview]);

  const handlePersonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setPersonFile(e.target.files[0]);
        setPersonPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClothesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setClothesFile(e.target.files[0]);
        setClothesPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const runMoussa = async () => {
    if (!personFile || !clothesFile) {
        alert("❗ لازم ترفع صورة الشخص وصورة الملابس");
        return;
    }

    setLoading(true);
    setResults([null, null, null]); // Reset with placeholders
    setErrors([]);
    setActiveResultIndex(0);

    try {
        // We run requests individually to catch errors per pose without failing the whole batch
        const runPose = async (posePrompt: string) => {
            try {
                return await changeOutfit(
                    personFile, clothesFile, gender, background, hiddenModel, userPrompt, posePrompt
                );
            } catch (err) {
                console.error("Error for pose:", posePrompt, err);
                return null;
            }
        };

        const [res1, res2, res3] = await Promise.all([
            // 1. Standing
            runPose("Full body STANDING pose, facing camera, arms relaxed, clear view of outfit."),
            // 2. Sitting
            runPose("SITTING pose on a simple chair/surface, relaxed, natural folds in clothing."),
            // 3. Showcase
            runPose("Dynamic FASHION SHOWCASE pose, 3/4 angle, model walking or posing confidently to highlight garment details.")
        ]);

        const newResults = [res1, res2, res3];
        setResults(newResults);
        
        // Auto-select the first successful result
        const firstSuccess = newResults.findIndex(r => r !== null);
        if (firstSuccess !== -1) {
            setActiveResultIndex(firstSuccess);
        }

        // Check if all failed
        if (newResults.every(r => r === null)) {
            alert("عذراً، لم نتمكن من توليد الصور. يرجى التأكد من وضوح الصور ومحاولة المحاولة مرة أخرى.");
        } else {
            setSliderValue(50);
        }

    } catch (e) {
        console.error(e);
        alert("حدث خطأ غير متوقع أثناء المعالجة.");
    } finally {
        setLoading(false);
    }
  };

  const downloadImage = () => {
    const finalImage = results[activeResultIndex];
    if (!finalImage) {
        alert("لا توجد صورة للتحميل");
        return;
    }

    const width = parseInt(dlQuality);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = finalImage;
    
    // Logo path - Ensure it matches exactly the file in public
    const logoUrl = "/Mariam_women_kids.jpg"; 

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const aspect = img.naturalHeight / img.naturalWidth;
        const targetHeight = width * aspect;

        canvas.width = width;
        canvas.height = targetHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw Main Image
        ctx.drawImage(img, 0, 0, width, targetHeight);

        // Function to save final canvas
        const saveCanvas = () => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            // Include Pose Name in filename
            const poseName = posesLabels[activeResultIndex].split('(')[1].replace(')', '');
            a.download = `mariam_style_${poseName}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        // --- Watermark Logic ---
        const drawWatermark = (imageObj?: HTMLImageElement) => {
            const padding = width * 0.03; // 3% padding from edge

            if (imageObj) {
                // 1. DRAW LOGO IMAGE
                // Size: Small (10% of width) for elegance
                const logoWidth = width * 0.12; 
                const logoAspect = imageObj.naturalHeight / imageObj.naturalWidth;
                const logoHeight = logoWidth * logoAspect;

                // Position: Bottom Left
                const x = padding;
                const y = targetHeight - logoHeight - padding;

                // Shadow for visibility
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Draw Circular Clip for Logo
                ctx.save();
                ctx.beginPath();
                // Draw logo rectangle
                ctx.drawImage(imageObj, x, y, logoWidth, logoHeight);
                ctx.restore();
                
                ctx.shadowColor = "transparent";

            } else {
                // 2. FALLBACK: DRAW GOLDEN TEXT
                // Only if image fails to load
                const fontSize = Math.max(24, width * 0.04); 
                ctx.font = `900 ${fontSize}px 'Tajawal', sans-serif`;
                const text = "MARIAM WOMEN & KIDS";
                
                const x = padding;
                const y = targetHeight - padding;
                
                // Strong Shadow
                ctx.shadowColor = "rgba(0,0,0,0.9)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                
                // Gold Gradient Text
                const gradient = ctx.createLinearGradient(x, y - fontSize, x + ctx.measureText(text).width, y);
                gradient.addColorStop(0, "#FFD700");
                gradient.addColorStop(0.5, "#FBF5B7");
                gradient.addColorStop(1, "#AA771C");
                
                ctx.fillStyle = gradient;
                ctx.fillText(text, x, y);
                ctx.shadowColor = "transparent";
            }
            
            saveCanvas();
        };

        // Try Loading Logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = logoUrl;
        
        logo.onload = () => {
            drawWatermark(logo);
        };

        logo.onerror = () => {
            console.warn("Logo image missing, drawing text watermark.");
            drawWatermark(undefined); // Trigger text fallback
        };
    };
  };

  return (
    <div className="font-sans text-[#111] animate-fade-in pb-20">

      {/* --- Loading Screen --- */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/95 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="relative">
                <div className="w-[80px] h-[80px] border-[8px] border-gray-100 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shirt size={24} className="text-yellow-600 animate-pulse" />
                </div>
            </div>
            <h3 className="text-2xl mt-6 font-black text-gold-shine">جاري تفصيل الملابس...</h3>
            <p className="text-gray-500 mt-2 text-lg">بنجهز لك 3 وضعيات احترافية (وقوف، جلوس، استعراض)</p>
        </div>
      )}

      {/* --- Main Card --- */}
      <div className="bg-white p-6 md:p-10 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 mt-4 relative overflow-hidden">
        
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                    <Shirt className="text-yellow-600" size={32} />
                    ✨ استوديو تبديل الملابس
                </h2>
                <p className="text-gray-600 text-sm md:text-lg mb-6">
                    غيّر ملابسك بالذكاء الاصطناعي واحصل على 3 وضعيات احترافية.
                </p>
            </div>
             <img 
                src="/Mariam_women_kids.jpg" 
                className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border border-gray-200 bg-white shadow-sm" 
                alt="Logo"
                onError={(e) => e.currentTarget.style.display = 'none'}
             />
        </div>

        {/* --- Inputs --- */}
        <div className="space-y-4 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-bold mb-2 text-gray-800">👤 صورة الشخص (الموديل)</label>
                    <div 
                        onClick={() => personInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all h-48 flex flex-col items-center justify-center relative overflow-hidden
                            ${personPreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                        `}
                    >
                        <input type="file" ref={personInputRef} onChange={handlePersonFile} className="hidden" accept="image/*" />
                        {personPreview ? (
                            <>
                                <img src={personPreview} className="h-full object-contain rounded-lg z-10 relative" alt="Person" />
                                <div className="absolute inset-0 bg-blue-50/50 z-0"></div>
                                <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-blue-600 shadow-sm z-20">تغيير</div>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <span className="font-bold text-gray-800">📸 صورة الشخص</span>
                                <span className="text-xs text-gray-400 mt-1">يُفضل صورة واضحة كاملة</span>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block font-bold mb-2 text-gray-800">👕 صورة الملابس (المنتج)</label>
                    <div 
                        onClick={() => clothesInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all h-48 flex flex-col items-center justify-center relative overflow-hidden
                            ${clothesPreview ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
                        `}
                    >
                        <input type="file" ref={clothesInputRef} onChange={handleClothesFile} className="hidden" accept="image/*" />
                        {clothesPreview ? (
                            <>
                                <img src={clothesPreview} className="h-full object-contain rounded-lg z-10 relative" alt="Clothes" />
                                <div className="absolute inset-0 bg-purple-50/50 z-0"></div>
                                <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-purple-600 shadow-sm z-20">تغيير</div>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <span className="font-bold text-gray-800">👗 صورة الملابس</span>
                                <span className="text-xs text-gray-400 mt-1">صورة اللبس فقط أو على مودل</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block font-bold mt-4 mb-2 text-gray-800">🟣 نوع الموديل</label>
                    <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-3.5 text-base rounded-2xl border border-gray-300 bg-[#fafafa] mt-2 outline-none focus:border-blue-500"
                    >
                        <option>رجالي</option>
                        <option>حريمي</option>
                        <option>أطفالي</option>
                    </select>
                </div>

                <div>
                    <label className="block font-bold mt-4 mb-2 text-gray-800">🌄 الخلفية</label>
                    <select 
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-full p-3.5 text-base rounded-2xl border border-gray-300 bg-[#fafafa] mt-2 outline-none focus:border-blue-500"
                    >
                        <option>نفس الخلفية الأصلية</option>
                        <option>استوديو أبيض نقي</option>
                        <option>استوديو رمادي احترافي</option>
                        <option>خلفية بيچ فاخرة</option>
                        <option>شارع أوروبي (Street Style)</option>
                        <option>منزل مودرن (Interior)</option>
                        <option>حديقة خارجية (Nature)</option>
                    </select>
                </div>

                <div>
                    <label className="block font-bold mt-4 mb-2 text-gray-800">🫥 وضع العرض</label>
                    <select 
                        value={hiddenModel}
                        onChange={(e) => setHiddenModel(e.target.value)}
                        className="w-full p-3.5 text-base rounded-2xl border border-gray-300 bg-[#fafafa] mt-2 outline-none focus:border-blue-500"
                    >
                        <option>مودل واقعي (عادي)</option>
                        <option>مفعّل — عرض الملابس فقط (Ghost)</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={runMoussa}
                disabled={loading || !personFile || !clothesFile}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold text-lg py-4 px-7 rounded-2xl mt-6 hover:shadow-lg transition-all cursor-pointer border-none shadow-yellow-600/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
            >
                {loading ? 'جاري المعالجة...' : '✨ ابدأ التغيير (3 وضعيات)'}
            </button>
        </div>

        {/* --- Results --- */}
        {results.some(r => r !== null) && personPreview && (
            <div className="mt-12 animate-fade-in relative z-10">
                
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-bold text-gray-800">
                        معاينة: <span className="text-yellow-600">{posesLabels[activeResultIndex]}</span>
                     </h3>
                     <span className="text-sm text-gray-400">اسحب الخط للمقارنة</span>
                </div>
                
                {/* Compare Box */}
                {mainResult ? (
                    <div 
                        ref={containerRef}
                        className="relative overflow-hidden rounded-[24px] bg-gray-100 border border-gray-200 select-none group shadow-inner mx-auto"
                        style={{ height: '500px', maxWidth: '800px' }}
                    >
                        {/* Before Image (Background) */}
                        <img 
                            src={personPreview} 
                            className="absolute top-0 left-0 w-full h-full object-contain opacity-50 blur-sm md:blur-none md:opacity-100" 
                            alt="Before" 
                        />
                        <div className="absolute top-6 right-6 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md pointer-events-none">
                            الأصلية
                        </div>
                        
                        {/* After Image (Foreground Clipped) */}
                        <div 
                            className="absolute top-0 left-0 h-full border-r-[3px] border-white overflow-hidden bg-white md:bg-transparent"
                            style={{ width: `${sliderValue}%` }}
                        >
                            <img 
                                src={mainResult} 
                                className="absolute top-0 left-0 h-full object-contain max-w-none bg-white md:bg-transparent"
                                style={{ width: containerWidth ? `${containerWidth}px` : '100%' }} 
                                alt="After" 
                            />
                            <div className="absolute top-6 left-6 bg-yellow-600/90 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md pointer-events-none shadow-lg">
                                {posesLabels[activeResultIndex]}
                            </div>
                        </div>
                        
                        {/* Slider Handle Line */}
                        <div 
                            className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] z-30 pointer-events-none"
                            style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                                <div className="flex gap-1">
                                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[400px] bg-red-50 rounded-[24px] border border-red-100 flex flex-col items-center justify-center text-red-500 gap-3">
                         <AlertTriangle size={48} />
                         <p className="font-bold">فشل توليد هذه الوضعية</p>
                    </div>
                )}
                
                {mainResult && (
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={sliderValue}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full mt-6 cursor-pointer accent-yellow-600 h-2 bg-gray-200 rounded-lg appearance-none max-w-[800px] block mx-auto"
                    />
                )}

                {/* Pose Selector (Results Gallery) */}
                <h3 className="mt-12 text-xl font-bold mb-6 flex items-center gap-2">
                    <Check className="text-green-500" />
                    🎨 اختر الوضعية
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide justify-start md:justify-center">
                    {results.map((res, idx) => (
                        <div 
                            key={idx} 
                            className={`relative min-w-[160px] w-[30%] md:w-[200px] group transition-all cursor-pointer ${activeResultIndex === idx ? 'scale-105 z-10' : 'opacity-70 hover:opacity-100'}`}
                            onClick={() => {
                                setActiveResultIndex(idx);
                                if(res) setSliderValue(50);
                            }}
                        >
                            <div className={`
                                aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-gray-100 relative
                                ${activeResultIndex === idx ? 'border-yellow-600 shadow-xl ring-4 ring-yellow-500/20' : 'border-gray-200 shadow-sm'}
                            `}>
                                {res ? (
                                    <img src={res} className="w-full h-full object-cover" alt={`Pose ${idx}`} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                                        <AlertTriangle className="mb-2" />
                                        <span className="text-xs">فشل</span>
                                    </div>
                                )}
                            </div>
                            <span className={`
                                absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] text-center text-xs px-2 py-2 rounded-lg backdrop-blur-md font-bold whitespace-nowrap overflow-hidden text-ellipsis
                                ${activeResultIndex === idx ? 'bg-yellow-600 text-white' : 'bg-black/60 text-white'}
                            `}>
                                {posesLabels[idx].split('(')[0]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Download Section */}
                {mainResult && (
                    <div className="mt-8 bg-gray-50 p-8 rounded-3xl border border-gray-200 max-w-[800px] mx-auto">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Download className="text-yellow-600" />
                            💾 تحميل الوضعية: {posesLabels[activeResultIndex]}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <select 
                                value={dlQuality}
                                onChange={(e) => setDlQuality(e.target.value)}
                                className="w-full md:w-1/3 p-4 rounded-xl border border-gray-300 outline-none focus:border-yellow-500 bg-white"
                            >
                                <option value="2048">جودة عالية 2K</option>
                                <option value="4096">جودة فائقة 4K</option>
                                <option value="7680">جودة سينمائية 8K</option>
                            </select>
                            <button 
                                onClick={downloadImage}
                                className="w-full md:w-2/3 bg-yellow-600 text-white font-bold py-4 rounded-xl hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-600/20 flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                تحميل الصورة الآن (مع الشعار)
                            </button>
                        </div>
                    </div>
                )}

            </div>
        )}

      </div>
    </div>
  );
};