
import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHabitInsight = async (habitName: string, description: string): Promise<AISuggestion | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I want to start a habit called "${habitName}" described as: "${description}". 
      Please provide a JSON object with:
      1. identityStatement: A powerful "I am" statement related to this habit (e.g., "I am a runner" for a running habit).
      2. motivation: A short, high-impact motivational sentence.
      3. tips: 3 specific, actionable tips to succeed with this habit.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identityStatement: { type: Type.STRING },
            motivation: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["identityStatement", "motivation", "tips"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text.trim()) as AISuggestion;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const getDailyInspiration = async (habits: string[]): Promise<string> => {
  try {
    const habitsList = habits.length > 0 ? habits.join(", ") : "becoming a better version of myself";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user is tracking these habits: ${habitsList}. Give them a single, short (max 20 words), powerful morning greeting that inspires them to stay consistent today.`
    });
    return response.text || "Every small step counts. Stay consistent!";
  } catch (error) {
    return "The journey of a thousand miles begins with a single step.";
  }
};
