import { GoogleGenAI } from "@google/genai";

export interface GeminiAnalysisOptions {
  modelName?: string;
  apiKey?: string;
}

export interface GeminiAnalysisResult {
  rawText: string;
  modelName: string;
}

export async function callGeminiForAnalysis(
  prompt: string,
  options?: GeminiAnalysisOptions,
): Promise<GeminiAnalysisResult> {
  const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const modelName =
    options?.modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }

    return { rawText, modelName };
  } catch (error) {
    if (error instanceof Error) {
      const sanitized = error.message.replace(/key=[^&]+/gi, "key=[REDACTED]");
      throw new Error(`Gemini API error: ${sanitized}`);
    }
    throw new Error("Gemini API error: Unknown error occurred");
  }
}
