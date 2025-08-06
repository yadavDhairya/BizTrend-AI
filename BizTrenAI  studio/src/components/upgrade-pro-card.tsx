
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export function UpgradeProCard() {
    const { user } = useAuth();

    return (
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-10rem)]">
            <Card className="max-w-2xl w-full text-center shadow-2xl">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <Star className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl">Upgrade to Pro to Access This Feature</CardTitle>
                    <CardDescription className="text-base">
                        You are currently on the <span className="font-semibold text-primary">{user?.plan || 'Free'}</span> plan. Unlock this tool and many others by upgrading your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-lg">Free Plan</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Basic data visualizations</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Upload 5 files/month</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Standard AI insights</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/50 border border-primary/20">
                             <h4 className="font-semibold text-lg">Pro Plan</h4>
                             <ul className="space-y-2 text-sm text-primary">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Unlimited Uploads</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Deeper AI Analysis & Prediction</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Customer & Market Intelligence</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Expense Tracking</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Email & Chat Support</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/pricing">View Pricing and Upgrade</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

    