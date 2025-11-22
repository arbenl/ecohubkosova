import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as z from 'zod';

// Initialize Genkit and the Google AI plugin.
// It will automatically use the GEMINI_API_KEY from your .env.local file.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

// Define a simple flow that takes a prompt and returns a response from Gemini.
export const simpleGeminiFlow = ai.defineFlow(
  {
    name: 'simpleGeminiFlow',
    inputSchema: z.string().describe('The prompt for the model'),
    outputSchema: z.string().describe("The model's response"),
  },
  async (prompt) => {
    const response = await ai.generate({
      model: 'gemini-1.5-pro-latest', // Using the powerful model you requested
      prompt: prompt,
    });

    return response.text;
  }
);
