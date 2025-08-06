
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileScan, Loader2, IndianRupee, Store, Calendar, ShoppingCart, Lightbulb } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DataUploader from '../components/uploader';
import { analyzeBill, type AnalyzeBillOutput } from '@/ai/flows/analyze-bill';
import { Skeleton } from '@/components/ui/skeleton';
import { ProFeatureGuard } from '@/components/pro-feature-guard';

function ExpenseTrackerContent() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeBillOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDataParsed = async (data: any, content: string) => {
    // We only care about file content (specifically data URIs for images/PDFs)
    if (!content.startsWith('data:')) {
        toast({
            variant: "destructive",
            title: "Unsupported File",
            description: "Please upload an image or PDF file of your bill.",
        });
        return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    const makeRequest = () => analyzeBill({ fileContent: content });

    try {
      const result = await makeRequest();
      setAnalysisResult(result);
       toast({
        title: "Bill Analyzed",
        description: "Successfully extracted expense details.",
      });
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
      console.error("Error analyzing bill:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to extract details from the bill. Please try again with a clearer image.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><FileScan/> Expense Tracker</h1>
        <p className="text-muted-foreground">
          Upload bills and receipts to automatically track your expenses with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <DataUploader onDataParsed={handleDataParsed} disabled={isLoading} setLoading={setIsLoading}/>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Extracted Bill Details</CardTitle>
                    <CardDescription>AI-powered extraction of key information from your uploaded bill.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-10 w-1/3" />
                           </div>
                           <Skeleton className="h-6 w-full" />
                           <div className="space-y-2 pt-4">
                             <Skeleton className="h-5 w-1/3" />
                             <Skeleton className="h-12 w-full" />
                           </div>
                        </div>
                    )}
                    {!isLoading && !analysisResult && (
                        <div className="flex items-center justify-center h-64 w-full bg-secondary/50 rounded-lg">
                            <p className="text-muted-foreground text-center p-4">Upload a bill to see the extracted data here.</p>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg bg-secondary/50">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Store className="w-4 h-4"/> Vendor
                                    </div>
                                    <p className="text-xl font-semibold">{analysisResult.vendor || 'Not found'}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-start sm:justify-end">
                                        <Calendar className="w-4 h-4"/> Date
                                    </div>
                                    <p className="text-lg font-medium">{analysisResult.date || 'Not found'}</p>
                                </div>
                            </div>

                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Expense Summary</AlertTitle>
                                <AlertDescription>{analysisResult.summary}</AlertDescription>
                            </Alert>

                            {analysisResult.items && analysisResult.items.length > 0 && (
                                <div className="space-y-2">
                                     <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Purchased Items</h3>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-center">Qty</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analysisResult.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.description}</TableCell>
                                                        <TableCell className="text-center">{item.quantity || '-'}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                             <div className="flex justify-end items-center gap-4 pt-4 mt-4 border-t">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Grand Total</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(analysisResult.totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseTrackerPage() {
    return (
        <ProFeatureGuard>
            <ExpenseTrackerContent />
        </ProFeatureGuard>
    )
}

    