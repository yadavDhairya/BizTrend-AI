
'use server';
/**
 * @fileOverview A flow that predicts future trends from time-series data.
 *
 * - predictTrends - A function that handles the prediction of future values.
 * - PredictTrendsInput - The input type for the predictTrends function.
 * - PredictTrendsOutput - The return type for the predictTrends function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { PredictTrendsInputSchema, PredictTrendsOutputSchema, type PredictTrendsInput, type PredictTrendsOutput } from '@/ai/schemas';

export { type PredictTrendsInput, type PredictTrendsOutput };

export async function predictTrends(input: PredictTrendsInput): Promise<PredictTrendsOutput> {
  return predictTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTrendsPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: PredictTrendsInputSchema},
  output: {schema: PredictTrendsOutputSchema},
  prompt: `You are a forecasting AI expert. Your task is to analyze the provided time-series data and predict the next 12 periods.

The user has provided data. You must identify the date/time information and the primary numeric values to be used for forecasting. The data could be in CSV format, or it could be from an image or PDF, so you may need to interpret the content first.

Based on your analysis, provide the following:
1.  **Forecast Data:** Create a JSON array containing both the historical data and the predicted data for the next 12 periods. Each object in the array should have a 'date'. For historical points, include the 'historical' value. For future points, include the 'predicted' value.
2.  **Summary:** A short, insightful summary of the forecast, highlighting the expected trend (e.g., growth, decline, stability).

Data to analyze:
{{{fileContent}}}`, 
});

const predictTrendsFlow = ai.defineFlow(
  {
    name: 'predictTrendsFlow',
    inputSchema: PredictTrendsInputSchema,
    outputSchema: PredictTrendsOutputSchema,
  },
  async input => {
    const FILE_CHARACTER_LIMIT = 50000;
    let fileContentForAnalysis = input.fileContent;
    let isTruncated = false;

    if (!input.fileContent.startsWith('data:') && input.fileContent.length > FILE_CHARACTER_LIMIT) {
        fileContentForAnalysis = input.fileContent.substring(0, FILE_CHARACTER_LIMIT);
        isTruncated = true;
    }

    const {output} = await prompt({ fileContent: fileContentForAnalysis });
    
    if (isTruncated && output?.summary) {
        output.summary += ' (Note: Analysis is based on a sample of the uploaded data due to size limitations.)';
    }

    return output!;
  }
);
