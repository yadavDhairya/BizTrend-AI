
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, BookText, Zap, Lightbulb, TrendingUp } from "lucide-react";
import { getReportFeedback, type GetReportFeedbackOutput } from '@/ai/flows/get-report-feedback';
import { Skeleton } from '@/components/ui/skeleton';
import { ProFeatureGuard } from '@/components/pro-feature-guard';

const formSchema = z.object({
  reportText: z.string().min(50, "Please enter at least 50 characters for a meaningful analysis."),
});

type ReportFormValues = z.infer<typeof formSchema>;

const FeedbackCard = ({ icon, title, feedback }: { icon: React.ReactNode, title: string, feedback: { problem: string; suggestion: string } }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            {icon}
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold text-sm mb-1">Area for Improvement:</h4>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{feedback.problem}</p>
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-1 text-primary">Suggestion:</h4>
                <p className="text-sm text-primary/90 bg-primary/10 p-3 rounded-md">{feedback.suggestion}</p>
            </div>
        </CardContent>
    </Card>
);


function ReportFeedbackContent() {
  const [feedback, setFeedback] = useState<GetReportFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportText: "",
    },
  });

  const onSubmit = async (data: ReportFormValues) => {
    setIsLoading(true);
    setFeedback(null);

    const makeRequest = () => getReportFeedback(data);

    try {
      const result = await makeRequest();
      setFeedback(result);
    } catch (error: any) {
        if (error.message && error.message.includes('overloaded')) {
            setTimeout(async () => {
                try {
                    const result = await makeRequest();
                    setFeedback(result);
                } catch (retryError: any) {
                    toast({ variant: "destructive", title: "Analysis Error", description: "The AI model is still busy. Please try again later." });
                } finally {
                    setIsLoading(false);
                }
            }, 2000);
            return;
        }
      console.error("Error getting report feedback:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to generate feedback. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><BookText /> Report Feedback</h1>
        <p className="text-muted-foreground max-w-2xl">
          Paste your business report, email draft, or any other text below to get instant, AI-powered suggestions for improvement.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Report Text</CardTitle>
              <CardDescription>Paste the content you want to analyze.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reportText"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Start with your quarterly sales summary..."
                            className="min-h-[300px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2" />}
                    {isLoading ? "Analyzing..." : "Get Feedback"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis Result */}
        <div className="lg:col-span-1">
           <Card>
             <CardHeader>
                <CardTitle>AI-Generated Feedback</CardTitle>
                <CardDescription>Suggestions to enhance your writing will appear here.</CardDescription>
             </CardHeader>
             <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}

                {!isLoading && !feedback && (
                    <div className="flex flex-col items-center justify-center text-center h-64 bg-secondary/50 rounded-lg p-4">
                        <BookText className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-lg">Ready for Feedback</p>
                        <p className="text-muted-foreground text-sm">Paste your text on the left and click the button.</p>
                    </div>
                )}
                
                {feedback && (
                    <div className="space-y-6">
                        <FeedbackCard 
                            icon={<Lightbulb className="w-6 h-6 text-yellow-400" />} 
                            title="Clarity"
                            feedback={feedback.clarity}
                        />
                         <FeedbackCard 
                            icon={<Zap className="w-6 h-6 text-blue-400" />} 
                            title="Conciseness"
                            feedback={feedback.conciseness}
                        />
                         <FeedbackCard 
                            icon={<TrendingUp className="w-6 h-6 text-green-400" />} 
                            title="Impact"
                            feedback={feedback.impact}
                        />
                    </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}


export default function ReportFeedbackPage() {
    return (
        <ProFeatureGuard>
            <ReportFeedbackContent />
        </ProFeatureGuard>
    )
}

    