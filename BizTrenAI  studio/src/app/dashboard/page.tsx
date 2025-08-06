
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { suggestVisualization, type SuggestVisualizationOutput } from "@/ai/flows/suggest-visualization";
import { useToast } from "@/hooks/use-toast";
import DataUploader, { type ParsedData } from "./components/uploader";
import InsightsView from "./components/insights-view";
import { DataTable } from "./components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Axis3d, BarChart, LineChart, PieChart, ScatterChart, AreaChart, Wand2, Check, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from 'next/dynamic';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useReactToPrint } from 'react-to-print';

const FinancialChartView = dynamic(() => import('./components/financial-chart-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});


type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';

const chartTypes: { value: ChartType, label: string, icon: React.ReactNode, hint: string }[] = [
    { value: 'bar', label: 'Bar', icon: <BarChart className="w-4 h-4"/>, hint: "Best for comparing categories." },
    { value: 'line', label: 'Line', icon: <LineChart className="w-4 h-4"/>, hint: "Best for time-series data." },
    { value: 'area', label: 'Area', icon: <AreaChart className="w-4 h-4"/>, hint: "Good for showing volume over time." },
    { value: 'pie', label: 'Pie', icon: <PieChart className="w-4 h-4"/>, hint: "Best for showing proportions of a whole." },
    { value: 'scatter', label: 'Scatter', icon: <ScatterChart className="w-4 h-4"/>, hint: "Shows relationships between two numeric values." },
];

export default function DashboardPage() {
  const [insights, setInsights] = useState<SuggestVisualizationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaderLoading, setIsUploaderLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const { toast } = useToast();

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = useState<string | null>(null);
  const [yAxisKeys, setYAxisKeys] = useState<string[]>([]);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `BizTrendAI-Report-${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => toast({ title: "Report export ready!" }),
  });


  // Auto-select axes on new data or AI suggestion
  useEffect(() => {
    if (insights) {
      setChartType(insights.chartType);
      setXAxisKey(insights.xAxisKey);
      setYAxisKeys([insights.yAxisKey]);
    } else if (parsedData && parsedData.headers.length > 0) {
      // Find first non-numeric column for X-axis
      const firstTextCol = parsedData.headers.find(h => typeof parsedData.rows[0]?.[h] !== 'number');
      setXAxisKey(firstTextCol || parsedData.headers[0]);
      
      // Find first numeric column for Y-axis
      const firstNumCol = parsedData.headers.find(h => typeof parsedData.rows[0]?.[h] === 'number');
      if (firstNumCol) {
          setYAxisKeys([firstNumCol]);
      } else {
          setYAxisKeys([]);
      }
    } else {
        setXAxisKey(null);
        setYAxisKeys([]);
    }
  }, [parsedData, insights]);


  const handleDataParsed = async (data: ParsedData, fileContent: string) => {
    setIsUploaderLoading(true);
    setParsedData(data);
    
    setIsUploaderLoading(false); 
    
    if (!data.headers || data.headers.length === 0 || data.rows.length === 0) {
        toast({
            variant: "destructive",
            title: "File Not Supported for Visualization",
            description: "Visualization and tables are only available for structured files like CSV.",
        });
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setInsights(null);

    const makeRequest = () => suggestVisualization({ 
        headers: data.headers, 
        sampleRows: JSON.stringify(data.rows.slice(0, 5)) 
    });

    try {
      const result = await makeRequest();
      setInsights(result);
    } catch (error: any) {
        if (error.message && error.message.includes('overloaded')) {
            setTimeout(async () => {
                try {
                    const result = await makeRequest();
                    setInsights(result);
                } catch (retryError: any) {
                    toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
                } finally {
                    setIsLoading(false);
                }
            }, 2000);
            return;
        }
      console.error("Error generating insights:", error);
      toast({
        variant: "destructive",
        title: "AI Analysis Error",
        description: "Failed to generate AI analysis. Please check your file and try again.",
      });
      setInsights(null);
      setIsLoading(false);
    }
  };
  
  const numericHeaders = useMemo(() => {
      if (!parsedData || parsedData.rows.length === 0) return [];
      return parsedData.headers.filter(h => typeof parsedData.rows[0]?.[h] === 'number');
  }, [parsedData]);
  
  const textHeaders = useMemo(() => {
      if (!parsedData || parsedData.rows.length === 0) return [];
      return parsedData.headers.filter(h => typeof parsedData.rows[0]?.[h] !== 'number');
  }, [parsedData]);


  return (
    <TooltipProvider>
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze your business data by uploading a file to generate visualizations and AI insights.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <DataUploader onDataParsed={handleDataParsed} disabled={isUploaderLoading} setLoading={setIsUploaderLoading} />
          <InsightsView insights={insights?.report} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-2 space-y-8">
           <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Visualize Your Data</CardTitle>
                        <CardDescription>Interactively explore your data with customizable charts.</CardDescription>
                    </div>
                    <Button onClick={handlePrint} disabled={!parsedData}>
                        <Download className="mr-2" />
                        Export Report
                    </Button>
                </CardHeader>
                <CardContent>
                    <div ref={reportRef} className="print-container p-4">
                        {/* --- CONTROLS START --- */}
                        <div className="flex flex-col md:flex-row gap-6 p-4 border rounded-lg bg-secondary/50 mb-6 print:hidden">
                            {/* Chart Type Selector */}
                            <div className="space-y-3 flex-1">
                                <Tooltip>
                                    <TooltipTrigger asChild><Label>1. Chart Type</Label></TooltipTrigger>
                                    <TooltipContent><p>Select the type of chart to display.</p></TooltipContent>
                                </Tooltip>
                                <ToggleGroup type="single" variant="outline" value={chartType} onValueChange={(value: ChartType) => value && setChartType(value)} disabled={!parsedData} className="flex-wrap justify-start">
                                    {chartTypes.map(type => (
                                        <Tooltip key={type.value}>
                                            <TooltipTrigger asChild>
                                                <ToggleGroupItem value={type.value} className="flex gap-2">
                                                    {type.icon}
                                                    <span>{type.label}</span>
                                                </ToggleGroupItem>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{type.hint}</p></TooltipContent>
                                        </Tooltip>
                                    ))}
                                </ToggleGroup>
                            </div>
                            <Separator orientation="vertical" className="h-auto hidden md:block" />
                            {/* Axis Selectors */}
                            <div className="space-y-3 flex-1">
                                <Label>2. Select Axes</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Popover>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between" disabled={!parsedData}>
                                                        <span className="truncate">{xAxisKey || "Select X-Axis"}</span>
                                                        <Axis3d className="w-4 h-4 text-muted-foreground"/>
                                                    </Button>
                                                </PopoverTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Select a column for the horizontal (X) axis. This is usually a text or date column.</p></TooltipContent>
                                        </Tooltip>
                                        <PopoverContent className="w-[250px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Select X-Axis..." />
                                            <CommandList>
                                                <CommandEmpty>No columns found.</CommandEmpty>
                                                <CommandGroup>
                                                {parsedData?.headers.map(header => (
                                                    <CommandItem key={header} onSelect={() => setXAxisKey(header)}>
                                                    <Check className={cn("mr-2 h-4 w-4", xAxisKey === header ? "opacity-100" : "opacity-0")}/>
                                                    {header}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between" disabled={!parsedData || numericHeaders.length === 0}>
                                                        <span className="truncate">{yAxisKeys.length > 0 ? yAxisKeys.join(', ') : "Select Y-Axis"}</span>
                                                        <Axis3d className="w-4 h-4 text-muted-foreground"/>
                                                    </Button>
                                                </PopoverTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Select one or more numeric columns for the vertical (Y) axis.</p></TooltipContent>
                                        </Tooltip>
                                        <PopoverContent className="w-[250px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Select Y-Axis..." />
                                            <CommandList>
                                                <CommandEmpty>No numeric columns found.</CommandEmpty>
                                                <CommandGroup>
                                                {numericHeaders.map(header => (
                                                    <CommandItem
                                                        key={header}
                                                        onSelect={() => {
                                                            const selected = new Set(yAxisKeys);
                                                            if (selected.has(header)) {
                                                                selected.delete(header);
                                                            } else {
                                                                selected.add(header);
                                                            }
                                                            setYAxisKeys(Array.from(selected));
                                                        }}
                                                    >
                                                    <Checkbox checked={yAxisKeys.includes(header)} className="mr-2"/>
                                                    {header}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                        {/* --- CONTROLS END --- */}

                        <FinancialChartView 
                            parsedData={parsedData}
                            isLoading={isUploaderLoading}
                            xAxisKey={xAxisKey}
                            yAxisKeys={yAxisKeys}
                            chartType={chartType}
                        />
                         {insights?.report && (
                           <div className="mt-6 print:block hidden">
                              <InsightsView insights={insights?.report} isLoading={isLoading} />
                           </div>
                         )}
                    </div>
                </CardContent>
            </Card>

            {parsedData && parsedData.rows.length > 0 && (
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Inspect Your Data</CardTitle>
                        <CardDescription>View, sort, and filter the raw data from your file.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable headers={parsedData.headers} data={parsedData.rows} />
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

    