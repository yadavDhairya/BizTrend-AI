
'use server';
/**
 * @fileOverview A flow that generates market analysis for a given industry and topic.
 *
 * - analyzeMarket - A function that handles the market analysis process.
 * - MarketAnalysisInput - The input type for the analyzeMarket function.
 * - MarketAnalysisOutput - The return type for the analyzeMarket function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { MarketAnalysisInputSchema, MarketAnalysisOutputSchema, type MarketAnalysisInput, type MarketAnalysisOutput } from '@/ai/schemas';

export { type MarketAnalysisInput, type MarketAnalysisOutput };

export async function analyzeMarket(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return analyzeMarketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: MarketAnalysisInputSchema},
  output: {schema: MarketAnalysisOutputSchema},
  prompt: `You are an expert business consultant AI specializing in helping small businesses in India. Your task is to generate a concise, insightful report on the current state of a specific industry based on a given topic.

Focus on providing practical, actionable information for a small business owner. The report should be structured and easy to read. Use simple language and markdown for formatting.

**Industry:** {{{industry}}}
**Topic of Interest:** {{{topic}}}

**Report Structure:**
1.  **## Top 3 Takeaways for a Small Business:** A brief, direct summary of the most critical points a small business owner needs to know.
2.  **## Key Opportunities:** 2-3 bullet points identifying potential opportunities. Focus on low-cost or realistic ideas a small business can implement (e.g., "Tap into the growing demand for organic products with a small, curated selection" instead of "Launch a nationwide distribution network").
3.  **## Potential Challenges:** 2-3 bullet points outlining challenges relevant to a small player (e.g., "Competition from larger, established online sellers" instead of "Global supply chain disruptions").
4.  **## A Simple First Step:** Suggest one single, easy-to-implement action the business owner could take this week based on the analysis.

Generate the report based on this structure.`,
});

const analyzeMarketFlow = ai.defineFlow(
  {
    name: 'analyzeMarketFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
