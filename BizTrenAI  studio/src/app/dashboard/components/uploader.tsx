
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, Download } from "lucide-react";
import React from 'react';

export interface ParsedData {
  headers: string[];
  rows: Record<string, string | number>[];
}

interface DataUploaderProps {
  onDataParsed: (data: ParsedData, fileContent: string) => void;
  disabled: boolean;
  setLoading?: (loading: boolean) => void;
}

const ACCEPTED_FILE_TYPES = ["text/csv", "text/plain", "application/json", "application/pdf", "image/jpeg", "image/png"];
const TEXT_FILE_TYPES = ["text/csv", "text/plain", "application/json"];

export default function DataUploader({ onDataParsed, disabled, setLoading }: DataUploaderProps) {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type) && !file.name.match(/\.(csv|txt|json|pdf|jpg|jpeg|png)$/i)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid file (e.g., .csv, .json, .txt, .pdf, .jpg, .png).",
        });
        return;
      }
      
      setLoading?.(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        let parsedResult: ParsedData = { headers: [], rows: [] };
        let parseError = false;

        // Try to parse structured text files (CSV/JSON-like)
        if (TEXT_FILE_TYPES.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
            try {
                // Check for JSON first
                if (file.name.endsWith('.json')) {
                    const jsonData = JSON.parse(result);
                    if (Array.isArray(jsonData) && jsonData.length > 0) {
                        parsedResult.headers = Object.keys(jsonData[0]);
                        parsedResult.rows = jsonData;
                    } else {
                         throw new Error("JSON is not an array of objects.");
                    }
                } else { // Assume CSV or similar delimited text
                    const lines = result.trim().split(/\r\n|\n/);
                    const headerLine = lines.shift()?.trim();
                    if (!headerLine) {
                        throw new Error("File is empty or has no header.");
                    }
                    const headers = headerLine.split(/,/).map(h => h.trim().replace(/"/g, ''));
                    
                    const rows = lines.map(line => {
                        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Handle commas inside quotes
                        const rowObject: Record<string, string | number> = {};
                        headers.forEach((header, index) => {
                          const value = values[index]?.trim().replace(/"/g, '') || '';
                          const cleanedValue = value.replace(/[₹,]/g, '');
                          const numValue = parseFloat(cleanedValue);
                          rowObject[header] = !isNaN(numValue) && cleanedValue !== '' ? numValue : value;
                        });
                        return rowObject;
                    });
                    parsedResult = { headers, rows };
                }
            } catch (error) {
                console.error("Error parsing file:", error);
                parseError = true;
            }
        }
        
        setLoading?.(false);
        onDataParsed(parsedResult, result); // This now happens after loader is off
        
        toast({
            title: "File Uploaded",
            description: `${file.name} is being processed...`,
        });

        if (parseError) {
             toast({
                variant: "destructive",
                title: "File Parsing Warning",
                description: "Could not auto-format data for charting. AI insights will still be generated.",
            });
        }
      };

      reader.onerror = () => {
        setLoading?.(false);
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "There was an issue reading your file. Please try again.",
        });
      };

      if (TEXT_FILE_TYPES.includes(file.type) || file.name.match(/\.(csv|txt|json)$/i)) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const sampleCsvData = [
    "Date,Product,Category,Revenue,Profit",
    "2024-07-01,Samosa,Snacks,5000,2000",
    "2024-07-01,Coffee,Beverages,3000,1800",
    "2024-07-02,Samosa,Snacks,5500,2200",
    "2024-07-02,Coffee,Beverages,3200,1900",
    "2024-07-03,Tea,Beverages,2500,1500",
    "2024-07-03,Samosa,Snacks,4800,1900",
    "2024-07-04,Coffee,Beverages,3500,2100",
    "2024-07-04,Samosa,Snacks,6000,2500",
    "2024-07-05,Tea,Beverages,2800,1700",
    "2024-07-05,Samosa,Snacks,5200,2100",
  ].join('\n');

  const sampleDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsvData)}`;


  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Your Data</CardTitle>
        <CardDescription>Upload a CSV, JSON, TXT, PDF, or Image file to begin analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-secondary/50 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-secondary'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {disabled ? (
                        <Loader2 className="w-10 h-10 mb-4 text-muted-foreground animate-spin" />
                    ) : (
                        <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                    )}
                    <p className="mb-2 text-sm text-muted-foreground">
                        {disabled 
                            ? "Processing your data..."
                            : <><span className="font-semibold">Click to upload</span> or drag and drop</>
                        }
                    </p>
                    <p className="text-xs text-muted-foreground">CSV, JSON, TXT, PDF, JPG, PNG files.</p>
                </div>
                <Input id="dropzone-file" type="file" className="hidden" accept={ACCEPTED_FILE_TYPES.join(',')} onChange={handleFileChange} disabled={disabled} />
            </label>
        </div>
         <div className="mt-4 text-center">
            <a 
                href={sampleDataUri} 
                download="sample-sales-data.csv"
                className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4"/>
                Download sample data
            </a>
        </div>
      </CardContent>
    </Card>
  );
}
