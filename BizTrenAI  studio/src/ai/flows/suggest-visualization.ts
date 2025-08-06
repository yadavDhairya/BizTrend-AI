
'use server';
/**
 * @fileOverview A flow that suggests the best visualization for a given dataset.
 * 
 * - suggestVisualization - A function that returns a recommended chart type, axes, and a report.
 * - SuggestVisualizationInput - The input type for the suggestVisualization function.
 * - SuggestVisualizationOutput - The return type for the suggestVisualization function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { SuggestVisualizationInputSchema, SuggestVisualizationOutputSchema, type SuggestVisualizationInput, type SuggestVisualizationOutput } from '@/ai/schemas';

export { type SuggestVisualizationInput, type SuggestVisualizationOutput };

export async function suggestVisualization(input: SuggestVisualizationInput): Promise<SuggestVisualizationOutput> {
  return suggestVisualizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVisualizationPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: SuggestVisualizationInputSchema},
  output: {schema: SuggestVisualizationOutputSchema},
  prompt: `You are an expert data visualization AI for small business owners in India. Your task is to analyze the structure of a dataset and determine the best way to visualize it. You must also generate a brief report explaining your choices and providing key insights.

**Data Structure:**
- Headers: {{{headers}}}
- Sample Rows (JSON): {{{sampleRows}}}

**Analysis and Recommendations:**

1.  **Choose the best \`chartType\`:**
    *   \`line\`: Best for time-series data (e.g., sales over time). Look for date or time-related headers.
    *   \`bar\`: Best for comparing categories (e.g., sales by product).
    *   \`pie\`: Best for showing proportions of a whole (e.g., expense categories). Requires a clear categorical column and a single numerical value.
    *   \`scatter\`: Best for showing the relationship between two numerical values (e.g., marketing spend vs. revenue).
    *   \`area\`: Good for showing volume over time, similar to a line chart.

2.  **Select \`xAxisKey\`:**
    *   For line/area charts, this should be the date or time column.
    *   For bar/pie charts, this should be the primary categorical column (e.g., 'Product', 'Category', 'City').
    *   For scatter charts, this should be one of the two numerical columns.

3.  **Select \`yAxisKey\`:**
    *   This must always be a numerical column. Choose the most important metric (e.g., 'Revenue', 'Profit', 'Sales', 'Amount').

4.  **Generate a \`report\` (as an HTML string):**
    *   Start with a heading \`<h3>Key Insights</h3>\`.
    *   Write a short paragraph explaining *why* you chose this chart type and these axes.
    *   Include a \`<ul>\` list with 2-3 bullet points highlighting key observations from the sample data. Be insightful. For example, "Your 'Samosa' product appears to be a top performer." or "There seems to be a steady upward trend in revenue during the first week of July."

**Important Rules:**
- The \`yAxisKey\` MUST be a header that contains numeric data.
- The \`xAxisKey\` and \`yAxisKey\` must be exact matches of the provided headers.
- If no logical visualization is possible, you can default to a bar chart with the first text column as X and the first number column as Y, but explain this limitation in your report.

Provide the full response in the structured JSON format.
`,
});

const suggestVisualizationFlow = ai.defineFlow(
  {
    name: 'suggestVisualizationFlow',
    inputSchema: SuggestVisualizationInputSchema,
    outputSchema: SuggestVisualizationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
