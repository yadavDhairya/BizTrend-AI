
'use server';
/**
 * @fileOverview A flow that analyzes daily sales data to provide insights.
 * 
 * - analyzeDailySales - A function that returns an AI-powered analysis of sales entries.
 * - AnalyzeDailySalesInput - The input type for the analyzeDailySales function.
 * - AnalyzeDailySalesOutput - The return type for the analyzeDailySales function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { AnalyzeDailySalesInputSchema, AnalyzeDailySalesOutputSchema, type AnalyzeDailySalesInput, type AnalyzeDailySalesOutput } from '@/ai/schemas';

export { type AnalyzeDailySalesInput, type AnalyzeDailySalesOutput };

export async function analyzeDailySales(input: AnalyzeDailySalesInput): Promise<AnalyzeDailySalesOutput> {
  return analyzeDailySalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDailySalesPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: AnalyzeDailySalesInputSchema},
  output: {schema: AnalyzeDailySalesOutputSchema},
  prompt: `You are a small business analyst AI. A user has provided a list of their daily sales records for a given period. Your task is to analyze this data and provide a concise, helpful summary. The data may include notes for each day, which you should use to provide more context for your insights.

**User's Sales Data (JSON):**
{{{salesData}}}

**Analysis Required:**
1.  **summary**: A one or two-sentence overview of the sales performance during this period. Mention the total profit and the general trend (e.g., "Overall, you had a profitable period with steady growth, earning a total net profit of...").
2.  **bestDay**: Identify the date with the highest net profit. Include the date and the profit amount.
3.  **worstDay**: Identify the date with the lowest net profit. Include the date and the profit amount.
4.  **actionableInsight**: Provide one single, actionable insight based on the data. Be specific. Use the notes to add context. For example, if sales were high on a day with a "Holiday Sale" note, you could say: "Your 'Holiday Sale' on [Date] was a huge success. Consider running similar promotions during other holidays to boost revenue."

Provide the full analysis in the structured JSON format.
`,
});

const analyzeDailySalesFlow = ai.defineFlow(
  {
    name: 'analyzeDailySalesFlow',
    inputSchema: AnalyzeDailySalesInputSchema,
    outputSchema: AnalyzeDailySalesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
