
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, BarChart3, BrainCircuit, Receipt, Users, Globe, Target, UserX, Lightbulb, MessageSquare, Wallet, FileScan } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import Footer from '@/components/footer';

const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Daily Sales Log",
      description: "Track daily revenue, costs, and profit. Get AI analysis on your performance trends and get actionable advice.",
      pro: true
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Customer-Level Analysis",
      description: "Upload sales data to get AI-powered reports on individual customer spending habits, purchase history, and potential upsell opportunities.",
      pro: true
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "Advanced Data Analysis",
      description: "Upload any CSV, text, or image file to get automated trend prediction and anomaly detection.",
      pro: true
    },
     {
      icon: <Receipt className="w-8 h-8 text-primary" />,
      title: "AI Invoice Generator",
      description: "Create professional, GST-compliant invoices in seconds. Let our AI handle the design and formatting for you.",
      pro: false
    },
    {
      icon: <FileScan className="w-8 h-8 text-primary" />,
      title: "Expense Tracker",
      description: "Simply upload a photo of a bill or receipt, and our AI will automatically extract all the key details.",
      pro: true
    },
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: "Financial Management Tools",
      description: "Calculate profit & loss, gross margin, and perform breakeven analysis with our simple financial calculators.",
      pro: false
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Market Intelligence",
      description: "Gain AI-powered insights into your industry, competitors, and market trends to stay ahead of the curve.",
      pro: true
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      title: "AI Support Bot",
      description: "Get instant help and answers to your questions with our integrated AI assistant, available 24/7.",
      pro: false
    },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-headline">
              A Powerful Suite of Tools for Your Business
            </h1>
            <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-muted-foreground">
              From data analysis to financial management, BizTrend AI provides everything you need to make smarter, data-driven decisions and streamline your operations.
            </p>
             <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-20 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.sort((a,b) => b.pro === a.pro ? 0 : b.pro ? -1 : 1).map((feature, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader className="flex-row gap-4 items-center">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    {feature.pro && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">PRO</span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32">
             <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-headline">
                    Ready to Unlock Your Business's Potential?
                </h2>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                    Join hundreds of businesses making smarter decisions with BizTrend AI.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg" className="text-base py-6 px-10">
                        <Link href="/signup">Sign Up For Free</Link>
                    </Button>
                </div>
             </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
