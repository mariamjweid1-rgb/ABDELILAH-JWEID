import React, { useState } from 'react';
import { generateText } from '../services/geminiService';
import { BrainCircuit, Copy, Sparkles, Check, Loader2, MessageSquare, Type, Maximize2, Minimize2, Palette, Key, Info, Wand2, Lightbulb } from 'lucide-react';

interface ToolButtonProps {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
  color?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ label, icon: Icon, onClick, disabled, loading, color = "blue" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all shadow-sm
      ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : `bg-white text-gray-700 hover:bg-${color}-50 hover:text-${color}-600 hover:shadow-md border border-gray-200 hover:border-${color}-200`}
    `}
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : <Icon size={20} />}
    <span>{label}</span>
  </button>
);

export const BrainAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState<string | null>(null); // stores id of loading tool
  const [copied, setCopied] = useState(false);

  const styles = ['Cinematic', 'Photorealistic', 'Anime', 'Oil Painting', 'Cyberpunk', 'Minimalist', '3D Render', 'Apple Clean Style', 'Neon Noir'];

  const runTool = async (toolId: string, promptLogic: () => string) => {
    if (!input) return;
    setLoading(toolId);
    setOutput('');
    try {
      const prompt = promptLogic();
      const result = await generateText(prompt);
      setOutput(result.trim());
    } catch (e) {
      console.error(e);
      setOutput("حدث خطأ أثناء المعالجة.");
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <BrainCircuit size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🧠 موسى براين — Brain AI</h2>
                    <p className="text-gray-600 mt-2 leading-relaxed max-w-3xl">
                    اكتب فكرة، جملة، لقطة، كلمة… <br className="hidden md:block" />
                    وموسى هيديك أفكار سينمائية، كادرات، قصص، حملات، زوايا، مشاهد، تصوّر، ونتايج قوية جاهزة للاستخدام.
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

        {/* Input Area */}
        <div className="space-y-4 mb-8 mt-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الموضوع / الفكرة / البرومبت</label>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اكتب فكرتك هنا، أو كلمة واحدة، أو برومبت تريد تعديله..."
                    className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[120px] text-lg"
                />
            </div>
            
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold text-gray-700 mb-2">الستايل (لأداة تحويل الستايل)</label>
                <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-rose-500 outline-none"
                >
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <ToolButton 
                label="تحسين البرومبت"
                icon={Wand2}
                disabled={!input || !!loading}
                loading={loading === 'fix'}
                color="rose"
                onClick={() => runTool('fix', () => `
Fix and improve this prompt:
"${input}"
Make it clearer, cinematic, detailed.
                `)}
            />

            <ToolButton 
                label="من كلمة واحدة"
                icon={Type}
                disabled={!input || !!loading}
                loading={loading === 'word'}
                color="purple"
                onClick={() => runTool('word', () => `
Turn this word into a full cinematic image prompt:
"${input}"
Apple clean style.
                `)}
            />

            <ToolButton 
                label="توسيع البرومبت"
                icon={Maximize2}
                disabled={!input || !!loading}
                loading={loading === 'expand'}
                color="blue"
                onClick={() => runTool('expand', () => `
Expand this into a professional full image prompt:
"${input}"
Detailed, aesthetic, cinematic.
                `)}
            />

            <ToolButton 
                label="اختصار البرومبت"
                icon={Minimize2}
                disabled={!input || !!loading}
                loading={loading === 'short'}
                color="orange"
                onClick={() => runTool('short', () => `
Shorten this prompt without losing meaning:
"${input}"
                `)}
            />

             <ToolButton 
                label="5 أفكار متنوعة"
                icon={Sparkles}
                disabled={!input || !!loading}
                loading={loading === 'multi'}
                color="green"
                onClick={() => runTool('multi', () => `
Give me 5 different creative prompts for:
"${input}"
All cinematic, different styles.
                `)}
            />

            <ToolButton 
                label="10 أفكار إبداعية"
                icon={Lightbulb}
                disabled={!input || !!loading}
                loading={loading === 'creative10'}
                color="teal"
                onClick={() => runTool('creative10', () => `
Give me 10 creative ideas for:
"${input}"

Ideas must include:
- Visual scene idea
- Camera angle
- Lighting
- Background
- Style
- Creative twist
                `)}
            />

            <ToolButton 
                label="تحويل الستايل"
                icon={Palette}
                disabled={!input || !!loading}
                loading={loading === 'style'}
                color="pink"
                onClick={() => runTool('style', () => `
Convert this prompt:
"${input}"

Into style: ${style}
Full English prompt.
                `)}
            />

             <ToolButton 
                label="استخراج Keywords"
                icon={Key}
                disabled={!input || !!loading}
                loading={loading === 'key'}
                color="yellow"
                onClick={() => runTool('key', () => `
Extract the most important conceptual keywords from:
"${input}"
                `)}
            />

            <ToolButton 
                label="تحليل البرومبت"
                icon={Info}
                disabled={!input || !!loading}
                loading={loading === 'analyze'}
                color="indigo"
                onClick={() => runTool('analyze', () => `
Analyze this prompt:
"${input}"
Explain tone, style, clarity, missing elements.
                `)}
            />

        </div>

        {/* Output Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 min-h-[200px] relative group">
            <div className="absolute top-4 left-4 flex gap-2">
                {output && (
                    <button 
                        onClick={handleCopy}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-all border border-gray-200"
                        title="نسخ"
                    >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                    </button>
                )}
            </div>
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">المخرجات</h3>
            
            {output ? (
                <div className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed ltr" dir="ltr">
                    {output}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                    <MessageSquare size={32} className="mb-2" />
                    <p>النتائج ستظهر هنا...</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};