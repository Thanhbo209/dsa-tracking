import { GoogleGenAI } from "@google/genai";

export interface GeminiAnalysisOptions {
  modelName?: string;
  apiKey?: string;
}

export interface GeminiAnalysisResult {
  rawText: string;
  modelName: string;
}

export class GeminiServiceError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "GeminiServiceError";
    this.status = status;
    this.details = details;
  }
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
    options?.modelName || process.env.GEMINI_MODEL || "gemini-3.6-flash";

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
      const status = "status" in error && typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;
      const details = "details" in error ? (error as { details: unknown }).details : undefined;
      throw new GeminiServiceError(`Gemini API error: ${sanitized}`, status, details);
    }
    throw new GeminiServiceError("Gemini API error: Unknown error occurred");
  }
}
