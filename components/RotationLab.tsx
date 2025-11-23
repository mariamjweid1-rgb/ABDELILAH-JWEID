
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { RotateCw, Upload, Sun, Image as ImageIcon, Loader2, Download, Trash2, Maximize } from 'lucide-react';

export const RotationLab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [angle, setAngle] = useState('أمامية مباشرة');
  const [lighting, setLighting] = useState('نفس الإضاءة');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Map Arabic UI options to clear English prompts for the model
      const angleMap: Record<string, string> = {
        // Basic
        'أمامية مباشرة': 'Straight front view',
        'جانبية يمين': 'Right side profile view',
        'جانبية شمال': 'Left side profile view',
        'زاوية ٣/٤ يمين': '3/4 angle from the right',
        'زاوية ٣/٤ شمال': '3/4 angle from the left',

        // Cinematic
        'زاوية سينمائية منخفضة': 'Low angle cinematic shot',
        'زاوية سينمائية عالية': 'High angle cinematic shot',
        'زاوية الهيرو — Hero Angle': 'Hero angle, low camera looking up, powerful stance',
        'زاوية Dramatic Low': 'Dramatic low angle shot',
        'زاوية High Fashion Portrait': 'High fashion portrait angle',

        // Product
        'Top Shot — من أعلى': 'Top-down shot (bird\'s eye view)',
        'Flat Lay — مسطحة من فوق': 'Flat lay photography, 90 degree top down',
        'Macro Close-up — قريبة جدًا': 'Macro close-up shot, high detail',
        'Side Product View — عرض جانبي': 'Side product view',
        'Front Facing Product': 'Front facing product shot, centered',
        'Perspective Angle — منظور': 'Perspective angle shot',

        // 3D
        'زاوية 45 يمين — 3D View': '45 degree angle from right, 3D view style',
        'زاوية 45 شمال — 3D View': '45 degree angle from left, 3D view style',
        'Isometric Right': 'Isometric view from right',
        'Isometric Left': 'Isometric view from left',
        'Isometric Top': 'Isometric top view',

        // Portrait / Faces
        'زاوية بورتريه كلاسيكية': 'Classic portrait angle',
        'Bust Portrait Angle': 'Bust portrait shot',
        'Shoulder View Portrait': 'Shoulder level portrait view',
        'Over the Shoulder يمين': 'Over the right shoulder shot',
        'Over the Shoulder شمال': 'Over the left shoulder shot',
        'Profile Shot — بروفايل': 'Side profile shot',
        'Half Profile': 'Half profile shot',

        // Dramatic / Fashion
        'Dutch Angle — مائلة': 'Dutch angle (tilted camera)',
        'Intense Close-up': 'Intense close-up on face/details',
        'Cinematic Overhead': 'Cinematic overhead shot',
        'Chin-up Angle': 'Chin-up angle, looking up',
        'Chin-down Angle': 'Chin-down angle, looking down',
        'Runway Model Angle': 'Runway model full body angle',
        'Street Style Fashion Angle': 'Street style fashion photography angle',
        'Editorial Portrait': 'Editorial magazine portrait angle',

        // Full Body
        'Standing Full Body Front': 'Full body standing front view',
        'Standing Full Body Side': 'Full body standing side view',
        'Standing 3/4 Angle': 'Standing 3/4 angle view',

        // Misc
        'Dynamic Motion Angle': 'Dynamic motion angle',
        '360 View — دوران من كل الاتجاهات': '360 degree rotation view simulation',
        'Camera Tilt Up': 'Camera tilting up',
        'Camera Tilt Down': 'Camera tilting down'
      };

      const lightMap: Record<string, string> = {
        'نفس الإضاءة': 'Keep original lighting conditions',
        'سينمائية': 'Cinematic dramatic lighting',
        'Soft Studio': 'Soft studio lighting',
        'Golden Hour': 'Golden hour warm lighting',
        'Moody Dark': 'Moody dark atmospheric lighting',
        'Neon Blue': 'Neon blue cyber lighting'
      };

      // Using the exact prompt structure requested
      const prompt = `
Rebuild this subject from a new angle:
Angle: ${angleMap[angle] || angle}
Lighting: ${lightMap[lighting] || lighting}

Rules:
- Keep full identity
- Keep original colors
- Do NOT change face or logo
- High detail, Apple clean commercial style
`;
      
      const res = await editImage(file, prompt);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert('فشلت عملية التدوير، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
      if (!result) return;
      const a = document.createElement('a');
      a.href = result;
      a.download = `moussa-rotation-${Date.now()}.png`;
      a.click();
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <RotateCw size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">🌀 مختبر تدوير موسى — Rotation Lab</h2>
                    <p className="text-gray-600 mt-2 leading-relaxed">
                        ارفع صورة منتج أو شخص…
                        واختر زاوية جديدة.
                    </p>
                </div>
            </div>
             <img 
                src="/Mariam_women_kids.jpg" 
                className="h-16 w-16 rounded-full object-contain border border-gray-200 bg-white shadow-sm hidden md:block" 
                alt="Logo"
                onError={(e) => e.currentTarget.style.display = 'none'}
             />
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
            
            {/* Inputs Side */}
            <div className="space-y-6">
                
                {/* Upload */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Upload size={18} className="text-indigo-500" />
                        📸 ارفع الصورة
                    </label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all h-64 flex flex-col items-center justify-center group
                            ${preview ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
                        {preview ? (
                            <>
                                <img src={preview} className="h-full w-full object-contain rounded-lg shadow-sm" alt="Preview" />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                    <ImageIcon size={32} className="text-gray-400" />
                                </div>
                                <span className="font-bold text-gray-600">اضغط لرفع الصورة</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">🌀 اختار الزاوية الجديدة</label>
                        <select 
                            value={angle} 
                            onChange={(e) => setAngle(e.target.value)} 
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-indigo-500 outline-none"
                        >
                            <optgroup label="زوايا أساسية">
                                <option>أمامية مباشرة</option>
                                <option>جانبية يمين</option>
                                <option>جانبية شمال</option>
                                <option>زاوية ٣/٤ يمين</option>
                                <option>زاوية ٣/٤ شمال</option>
                            </optgroup>

                            <optgroup label="زوايا سينمائية">
                                <option>زاوية سينمائية منخفضة</option>
                                <option>زاوية سينمائية عالية</option>
                                <option>زاوية الهيرو — Hero Angle</option>
                                <option>زاوية Dramatic Low</option>
                                <option>زاوية High Fashion Portrait</option>
                            </optgroup>

                            <optgroup label="زوايا احترافية للمنتجات">
                                <option>Top Shot — من أعلى</option>
                                <option>Flat Lay — مسطحة من فوق</option>
                                <option>Macro Close-up — قريبة جدًا</option>
                                <option>Side Product View — عرض جانبي</option>
                                <option>Front Facing Product</option>
                                <option>Perspective Angle — منظور</option>
                            </optgroup>

                            <optgroup label="زوايا 3D">
                                <option>زاوية 45 يمين — 3D View</option>
                                <option>زاوية 45 شمال — 3D View</option>
                                <option>Isometric Right</option>
                                <option>Isometric Left</option>
                                <option>Isometric Top</option>
                            </optgroup>

                            <optgroup label="زوايا للوجوه">
                                <option>زاوية بورتريه كلاسيكية</option>
                                <option>Bust Portrait Angle</option>
                                <option>Shoulder View Portrait</option>
                                <option>Over the Shoulder يمين</option>
                                <option>Over the Shoulder شمال</option>
                                <option>Profile Shot — بروفايل</option>
                                <option>Half Profile</option>
                            </optgroup>

                            <optgroup label="زوايا درامية">
                                <option>Dutch Angle — مائلة</option>
                                <option>Intense Close-up</option>
                                <option>Cinematic Overhead</option>
                                <option>Chin-up Angle</option>
                                <option>Chin-down Angle</option>
                            </optgroup>

                            <optgroup label="زوايا موضة">
                                <option>Runway Model Angle</option>
                                <option>Street Style Fashion Angle</option>
                                <option>Editorial Portrait</option>
                            </optgroup>

                            <optgroup label="زوايا للشخص واقف">
                                <option>Standing Full Body Front</option>
                                <option>Standing Full Body Side</option>
                                <option>Standing 3/4 Angle</option>
                            </optgroup>

                            <optgroup label="زوايا إضافية متنوعة">
                                <option>Dynamic Motion Angle</option>
                                <option>360 View — دوران من كل الاتجاهات</option>
                                <option>Camera Tilt Up</option>
                                <option>Camera Tilt Down</option>
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">💡 الإضاءة الجديدة (اختياري)</label>
                        <select 
                            value={lighting} 
                            onChange={(e) => setLighting(e.target.value)} 
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-indigo-500 outline-none"
                        >
                            <option>نفس الإضاءة</option>
                            <option>سينمائية</option>
                            <option>Soft Studio</option>
                            <option>Golden Hour</option>
                            <option>Moody Dark</option>
                            <option>Neon Blue</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={!file || loading}
                    className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <RotateCw size={24} />}
                    ✨ اعمل النسخة الجديدة
                </button>

            </div>

            {/* Result Side */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 min-h-[400px] flex flex-col items-center justify-center relative">
                 {!result && !loading && (
                    <div className="text-center text-gray-400">
                        <Maximize size={48} className="mx-auto mb-3 opacity-30" />
                        <p>النتيجة ستظهر هنا</p>
                    </div>
                 )}
                 
                 {loading && (
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="font-bold text-gray-600">جاري تدوير العنصر...</p>
                        <p className="text-xs text-gray-400 mt-2">قد يستغرق هذا بضع ثوانٍ</p>
                    </div>
                 )}

                 {result && (
                    <div className="w-full space-y-4 animate-fade-in">
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <img src={result} alt="Rotated Result" className="w-full rounded-xl" />
                        </div>
                        <button 
                            onClick={downloadImage}
                            className="w-full py-3 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            تحميل النتيجة
                        </button>
                    </div>
                 )}
            </div>

         </div>
      </div>
    </div>
  );
};