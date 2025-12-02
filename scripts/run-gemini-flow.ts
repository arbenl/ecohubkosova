import { simpleGeminiFlow } from "../src/flows/simple-gemini"
import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Enter your prompt for Gemini: ", async (prompt) => {
  if (!prompt) {
    console.log("Prompt cannot be empty.")
    rl.close()
    return
  }

  try {
    const response = await simpleGeminiFlow(prompt)
    console.log("Gemini Response:", response)
  } catch (error) {
    console.error("Error running Gemini flow:", error)
  } finally {
    rl.close()
  }
})
