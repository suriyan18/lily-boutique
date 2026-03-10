import { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { analyzeStyle } from '../services/geminiService';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function StyleFinder() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzeStyle(image);
      setAnalysis(result);
    } catch (err) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">AI Style Finder</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Upload a photo of an outfit or item you love, and our AI will analyze the style and suggest matching pieces from our collection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[3/4] rounded-3xl border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative ${image ? 'border-brand-500' : 'border-brand-100 hover:border-brand-300 bg-white'}`}
            >
              {image ? (
                <img src={image} alt="Upload" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="bg-brand-50 p-6 rounded-full text-brand-600 mb-4">
                    <Upload size={40} />
                  </div>
                  <p className="font-bold text-gray-900">Click to upload photo</p>
                  <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            <button 
              onClick={handleAnalyze}
              disabled={!image || loading}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              <span>{loading ? 'Analyzing Style...' : 'Analyze My Style'}</span>
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-50 min-h-[400px]">
            {analysis ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-brand max-w-none">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 border-b border-brand-50 pb-4">Style Analysis</h3>
                <div className="text-gray-600 leading-relaxed">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
                <button className="mt-8 w-full bg-brand-50 text-brand-600 py-3 rounded-xl font-bold hover:bg-brand-100 transition-all flex items-center justify-center">
                  Shop Recommended Items <ArrowRight size={18} className="ml-2" />
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <Sparkles size={40} />
                </div>
                <p>Upload a photo to see <br />AI-powered style recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
