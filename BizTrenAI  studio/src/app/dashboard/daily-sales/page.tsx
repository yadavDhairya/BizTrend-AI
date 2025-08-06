
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Wand2, PlusCircle, Trash2, CalendarDays, Loader2, Info, Lightbulb, FileText } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DailySaleItem, analyzeDailySales, type AnalyzeDailySalesOutput } from '@/ai/flows/analyze-daily-sales';
import { sub, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ProFeatureGuard } from '@/components/pro-feature-guard';


const formSchema = z.object({
  date: z.string().min(1, "Date is required."),
  revenue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number({invalid_type_error: "Revenue must be a number."}).min(0, "Revenue must be a positive number.")
  ),
  costs: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number({invalid_type_error: "Costs must be a number."}).min(0, "Costs must be a positive number.")
  ),
  notes: z.string().optional(),
});

type SalesFormValues = z.infer<typeof formSchema>;


function DailySalesContent() {
  const [salesData, setSalesData] = useState<DailySaleItem[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [isClient, setIsClient] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDailySalesOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedData = localStorage.getItem('biztrend-dailySales');
    if (savedData) {
      setSalesData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem('biztrend-dailySales', JSON.stringify(salesData));
    }
  }, [salesData, isClient]);

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      revenue: undefined,
      costs: undefined,
      notes: '',
    },
  });

  const onSubmit = (data: SalesFormValues) => {
    const profit = data.revenue - data.costs;
    const newEntry: DailySaleItem = { id: new Date().toISOString(), ...data, profit };
    
    // prevent adding duplicate dates
    if(salesData.some(d => d.date === newEntry.date)) {
        toast({ variant: "destructive", title: "Duplicate Date", description: "An entry for this date already exists. Please edit the existing one." });
        return;
    }

    const sortedData = [...salesData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setSalesData(sortedData);
    form.reset({
      date: new Date().toISOString().split('T')[0],
      revenue: undefined,
      costs: undefined,
      notes: '',
    });
    toast({ title: "Entry Added", description: "Your sales for that day have been logged." });
  };
  
  const deleteEntry = (id: string) => {
    setSalesData(salesData.filter(entry => entry.id !== id));
    toast({ title: "Entry Removed", description: "The selected sales entry has been deleted." });
  };
  
  const handleRunAnalysis = async () => {
    if (filteredData.length < 3) {
      toast({ variant: "destructive", title: "Not Enough Data", description: "Please add at least 3 sales entries for the selected timeframe to run an analysis." });
      return;
    }
    setIsAnalysisLoading(true);
    setAnalysisResult(null);

    const makeRequest = () => analyzeDailySales({ salesData: JSON.stringify(filteredData) });

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
                    setIsAnalysisLoading(false);
                }
            }, 2000);
            return;
        }
      console.error("Error analyzing sales data:", error);
      toast({ variant: "destructive", title: "Analysis Error", description: "Failed to generate AI analysis." });
    } 
    setIsAnalysisLoading(false);
  };


  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    switch(timeframe) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
    }
    return salesData.filter(d => new Date(d.date) >= startDate);
  }, [salesData, timeframe]);

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, item) => acc + item.revenue, 0);
    const totalCosts = filteredData.reduce((acc, item) => acc + item.costs, 0);
    const totalProfit = totalRevenue - totalCosts;
    return { totalRevenue, totalCosts, totalProfit, averageProfit: totalProfit / (filteredData.length || 1) };
  }, [filteredData]);
  
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };
  
  const formatDate = (dateString: string) => {
      try {
        return format(parseISO(dateString), 'dd MMM');
      } catch (error) {
          return "Invalid Date";
      }
  }


  if (!isClient) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><BarChart3/> Daily Sales Log</h1>
        <p className="text-muted-foreground">
          Track your daily revenue, costs, and profit to understand your business performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Sales Entry</CardTitle>
                    <CardDescription>Log your sales for a specific day.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="revenue" render={({ field }) => (<FormItem><FormLabel>Total Revenue (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 12000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="costs" render={({ field }) => (<FormItem><FormLabel>Total Costs (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 7500" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Holiday sale, rainy day..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="submit" className="w-full"><PlusCircle/> Add Entry</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>AI Analysis</CardTitle>
                    <CardDescription>Get AI-powered insights on your sales performance for the selected timeframe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleRunAnalysis} disabled={isAnalysisLoading || filteredData.length < 3} className="w-full">
                        {isAnalysisLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        {isAnalysisLoading ? "Analyzing..." : "Run AI Analysis"}
                    </Button>
                    {isAnalysisLoading ? (
                        <div className="space-y-4 mt-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ) : analysisResult ? (
                         <Alert className="mt-4">
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Performance Insights</AlertTitle>
                            <AlertDescription>
                                <p className="font-semibold">{analysisResult.summary}</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                                    <li><span className="font-semibold">Best Day:</span> {formatDate(analysisResult.bestDay.date)} ({formatCurrency(analysisResult.bestDay.profit)} profit)</li>
                                    <li><span className="font-semibold">Worst Day:</span> {formatDate(analysisResult.worstDay.date)} ({formatCurrency(analysisResult.worstDay.profit)} profit)</li>
                                </ul>
                                <p className="mt-2 text-primary">{analysisResult.actionableInsight}</p>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground mt-4 p-4 bg-secondary/50 rounded-lg">
                           <p>Your AI insights will appear here.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Sales Performance</CardTitle>
                            <CardDescription>Visualize your revenue, costs, and profit over time.</CardDescription>
                        </div>
                         <ToggleGroup type="single" value={timeframe} onValueChange={(value: 'week' | 'month' | 'year') => value && setTimeframe(value)} size="sm">
                            <ToggleGroupItem value="week">Week</ToggleGroupItem>
                            <ToggleGroupItem value="month">Month</ToggleGroupItem>
                            <ToggleGroupItem value="year">Year</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</p>
                        </div>
                         <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Costs</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalCosts)}</p>
                        </div>
                        <div className="p-4 bg-green-100/50 dark:bg-green-900/30 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-400">Net Profit</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(summaryStats.totalProfit)}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Avg. Daily Profit</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryStats.averageProfit)}</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                         <ResponsiveContainer>
                           {filteredData.length > 0 ? (
                             <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis tickFormatter={(value) => `₹${Number(value)/1000}k`}/>
                                <RechartsTooltip formatter={(value, name, props) => [formatCurrency(Number(value)), name, (props.payload.notes ? `Notes: ${props.payload.notes}`: null)]}/>
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue" dot={false} strokeWidth={2}/>
                                <Line type="monotone" dataKey="costs" stroke="hsl(var(--destructive))" name="Costs" dot={false} strokeWidth={2}/>
                                <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" name="Profit" strokeDasharray="5 5" dot={false} strokeWidth={2}/>
                            </LineChart>
                           ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50 rounded-lg">
                                    <p>No sales data for this period. Add entries to see the chart.</p>
                                </div>
                           )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logged Sales Entries</CardTitle>
                    <CardDescription>A complete log of all your recorded daily sales.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="border rounded-lg max-h-[500px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="text-right">Costs</TableHead>
                                    <TableHead className="text-right">Net Profit</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesData.length > 0 ? (
                                    salesData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{format(parseISO(item.date), "PPP")}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                {item.notes ? (
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 shrink-0"/>
                                                        <span title={item.notes}>{item.notes}</span>
                                                    </div>
                                                ) : <span className="text-slate-400">-</span>}
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                                            <TableCell className="text-right text-destructive">{formatCurrency(item.costs)}</TableCell>
                                            <TableCell className={`text-right font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>{formatCurrency(item.profit)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => deleteEntry(item.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No sales entries yet. Add your first one!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


export default function DailySalesPage() {
    return (
        <ProFeatureGuard>
            <DailySalesContent />
        </ProFeatureGuard>
    )
}

    