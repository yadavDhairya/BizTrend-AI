import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check if API key is available
const hasApiKey = process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your_google_api_key_here';

export const ai = genkit({
  plugins: hasApiKey ? [googleAI()] : [],
});

// Export a helper function to check if AI is available
export const isAIEnabled = () => hasApiKey;