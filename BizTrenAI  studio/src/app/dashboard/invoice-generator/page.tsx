
"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Plus, Trash2, Wand2, Printer, Loader2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { useRef, useState, useEffect } from "react";
import { generateInvoice, type GenerateInvoiceOutput } from "@/ai/flows/generate-invoice";
import { InvoiceItemSchema } from "@/ai/schemas";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientAddress: z.string().min(1, "Client address is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.preprocess(
        (a) => (a === '' ? undefined : a),
        z.coerce.number({invalid_type_error: "Quantity must be a number."}).min(0, "Quantity must be positive")
      ),
      price: z.preprocess(
        (a) => (a === '' ? undefined : a),
        z.coerce.number({invalid_type_error: "Price must be a number."}).min(0, "Price must be positive")
      ),
  })).min(1, "At least one item is required"),
  gstRate: z.coerce.number().min(0),
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
  prompt: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

const getInitialFormValues = (): InvoiceFormValues => {
    const upiId = typeof window !== 'undefined' ? localStorage.getItem('biztrend-upiId') || '' : '';
    const razorpayLink = typeof window !== 'undefined' ? localStorage.getItem('biztrend-razorpayLink') || '' : '';
    
    let paymentInstructions = '';
    if (upiId) paymentInstructions += `UPI: ${upiId}\n`;
    if (razorpayLink) paymentInstructions += `Razorpay: ${razorpayLink}`;

    return {
      companyName: '',
      companyAddress: '',
      clientName: '',
      clientAddress: '',
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      items: [{ description: "", quantity: 1, price: 0 }],
      gstRate: 18,
      notes: "",
      paymentInstructions: paymentInstructions.trim(),
      prompt: "",
    };
};

const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export default function InvoiceGeneratorPage() {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GenerateInvoiceOutput | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormValues(),
  });

   useEffect(() => {
    if (isClient) {
      form.reset(getInitialFormValues());
    }
  }, [isClient, form]);


  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${form.getValues('invoiceNumber')}`,
    onAfterPrint: () => toast({ title: "Print job complete!" }),
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedGstRate = useWatch({ control: form.control, name: "gstRate" });

  const subTotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const gstAmount = subTotal * (watchedGstRate / 100);
  const grandTotal = subTotal + gstAmount;

  async function onSubmit(data: InvoiceFormValues) {
    setIsGenerating(true);
    setGeneratedInvoice(null);

    const itemsWithTotals = data.items.map(item => ({
        ...item,
        total: item.quantity * item.price,
    }));
    const payload = { 
        ...data, 
        items: itemsWithTotals,
        subTotal,
        gstAmount,
        grandTotal
    };

    const makeRequest = () => generateInvoice(payload);

    try {
      const result = await makeRequest();
      setGeneratedInvoice(result);
       toast({
        title: "Invoice Generated",
        description: "Your AI-powered invoice is ready for review.",
      });
    } catch (error: any) {
        if (error.message && error.message.includes('overloaded')) {
            setTimeout(async () => {
                try {
                    const result = await makeRequest();
                    setGeneratedInvoice(result);
                } catch (retryError: any) {
                     toast({ variant: "destructive", title: "Generation Error", description: "The AI model is still busy. Please try again later." });
                } finally {
                    setIsGenerating(false);
                }
            }, 2000);
            return;
        }
      console.error("Error generating invoice:", error);
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: "Failed to generate the invoice. Please try again.",
      });
    } finally {
        setIsGenerating(false);
    }
  }

  if (!isClient) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="grid lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4"><Skeleton className="h-96 w-full" /><Skeleton className="h-64 w-full" /></div>
                <div className="lg:col-span-3 "><Skeleton className="h-[700px] w-full" /></div>
            </div>
        </div>
      )
  }

  return (
    <TooltipProvider>
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Receipt /> Invoice Generator</h1>
        <p className="text-muted-foreground">
          Create, customize, and generate professional invoices with the help of AI.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Invoice Details
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Fill in your company and client info, add line items, and let the AI design the final invoice.</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
                <CardDescription>Fill in the details to create your invoice.</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Company & Client Details */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Your Company</FormLabel><FormControl><Input placeholder="e.g., BizTrend AI Solutions" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel>Company Address</FormLabel><FormControl><Input placeholder="e.g., 123 Tech Park, Bangalore" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Client Company</FormLabel><FormControl><Input placeholder="e.g., Sharma Sweets" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel>Client Address</FormLabel><FormControl><Input placeholder="e.g., 456 Main St, Delhi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <Separator />
                     {/* Invoice Meta */}
                    <div className="grid sm:grid-cols-3 gap-4">
                         <FormField control={form.control} name="invoiceNumber" render={({ field }) => (<FormItem><FormLabel>Invoice #</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <Separator />
                    {/* Line Items */}
                    <div className="space-y-2">
                        <h3 className="font-medium">Line Items</h3>
                        <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center text-xs text-muted-foreground px-1">
                            <Label>Description</Label>
                            <Label className="text-right">Quantity</Label>
                            <Label className="text-right">Price</Label>
                            <div/>
                        </div>

                        {fields.map((field, index) => (
                           <div key={field.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-start">
                                <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (<FormItem className="space-y-0"><FormControl><Input placeholder="Data Analysis Service" {...field} /></FormControl><FormMessage className="pt-1"/></FormItem>)} />
                                <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<FormItem className="space-y-0"><FormControl><Input type="number" placeholder="1" {...field} className="text-right" /></FormControl><FormMessage className="pt-1"/></FormItem>)} />
                                <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (<FormItem className="space-y-0"><FormControl><Input type="number" placeholder="500" {...field} className="text-right" /></FormControl><FormMessage className="pt-1"/></FormItem>)} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4" /></Button>
                           </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, price: 0 })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                    <Separator />

                    {/* Totals & GST */}
                    <div className="space-y-4 rounded-lg bg-secondary/50 p-4">
                        <div className="flex justify-between items-center">
                            <Label>Subtotal</Label>
                            <span className="font-mono">{formatCurrency(subTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <Label htmlFor="gst-rate" className="flex-1">GST</Label>
                             <FormField
                                control={form.control}
                                name="gstRate"
                                render={({ field }) => (
                                <FormItem className="w-2/5">
                                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select GST Rate" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="0">0%</SelectItem>
                                            <SelectItem value="5">5%</SelectItem>
                                            <SelectItem value="12">12%</SelectItem>
                                            <SelectItem value="18">18%</SelectItem>
                                            <SelectItem value="28">28%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                                )}
                            />
                            <span className="font-mono w-2/5 text-right">{formatCurrency(gstAmount)}</span>
                        </div>
                         <Separator />
                         <div className="flex justify-between items-center font-bold text-lg">
                            <Label>Grand Total</Label>
                            <span className="font-mono">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>

                     <Separator />
                     {/* Notes & Prompt */}
                     <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes / Terms</FormLabel><FormControl><Textarea placeholder="e.g., Thank you for your business!" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="paymentInstructions" render={({ field }) => (<FormItem><FormLabel>Payment Instructions</FormLabel><FormControl><Textarea placeholder="e.g., UPI: yourid@bank" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="prompt" render={({ field }) => (<FormItem><FormLabel>AI Prompt (Optional)</FormLabel><FormControl><Input placeholder="e.g., Make it look modern and friendly" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     
                    <Button type="submit" className="w-full" disabled={isGenerating}>
                         {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                         {isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                </form>
               </Form>
            </CardContent>
           </Card>
        </div>
        <div className="lg:col-span-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            Invoice Preview
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>The AI-generated invoice will appear here. You can then print it or save it as a PDF.</p>
                                </TooltipContent>
                            </Tooltip>
                        </CardTitle>
                        <CardDescription>This is a preview of your generated invoice.</CardDescription>
                    </div>
                    <Button onClick={handlePrint} disabled={!generatedInvoice || isGenerating}>
                        <Printer className="mr-2" /> Print / Save PDF
                    </Button>
                </CardHeader>
                <CardContent>
                   <div ref={invoiceRef} className="border rounded-lg min-h-[700px] bg-white text-black p-8">
                       {isGenerating && (
                           <div className="flex items-center justify-center h-full w-full">
                               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                           </div>
                       )}
                        {!isGenerating && !generatedInvoice && (
                             <div className="flex flex-col items-center justify-center h-full w-full text-center">
                               <Receipt className="w-12 h-12 text-muted-foreground mb-4"/>
                               <p className="text-muted-foreground">Your generated invoice will appear here.</p>
                           </div>
                        )}
                        {generatedInvoice && (
                            <div dangerouslySetInnerHTML={{ __html: generatedInvoice.invoiceHtml }}/>
                        )}
                   </div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

    