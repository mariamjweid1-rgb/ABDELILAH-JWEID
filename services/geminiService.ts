import { GoogleGenAI, Modality, Type } from "@google/genai";

// Helper to ensure API key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert file to base64
export const fileToGenericPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Image Generation using Imagen 4.0
 */
export const generateImage = async (prompt: string, aspectRatio: string = '1:1'): Promise<string> => {
  const ai = getClient();
  
  // Using imagen-4.0-generate-001 as per guidelines for high quality
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64ImageBytes) throw new Error("No image generated");
  
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

/**
 * Product Fusion (Image Editing)
 * Places a product into a context using gemini-2.5-flash-image.
 */
export const fuseProductImage = async (productFile: File, backgroundFile: File | null, contextPrompt: string): Promise<string> => {
  const ai = getClient();
  const productPart = await fileToGenericPart(productFile);
  const parts: any[] = [productPart];

  let instruction = `
    You are an expert product photographer and editor.
    Task: Place the product from the provided image into a scene described as: "${contextPrompt}".
  `;

  if (backgroundFile) {
    const bgPart = await fileToGenericPart(backgroundFile);
    parts.push(bgPart);
    instruction += `
    Usage: Use the second image provided as the exact background reference. Composite the product into this background realistically.
    `;
  }

  instruction += `
    Requirements: 
    1. Maintain the product's exact shape, dimensions, and logo details.
    2. Match the lighting, shadows, and perspective of the background perfectly.
    3. Ensure a realistic integration as if photographed in that scene.
    4. Return ONLY the final fused image.
  `;

  parts.push({ text: instruction });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  throw new Error("Failed to fuse product image.");
};

/**
 * Outfit Changer
 * Swaps clothes on a person using Gemini 2.5 Flash Image with precise Pose Logic
 */
export const changeOutfit = async (
  personFile: File, 
  clothesFile: File, 
  gender: string,
  background: string,
  hiddenModel: string,
  userInstruction: string, 
  targetPose: string
): Promise<string> => {
  const ai = getClient();
  const personPart = await fileToGenericPart(personFile);
  const clothesPart = await fileToGenericPart(clothesFile);

  // Robust prompt for Virtual Try-On
  const prompt = `
    Task: Virtual Try-On / Fashion Composite.
    
    Reference Images:
    1. Model Image (Target Person).
    2. Garment Image (Clothing source).
    
    Goal: Generate a realistic image of the Model wearing the Garment.
    
    Configuration:
    - Pose: ${targetPose}
    - Gender/Style: ${gender}
    - Background: ${background}
    - Mode: ${hiddenModel === 'مفعّل — عرض الملابس فقط' ? 'Ghost Mannequin / Invisible Model' : 'Photorealistic Model'}
    - Additional Info: "${userInstruction}"
    
    Guidelines:
    - Apply the garment to the model naturally, respecting fabric physics.
    - Maintain the visual characteristics of the model's face and body structure to look like the reference.
    - Maintain the details, patterns, and logos of the garment.
    - Ensure high quality, photorealistic lighting and texture.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [personPart, clothesPart, { text: prompt }]
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  // If text is returned instead of image (refusal or error explanation), we log it.
  if (part && part.text) {
      console.warn("Model returned text instead of image:", part.text);
  }
  
  throw new Error("Failed to change outfit. The model might have refused the request or failed to generate an image.");
};

/**
 * Smart Analysis using Gemini 2.5 Flash
 */
export const analyzeImage = async (imageFile: File): Promise<string> => {
  const ai = getClient();
  const imagePart = await fileToGenericPart(imageFile);

  const prompt = `
    Analyze this image in detail (Arabic language).
    Structure the response in Markdown:
    1. **Visual Description (وصف مرئي):** What is in the image?
    2. **Technical Analysis (تحليل تقني):** Lighting, composition, colors.
    3. **Improvement Suggestions (اقتراحات للتحسين):** How to make it better?
    4. **Potential Use Cases (حالات الاستخدام):** Where can this be used?
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [imagePart, { text: prompt }]
    },
  });

  return response.text || "لم أتمكن من تحليل الصورة.";
};

/**
 * Text Generation (Brain AI)
 */
export const generateText = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { text: prompt },
  });

  return response.text || "لا توجد إجابة.";
};

/**
 * Text Generation from Image (Analysis Tools)
 */
export const generateTextFromImage = async (imageFile: File, prompt: string): Promise<string> => {
    const ai = getClient();
    const imagePart = await fileToGenericPart(imageFile);
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
    });
  
    return response.text || "لا توجد إجابة.";
};

/**
 * Image Editing (Advanced Tools / Rotation Lab)
 */
export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
    const ai = getClient();
    const imagePart = await fileToGenericPart(imageFile);
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("Failed to edit image.");
};