import { GoogleGenAI, Type } from "@google/genai";

const getAiInstance = () => {
  // Use Vite's import.meta.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API feature is disabled: No API key found.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `High-end fashion product photography of ${prompt}. Elegant, boutique style, studio lighting, royal purple and cream background.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return a dummy image or throw to be handled by the component gracefully
    throw error;
  }
};

export const analyzeStyle = async (imageBase64: string) => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } },
          { text: "Analyze this fashion item. Identify the style, color palette, and suggest 3 matching items for a complete boutique look. Return the response in a structured format." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Style analysis failed:", error);
    return "Style analysis is currently unavailable (API Key missing).";
  }
};

export const getStyleKeywords = async (imageBase64: string) => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } },
          { text: "Analyze this fashion item and provide 3-5 specific keywords that describe its style, color, and type (e.g., 'floral midi dress', 'silk wrap', 'velvet'). Only return the keywords separated by commas." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Keyword generation failed:", error);
    return "elegant, fashion, new arrival";
  }
};
