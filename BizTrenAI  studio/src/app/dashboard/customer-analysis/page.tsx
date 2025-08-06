
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Loader2, Lightbulb, ShoppingBag, BarChartHorizontal, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { analyzeCustomerSales, type CustomerSalesAnalysisOutput } from '@/ai/flows/customer-sales-analysis';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DataUploader from '../components/uploader';
import type { ParsedData } from '../components/uploader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProFeatureGuard } from '@/components/pro-feature-guard';

function CustomerAnalysisContent() {
  const [analysisResult, setAnalysisResult] = useState<CustomerSalesAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [customerColumn, setCustomerColumn] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleDataParsed = (data: ParsedData, content: string) => {
    setParsedData(data);
    // Auto-select a likely customer column
    const likelyColumns = ['customer', 'name', 'client', 'customer name', 'customer_name', 'client_name'];
    const foundColumn = data.headers.find(h => likelyColumns.includes(h.toLowerCase()));
    if (foundColumn) {
        setCustomerColumn(foundColumn);
    }
    toast({
        title: "Data Loaded",
        description: "Your sales data is ready. You can now analyze a customer.",
    });
  };

  const handleAnalyzeCustomer = async () => {
    if (!parsedData || !customerIdentifier) {
        toast({ variant: "destructive", title: "Missing Info", description: "Please upload data and enter a customer name or ID." });
        return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    const makeRequest = () => analyzeCustomerSales({ customerIdentifier, salesData: JSON.stringify(parsedData.rows) });

    try {
      const result = await makeRequest();
      setAnalysisResult(result);
    } catch (error: any) {
        if (error.message && error.message.includes('overloaded')) {
            setTimeout(async () => {
                try {
                    const result = await makeRequest();
                    setAnalysisResult(result);
                } catch (retryError: any) {
                    toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
                } finally {
                    setIsLoading(false);
                }
            }, 2000);
            return;
        }
      console.error("Error generating customer analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to generate customer analysis. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <TooltipProvider>
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Users /> Customer-Level Analysis</h1>
        <p className="text-muted-foreground">
          Get deep insights into individual customer behavior from your sales data.
        </p>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
             <DataUploader onDataParsed={handleDataParsed} disabled={isLoading}/>
            
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Analyze a Customer
                  </CardTitle>
                  <CardDescription>Enter a customer name or ID from your data to generate a report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <label htmlFor="customer-identifier" className="text-sm font-medium">Customer Name or ID</label>
                        <Input 
                            id="customer-identifier"
                            placeholder="e.g., Priya Desai"
                            value={customerIdentifier}
                            onChange={(e) => setCustomerIdentifier(e.target.value)}
                            disabled={isLoading || !parsedData}
                        />
                     </div>
                      <Button onClick={handleAnalyzeCustomer} className="w-full" disabled={isLoading || !parsedData || !customerIdentifier}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Search className="mr-2" />}
                        {isLoading ? "Analyzing..." : "Analyze Customer"}
                      </Button>
                </CardContent>
              </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Customer Report</CardTitle>
              <CardDescription>The analysis for your selected customer will appear below.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
              )}
              {!isLoading && !analysisResult && (
                <div className="flex flex-col items-center justify-center text-center h-64 bg-secondary/50 rounded-lg p-4">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg">Ready for Analysis</p>
                  <p className="text-muted-foreground text-sm">Upload data and enter a customer name to generate a report.</p>
                </div>
              )}
              {analysisResult && (
                <div className="space-y-6">
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Customer Summary</AlertTitle>
                        <AlertDescription>{analysisResult.summary}</AlertDescription>
                    </Alert>

                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ShoppingBag/> Purchase History</h3>
                        <div className="border rounded-lg max-h-80 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysisResult.purchaseHistory.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.items}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                         <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><BarChartHorizontal/> Top Products</h3>
                         <div className="flex flex-wrap gap-2">
                             {analysisResult.topProducts.map((product, index) => (
                                 <div key={index} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                                     {product}
                                 </div>
                             ))}
                         </div>
                    </div>

                    <Alert variant="default" className="border-accent">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <AlertTitle className="text-accent">Actionable Insight</AlertTitle>
                        <AlertDescription>{analysisResult.actionableInsight}</AlertDescription>
                    </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}


export default function CustomerAnalysisPage() {
    return (
        <ProFeatureGuard>
            <CustomerAnalysisContent />
        </ProFeatureGuard>
    )
}

    