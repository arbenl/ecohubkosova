import { genkit } from "genkit"
import { googleAI } from "@genkit-ai/google-genai"
import * as z from "zod"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

// Get the directory name in an ES module environment
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the API key from the .env.local file
const envPath = path.resolve(__dirname, "..", "..", ".env.local")
const envFile = fs.readFileSync(envPath, "utf-8")
const apiKeyMatch = envFile.match(/^GEMINI_API_KEY=(.*)$/m)
const apiKey = apiKeyMatch ? apiKeyMatch[1].replace(/"/g, "") : undefined

// Initialize Genkit and the Google AI plugin.
export const ai = genkit({
  plugins: [googleAI({ apiKey })],
})

// Define a simple flow that takes a prompt and returns a response from Gemini.
export const simpleGeminiFlow = ai.defineFlow(
  {
    name: "simpleGeminiFlow",
    inputSchema: z.string().describe("The prompt for the model"),
    outputSchema: z.string().describe("The model's response"),
  },
  async (prompt) => {
    const response = await ai.generate({
      model: "gemini-2.5-pro", // Using the model specified by the user
      prompt: prompt,
    })

    return response.text
  }
)
