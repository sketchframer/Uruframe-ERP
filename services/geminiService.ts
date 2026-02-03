
import { GoogleGenAI } from "@google/genai";
import { Machine, FactoryEvent, Job } from "../types";

/**
 * Creates a new GoogleGenAI instance using the environment API key.
 * Always use process.env.API_KEY directly in the named parameter.
 */
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFactoryState = async (
  machines: Machine[],
  events: FactoryEvent[],
  jobs: Job[],
  userQuery: string
): Promise<string> => {
  // Create a new instance right before making the call
  const ai = getAiClient();
  
  // Prepare context data
  const contextData = {
    machineStatus: machines.map(m => ({ id: m.id, name: m.name, status: m.status, eff: m.efficiency })),
    recentEvents: events.slice(0, 15), // Last 15 events
    activeJobs: jobs.filter(j => j.status === 'IN_PROGRESS'),
  };

  const prompt = `
    You are an AI Plant Manager for a structure and profile factory.
    Here is the current real-time snapshot of the factory:
    ${JSON.stringify(contextData, null, 2)}

    User Query: "${userQuery}"

    Provide a concise, professional, and actionable insight or answer. 
    If asking about problems, look for ERROR status or LOW efficiency.
    Keep it under 100 words.
  `;

  try {
    // Generate content using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access the .text property directly
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to analyze factory data currently. Please check API connection.";
  }
};
