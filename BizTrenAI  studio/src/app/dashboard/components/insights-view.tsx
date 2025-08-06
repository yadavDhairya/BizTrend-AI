
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";

interface InsightsViewProps {
  insights: string | undefined | null;
  isLoading: boolean;
}

export default function InsightsView({ insights, isLoading }: InsightsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-400" />
            AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Key trends and patterns identified from your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : insights ? (
          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: insights }}/>
        ) : (
          <p className="text-muted-foreground">Upload data to generate AI insights.</p>
        )}
      </CardContent>
    </Card>
  );
}
