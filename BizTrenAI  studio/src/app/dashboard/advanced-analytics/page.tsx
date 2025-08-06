
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, AlertTriangle, Loader2, FileWarning, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { predictTrends, type PredictTrendsOutput } from '@/ai/flows/predict-trends';
import { detectAnomalies, type DetectAnomaliesOutput } from '@/ai/flows/detect-anomalies';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DataUploader from '../components/uploader';
import { ProFeatureGuard } from '@/components/pro-feature-guard';

function AdvancedAnalyticsContent() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  
  const [trends, setTrends] = useState<PredictTrendsOutput | null>(null);
  const [anomalies, setAnomalies] = useState<DetectAnomaliesOutput | null>(null);

  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [isAnomaliesLoading, setIsAnomaliesLoading] = useState(false);
  const [isUploaderLoading, setIsUploaderLoading] = useState(false);

  const { toast } = useToast();

  const handleDataParsed = async (data: any, content: string) => {
    setIsUploaderLoading(true);
    setFileContent(content);
    // For this page, we don't need to run an initial analysis on upload.
    // We just enable the buttons.
    setIsUploaderLoading(false);
    toast({
      title: "File Ready",
      description: "You can now run trend prediction or anomaly detection.",
    });
  };

  const handlePredictTrends = async () => {
    if (!fileContent) {
      toast({ variant: "destructive", title: "No File", description: "Please upload a time-series data file." });
      return;
    }
    setIsTrendsLoading(true);
    setTrends(null);

    const makeRequest = () => predictTrends({ fileContent: fileContent });

    try {
      const result = await makeRequest();
      setTrends(result);
    } catch (error: any) {
      if (error.message && error.message.includes('overloaded')) {
        // Automatic retry after a short delay
        setTimeout(async () => {
            try {
                const result = await makeRequest();
                setTrends(result);
            } catch (retryError: any) {
                 toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
            } finally {
                 setIsTrendsLoading(false);
            }
        }, 2000);
        return; // Important to return here to not hit the final `finally` block too early
      }
      console.error("Error predicting trends:", error);
      toast({ variant: "destructive", title: "Analysis Error", description: "Failed to predict trends." });
      setIsTrendsLoading(false);
    }
  };
  
  const handleDetectAnomalies = async () => {
    if (!fileContent) {
      toast({ variant: "destructive", title: "No File", description: "Please upload a time-series data file." });
      return;
    }
    setIsAnomaliesLoading(true);
    setAnomalies(null);

    const makeRequest = () => detectAnomalies({ fileContent: fileContent });
    
    try {
      const result = await makeRequest();
      setAnomalies(result);
    } catch (error: any) {
        if (error.message && error.message.includes('overloaded')) {
            setTimeout(async () => {
                try {
                    const result = await makeRequest();
                    setAnomalies(result);
                } catch (retryError: any) {
                    toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
                } finally {
                     setIsAnomaliesLoading(false);
                }
            }, 2000);
            return;
        }
      console.error("Error detecting anomalies:", error);
      toast({ variant: "destructive", title: "Analysis Error", description: "Failed to detect anomalies." });
      setIsAnomaliesLoading(false);
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
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><BrainCircuit/> Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Predict future trends and detect anomalies in your time-series data from any file.
        </p>
      </div>

       <DataUploader onDataParsed={handleDataParsed} disabled={isUploaderLoading || isTrendsLoading || isAnomaliesLoading}/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Predict Trends */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-md">
                    <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                 <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">Predict Future Trends</CardTitle>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Analyzes historical data to forecast the next 12 periods, helping with inventory and financial planning.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <CardDescription>
              Forecast the next 12 periods of your data to make informed business decisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <Button onClick={handlePredictTrends} disabled={isTrendsLoading || !fileContent}>
                {isTrendsLoading ? <Loader2 className="animate-spin" /> : "Predict Trends"}
            </Button>
            <div className="mt-4 flex-grow">
                 {isTrendsLoading && <div className="flex items-center justify-center h-full w-full bg-secondary/50 rounded-lg"><p className="text-muted-foreground">Forecasting...</p></div>}
                 {!isTrendsLoading && !trends && <div className="flex items-center justify-center h-full w-full bg-secondary/50 rounded-lg"><p className="text-muted-foreground text-center p-4">Click the button to generate a forecast.</p></div>}
                 {trends && (
                     <div className="space-y-4">
                         <Alert>
                            <BrainCircuit className="h-4 w-4" />
                            <AlertTitle>Forecast Summary</AlertTitle>
                            <AlertDescription>{trends.summary}</AlertDescription>
                        </Alert>
                        <div className="h-80 w-full">
                            <ResponsiveContainer>
                                <LineChart data={trends.forecast}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))}/>
                                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="historical" stroke="hsl(var(--primary))" name="Historical" dot={false} strokeWidth={2}/>
                                    <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" name="Predicted" strokeDasharray="5 5" dot={false} strokeWidth={2}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                 )}
            </div>
          </CardContent>
        </Card>

        {/* Detect Anomalies */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-md">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                 <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">Detect Anomalies</CardTitle>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Finds unusual outliers in your data, such as sudden sales spikes or drops, that may require investigation.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <CardDescription>
              Identify unusual spikes or dips in your data that may require your attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
             <Button onClick={handleDetectAnomalies} disabled={isAnomaliesLoading || !fileContent}>
                {isAnomaliesLoading ? <Loader2 className="animate-spin" /> : "Detect Anomalies"}
            </Button>
            <div className="mt-4 flex-grow">
                 {isAnomaliesLoading && <div className="flex items-center justify-center h-full w-full bg-secondary/50 rounded-lg"><p className="text-muted-foreground">Analyzing...</p></div>}
                 {!isAnomaliesLoading && !anomalies && <div className="flex items-center justify-center h-full w-full bg-secondary/50 rounded-lg"><p className="text-muted-foreground text-center p-4">Click the button to find significant outliers in your data.</p></div>}
                 {anomalies && (
                     <div className="space-y-4">
                         <Alert>
                            <BrainCircuit className="h-4 w-4" />
                            <AlertTitle>Analysis Summary</AlertTitle>
                            <AlertDescription>{anomalies.summary}</AlertDescription>
                        </Alert>
                        {anomalies.anomalies.length > 0 ? (
                           <div className="border rounded-lg max-h-80 overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-secondary">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Reason</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {anomalies.anomalies.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(item.value)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center text-center h-48 bg-secondary/50 rounded-lg p-4">
                                <FileWarning className="w-12 h-12 text-green-500 mb-4" />
                                <p className="font-semibold text-lg">No Anomalies Found</p>
                                <p className="text-muted-foreground text-sm">Your data appears stable and consistent.</p>
                            </div>
                        )}
                     </div>
                 )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}


export default function AdvancedAnalyticsPage() {
    return (
        <ProFeatureGuard>
            <AdvancedAnalyticsContent />
        </ProFeatureGuard>
    )
}

    