
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/language-context";
import { translations } from "@/lib/translations";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        await login(values.email, values.password);
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
        router.push("/dashboard");
    } catch (error) {
        // Error toast is handled in auth context
    } finally {
        setIsLoading(false);
    }
  }
  
  async function onGoogleLogin() {
    setIsLoading(true);
    try {
        await loginWithGoogle();
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
        router.push("/dashboard");
    } catch (error) {
         // Error toast is handled in auth context
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
            <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{t.loginTitle}</CardTitle>
                <CardDescription>
                    {t.loginDescription}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.emailLabel}</FormLabel>
                            <FormControl>
                            <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.passwordLabel}</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin mr-2" />}
                        {t.loginButton}
                    </Button>
                    </form>
                </Form>

                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">{t.or}</span>
                </div>
                
                <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isLoading}>
                     {isLoading && <Loader2 className="animate-spin mr-2" />}
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.7C309 93.5 280.3 80 248 80c-73.2 0-133.3 59.9-133.3 133.3s60.1 133.3 133.3 133.3c58.2 0 104.4-25.3 121.2-47.2h-121.2v-92h205.8c2.9 15.8 4.6 32.4 4.6 50.8z"></path></svg>
                    {t.googleButton}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {t.noAccount}{" "}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                    {t.signUpLink}
                    </Link>
                </p>
                </CardContent>
            </Card>
             <div className="mt-8 flex justify-center">
                <div className="w-full max-w-[200px]">
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
        </main>
        <Footer />
    </div>
  );
}
