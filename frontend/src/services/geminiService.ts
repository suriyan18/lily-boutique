import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateProductImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  try {
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
    throw error;
  }
};

export const analyzeStyle = async (imageBase64: string) => {
  try {
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
    throw error;
  }
};

export const getStyleKeywords = async (imageBase64: string) => {
  try {
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
    throw error;
  }
};
