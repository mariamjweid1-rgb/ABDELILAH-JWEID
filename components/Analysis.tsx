import React, { useState, useRef } from 'react';
import { generateTextFromImage } from '../services/geminiService';
import { Search, Upload, Loader2, Eye, Sliders, Palette, Grid, Star, Trash2 } from 'lucide-react';

interface AnalysisToolProps {
  title: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
  file: File | null;
  onResult: (result: string) => void;
}

const AnalysisButton: React.FC<AnalysisToolProps> = ({ title, icon: Icon, prompt, color, file, onResult }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!file) return alert('يرجى رفع صورة أولاً');
    setLoading(true);
    try {
      const res = await generateTextFromImage(file, prompt);
      onResult(res);
    } catch (e) {
      console.error(e);
      alert('فشل التحليل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={!file || loading}
      className={`
        flex flex-col items-center justify-center p-6 rounded-2xl border transition-all gap-3
        ${!file ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : `bg-white border-gray-200 hover:border-${color}-500 hover:shadow-md text-gray-700 hover:text-${color}-600`}
      `}
    >
      {loading ? (
        <Loader2 className={`animate-spin text-${color}-500`} size={28} />
      ) : (
        <Icon size={28} className={!file ? 'text-gray-300' : `text-${color}-500`} />
      )}
      <span className="font-bold text-sm">{title}</span>
    </button>
  );
};

export const Analysis: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Eye size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">🔍 التحليل الذكي — Analysis AI Pro</h2>
                        <p className="text-gray-500">تحليل شامل لأي صورة + اقتراحات تحسين</p>
                    </div>
                </div>
                <img 
                    src="/Mariam_women_kids.jpg" 
                    className="h-16 w-16 rounded-full object-contain border border-gray-200 bg-white shadow-sm hidden md:block" 
                    alt="Logo"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                />
            </div>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left: Image Upload */}
                <div className="space-y-4">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative
                            ${previewUrl ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                                    تغيير الصورة
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400 text-center p-4">
                                <Upload className="mx-auto mb-2" size={32} />
                                <span className="font-bold">اختر صورة للتحليل</span>
                            </div>
                        )}
                    </div>

                    {/* Tool Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        
                        <AnalysisButton 
                            title="تحليل تقني"
                            icon={Search}
                            color="blue"
                            file={image}
                            prompt={`
Analyze this image technically:
- lighting type
- camera angle
- lens
- mood
- style
- composition
- quality score
- improvements
                            `}
                            onResult={setResult}
                        />

                        <AnalysisButton 
                            title="اقتراح تحسين"
                            icon={Sliders}
                            color="green"
                            file={image}
                            prompt={`
Suggest improvements for this image:
- lighting fix
- color grading
- sharpness
- framing
- mood adjustment
Return actionable items.
                            `}
                            onResult={setResult}
                        />

                        <AnalysisButton 
                            title="كشف الستايل"
                            icon={Palette}
                            color="purple"
                            file={image}
                            prompt={`
Detect image style (cinematic / realistic / moody / product / neon / luxury).
Return clear label + reasoning.
                            `}
                            onResult={setResult}
                        />

                        <AnalysisButton 
                            title="تحليل التكوين"
                            icon={Grid}
                            color="orange"
                            file={image}
                            prompt={`
Analyze composition:
- rule of thirds
- leading lines
- visual balance
- contrast
Give suggestions to improve.
                            `}
                            onResult={setResult}
                        />

                        <AnalysisButton 
                            title="تقييم الجودة"
                            icon={Star}
                            color="yellow"
                            file={image}
                            prompt={`
Rate image quality from 1 to 10.
Explain rating (sharpness, lighting, colors).
                            `}
                            onResult={setResult}
                        />

                         {/* Reset Button */}
                         <button 
                            onClick={() => { setImage(null); setPreviewUrl(null); setResult(null); }}
                            disabled={!image}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all gap-3 disabled:opacity-50"
                        >
                             <Trash2 size={28} />
                             <span className="font-bold text-sm">مسح</span>
                        </button>

                    </div>
                </div>

                {/* Right: Results */}
                <div className="h-full min-h-[500px] bg-gray-50 rounded-3xl border border-gray-200 p-8">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Eye size={20} />
                        نتيجة التحليل
                    </h3>
                    
                    {result ? (
                        <div className="prose prose-blue max-w-none font-sans text-right" dir="rtl">
                             <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-base">
                                {result}
                             </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p>اضغط على إحدى أدوات التحليل لتظهر النتيجة هنا</p>
                        </div>
                    )}
                </div>

            </div>
    </div>
  );
};