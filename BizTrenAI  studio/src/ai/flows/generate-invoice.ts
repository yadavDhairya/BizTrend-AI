
'use server';
/**
 * @fileOverview A flow that generates an invoice HTML from structured data.
 *
 * - generateInvoice - A function that handles the invoice generation process.
 * - GenerateInvoiceInput - The input type for the generateInvoice function.
 * - GenerateInvoiceOutput - The return type for the generateInvoice function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { GenerateInvoiceInputSchema, GenerateInvoiceOutputSchema, type GenerateInvoiceInput, type GenerateInvoiceOutput } from '@/ai/schemas';

export { type GenerateInvoiceInput, type GenerateInvoiceOutput };

export async function generateInvoice(input: GenerateInvoiceInput): Promise<GenerateInvoiceOutput> {
  return generateInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvoicePrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: {schema: GenerateInvoiceInputSchema},
  output: {schema: GenerateInvoiceOutputSchema},
  prompt: `You are an expert invoice designer AI. Your task is to generate a clean, professional, and well-structured HTML document for an invoice based on the provided JSON data.

The design should be modern and easy to read. Use inline CSS for styling to ensure compatibility across email clients and browsers. Do not use any external stylesheets, images, or JavaScript. The entire output must be a single, self-contained HTML file.

**User's Custom Prompt:** {{{prompt}}}

**Invoice Data:**
- From: {{{companyName}}}, {{{companyAddress}}}
- To: {{{clientName}}}, {{{clientAddress}}}
- Invoice Number: {{{invoiceNumber}}}
- Date: {{{date}}}
- Due Date: {{{dueDate}}}
- Items:
{{#each items}}
  - Description: {{{description}}}, Quantity: {{{quantity}}}, Price: {{{price}}}, Total: {{{total}}}
{{/each}}
- Subtotal: {{{subTotal}}}
- GST ({{gstRate}}%): {{{gstAmount}}}
- Grand Total: {{{grandTotal}}}
- Notes: {{{notes}}}
- Payment Instructions: {{{paymentInstructions}}}

Based on this data, generate a complete HTML document for the invoice. The HTML should be ready to be rendered or printed. Make sure to include all details clearly, especially the line items, subtotal, GST, and grand total. Structure it like a real, professional invoice.
`,
});

const generateInvoiceFlow = ai.defineFlow(
  {
    name: 'generateInvoiceFlow',
    inputSchema: GenerateInvoiceInputSchema,
    outputSchema: GenerateInvoiceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
