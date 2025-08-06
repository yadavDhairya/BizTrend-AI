
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage, type Language } from "@/contexts/language-context";
import { translations } from "@/lib/translations";

export default function PricingPage() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  
  const t = translations[language];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto py-20 px-4 md:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-headline">
              {t.pricingTitle}
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              {t.pricingSubtitle}
            </p>
             <div className="mt-8 flex justify-center">
                <div className="max-w-[200px]">
                    <Select defaultValue={language} onValueChange={(value: Language) => setLanguage(value)}>
                    <SelectTrigger>
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

          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
            {t.pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col ${tier.popular ? "border-primary shadow-2xl shadow-primary/20" : ""} ${user?.plan === tier.name ? "border-primary ring-2 ring-primary" : "border-border"}`}
              >
                {tier.popular && (
                  <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1.5 rounded-t-lg">
                    {t.mostPopular}
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div>
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.pricePeriod && (
                      <span className="text-muted-foreground">{tier.pricePeriod}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                   <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"} disabled={user?.plan === tier.name}>
                     <Link href={!user ? '/signup' : tier.cta === 'Contact Sales' ? '/#contact-sales' : '/dashboard/settings'}>
                        {user?.plan === tier.name ? t.currentPlan : tier.cta}
                     </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
