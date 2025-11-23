import React, { useState, useRef, useEffect } from 'react';
import { generateImage, generateText, editImage } from '../services/geminiService';
import { 
  Camera, Sparkles, Sliders, Zap, Wand2, 
  Maximize, Crop, Layers, Palette, User, 
  Download, Loader2, Image as ImageIcon, Trash2, UploadCloud,
  Monitor, Tv, Smartphone
} from 'lucide-react';

// --- Helper: Resize & Download ---
const resizeAndDownload = (imageUrl: string, label: string, width?: number) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
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
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `moussa-studio-${label}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
};

// --- Advanced Tool Component ---
interface AdvancedToolProps {
  title: string;
  description: string;
  icon: React.ElementType;
  promptTemplate: string;
  colorClass: string;
  buttonText: string;
}

const AdvancedTool: React.FC<AdvancedToolProps> = ({ title, description, icon: Icon, promptTemplate, colorClass, buttonText }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [outputLog, setOutputLog] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setResult(null);
        setOutputLog('');
    } else {
        alert('يرجى رفع ملف صورة صالح');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const process = async () => {
    if (!file) return;
    setLoading(true);
    setOutputLog('جاري المعالجة...');
    try {
      const res = await editImage(file, promptTemplate);
      setResult(res);
      setOutputLog('تمت العملية بنجاح ✅');
    } catch (err) {
      setOutputLog('❌ فشلت العملية');
      console.error(err);
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
            {/* <p className="text-xs text-gray-500">{description}</p> */}
        </div>
      </div>

      <div className="space-y-4">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        
        {!file ? (
           <div 
                className={`
                    flex flex-col items-center justify-center gap-2 p-6 
                    border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100'}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
           >
              <UploadCloud size={24} className={isDragging ? 'text-blue-500' : 'text-gray-400'} />
              <span className="text-xs font-bold text-gray-500">
                {isDragging ? 'افلت الصورة هنا' : 'اضغط أو اسحب الصورة هنا'}
              </span>
           </div>
        ) : (
           <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <img src={preview!} className="w-10 h-10 rounded-lg object-cover" alt="preview" />
                  <span className="text-xs font-medium flex-1 truncate">{file.name}</span>
                  <button onClick={() => {setFile(null); setPreview(null); setResult(null);}} className="text-red-500 p-1 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
              </div>
              
              <button
                  onClick={process}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                      ${loading ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}
                  `}
              >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                  {buttonText}
              </button>
           </div>
        )}

        {(outputLog || result) && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-3">
                {result ? (
                    <div className="space-y-3">
                        <img src={result} className="w-full rounded-lg border border-gray-200" alt="result" />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => resizeAndDownload(result, 'enhanced-original')}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                            >
                                تحميل
                            </button>
                            <button 
                                onClick={() => resizeAndDownload(result, 'enhanced-8k', 7680)}
                                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700"
                            >
                                8K
                            </button>
                        </div>
                    </div>
                ) : (
                    <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono">{outputLog}</pre>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export const ImageStudio: React.FC = () => {
  // --- State with LocalStorage Persistence ---
  const [idea, setIdea] = useState('');
  
  // Persistent State Initialization with safe defaults
  const [angle, setAngle] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('moussa_imgAngle') || 'أمامية مباشرة';
      } catch {
        return 'أمامية مباشرة';
      }
    }
    return 'أمامية مباشرة';
  });
  
  const [lighting, setLighting] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('moussa_imgLight') || 'سينمائية';
      } catch {
        return 'سينمائية';
      }
    }
    return 'سينمائية';
  });
  
  const [background, setBackground] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('moussa_imgBackground') || 'ستوديو أبيض نظيف';
      } catch {
        return 'ستوديو أبيض نظيف';
      }
    }
    return 'ستوديو أبيض نظيف';
  });
  
  const [size, setSize] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('moussa_imgSize') || '2048x2048';
      } catch {
        return '2048x2048';
      }
    }
    return '2048x2048';
  });
  
  const [suggestions, setSuggestions] = useState('');
  const [oneWordPrompt, setOneWordPrompt] = useState('');
  const [builtPrompt, setBuiltPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingOneWord, setLoadingOneWord] = useState(false);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);

  // --- Effects to Save Settings ---
  useEffect(() => {
    try { localStorage.setItem('moussa_imgAngle', angle); } catch (e) { console.warn('LocalStorage failed', e); }
  }, [angle]);

  useEffect(() => {
    try { localStorage.setItem('moussa_imgLight', lighting); } catch (e) { console.warn('LocalStorage failed', e); }
  }, [lighting]);

  useEffect(() => {
    try { localStorage.setItem('moussa_imgBackground', background); } catch (e) { console.warn('LocalStorage failed', e); }
  }, [background]);

  useEffect(() => {
    try { localStorage.setItem('moussa_imgSize', size); } catch (e) { console.warn('LocalStorage failed', e); }
  }, [size]);

  // --- Data ---
  const angleOptions = [
    "أمامية مباشرة",
    "جنب",
    "٣/٤",
    "لقطة قريبة (Close-Up)",
    "لقطة بورتريه",
    "لقطة واسعة (Wide Angle)",
    "لقطة سينمائية منخفضة",
    "لقطة سينمائية عالية",
    "عين الطائر",
    "عين الدودة",
    "Dutch Angle (زاوية مائلة)",
    "Tracking Shot",
    "Over the Shoulder",
    "Top Shot",
    "Side View Cinematic"
  ];
  
  const lightOptions = [
    "سينمائية",
    "الرؤية الليلية (Mariam_women_kids)",
    "غروب برتقالي",
    "نهارية ناعمة",
    "قمرية",
    "إضاءة نيون",
    "ستوديو 3-Point Light",
    "Soft Diffused Light",
    "Rim Light",
    "Hard Shadow Light",
    "Bounce Light أبيض",
    "Golden Hour",
    "Blue Hour",
    "Spotlight",
    "Flat Light",
    "Moody Dark"
  ];

  const bgOptions = [
    "ستوديو أبيض نظيف",
    "ستوديو أسود",
    "خلفية بيچ فاخرة",
    "خلفية نيون",
    "غرفة معيشة مودرن",
    "غرفة Minimal",
    "روف توب",
    "شارع ليلي",
    "غابة",
    "شاطئ",
    "صحراء",
    "محل تجاري",
    "مكتب راقي",
    "مطبخ عصري",
    "خلفية Apple Style",
    "خلفية عشوائية إبداعية"
  ];
  
  const sizeOptions = ["2048x2048", "1024x1024", "1536x2048 (طولي)", "2048x1536 (عرضي)", "4096x4096 (جودة عالية)"];

  // --- Handlers ---

  // 1. Smart Suggestions
  const handleSuggest = async () => {
    if (!idea) return;
    setLoadingSuggest(true);
    try {
      const prompt = `
اقترح إعدادات تصوير احترافية لمشهد:
"${idea}"

تشمل:
- أفضل زاوية
- أفضل إضاءة
- أفضل خلفية مناسبة
- أفضل نوع عدسة
- Mood للمشهد
- أسلوب Apple Clean
- نصائح احترافية
`;
      const text = await generateText(prompt);
      setSuggestions(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggest(false);
    }
  };

  // 2. One Word Prompt
  const handleOneWord = async () => {
    if (!idea) return;
    setLoadingOneWord(true);
    try {
      const prompt = `
حوّل الكلمة التالية إلى برومبت تصوير كامل واحترافي لمولد صور:
"${idea}"

باللغة الإنجليزية،
بستايل Apple،
وإضاءة سينمائية مع تفاصيل دقيقة.
`;
      const text = await generateText(prompt);
      setOneWordPrompt(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOneWord(false);
    }
  };

  // 3. Build Prompt
  const handleBuildPrompt = async () => {
    setLoadingBuild(true);
    try {
      const prompt = `
Make a full English cinematic Apple-style image prompt:

Scene: ${idea || 'Unspecified'}
Camera angle: ${angle}
Lighting: ${lighting}
Background: ${background}
Resolution: ${size}

High detail, natural colors, ultra sharp, depth of field, clean aesthetic.
`;
      const text = await generateText(prompt);
      setBuiltPrompt(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBuild(false);
    }
  };

  // 4. Generate Image
  const handleGenerate = async () => {
    const promptToUse = builtPrompt || idea;
    if (!promptToUse) return;
    
    setLoadingGen(true);
    try {
      // Map size selection to aspect ratio for the API
      let aspectRatio = '1:1';
      if (size.includes('1536x2048')) aspectRatio = '3:4';
      else if (size.includes('2048x1536')) aspectRatio = '4:3';
      else if (size.includes('1080') || size.includes('1920')) aspectRatio = '9:16'; // fallback logic if needed

      const url = await generateImage(promptToUse, aspectRatio);
      setGeneratedImage(url);
    } catch (e) {
      alert("فشل التوليد، يرجى المحاولة مرة أخرى");
    } finally {
      setLoadingGen(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="flex items-start justify-between relative z-10">
            <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                    <Camera className="text-blue-600" size={28} />
                    📸 استوديو الصور — Image Studio Pro
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    أقوى ستوديو لإنشاء الصور وتحسينها وتعديلها من غير ما تحتاج أي خبرة.
                </p>
            </div>
             <img 
                src="/Mariam_women_kids.jpg" 
                className="h-16 w-16 rounded-full object-contain border border-gray-200 bg-white shadow-sm hidden md:block" 
                alt="Logo"
                onError={(e) => e.currentTarget.style.display = 'none'}
             />
         </div>
      </div>

      {/* Main Inputs */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
         
         <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-500" />
                ✏️ اكتب وصف المشهد
            </label>
            <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="مثال: بنت واقفة في شارع نيون بالليل، إضاءة سينمائية، جو درامي…"
                className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] text-lg"
            />
         </div>

         {/* Camera Settings */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">🎥 زاوية الكاميرا</label>
                <select value={angle} onChange={(e) => setAngle(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-500 outline-none">
                    {angleOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">💡 الإضاءة</label>
                <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-500 outline-none">
                    {lightOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">🖼️ الخلفية</label>
                <select value={background} onChange={(e) => setBackground(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-500 outline-none">
                    {bgOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
         </div>

         {/* Size */}
         <div>
             <label className="block text-sm font-bold text-gray-600 mb-2">📐 المقاس</label>
             <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full md:w-1/3 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-500 outline-none">
                {sizeOptions.map(o => <option key={o} value={o}>{o}</option>)}
             </select>
         </div>
      </div>

      {/* Smart Suggestions & Prompt Building */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Suggestions */}
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🧠 اقتراحات ذكية
             </h3>
             
             <div className="space-y-6">
                 <div className="space-y-3">
                    <button 
                        onClick={handleSuggest} 
                        disabled={loadingSuggest || !idea}
                        className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                        {loadingSuggest ? <Loader2 className="animate-spin" size={18} /> : <Sliders size={18} />}
                        اقترح إعدادات للصورة
                    </button>
                    {suggestions && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-60 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{suggestions}</pre>
                        </div>
                    )}
                 </div>

                 <div className="space-y-3">
                    <button 
                        onClick={handleOneWord} 
                        disabled={loadingOneWord || !idea}
                        className="w-full py-3 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                    >
                         {loadingOneWord ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        برومبت كامل من كلمة واحدة
                    </button>
                    {oneWordPrompt && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 ltr" dir="ltr">{oneWordPrompt}</pre>
                        </div>
                    )}
                 </div>
             </div>
         </div>

         {/* Prompt Builder */}
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📝 بناء البرومبت الاحترافي
             </h3>
             <div className="flex-1 flex flex-col gap-4">
                 <button 
                    onClick={handleBuildPrompt}
                    disabled={loadingBuild}
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                 >
                     {loadingBuild ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                     اعمل البرومبت
                 </button>
                 
                 <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[150px]">
                     {builtPrompt ? (
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 ltr" dir="ltr">{builtPrompt}</pre>
                     ) : (
                        <span className="text-gray-400 text-sm">البرومبت سيظهر هنا...</span>
                     )}
                 </div>
             </div>
         </div>

      </div>

      {/* Image Generation */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
         <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🎨 توليد الصورة
         </h3>
         
         <div className="flex flex-col gap-6">
             <button 
                onClick={handleGenerate}
                disabled={loadingGen}
                className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-3"
             >
                 {loadingGen ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
                 طلّع الصورة
             </button>

             {/* Result Area */}
             <div className="relative w-full aspect-square md:aspect-[16/9] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                 {generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                 ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p>الصورة ستظهر هنا</p>
                    </div>
                 )}
             </div>

             {/* Download Options */}
             {generatedImage && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-fade-in" id="downloadSection">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Download size={20} className="text-blue-600" />
                        ⬇️ تحميل الصورة بالجودة اللي تعجبك
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => resizeAndDownload(generatedImage, 'original')} 
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 text-sm font-bold text-gray-700 transition-all flex items-center gap-2"
                        >
                            تحميل الجودة الأصلية
                        </button>
                        <button 
                            onClick={() => resizeAndDownload(generatedImage, '4k', 3840)} 
                            className="px-4 py-2 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 text-sm font-bold text-purple-700 transition-all flex items-center gap-2"
                        >
                            تحميل 4K
                        </button>
                        <button 
                            onClick={() => resizeAndDownload(generatedImage, '2k', 2560)} 
                            className="px-4 py-2 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 text-sm font-bold text-blue-700 transition-all flex items-center gap-2"
                        >
                            تحميل 2K
                        </button>
                        <button 
                            onClick={() => resizeAndDownload(generatedImage, 'hd', 1920)} 
                            className="px-4 py-2 bg-white border border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 text-sm font-bold text-green-700 transition-all flex items-center gap-2"
                        >
                            تحميل HD 1080p
                        </button>
                         <button 
                            onClick={() => resizeAndDownload(generatedImage, '8k', 7680)} 
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none rounded-xl hover:shadow-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            تحميل 8K (Upscaled)
                        </button>
                    </div>
                </div>
             )}
         </div>
      </div>

      {/* Advanced Tools */}
      <div className="mt-12">
         <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            🔧 أدوات احترافية
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <AdvancedTool 
                title="🔼 رفع الجودة 8K" 
                description="رفع جودة الصورة إلى 8K"
                icon={Maximize}
                colorClass="bg-blue-500"
                promptTemplate="Enhance this image to real 8K resolution. Rules: Keep same facial identity and product shape, Increase sharpness, Remove noise, Boost micro-details, Do NOT change colors or style."
                buttonText="رفع الجودة لدرجة 8K"
            />

            <AdvancedTool 
                title="🖼️ توسيع الصورة — Outpainting" 
                description="توسيع الصورة بشكل طبيعي"
                icon={Crop}
                colorClass="bg-purple-500"
                promptTemplate="Extend the image naturally (outpainting). Keep same lighting, style, colors. Describe extension area for Imagen."
                buttonText="وسّع الصورة"
            />

            <AdvancedTool 
                title="❌ إزالة الخلفية" 
                description="إزالة الخلفية بدقة"
                icon={Layers}
                colorClass="bg-red-500"
                promptTemplate="Remove background cleanly. Return instructions for Imagen to isolate subject on transparent/white."
                buttonText="إزالة الخلفية"
            />

            <AdvancedTool 
                title="🎞️ تلوين سينمائي — Color Grading" 
                description="تطبيق تدرج لوني سينمائي"
                icon={Palette}
                colorClass="bg-orange-500"
                promptTemplate="Apply cinematic color grading. Apple clean tone. Soft teal & orange. Explain adjustments for Imagen."
                buttonText="طبّق تدرج سينمائي"
            />

            <AdvancedTool 
                title="😊 تحسين الوجه — Face Enhance" 
                description="تحسين ملامح الوجه"
                icon={User}
                colorClass="bg-pink-500"
                promptTemplate="Enhance facial details: sharpen eyes, fix skin, remove noise, keep identity. Output imagen instructions."
                buttonText="حسّن ملامح الوجه"
            />

         </div>
      </div>

    </div>
  );
};