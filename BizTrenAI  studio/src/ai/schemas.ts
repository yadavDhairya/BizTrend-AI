
import { z } from 'zod';

// generate-insights.ts
export const GenerateInsightsInputSchema = z.object({
  fileContent: z.string().describe("The raw text content or a data URI of a user-uploaded file to analyze."),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

export const GenerateInsightsOutputSchema = z.object({
  insights: z.string().describe('The generated insights from the file data, formatted as an HTML string.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

// predict-trends.ts
export const PredictTrendsInputSchema = z.object({
  fileContent: z.string().describe("The raw text content or a data URI of a user-uploaded file to analyze for trends."),
});
export type PredictTrendsInput = z.infer<typeof PredictTrendsInputSchema>;

const ForecastItemSchema = z.object({
  date: z.string().describe("The date for the data point."),
  historical: z.number().optional().describe("The historical value for the date."),
  predicted: z.number().optional().describe("The predicted value for the date."),
});

export const PredictTrendsOutputSchema = z.object({
  forecast: z.array(ForecastItemSchema).describe("An array of historical and predicted data points."),
  summary: z.string().describe("A summary of the prediction."),
});
export type PredictTrendsOutput = z.infer<typeof PredictTrendsOutputSchema>;

// detect-anomalies.ts
export const DetectAnomaliesInputSchema = z.object({
  fileContent: z.string().describe("The raw text content or a data URI of a user-uploaded file to analyze for anomalies."),
});
export type DetectAnomaliesInput = z.infer<typeof DetectAnomaliesInputSchema>;

const AnomalyItemSchema = z.object({
  date: z.string().describe("The date of the anomaly."),
  value: z.number().describe("The value of the anomalous data point."),
  reason: z.string().describe("A brief explanation of why this point is considered an anomaly."),
});

export const DetectAnomaliesOutputSchema = z.object({
  anomalies: z.array(AnomalyItemSchema).describe("An array of detected anomalies."),
  summary: z.string().describe("A summary of the anomaly detection findings."),
});
export type DetectAnomaliesOutput = z.infer<typeof DetectAnomaliesOutputSchema>;

// generate-invoice.ts
export const InvoiceItemSchema = z.object({
    description: z.string(),
    quantity: z.coerce.number(),
    price: z.coerce.number(),
    total: z.coerce.number(),
});
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const GenerateInvoiceInputSchema = z.object({
    companyName: z.string().describe("Your company's name."),
    companyAddress: z.string().describe("Your company's address."),
    clientName: z.string().describe("Your client's name."),
    clientAddress: z.string().describe("Your client's address."),
    invoiceNumber: z.string().describe("A unique invoice number."),
    date: z.string().describe("The date the invoice was issued."),
    dueDate: z.string().describe("The date the payment is due."),
    items: z.array(InvoiceItemSchema).describe("An array of line items for the invoice."),
    subTotal: z.number().describe("The subtotal of all items before tax."),
    gstRate: z.number().describe("The GST rate applied."),
    gstAmount: z.number().describe("The calculated GST amount."),
    grandTotal: z.number().describe("The final amount including GST."),
    notes: z.string().optional().describe("Any additional notes or terms."),
    paymentInstructions: z.string().optional().describe("Instructions for how the client can pay."),
    prompt: z.string().optional().describe("A custom AI prompt to influence the invoice style or content (e.g., 'Make the tone very formal')."),
});
export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceInputSchema>;

export const GenerateInvoiceOutputSchema = z.object({
  invoiceHtml: z.string().describe("The full HTML content of the generated invoice, ready to be displayed or printed."),
});
export type GenerateInvoiceOutput = z.infer<typeof GenerateInvoiceOutputSchema>;


// market-analysis.ts
export const MarketAnalysisInputSchema = z.object({
  industry: z.string().describe("The industry to analyze (e.g., Retail, SaaS, Healthcare)."),
  topic: z.string().describe("The specific topic to focus on (e.g., customer retention, new technologies, supply chain)."),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

export const MarketAnalysisOutputSchema = z.object({
  report: z.string().describe("A comprehensive report on the market trends, opportunities, and challenges for the given industry and topic. The report should be well-structured, using markdown for formatting (e.g., headings, bullet points)."),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

// analyze-gross-margin.ts
export const AnalyzeGrossMarginInputSchema = z.object({
    totalRevenue: z.number().describe("The total revenue or sales."),
    costOfGoodsSold: z.number().describe("The direct cost of producing the goods sold."),
    currentMargin: z.number().describe("The calculated gross margin percentage."),
});
export type AnalyzeGrossMarginInput = z.infer<typeof AnalyzeGrossMarginInputSchema>;

export const AnalyzeGrossMarginOutputSchema = z.object({
  suggestion: z.string().describe("A single, actionable suggestion for how to improve the gross margin."),
});
export type AnalyzeGrossMarginOutput = z.infer<typeof AnalyzeGrossMarginOutputSchema>;


// analyze-bill.ts
export const AnalyzeBillInputSchema = z.object({
  fileContent: z.string().describe("A data URI of a user-uploaded bill (image or PDF) to analyze."),
});
export type AnalyzeBillInput = z.infer<typeof AnalyzeBillInputSchema>;

const BillItemSchema = z.object({
  description: z.string().describe("The name or description of the item purchased."),
  quantity: z.number().optional().describe("The quantity of the item."),
  price: z.number().optional().describe("The unit price of the item."),
  total: z.number().describe("The total price for this line item."),
});

export const AnalyzeBillOutputSchema = z.object({
  vendor: z.string().optional().describe("The name of the vendor or store."),
  date: z.string().optional().describe("The date of the transaction."),
  totalAmount: z.number().optional().describe("The final total amount on the bill."),
  items: z.array(BillItemSchema).optional().describe("An array of line items from the bill."),
  summary: z.string().describe("A brief summary of the expenses from the bill."),
});
export type AnalyzeBillOutput = z.infer<typeof AnalyzeBillOutputSchema>;

// analyze-daily-sales.ts
export const DailySaleItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  revenue: z.number(),
  costs: z.number(),
  profit: z.number(),
  notes: z.string().optional(),
});
export type DailySaleItem = z.infer<typeof DailySaleItemSchema>;

export const AnalyzeDailySalesInputSchema = z.object({
  salesData: z.string().describe("A JSON string of daily sales data to be analyzed."),
});
export type AnalyzeDailySalesInput = z.infer<typeof AnalyzeDailySalesInputSchema>;

const DayAnalysisSchema = z.object({
    date: z.string(),
    profit: z.number(),
});

export const AnalyzeDailySalesOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the sales performance for the period."),
  bestDay: DayAnalysisSchema.describe("The day with the highest net profit."),
  worstDay: DayAnalysisSchema.describe("The day with the lowest net profit."),
  actionableInsight: z.string().describe("A single, actionable insight based on the sales data."),
});
export type AnalyzeDailySalesOutput = z.infer<typeof AnalyzeDailySalesOutputSchema>;

// customer-sales-analysis.ts
export const CustomerSalesAnalysisInputSchema = z.object({
  customerIdentifier: z.string().describe("The name or ID of the customer to analyze."),
  salesData: z.string().describe("A JSON string of the full sales data."),
});
export type CustomerSalesAnalysisInput = z.infer<typeof CustomerSalesAnalysisInputSchema>;

const PurchaseHistoryItemSchema = z.object({
  date: z.string(),
  items: z.string(),
  total: z.number(),
});

export const CustomerSalesAnalysisOutputSchema = z.object({
  summary: z.string(),
  purchaseHistory: z.array(PurchaseHistoryItemSchema),
  topProducts: z.array(z.string()),
  actionableInsight: z.string(),
});
export type CustomerSalesAnalysisOutput = z.infer<typeof CustomerSalesAnalysisOutputSchema>;

// suggest-visualization.ts
export const SuggestVisualizationInputSchema = z.object({
  headers: z.array(z.string()).describe("The headers of the CSV data."),
  sampleRows: z.string().describe("A few sample rows of the CSV data as a JSON string."),
});
export type SuggestVisualizationInput = z.infer<typeof SuggestVisualizationInputSchema>;

export const SuggestVisualizationOutputSchema = z.object({
  chartType: z.enum(['bar', 'line', 'area', 'pie', 'scatter']).describe("The suggested chart type."),
  xAxisKey: z.string().describe("The suggested column header for the X-axis."),
  yAxisKey: z.string().describe("The suggested column header for the Y-axis."),
  report: z.string().describe("An AI-generated report explaining the visualization choice and providing insights from the data, formatted as an HTML string."),
});
export type SuggestVisualizationOutput = z.infer<typeof SuggestVisualizationOutputSchema>;

// get-report-feedback.ts
export const GetReportFeedbackInputSchema = z.object({
  reportText: z.string().describe("The text content of the report to be analyzed."),
});
export type GetReportFeedbackInput = z.infer<typeof GetReportFeedbackInputSchema>;

const FeedbackItemSchema = z.object({
    problem: z.string().describe("A brief description of the area for improvement (e.g., 'Overly complex sentence')."),
    suggestion: z.string().describe("A specific, actionable suggestion for how to fix the problem."),
});

export const GetReportFeedbackOutputSchema = z.object({
  clarity: FeedbackItemSchema.describe("Feedback on the clarity and readability of the report."),
  conciseness: FeedbackItemSchema.describe("Feedback on the conciseness and efficiency of the language used."),
  impact: FeedbackItemSchema.describe("Feedback on the overall impact and persuasiveness of the report."),
});
export type GetReportFeedbackOutput = z.infer<typeof GetReportFeedbackOutputSchema>;
