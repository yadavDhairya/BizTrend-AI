
'use server';
/**
 * @fileOverview A flow that provides a suggestion for improving gross margin.
 * 
 * - analyzeGrossMargin - A function that returns an AI-powered suggestion.
 * - AnalyzeGrossMarginInput - The input type for the analyzeGrossMargin function.
 * - AnalyzeGrossMarginOutput - The return type for the analyzeGrossMargin function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { AnalyzeGrossMarginInputSchema, AnalyzeGrossMarginOutputSchema, type AnalyzeGrossMarginInput, type AnalyzeGrossMarginOutput } from '@/ai/schemas';

export { type AnalyzeGrossMarginInput, type AnalyzeGrossMarginOutput };

export async function analyzeGrossMargin(input: AnalyzeGrossMarginInput): Promise<AnalyzeGrossMarginOutput> {
  return analyzeGrossMarginFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeGrossMarginPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: AnalyzeGrossMarginInputSchema},
  output: {schema: AnalyzeGrossMarginOutputSchema},
  prompt: `You are a business consultant AI. A user has provided their financial numbers and needs a suggestion to improve their gross margin.

**User's Data:**
- Total Revenue: {{{totalRevenue}}}
- Cost of Goods Sold (COGS): {{{costOfGoodsSold}}}
- Current Gross Margin: {{{currentMargin}}}%

Based on this data, provide **one single, concise, and actionable suggestion**. Frame the suggestion in a helpful and encouraging tone. Focus on a common business strategy like reducing COGS, optimizing pricing, or improving product mix.

Example of a good suggestion: "Consider exploring bulk purchasing options for your raw materials. This could lower your 'Cost of Goods Sold' and directly boost your margin."
Example of a bad suggestion: "You should increase your revenue and decrease your costs." (This is too generic).

Your suggestion should be specific enough to be useful.
`,
});

const analyzeGrossMarginFlow = ai.defineFlow(
  {
    name: 'analyzeGrossMarginFlow',
    inputSchema: AnalyzeGrossMarginInputSchema,
    outputSchema: AnalyzeGrossMarginOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
