"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, UploadCloud, BarChart2, Lightbulb, TrendingUp, Receipt, Wallet, Globe, Star, ArrowRight, BrainCircuit, BarChart3, Users, Target, MessageSquare, FileScan } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useLanguage, type Language } from '@/contexts/language-context';
import { translations } from '@/lib/translations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
];

const demoPages = [
    {
        title: "Interactive Dashboard",
        description: "Upload your data and see it come to life with beautiful, interactive charts.",
        link: "/dashboard",
        image: "https://placehold.co/600x400.png",
        aiHint: "dashboard analytics"
    },
    {
        title: "AI Invoice Generator",
        description: "Create professional, GST-compliant invoices in seconds with AI-powered designs.",
        link: "/dashboard/invoice-generator",
        image: "https://placehold.co/600x400.png",
        aiHint: "invoice generator"
    },
    {
        title: "Predictive Analytics",
        description: "Forecast future sales trends and detect hidden anomalies in your business data.",
        link: "/dashboard/advanced-analytics",
        image: "https://placehold.co/600x400.png",
        aiHint: "financial forecast"
    }
];

const SalesContactForm = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you would send this data to your backend.
        toast({
            title: "Request Received!",
            description: "Thank you for your interest. Our team will contact you shortly.",
        });
        (e.target as HTMLFormElement).reset();
    }
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-headline">{t.contactSalesTitle}</CardTitle>
                <CardDescription>{t.contactSalesSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label htmlFor="name" className="text-sm font-medium">{t.contactSalesName}</label>
                           <Input id="name" name="name" type="text" placeholder="e.g. Rohan Sharma" required />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="email" className="text-sm font-medium">{t.contactSalesEmail}</label>
                             <Input id="email" name="email" type="email" placeholder="name@company.com" required />
                        </div>
                     </div>
                     <div className="space-y-2">
                         <label htmlFor="phone" className="text-sm font-medium">{t.contactSalesPhone}</label>
                         <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                     </div>
                    <Button type="submit" className="w-full">{t.contactSalesSubmit}</Button>
                </form>
            </CardContent>
        </Card>
    );
};


export default function Home() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
            <div className="absolute inset-0 z-[-1]">
                <Image
                    src="https://placehold.co/1920x1080.png"
                    alt="Abstract background representing data and network connections."
                    fill
                    style={{ objectFit: 'cover' }}
                    className="object-cover"
                    quality={90}
                    data-ai-hint="abstract technology"
                    priority
                />
                <div className="absolute inset-0 bg-background/80"></div>
            </div>
            <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-headline">
                {t.heroTitle}
                </h1>
                <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-muted-foreground">
                {t.heroSubtitle}
                </p>
                <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/signup">{t.getStarted}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/pricing">{t.viewPricing}</Link>
                </Button>
                </div>
                <div className="mt-8 flex justify-center">
                    <div className="w-full max-w-[200px] bg-background/80 backdrop-blur-sm rounded-md">
                        <Select defaultValue={language} onValueChange={(value: Language) => setLanguage(value)}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder={t.language} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Pre-built Pages Section */}
        <section className="w-full py-20 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-center font-headline">Explore Our Pre-Built Pages</h2>
                    <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                       Get a glimpse of the powerful tools inside BizTrend AI. Each page is designed to be intuitive, powerful, and ready to use.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {demoPages.map((page) => (
                         <Card key={page.title} className="flex flex-col overflow-hidden group">
                            <CardHeader>
                                <div className="aspect-video overflow-hidden rounded-md border">
                                     <Image
                                        src={page.image}
                                        width={600}
                                        height={400}
                                        alt={`Screenshot of the ${page.title} page.`}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        data-ai-hint={page.aiHint}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardTitle className="text-xl mb-2">{page.title}</CardTitle>
                                <CardDescription>{page.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={page.link}>
                                        View Demo <ArrowRight className="w-4 h-4 ml-2"/>
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                  {t.howItWorks}
                </div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                  {t.howItWorksTitle}
                </h2>
                <p className="text-muted-foreground">
                  {t.howItWorksSubtitle}
                </p>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.step1Title}</h3>
                      <p className="text-muted-foreground">{t.step1Subtitle}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.step2Title}</h3>
                      <p className="text-muted-foreground">{t.step2Subtitle}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.step3Title}</h3>
                      <p className="text-muted-foreground">{t.step3Subtitle}</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-8 md:mt-0">
                <Image
                  src="https://placehold.co/600x450.png"
                  width={600}
                  height={450}
                  alt="A screenshot of the BizTrend AI dashboard showing various charts and insights."
                  className="rounded-xl shadow-2xl ring-1 ring-border"
                  data-ai-hint="dashboard analytics"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-center font-headline">{t.featuresTitle}</h2>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                  {t.featuresSubtitle}
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.sort((a,b) => b.pro === a.pro ? 0 : b.pro ? -1 : 1).map((feature, index) => (
                <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex-row gap-4 items-center">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    {feature.pro && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">PRO</span>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/features" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
         <section className="w-full py-20 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold text-center font-headline">{t.testimonialsTitle}</h2>
                    <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                        See how our platform is making a difference for entrepreneurs and business owners.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={`t1-star-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />)}
                            </div>
                            <p className="text-muted-foreground mb-4">"{t.testimonial1}"</p>
                        </CardContent>
                         <CardHeader className="flex-row gap-4 items-center pt-0">
                           <Avatar>
                             <AvatarFallback>RS</AvatarFallback>
                           </Avatar>
                           <div>
                             <CardTitle className="text-base">{t.testimonial1Name}</CardTitle>
                             <CardDescription>{t.testimonial1Role}</CardDescription>
                           </div>
                         </CardHeader>
                    </Card>
                     <Card>
                        <CardContent className="pt-6">
                             <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={`t2-star-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />)}
                            </div>
                            <p className="text-muted-foreground mb-4">"{t.testimonial2}"</p>
                        </CardContent>
                         <CardHeader className="flex-row gap-4 items-center pt-0">
                           <Avatar>
                             <AvatarFallback>PD</AvatarFallback>
                           </Avatar>
                           <div>
                             <CardTitle className="text-base">{t.testimonial2Name}</CardTitle>
                             <CardDescription>{t.testimonial2Role}</CardDescription>
                           </div>
                         </CardHeader>
                    </Card>
                     <Card>
                        <CardContent className="pt-6">
                             <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={`t3-star-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />)}
                            </div>
                            <p className="text-muted-foreground mb-4">"{t.testimonial3}"</p>
                        </CardContent>
                         <CardHeader className="flex-row gap-4 items-center pt-0">
                           <Avatar>
                             <AvatarFallback>AS</AvatarFallback>
                           </Avatar>
                           <div>
                             <CardTitle className="text-base">{t.testimonial3Name}</CardTitle>
                             <CardDescription>{t.testimonial3Role}</CardDescription>
                           </div>
                         </CardHeader>
                    </Card>
                </div>
            </div>
        </section>

        {/* Contact Sales Section */}
        <section id="contact-sales" className="w-full py-20 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <SalesContactForm />
            </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-secondary/50">
             <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-headline">
                    {t.ctaTitle}
                </h2>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                    {t.ctaSubtitle}
                </p>
                <div className="mt-8">
                    <Button asChild size="lg" className="text-base py-6 px-10">
                        <Link href="/signup">{t.ctaButton}</Link>
                    </Button>
                </div>
             </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
