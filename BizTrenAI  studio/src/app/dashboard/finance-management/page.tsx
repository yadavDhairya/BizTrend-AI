
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, Scale, Percent, FileDigit, Wand2, Loader2, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { analyzeGrossMargin, type AnalyzeGrossMarginOutput } from '@/ai/flows/analyze-gross-margin';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FinanceManagementPage() {
    // State for Profit & Loss
    const [revenue, setRevenue] = useState<number | string>('');
    const [expenses, setExpenses] = useState<number | string>('');
    const profit = useMemo(() => {
        const numRevenue = Number(revenue);
        const numExpenses = Number(expenses);
        if (isNaN(numRevenue) || isNaN(numExpenses)) return null;
        return numRevenue - numExpenses;
    }, [revenue, expenses]);

    // State for Breakeven Analysis
    const [fixedCosts, setFixedCosts] = useState<number | string>('');
    const [variableCost, setVariableCost] = useState<number | string>('');
    const [unitPrice, setUnitPrice] = useState<number | string>('');
    const breakevenPoint = useMemo(() => {
        const numFixedCosts = Number(fixedCosts);
        const numVariableCost = Number(variableCost);
        const numUnitPrice = Number(unitPrice);
        if (isNaN(numFixedCosts) || isNaN(numVariableCost) || isNaN(numUnitPrice) || (numUnitPrice - numVariableCost) <= 0) return null;
        return Math.ceil(numFixedCosts / (numUnitPrice - numVariableCost));
    }, [fixedCosts, variableCost, unitPrice]);
    
    const breakevenChartData = useMemo(() => {
        if (breakevenPoint === null) return [];
        const numFixedCosts = Number(fixedCosts);
        const numVariableCost = Number(variableCost);
        const numUnitPrice = Number(unitPrice);

        const dataPoints = [];
        const maxUnits = breakevenPoint * 2 > 100 ? breakevenPoint * 2 : 100;

        for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits/10)) {
             if (units > maxUnits) units = maxUnits;
            dataPoints.push({
                units,
                revenue: units * numUnitPrice,
                costs: numFixedCosts + (units * numVariableCost)
            });
            if (units === maxUnits) break;
        }
        return dataPoints;

    }, [breakevenPoint, fixedCosts, variableCost, unitPrice]);

    // State for Gross Margin
    const [totalRevenueMargin, setTotalRevenueMargin] = useState<number | string>('');
    const [cogs, setCogs] = useState<number | string>('');
    const grossMargin = useMemo(() => {
        const numTotalRevenue = Number(totalRevenueMargin);
        const numCogs = Number(cogs);
        if (isNaN(numTotalRevenue) || isNaN(numCogs) || numTotalRevenue === 0) return null;
        const margin = ((numTotalRevenue - numCogs) / numTotalRevenue) * 100;
        return margin;
    }, [totalRevenueMargin, cogs]);
    
    // State for GST Calculator
    const [baseAmount, setBaseAmount] = useState<number | string>('');
    const [gstRate, setGstRate] = useState<number | string>(18);
    const [transactionType, setTransactionType] = useState<'intra-state' | 'inter-state'>('intra-state');
    const gstDetails = useMemo(() => {
        const numBaseAmount = Number(baseAmount);
        const numGstRate = Number(gstRate);
        if (isNaN(numBaseAmount) || isNaN(numGstRate) || numBaseAmount <= 0) return null;
        
        const totalGst = (numBaseAmount * numGstRate) / 100;
        const totalValue = numBaseAmount + totalGst;
        
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (transactionType === 'intra-state') {
            cgst = totalGst / 2;
            sgst = totalGst / 2;
        } else {
            igst = totalGst;
        }

        return {
            cgst,
            sgst,
            igst,
            totalGst,
            totalValue
        };
    }, [baseAmount, gstRate, transactionType]);
    
    // State for AI Margin Analysis
    const [isMarginAnalysisLoading, setIsMarginAnalysisLoading] = useState(false);
    const [marginAnalysisResult, setMarginAnalysisResult] = useState<AnalyzeGrossMarginOutput | null>(null);
    const { toast } = useToast();
    
    const handleMarginAnalysis = async () => {
        const numTotalRevenue = Number(totalRevenueMargin);
        const numCogs = Number(cogs);

        if (grossMargin === null || isNaN(numTotalRevenue) || isNaN(numCogs)) {
            toast({ variant: "destructive", title: "Invalid Input", description: "Please enter valid revenue and COGS before analyzing." });
            return;
        }
        
        setIsMarginAnalysisLoading(true);
        setMarginAnalysisResult(null);

        const makeRequest = () => analyzeGrossMargin({ totalRevenue: numTotalRevenue, costOfGoodsSold: numCogs, currentMargin: grossMargin });

        try {
            const result = await makeRequest();
            setMarginAnalysisResult(result);
        } catch (error: any) {
            if (error.message && error.message.includes('overloaded')) {
                setTimeout(async () => {
                    try {
                        const result = await makeRequest();
                        setMarginAnalysisResult(result);
                    } catch (retryError: any) {
                        toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
                    } finally {
                        setIsMarginAnalysisLoading(false);
                    }
                }, 2000);
                return;
            }
            console.error("Error analyzing gross margin:", error);
            toast({ variant: "destructive", title: "Analysis Error", description: "Failed to generate AI analysis." });
            setIsMarginAnalysisLoading(false);
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
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Wallet/> Financial Management</h1>
        <p className="text-muted-foreground">
          Essential calculators and visual tools to understand your business's financial health.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Left Column: Breakeven Analysis */}
        <div className="lg:col-span-2">
            <Card className="flex flex-col h-full">
                 <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <Scale className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-2xl">Breakeven Analysis</CardTitle>
                             <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Calculates the number of units you must sell to cover all your costs.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <CardDescription>
                    Find out how many units you need to sell to cover your costs, visualized with an interactive chart.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow grid md:grid-cols-3 gap-4">
                     <div>
                        <Label htmlFor="fixed-costs">Total Fixed Costs (₹)</Label>
                        <Input id="fixed-costs" type="number" placeholder="e.g., 20000" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="variable-cost">Variable Cost Per Unit (₹)</Label>
                        <Input id="variable-cost" type="number" placeholder="e.g., 75" value={variableCost} onChange={(e) => setVariableCost(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="unit-price">Sale Price Per Unit (₹)</Label>
                        <Input id="unit-price" type="number" placeholder="e.g., 125" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
                    </div>
                    <div className="md:col-span-3 min-h-[300px] pt-4">
                         <ResponsiveContainer width="100%" height="100%">
                            {breakevenPoint !== null && breakevenChartData.length > 0 ? (
                                <LineChart data={breakevenChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="units" name="Units Sold" />
                                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))}/>
                                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="costs" stroke="hsl(var(--destructive))" strokeWidth={2} name="Total Costs" dot={false} />
                                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Revenue" dot={false} />
                                    {breakevenPoint > 0 && 
                                        <ReferenceLine x={breakevenPoint} stroke="hsl(var(--accent))" strokeDasharray="3 3">
                                            <Label value="Breakeven" position="insideBottom" fill="hsl(var(--accent))" fontSize={12} />
                                        </ReferenceLine>
                                    }
                                </LineChart>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50 rounded-lg">
                                    <p>Enter valid costs and price to see the chart.</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/50 border-t p-6">
                    <div className="w-full text-center">
                        <p className="text-sm text-muted-foreground">Breakeven Point</p>
                        <p className="text-3xl font-bold text-primary">{breakevenPoint !== null ? `${breakevenPoint.toLocaleString()} units` : 'N/A'}</p>
                    </div>
                </CardFooter>
            </Card>
        </div>


        {/* Right Column: Other Calculators */}
        <div className="lg:col-span-1 space-y-8">
            {/* Profit & Loss Calculator */}
            <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                     <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">Profit & Loss</CardTitle>
                         <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Calculates the net profit or loss by subtracting total expenses from total revenue.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <CardDescription>
                Quickly calculate your net profit by entering total revenue and expenses.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div>
                    <Label htmlFor="revenue">Total Revenue (₹)</Label>
                    <Input id="revenue" type="number" placeholder="e.g., 50000" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="expenses">Total Expenses (₹)</Label>
                    <Input id="expenses" type="number" placeholder="e.g., 30000" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/50 border-t p-6">
                    <div className="w-full text-center">
                        <p className="text-sm text-muted-foreground">Net Profit / Loss</p>
                        <p className={`text-3xl font-bold ${profit !== null && profit < 0 ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(profit)}</p>
                    </div>
                </CardFooter>
            </Card>
            
            {/* Gross Margin Calculator */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <Percent className="w-6 h-6 text-primary" />
                        </div>
                         <div className="flex items-center gap-2">
                            <CardTitle className="text-2xl">Gross Margin</CardTitle>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Measures the profitability of your products or services before overhead costs.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <CardDescription>
                    Calculate profitability and get AI suggestions for improvement.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                        <Label htmlFor="total-revenue-margin">Total Revenue (₹)</Label>
                        <Input id="total-revenue-margin" type="number" placeholder="e.g., 80000" value={totalRevenueMargin} onChange={(e) => setTotalRevenueMargin(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="cogs">Cost of Goods Sold (COGS) (₹)</Label>
                        <Input id="cogs" type="number" placeholder="e.g., 45000" value={cogs} onChange={(e) => setCogs(e.target.value)} />
                    </div>
                    {marginAnalysisResult && (
                        <Alert>
                            <Wand2 className="h-4 w-4" />
                            <AlertTitle>AI Suggestion</AlertTitle>
                            <AlertDescription>
                                {marginAnalysisResult.suggestion}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="bg-secondary/50 border-t p-6 grid gap-4">
                        <div className="w-full text-center">
                            <p className="text-sm text-muted-foreground">Gross Margin</p>
                            <p className="text-3xl font-bold text-primary">{grossMargin !== null ? `${grossMargin.toFixed(2)}%` : 'N/A'}</p>
                        </div>
                         <Button onClick={handleMarginAnalysis} disabled={isMarginAnalysisLoading || grossMargin === null}>
                            {isMarginAnalysisLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            {isMarginAnalysisLoading ? "Analyzing..." : "AI Analysis"}
                        </Button>
                </CardFooter>
            </Card>

            {/* GST Billing Calculator */}
            <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <FileDigit className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">GST Calculator</CardTitle>
                         <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Calculates tax components (CGST, SGST, IGST) for accurate GST billing.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <CardDescription>
                Calculate GST with a detailed breakdown for CGST, SGST, and IGST.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label htmlFor="base-amount">Base Amount (₹)</Label>
                        <Input id="base-amount" type="number" placeholder="e.g., 1000" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="transaction-type">Transaction Type</Label>
                        <Select onValueChange={(value: 'intra-state' | 'inter-state') => setTransactionType(value)} defaultValue={transactionType}>
                        <SelectTrigger id="transaction-type">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="intra-state">Intra-State</SelectItem>
                            <SelectItem value="inter-state">Inter-State</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="gst-rate">GST Rate (%)</Label>
                    <Select onValueChange={(value) => setGstRate(value)} defaultValue={String(gstRate)}>
                    <SelectTrigger id="gst-rate">
                        <SelectValue placeholder="Select GST Rate" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/50 border-t p-6">
                    <div className="w-full text-center space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">CGST</p>
                                <p className="font-semibold">{formatCurrency(gstDetails?.cgst)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">SGST</p>
                                <p className="font-semibold">{formatCurrency(gstDetails?.sgst)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">IGST</p>
                                <p className="font-semibold">{formatCurrency(gstDetails?.igst)}</p>
                            </div>
                        </div>
                        <div className="!mt-6">
                            <p className="text-sm text-muted-foreground">Total Amount (Inc. GST)</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(gstDetails?.totalValue)}</p>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
    </TooltipProvider>
  );
}

    