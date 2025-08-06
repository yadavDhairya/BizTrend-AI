
'use server';
/**
 * @fileOverview A flow that analyzes sales data for a specific customer.
 * 
 * - analyzeCustomerSales - A function that returns an AI-powered analysis of a single customer's purchase history.
 * - CustomerSalesAnalysisInput - The input type for the analyzeCustomerSales function.
 * - CustomerSalesAnalysisOutput - The return type for the analyzeCustomerSales function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { CustomerSalesAnalysisInputSchema, CustomerSalesAnalysisOutputSchema, type CustomerSalesAnalysisInput, type CustomerSalesAnalysisOutput } from '@/ai/schemas';

export { type CustomerSalesAnalysisInput, type CustomerSalesAnalysisOutput };

export async function analyzeCustomerSales(input: CustomerSalesAnalysisInput): Promise<CustomerSalesAnalysisOutput> {
  return analyzeCustomerSalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCustomerSalesPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: CustomerSalesAnalysisInputSchema},
  output: {schema: CustomerSalesAnalysisOutputSchema},
  prompt: `You are an expert retail analyst AI. A user has provided their entire sales history and asked for an analysis of a single customer.

**Customer to Analyze:** {{{customerIdentifier}}}
**Full Sales Data (JSON):** 
{{{salesData}}}

**Analysis Required:**
1.  **summary**: A one or two-sentence overview of the customer's value. Mention total spend and number of orders. (e.g., "This is a high-value customer with a total spend of X across Y orders.")
2.  **purchaseHistory**: A table (as a JSON array) of their recent transactions. Include date, items purchased (as a string), and the total amount for each transaction.
3.  **topProducts**: A list of the top 3-5 products or services this customer has purchased most frequently.
4.  **actionableInsight**: Provide one single, actionable insight to improve engagement or sales with this customer. Be specific. For example, "They frequently buy 'Product A'. Consider offering them a discount on the complementary 'Product B' on their next visit."

Filter the full sales data to only include records for the specified customer. Provide the full analysis in the structured JSON format.
`,
});

const analyzeCustomerSalesFlow = ai.defineFlow(
  {
    name: 'analyzeCustomerSalesFlow',
    inputSchema: CustomerSalesAnalysisInputSchema,
    outputSchema: CustomerSalesAnalysisOutputSchema,
  },
  async (input) => {
    const FILE_CHARACTER_LIMIT = 50000;
    let salesDataForAnalysis = input.salesData;
    let isTruncated = false;

    if (salesDataForAnalysis.length > FILE_CHARACTER_LIMIT) {
        salesDataForAnalysis = salesDataForAnalysis.substring(0, FILE_CHARACTER_LIMIT);
        isTruncated = true;
    }

    const {output} = await prompt({ ...input, salesData: salesDataForAnalysis });

    if (isTruncated && output?.summary) {
        output.summary += ' (Note: Analysis is based on a sample of the uploaded data due to size limitations.)';
    }

    return output!;
  }
);
