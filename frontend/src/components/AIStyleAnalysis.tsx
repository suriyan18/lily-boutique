import { useState, useRef } from 'react';
import { Sparkles, Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStyleKeywords } from '../services/geminiService';

interface AIStyleAnalysisProps {
  onAnalysisComplete: (keywords: string) => void;
}

export default function AIStyleAnalysis({ onAnalysisComplete }: AIStyleAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const keywords = await getStyleKeywords(base64);
      if (keywords) {
        onAnalysisComplete(keywords);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-brand-600 to-brand-800 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <Sparkles size={20} />
        <span>AI Style Match</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="bg-brand-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600">
                  <Sparkles size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">AI Style Analysis</h3>
                <p className="text-gray-500">Upload an image of a style you love, and we'll find matching items from our boutique.</p>
              </div>

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-100 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all"
                >
                  <Upload size={40} className="text-brand-400 mb-4" />
                  <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-6">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                      <Loader2 size={40} className="animate-spin mb-4" />
                      <p className="font-bold">Analyzing Style...</p>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <button
                      onClick={clear}
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-600 hover:text-brand-600 shadow-lg"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                  Our AI analyzes colors, patterns, and silhouettes to find your perfect match.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
