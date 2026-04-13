import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getBuilderAdvice = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a Base Builder Assistant. Your goal is to help developers build on the Base network (Coinbase's L2). 
        Provide technical advice, explain Builder Codes, and suggest quests. 
        Keep it concise, technical, and encouraging.
        
        User question: ${prompt}`
    });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm having trouble connecting to my AI brain right now. Please try again later!";
  }
};
