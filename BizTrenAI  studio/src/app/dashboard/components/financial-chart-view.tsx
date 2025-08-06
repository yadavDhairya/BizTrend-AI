
"use client";

import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data } from 'plotly.js';
import { Skeleton } from '@/components/ui/skeleton';
import { FileWarning } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ParsedData } from '../components/uploader';


interface FinancialChartViewProps {
  parsedData: ParsedData | null;
  isLoading: boolean;
  xAxisKey: string | null;
  yAxisKeys: string[];
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'scatter';
}

const PLOTLY_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export default function FinancialChartView({ parsedData, isLoading, xAxisKey, yAxisKeys, chartType }: FinancialChartViewProps) {
  const { resolvedTheme } = useTheme();

  const chartData: Data[] = useMemo(() => {
    if (!parsedData || !xAxisKey || yAxisKeys.length === 0) return [];
    
    const xValues = parsedData.rows.map(row => row[xAxisKey!]);
    
    if (chartType === 'pie') {
        const yAxisKey = yAxisKeys[0]; // Pie chart only uses the first Y-axis key
        if (!yAxisKey) return [];
        const pieLabels = parsedData.rows.map(row => String(row[xAxisKey!]));
        const pieValues = parsedData.rows.map(row => Number(row[yAxisKey!]));
        
        return [{
            labels: pieLabels,
            values: pieValues,
            type: 'pie',
            hole: 0.4,
            marker: { colors: PLOTLY_COLORS },
            textinfo: 'percent',
            textfont: {
                color: resolvedTheme === 'dark' ? '#FFFFFF' : '#000000'
            },
            hoverinfo: 'label+percent+value',
        }];
    }

    return yAxisKeys.map((yKey, index) => {
        const yValues = parsedData.rows.map(row => row[yKey]);
        let trace: Partial<Data> = {
            x: xValues,
            y: yValues,
            name: yKey,
            type: chartType,
            marker: { color: PLOTLY_COLORS[index % PLOTLY_COLORS.length] },
        };
        
        if (chartType === 'area') {
            trace.type = 'scatter';
            trace.fill = 'tozeroy';
        } else if (chartType === 'line' || chartType === 'scatter') {
             trace.mode = chartType === 'line' ? 'lines+markers' : 'markers';
        }

        return trace as Data;
    });
    
  }, [parsedData, xAxisKey, yAxisKeys, chartType, resolvedTheme]);


  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!parsedData || parsedData.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full bg-secondary/50 rounded-lg">
        <p className="text-muted-foreground">Upload data to see your chart.</p>
      </div>
    );
  }

  if (!xAxisKey || yAxisKeys.length === 0) {
     return (
      <div className="flex items-center justify-center h-96 w-full bg-secondary/50 rounded-lg">
        <p className="text-muted-foreground text-center p-4">Select columns for X and Y axes to generate a chart.</p>
      </div>
    );
  }

  // Smart validation for chart types
  if (chartType === 'pie' && yAxisKeys.length > 1) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-96 bg-secondary/50 rounded-lg p-4">
            <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">Invalid Selection for Pie Chart</p>
            <p className="text-muted-foreground text-sm">Pie charts can only visualize one numeric column (Y-Axis) at a time.</p>
        </div>
    );
  }
  
  if (chartType === 'scatter' && (!parsedData.headers.some(h => typeof parsedData.rows[0]?.[h] === 'number' && h === xAxisKey))) {
     return (
        <div className="flex flex-col items-center justify-center text-center h-96 bg-secondary/50 rounded-lg p-4">
            <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">Invalid Selection for Scatter Plot</p>
            <p className="text-muted-foreground text-sm">Scatter plots require a numeric column for the X-Axis.</p>
        </div>
    );
  }


  return (
    <div className="h-96 w-full">
        <Plot
            data={chartData}
            layout={{
                autosize: true,
                showlegend: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: {
                  color: resolvedTheme === 'dark' ? '#FFFFFF' : '#000000',
                  family: 'Inter, sans-serif'
                },
                xaxis: {
                  title: xAxisKey || '',
                  gridcolor: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
                  linecolor: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
                },
                yaxis: {
                  title: yAxisKeys.join(', '),
                  gridcolor: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
                  linecolor: resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
                  tickprefix: '₹',
                  hoverformat: ',.2f'
                },
                legend: {
                  orientation: 'h',
                  yanchor: 'bottom',
                  y: 1.02,
                  xanchor: 'right',
                  x: 1,
                },
                margin: { l: 60, r: 20, t: 20, b: 40 }
            }}
            config={{
                responsive: true,
                displaylogo: false,
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
        />
    </div>
  );
}
