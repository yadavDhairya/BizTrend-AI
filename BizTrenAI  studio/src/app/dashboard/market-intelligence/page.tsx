
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search, Loader2, Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { analyzeMarket, type MarketAnalysisOutput } from '@/ai/flows/market-analysis';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProFeatureGuard } from '@/components/pro-feature-guard';


const formSchema = z.object({
  industry: z.string().min(2, "Industry is required."),
  topic: z.string().min(2, "Topic is required."),
});

type MarketAnalysisFormValues = z.infer<typeof formSchema>;

function MarketIntelligenceContent() {
  const [analysisResult, setAnalysisResult] = useState<MarketAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MarketAnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      topic: "",
    },
  });

  const onSubmit = async (data: MarketAnalysisFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const makeRequest = () => analyzeMarket(data);

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
      console.error("Error generating market analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to generate market analysis. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Globe /> Market Intelligence</h1>
        <p className="text-muted-foreground">
          Gain AI-powered insights into your industry and market trends.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Analysis Parameters
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tell the AI which industry and topic to research. Be as specific as you like.</p>
                    </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Define the scope of your market analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Retail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic of Interest</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Customer Retention Strategies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Search className="mr-2" />}
                    {isLoading ? "Analyzing..." : "Analyze Market"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis Result */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Report</CardTitle>
              <CardDescription>Your market analysis will appear below.</CardDescription>
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
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
              )}
              {!isLoading && !analysisResult && (
                <div className="flex flex-col items-center justify-center text-center h-64 bg-secondary/50 rounded-lg p-4">
                  <Search className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg">Ready for Analysis</p>
                  <p className="text-muted-foreground text-sm">Fill out the form to generate your report.</p>
                </div>
              )}
              {analysisResult && (
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult.report.replace(/\n/g, '<br />').replace(/## (.*?)(<br \/>)/g, '<h2>$1</h2>').replace(/\* \*(.*?)\* \*/g, '<strong>$1</strong>') }}/>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}


export default function MarketIntelligencePage() {
    return (
        <ProFeatureGuard>
            <MarketIntelligenceContent />
        </ProFeatureGuard>
    )
}

    