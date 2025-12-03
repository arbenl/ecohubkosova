
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  try {
    // 1. Load the .env.local file
    const envPath = path.resolve(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('Error: .env.local file not found.');
      return;
    }
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envFile.match(/^GEMINI_API_KEY=(.*)$/m);
    if (!apiKeyMatch || !apiKeyMatch[1]) {
      console.error('Error: GEMINI_API_KEY not found in .env.local file.');
      return;
    }
    const apiKey = apiKeyMatch[1].replace(/"/g, '');

    // 2. Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // 4. Generate content
    const prompt = 'list mcp servers';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response:', text);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
