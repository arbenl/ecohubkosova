
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

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

    // 2. Make a request to the models API
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log('Fetching models from:', url);

    const response = await axios.get(url);

    // 3. Print the list of available models
    if (response.data && response.data.models) {
      console.log('Available models:');
      response.data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
        console.log(`  Description: ${model.description}`);
        console.log(`  Supported generation methods: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('---');
      });
    } else {
      console.log('No models found.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Error fetching models:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error fetching models:', error.message);
    }
  }
}

main();
