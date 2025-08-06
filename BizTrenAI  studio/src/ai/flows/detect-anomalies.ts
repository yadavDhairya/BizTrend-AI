
'use server';
/**
 * @fileOverview A flow that detects anomalies in time-series data.
 *
 * - detectAnomalies - A function that handles the anomaly detection process.
 * - DetectAnomaliesInput - The input type for the detectAnomalies function;
 * - DetectAnomaliesOutput - The return type for the detectAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { DetectAnomaliesInputSchema, DetectAnomaliesOutputSchema, type DetectAnomaliesInput, type DetectAnomaliesOutput } from '@/ai/schemas';

export { type DetectAnomaliesInput, type DetectAnomaliesOutput };

export async function detectAnomalies(input: DetectAnomaliesInput): Promise<DetectAnomaliesOutput> {
  return detectAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAnomaliesPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: DetectAnomaliesInputSchema},
  output: {schema: DetectAnomaliesOutputSchema},
  prompt: `You are an expert anomaly detection AI. Your task is to analyze the provided time-series data and identify any unusual patterns or outliers.

The user has provided data. You must identify the date/time information and the primary numeric values to analyze for anomalies. The data could be in CSV format, or it could be from an image or PDF, so you may need to interpret the content first.

Based on your analysis, provide the following:
1.  **Anomalies:** Create a JSON array of objects, where each object represents a detected anomaly. Include the 'date', the anomalous 'value', and a brief 'reason' explaining why it's considered an outlier (e.g., "significantly higher than the moving average", "unusual spike in activity").
2.  **Summary:** A short, insightful summary of your findings. If no anomalies are found, state that the data appears stable.

Data to analyze:
{{{fileContent}}}`,
});

const detectAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAnomaliesFlow',
    inputSchema: DetectAnomaliesInputSchema,
    outputSchema: DetectAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
