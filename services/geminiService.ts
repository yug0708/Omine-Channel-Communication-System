import { GoogleGenAI } from "@google/genai";

export const summarizeTicket = async (description: string): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
    return "Error: Gemini API key is not configured.";
  }
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following support ticket description in 2-3 bullet points for a busy agent. Focus on the core problem and any specific details provided by the user:\n\n---\n\n${description}`,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error summarizing with Gemini:", error);
    return "Could not generate summary. Please try again.";
  }
};
