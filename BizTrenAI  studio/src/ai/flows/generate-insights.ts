
'use server';
/**
 * @fileOverview A flow that generates insights from a CSV file.
 *
 * - generateInsights - A function that handles the generation of insights from CSV data.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import { GenerateInsightsInputSchema, GenerateInsightsOutputSchema, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/ai/schemas';
import { googleAI } from '@genkit-ai/googleai';

export { type GenerateInsightsInput, type GenerateInsightsOutput };

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateInsightsPrompt',
    model: googleAI.model('gemini-1.5-pro'),
    input: { schema: GenerateInsightsInputSchema },
    output: { schema: GenerateInsightsOutputSchema },
    prompt: `You are an expert data analyst AI. Your task is to analyze the provided data and generate a comprehensive summary.
The user has provided a file. You must first identify the structure and language of the data.

Analyze the following content:
{{#if (contains fileContent 'data:')}}
  {{media url=fileContent}}
{{else}}
  {{{fileContent}}}
{{/if}}

Based on your analysis, provide the following in an HTML string format:
1.  A heading "Key Insights" followed by a <ul> list of 3-5 bullet points highlighting the most important findings.
2.  A heading "Main Trends" followed by a short paragraph describing the primary trends or patterns observed.
3.  A heading "Actionable Recommendations" followed by a <ul> list of 1-2 suggestions for what the user could do based on these insights.

Keep the language clear, concise, and professional.
`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    // Set a character limit to avoid exceeding API rate limits with large files.
    // This limit applies to text content, not data URIs.
    const FILE_CHARACTER_LIMIT = 50000; 
    let fileContentForAnalysis = input.fileContent;
    let isTruncated = false;

    if (!input.fileContent.startsWith('data:') && input.fileContent.length > FILE_CHARACTER_LIMIT) {
      fileContentForAnalysis = input.fileContent.substring(0, FILE_CHARACTER_LIMIT);
      isTruncated = true;
    }
    
    const {output} = await prompt({ fileContent: fileContentForAnalysis });

    if (isTruncated && output?.insights) {
        output.insights += '<p class="text-xs text-muted-foreground mt-4">Note: These insights are based on a sample of the uploaded data.</p>';
    }
    
    return output!;
  }
);
