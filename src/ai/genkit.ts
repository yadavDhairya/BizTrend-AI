import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});

// Export a helper function to check if AI is available
export const isAIEnabled = () => true;