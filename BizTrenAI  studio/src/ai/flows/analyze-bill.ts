
'use server';
/**
 * @fileOverview A flow that analyzes an uploaded bill (image/PDF) to extract expense data.
 * 
 * - analyzeBill - A function that performs OCR and data extraction on a bill file.
 * - AnalyzeBillInput - The input type for the analyzeBill function.
 * - AnalyzeBillOutput - The return type for the analyzeBill function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { AnalyzeBillInputSchema, AnalyzeBillOutputSchema, type AnalyzeBillInput, type AnalyzeBillOutput } from '@/ai/schemas';

export { type AnalyzeBillInput, type AnalyzeBillOutput };

export async function analyzeBill(input: AnalyzeBillInput): Promise<AnalyzeBillOutput> {
  return analyzeBillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBillPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: AnalyzeBillInputSchema},
  output: {schema: AnalyzeBillOutputSchema},
  prompt: `You are an expert expense tracking AI. Your task is to perform Optical Character Recognition (OCR) on the provided image or PDF of a bill/receipt and extract key information.

The user has uploaded a file. Analyze it and extract the following details:
1.  **Vendor:** The name of the shop, store, or service provider.
2.  **Date:** The date the transaction occurred.
3.  **Total Amount:** The final, total amount paid. This is often labeled as "Total", "Grand Total", or "Net Amount".
4.  **Line Items:** A list of individual items purchased, including their description and total price. If quantity or unit price are available, include them.
5.  **Summary:** A brief, one-sentence summary of the expense (e.g., "Grocery purchase from BigBasket for ₹1,234.56.").

If any information is unclear or cannot be found, leave the corresponding field empty but try your best to extract as much detail as possible.

File to analyze:
{{media url=fileContent}}`,
});

const analyzeBillFlow = ai.defineFlow(
  {
    name: 'analyzeBillFlow',
    inputSchema: AnalyzeBillInputSchema,
    outputSchema: AnalyzeBillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
