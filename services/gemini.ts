
import { GoogleGenAI } from "@google/genai";

// Always use a named parameter for the API key and obtain it directly from process.env.API_KEY
const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

export const getTennisTips = async (userPerformance: string) => {
  // API 키가 없으면 바로 기본값 반환
  if (!ai) {
    return "코트에서 즐거운 시간 되세요! 꾸준한 연습이 실력 향상의 지름길입니다.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional tennis coach for Sungkyunkwan University Tennis Club (STC). 
      Based on this player's recent match history: "${userPerformance}", 
      provide 3 short, encouraging technical tips for improvement. Keep it concise.`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });
    // Correctly accessing the text property from GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "코트에서 즐거운 시간 되세요! 꾸준한 연습이 실력 향상의 지름길입니다.";
  }
};

export const analyzeHistory = async (history: any[]) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze these recent club match results: ${JSON.stringify(history)}. 
            Identify the most active player and suggest a club-wide training focus. Return in plain text.`,
            config: {
                maxOutputTokens: 150,
            }
        });
        // Correctly accessing the text property from GenerateContentResponse
        return response.text;
    } catch (e) {
        return "Season is in full swing. Everyone is showing great spirit!";
    }
}
