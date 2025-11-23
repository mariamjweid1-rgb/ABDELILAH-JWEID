import React, { useState, useRef } from 'react';
import { fuseProductImage, generateText, generateTextFromImage, editImage } from '../services/geminiService';
import { ShoppingBag, Upload, Sparkles, Loader2, Lightbulb, Wand2, Sun, Cloud, Layers, Trash2, Download, Maximize } from 'lucide-react';

// --- Helper: Resize & Download with Logo Watermark ---
const resizeAndDownload = (imageUrl: string, label: string, width?: number) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    // Corrected Path
    const logoUrl = "/Mariam_women_kids.jpg";

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        if (width) {
            const aspect = img.naturalHeight / img.naturalWidth;
            targetWidth = width;
            targetHeight = width * aspect;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Better quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw Main Image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Function to save final canvas
        const saveCanvas = () => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `mariam-fusion-${label}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        // --- Watermark Logic ---
        const drawWatermark = (imageObj?: HTMLImageElement) => {
            const padding = targetWidth * 0.02; // 2% padding

            if (imageObj) {
                 // 1. DRAW LOGO IMAGE
                 // Size: Small (10% of width)
                 const logoWidth = targetWidth * 0.10; 
                 const logoAspect = imageObj.naturalHeight / imageObj.naturalWidth;
                 const logoHeight = logoWidth * logoAspect;

                 // Position: Bottom Left
                 const x = padding;
                 const y = targetHeight - logoHeight - padding;

                 // Shadow for visibility
                 ctx.shadowColor = "rgba(0,0,0,0.5)";
                 ctx.shadowBlur = 6;
                 ctx.shadowOffsetX = 2;
                 ctx.shadowOffsetY = 2;
                 
                 ctx.drawImage(imageObj, x, y, logoWidth, logoHeight);
                 ctx.shadowColor = "transparent";

            } else {
                 // 2. FALLBACK: DRAW GOLDEN TEXT
                 // Only if image fails to load
                 const fontSize = Math.max(20, targetWidth * 0.035);
                 ctx.font = `900 ${fontSize}px 'Tajawal', sans-serif`;
                 const text = "MARIAM WOMEN & KIDS";
                 
                 const x = padding;
                 const y = targetHeight - padding;
                 
                 // Strong Shadow
                 ctx.shadowColor = "rgba(0,0,0,0.9)";
                 ctx.shadowBlur = 10;
                 ctx.shadowOffsetX = 3;
                 ctx.shadowOffsetY = 3;
                 
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

        // Load and Draw Logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = logoUrl;
        
        logo.onload = () => {
            drawWatermark(logo);
        };

        logo.onerror = () => {
             // Fallback if logo fails
             console.warn("Logo image missing, drawing text watermark.");
             drawWatermark(undefined);
        };
    };
};

// --- Helper: Base64 to File ---
const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// --- Advanced Tool Component (Reusable) ---
interface FusionToolProps {
  title: string;
  description: string;
  icon: React.ElementType;
  promptTemplate: string;
  colorClass: string;
  outputType?: 'image' | 'text';
}

const FusionTool: React.FC<FusionToolProps> = ({ title, description, icon: Icon, promptTemplate, colorClass, outputType = 'text' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setTextResult(null);
    }
  };

  const process = async () => {
    if (!file) return;
    setLoading(true);
    try {
      if (outputType === 'text') {
        const res = await generateTextFromImage(file, promptTemplate);
        setTextResult(res);
      } else {
        const res = await editImage(file, promptTemplate);
        setResult(res);
      }
    } catch (err) {
      alert("فشلت العملية، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-gray-700`}>
            <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
        </div>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors h-32 flex flex-col items-center justify-center"
          >
            <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
            <span className="text-sm text-gray-400">ارفع صورة</span>
          </div>
        ) : (
           <div className="flex flex-col gap-3">
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 group">
                 <img src={preview} className="w-full h-full object-contain bg-gray-50" alt="Original" />
                 <button 
                    onClick={() => { setFile(null); setPreview(null); setResult(null); setTextResult(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
        )}

        <button
            onClick={process}
            disabled={!file || loading}
            className={`w-full py-2 rounded-xl font-bold text-sm transition-all
                ${!file || loading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'}
            `}
        >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : title}
        </button>

        {textResult && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700 font-mono whitespace-pre-wrap text-left" dir="ltr">
                {textResult}
            </div>
        )}
        {result && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <img src={result} className="w-full rounded-lg mb-2" alt="Result" />
                 <button 
                    onClick={() => resizeAndDownload(result, title)}
                    className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-xs"
                 >
                    تحميل النتيجة
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export const ProductFusion: React.FC = () => {
  // State
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  const [instruction, setInstruction] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [upscaled8KResult, setUpscaled8KResult] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingUpscale, setLoadingUpscale] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  const productInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleProductFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setProductImage(f);
      setProductPreview(URL.createObjectURL(f));
      setResultImage(null);
      setUpscaled8KResult(null);
    }
  };

  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setBgImage(f);
      setBgPreview(URL.createObjectURL(f));
    }
  };

  const handleSuggest = async () => {
    if (!instruction) return;
    setIsSuggesting(true);
    try {
      const prompt = `
اقترح أفضل إعدادات لدمج منتج داخل خلفية:
"${instruction}"

يشمل:
- مكان مثالي للمنتج
- زاوية مناسبة
- إضاءة مناسِبة للخلفية
- نوع الظل
- Mood مناسب
- نصائح احتراف دمج
      `;
      const res = await generateText(prompt);
      setSuggestion(res.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleBuildPrompt = async () => {
    if (!instruction) return;
    setIsSuggesting(true);
    try {
      const prompt = `
Build a full professional prompt for image compositing.
Scene idea: "${instruction}"
Keep product realistic.
Match light + shadow + reflections.
Apple clean style.
      `;
      const res = await generateText(prompt);
      setGeneratedPrompt(res.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleMerge = async () => {
    if (!productImage || !instruction) return;
    setLoading(true);
    setUpscaled8KResult(null);
    try {
      const fullPrompt = `
Composite product into background.
Instructions: "${instruction}"
Keep product EXACT identity, shape, logo and color.
Match shadows, light, tone, reflections.
Apple clean commercial style.
Ultra realistic.
      `;
      // We use our powerful Gemini 2.5 Flash Image implementation here
      const res = await fuseProductImage(productImage, bgImage, fullPrompt);
      setResultImage(res);
      setSliderValue(50); // Init slider to center
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الدمج. تأكد من جودة الصور.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (!resultImage) return;
    setLoadingUpscale(true);
    try {
        const file = base64ToFile(resultImage, 'fusion-result.png');
        const prompt = `
Upscale this composite to 8K.
Keep product shape + logo + colors.
Boost micro-details + edges.
Preserve lighting + style.
        `;
        const res = await editImage(file, prompt);
        setUpscaled8KResult(res);
    } catch (e) {
        console.error(e);
        alert("فشل رفع الجودة.");
    } finally {
        setLoadingUpscale(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      
       {/* Header */}
       <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
         <div className="relative z-10 flex items-center justify-between">
             <div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center gap-3">
                    <ShoppingBag className="text-yellow-600" size={32} />
                    دمج المنتجات — Product Fusion Pro
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                    أداة دمج المنتجات هنا بتقدّم دمج احترافي بمستوى شركات الإعلانات.  
                    <br className="hidden md:block" />
                    هنركّب المنتج في الخلفية اللي تختارها مع المحافظة على <span className="font-bold text-gray-900">الشكل – الإضاءة – الظلال – الأبعاد – تفاصيل اللوجو</span>.
                </p>
             </div>
             <img 
                src="/Mariam_women_kids.jpg" 
                className="h-16 w-16 rounded-full object-cover border border-gray-200 bg-white shadow-sm hidden md:block" 
                alt="Logo"
                onError={(e) => e.currentTarget.style.display = 'none'}
             />
         </div>
         <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left: Inputs & Controls */}
         <div className="lg:col-span-7 space-y-6">
            
            {/* Uploads Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Product Upload */}
                <div 
                    onClick={() => productInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all h-48 flex flex-col items-center justify-center group
                        ${productPreview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 hover:border-yellow-500 hover:bg-gray-50'}
                    `}
                >
                    <input type="file" ref={productInputRef} onChange={handleProductFile} className="hidden" accept="image/*" />
                    {productPreview ? (
                        <>
                            <img src={productPreview} className="h-full w-full object-contain rounded-lg opacity-90" alt="Product" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-bold">تغيير</div>
                        </>
                    ) : (
                        <>
                            <Upload size={30} className="text-gray-400 mb-2" />
                            <span className="font-bold text-gray-600 text-sm">📸 صورة المنتج</span>
                        </>
                    )}
                </div>

                {/* Background Upload */}
                <div 
                    onClick={() => bgInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all h-48 flex flex-col items-center justify-center group
                        ${bgPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                    `}
                >
                    <input type="file" ref={bgInputRef} onChange={handleBgFile} className="hidden" accept="image/*" />
                    {bgPreview ? (
                        <>
                            <img src={bgPreview} className="h-full w-full object-cover rounded-lg opacity-90" alt="Background" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-bold">تغيير</div>
                        </>
                    ) : (
                        <>
                            <Layers size={30} className="text-gray-400 mb-2" />
                            <span className="font-bold text-gray-600 text-sm">🖼️ صورة الخلفية (اختياري)</span>
                        </>
                    )}
                </div>
            </div>

            {/* Instruction */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    ✏️ وضّح المطلوب
                </label>
                <textarea 
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="مثال: عايزه المنتج يتحط فوق ترابيزة خشب، بإضاءة دافئة، وShadow طبيعي…"
                    className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all outline-none min-h-[100px]"
                />
            </div>

            {/* Smart Buttons */}
            <div className="flex flex-wrap gap-3">
                <button 
                    onClick={handleSuggest}
                    disabled={!instruction || isSuggesting}
                    className="flex-1 py-3 px-4 bg-white text-yellow-700 border border-yellow-200 rounded-xl font-bold hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {isSuggesting ? <Loader2 className="animate-spin" size={16}/> : <Lightbulb size={16} />}
                    اقترح إعدادات الدمج
                </button>
                <button 
                    onClick={handleBuildPrompt}
                    disabled={!instruction || isSuggesting}
                    className="flex-1 py-3 px-4 bg-white text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {isSuggesting ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16} />}
                    بناء البرومبت
                </button>
            </div>

            {/* Feedback Areas */}
            {suggestion && (
                 <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 animate-fade-in">
                    <h4 className="font-bold text-yellow-800 text-sm mb-1">🧠 اقتراح ذكي:</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{suggestion}</p>
                 </div>
            )}
            {generatedPrompt && (
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-blue-800 text-sm">📝 البرومبت الاحترافي:</h4>
                        <button onClick={() => navigator.clipboard.writeText(generatedPrompt)} className="text-xs text-blue-500 hover:underline">نسخ</button>
                    </div>
                    <p className="text-gray-700 text-sm font-mono ltr text-left" dir="ltr">{generatedPrompt}</p>
                 </div>
            )}

            {/* Execute Button */}
            <button 
                onClick={handleMerge}
                disabled={loading || !productImage || !instruction}
                className="w-full py-4 bg-yellow-600 text-white font-bold rounded-2xl hover:bg-yellow-700 shadow-lg shadow-yellow-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <> <Loader2 className="animate-spin" /> جاري الدمج... </>
                ) : (
                    <> <Layers size={22} /> نفّذ الدمج </>
                )}
            </button>

         </div>

         {/* Right: Result & Comparison */}
         <div className="lg:col-span-5">
             <div className="sticky top-8">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 min-h-[500px] flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">النتيجة (قبل / بعد)</h3>
                    
                    {/* BEFORE / AFTER COMPARISON */}
                    <div className="pf-compare-wrapper">
                        <div className="pf-compare">
                            
                            {/* Original Image (Before) */}
                            {productPreview ? (
                                <img id="PF_before" className="pf-img pf-before" src={productPreview} alt="Product Before" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                                    <Layers size={48} className="mb-2 opacity-30" />
                                    <p>معاينة المنتج</p>
                                </div>
                            )}

                            {/* Result Image (After) - revealed via clip-path */}
                            {resultImage && (
                                <>
                                    <div className="pf-after" style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}>
                                        <img id="PF_after" className="pf-img object-cover" src={upscaled8KResult || resultImage} alt="Fused Result" />
                                        
                                        {/* Badge */}
                                        {upscaled8KResult && (
                                            <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20">
                                                ✨ 8K
                                            </div>
                                        )}
                                    </div>
                                    {/* Vertical Divider Line */}
                                    <div 
                                        className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30 pointer-events-none"
                                        style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}
                                    />
                                </>
                            )}
                        </div>

                        {resultImage && (
                             <input 
                                id="PF_slider" 
                                type="range" 
                                min="0" max="100" 
                                value={sliderValue} 
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                style={{ width: '100%', marginTop: '15px' }} 
                             />
                        )}
                    </div>

                </div>

                {/* Download Section */}
                {resultImage && (
                    <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-fade-in" id="PF_downloadSection">
                        
                        {/* Upscale Button */}
                        {!upscaled8KResult && (
                            <button 
                                onClick={handleUpscale}
                                disabled={loadingUpscale}
                                className="w-full mb-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loadingUpscale ? <Loader2 className="animate-spin" /> : <Maximize size={18} />}
                                ⚡ إنشاء نسخة 8K (AI Upscale)
                            </button>
                        )}

                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Download size={20} className="text-yellow-600" />
                            ⬇️ تحميل الصورة النهائية
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => resizeAndDownload(resultImage, 'fusion-original')} 
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 text-sm font-bold text-gray-700 transition-all flex items-center gap-2"
                            >
                                تحميل الجودة الأصلية
                            </button>
                            <button 
                                onClick={() => resizeAndDownload(resultImage, 'fusion-4k', 3840)} 
                                className="px-4 py-2 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 text-sm font-bold text-purple-700 transition-all flex items-center gap-2"
                            >
                                تحميل 4K
                            </button>
                            <button 
                                onClick={() => resizeAndDownload(upscaled8KResult || resultImage, 'fusion-8k', 7680)} 
                                className={`px-4 py-2 border-none rounded-xl hover:shadow-lg text-sm font-bold transition-all flex items-center gap-2
                                    ${upscaled8KResult ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}
                                `}
                            >
                                {upscaled8KResult ? 'تحميل 8K (جاهز)' : 'تحميل 8K (بعد الرفع)'}
                            </button>
                        </div>
                    </div>
                )}

             </div>
         </div>

      </div>

      {/* Advanced Tools Section */}
      <div className="mt-20">
        <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <Wand2 className="text-gray-900" />
            أدوات الدمج الاحترافية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FusionTool 
                title="ضبط الإضاءة — Light Match" 
                description="تحليل إضاءة المنتج للحصول على تعليمات المطابقة"
                icon={Sun}
                colorClass="bg-orange-500"
                promptTemplate={`
Analyze lighting and describe how to match product light for compositing.
Return clear instructions for Imagen.
                `}
                outputType="text"
            />

            <FusionTool 
                title="توليد ظل واقعي — Smart Shadow" 
                description="الحصول على إرشادات لبناء ظلال واقعية"
                icon={Cloud}
                colorClass="bg-gray-700"
                promptTemplate={`
Generate realistic shadow guidelines.
Return Imagen-ready instructions.
Keep shadow soft and natural.
                `}
                outputType="text"
            />

            <FusionTool 
                title="دمج المنتج مع الخلفية — Background Blend" 
                description="إرشادات دمج المنتج مع الخلفية"
                icon={Layers}
                colorClass="bg-blue-500"
                promptTemplate={`
Blend product with background.
Fix color tone, lighting, shadows.
Output Imagen guidance.
                `}
                outputType="text"
            />
        </div>
      </div>

    </div>
  );
};