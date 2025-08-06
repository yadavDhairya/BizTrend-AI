
'use server';
/**
 * @fileOverview A flow that provides feedback on a user-submitted report or document.
 * 
 * - getReportFeedback - A function that returns AI-powered suggestions for improving a report.
 * - GetReportFeedbackInput - The input type for the getReportFeedback function.
 * - GetReportFeedbackOutput - The return type for the getReportFeedback function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { GetReportFeedbackInputSchema, GetReportFeedbackOutputSchema, type GetReportFeedbackInput, type GetReportFeedbackOutput } from '@/ai/schemas';

export { type GetReportFeedbackInput, type GetReportFeedbackOutput };

export async function getReportFeedback(input: GetReportFeedbackInput): Promise<GetReportFeedbackOutput> {
  return getReportFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getReportFeedbackPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: GetReportFeedbackInputSchema},
  output: {schema: GetReportFeedbackOutputSchema},
  prompt: `You are an expert business communication coach. A user has submitted a report or document and needs feedback on how to improve it. Your task is to analyze the text and provide specific, actionable suggestions in three key areas: Clarity, Conciseness, and Impact.

**User's Report Text:**
---
{{{reportText}}}
---

**Analysis Required:**

For each of the three categories below, identify the single most important area for improvement. Describe the problem you identified and then provide a clear, constructive suggestion on how to fix it.

1.  **Clarity:** Is the message clear and easy to understand? Is there any jargon or ambiguity?
    *   Identify a problem (e.g., "The main point is buried in a long paragraph.").
    *   Provide a suggestion (e.g., "Start the report with a clear, one-sentence summary of the key finding.").

2.  **Conciseness:** Is the language direct and to the point? Are there unnecessary words or sentences?
    *   Identify a problem (e.g., "Uses passive voice, making sentences wordy.").
    *   Provide a suggestion (e.g., "Rewrite sentences to use active voice. For example, change 'The decision was made by the team' to 'The team decided'.").

3.  **Impact:** Is the report persuasive and compelling? Does it drive the reader to a conclusion or action?
    *   Identify a problem (e.g., "The report presents data but doesn't explain its significance.").
    *   Provide a suggestion (e.g., "After presenting the sales data, add a sentence that explains what this data means for the business, such as 'This upward trend indicates a strong market fit for the new product.'").

Provide the full analysis in the structured JSON format.
`,
});

const getReportFeedbackFlow = ai.defineFlow(
  {
    name: 'getReportFeedbackFlow',
    inputSchema: GetReportFeedbackInputSchema,
    outputSchema: GetReportFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
