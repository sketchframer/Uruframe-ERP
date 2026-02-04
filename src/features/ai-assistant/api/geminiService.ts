import { GoogleGenAI } from '@google/genai';
import type { Machine, FactoryEvent, Job } from '@/shared/types';

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface FactoryContext {
  machines: Pick<Machine, 'id' | 'name' | 'status' | 'efficiency'>[];
  recentEvents: FactoryEvent[];
  activeJobs: Job[];
}

export async function analyzeFactoryState(
  context: FactoryContext,
  userQuery: string
): Promise<string> {
  const ai = getAiClient();

  const prompt = `
    You are an AI Plant Manager for a structure and profile factory.
    Here is the current real-time snapshot of the factory:
    ${JSON.stringify(context, null, 2)}

    User Query: "${userQuery}"

    Provide a concise, professional, and actionable insight or answer.
    If asking about problems, look for ERROR status or LOW efficiency.
    Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text ?? 'No insights available at the moment.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Unable to analyze factory data currently. Please check API connection.';
  }
}
