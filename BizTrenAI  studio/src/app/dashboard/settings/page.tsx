
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactToPrint } from 'react-to-print';
import { useRef, useState, useEffect } from 'react';


import Link from "next/link";
import { User, CreditCard, LogOut, Trash2, ShieldCheck, Laptop, Smartphone, Download, Bell, Mail, Lightbulb, TrendingUp, KeyRound, Wallet, Check } from "lucide-react";

const loginHistory = [
  { device: "Chrome on Windows", type: "Laptop", location: "Bangalore, IN", time: "2 hours ago" },
  { device: "Safari on iPhone", type: "Smartphone", location: "Mumbai, IN", time: "1 day ago" },
  { device: "Firefox on Linux", type: "Laptop", location: "Delhi, IN", time: "3 days ago" },
];

const paymentHistory = [
    { date: "2024-07-01", amount: "₹199.00", status: "Paid", invoiceId: "INV-PRO-124" },
    { date: "2024-06-01", amount: "₹199.00", status: "Paid", invoiceId: "INV-PRO-123" },
    { date: "2024-05-01", amount: "₹199.00", status: "Paid", invoiceId: "INV-PRO-122" },
]

const subscriptionPlans = [
     {
        name: "Free",
        price: "₹0",
        pricePeriod: "/ month",
        description: "For individuals getting started.",
        features: [
            "Basic data visualizations",
            "Upload 5 files per month",
            "Standard AI insights",
            "7-day trial of Pro features",
        ],
        cta: "Get Started"
    },
    {
        name: "Pro",
        price: "₹199",
        pricePeriod: "/ month",
        description: "For professionals who need more power.",
        features: [
            "Unlimited CSV, PDF, and Image uploads",
            "Advanced chart customizations",
            "Deeper AI analysis & insights",
            "Sales & Expense Prediction",
            "Email & chat support",
        ],
        cta: "Upgrade to Pro"
    },
    {
        name: "Business",
        price: "₹499",
        pricePeriod: "/ month",
        description: "For small teams and businesses.",
        features: [
            "Everything in Pro",
            "Team collaboration (up to 5 users)",
            "Export charts & insights",
            "Market Intelligence reports",
            "Priority support",
        ],
        cta: "Upgrade to Business"
    },
    {
        name: "Enterprise",
        price: "₹999",
        pricePeriod: "/ month",
        description: "For large organizations with advanced needs.",
        features: [
            "Everything in Business",
            "Unlimited users",
            "API access & integrations",
            "Dedicated account manager",
            "On-premise deployment option",
        ],
        cta: "Upgrade to Enterprise"
    },
];


const InvoiceTemplate = ({ invoiceId }: { invoiceId: string }) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold font-headline">Invoice {invoiceId}</h1>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <p>Status: Paid</p>
        <p className="mt-4">Thank you for your business!</p>
    </div>
)

const PaymentHistoryRow = ({ item }: { item: typeof paymentHistory[0] }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const handlePrint = useReactToPrint({
      content: () => invoiceRef.current,
      documentTitle: `Invoice-${item.invoiceId}`,
      onAfterPrint: () => toast({ title: "Invoice Ready", description: "Your invoice has been prepared for printing or saving as PDF."})
    });
  
    return (
      <TableRow>
        <TableCell>{item.date}</TableCell>
        <TableCell>{item.amount}</TableCell>
        <TableCell>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {item.status}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" title={`Download invoice ${item.invoiceId}`} onClick={handlePrint}>
            <Download className="w-4 h-4" />
          </Button>
          <div className="hidden">
            <div ref={invoiceRef}>
              <InvoiceTemplate invoiceId={item.invoiceId} />
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  };


export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [upiId, setUpiId] = useState('');
  const [razorpayLink, setRazorpayLink] = useState('');

  useEffect(() => {
    if (user) {
        setUpiId(localStorage.getItem('biztrend-upiId') || '');
        setRazorpayLink(localStorage.getItem('biztrend-razorpayLink') || '');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    // In a real app, this would trigger a backend process.
    // Here we just log out and show a confirmation.
    logout(); 
    toast({
        variant: "destructive",
        title: "Account Deleted",
        description: "Your account and all associated data have been removed.",
    });
    router.push("/");
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Settings Saved",
        description: "Your profile information has been updated.",
    });
  }

  const handlePaymentDetailsSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('biztrend-upiId', upiId);
    localStorage.setItem('biztrend-razorpayLink', razorpayLink);
    toast({
        title: "Payment Details Saved",
        description: "Your default payment details have been updated for new invoices.",
    });
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    // Here you would close the dialog
  }

   const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Billing Information Saved",
      description: "Your payment method has been updated.",
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, payments, security, and subscription settings.
        </p>
      </div>

       <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl">
                <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/> Profile</TabsTrigger>
                <TabsTrigger value="payment"><Wallet className="w-4 h-4 mr-2"/> Payment</TabsTrigger>
                <TabsTrigger value="security"><ShieldCheck className="w-4 h-4 mr-2"/> Security</TabsTrigger>
                <TabsTrigger value="subscription"><CreditCard className="w-4 h-4 mr-2"/> Subscription</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/> Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
                 <form onSubmit={handleSaveChanges}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>This is how your information appears on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name (Optional)</Label>
                                <Input id="displayName" type="text" placeholder="e.g., Dhairya Yadav" defaultValue={user?.email?.split('@')[0]}/>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6 flex justify-between items-center">
                            <Button type="submit">Save Changes</Button>
                        </CardFooter>
                    </Card>
                </form>
            </TabsContent>
            
             <TabsContent value="payment" className="mt-6">
                 <form onSubmit={handlePaymentDetailsSave}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Set your default payment methods for invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="upiId">Default UPI ID</Label>
                                <Input id="upiId" type="text" placeholder="yourname@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                                <p className="text-xs text-muted-foreground">This will be automatically added to new invoices.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="razorpayLink">Default Razorpay Link</Label>
                                <Input id="razorpayLink" type="text" placeholder="https://rzp.io/l/..." value={razorpayLink} onChange={(e) => setRazorpayLink(e.target.value)} />
                                 <p className="text-xs text-muted-foreground">Add your Razorpay payment page link here.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            <Button type="submit">Save Payment Details</Button>
                        </CardFooter>
                    </Card>
                </form>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login & Security</CardTitle>
                            <CardDescription>Enhance your account's security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Two-Factor Authentication (2FA)</h3>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                </div>
                                <Switch id="2fa-switch" />
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Password</h3>
                                    <p className="text-sm text-muted-foreground">Last changed over a year ago.</p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><KeyRound className="mr-2" /> Change Password</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <form onSubmit={handleChangePassword}>
                                            <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Choose a new password for your account.
                                            </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="current-password" className="text-right">Current</Label>
                                                    <Input id="current-password" type="password" className="col-span-3" required/>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="new-password" className="text-right">New</Label>
                                                    <Input id="new-password" type="password" className="col-span-3" required/>
                                                </div>
                                                 <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="confirm-password" className="text-right">Confirm</Label>
                                                    <Input id="confirm-password" type="password" className="col-span-3" required/>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Login History</CardTitle>
                            <CardDescription>A log of recent sign-ins to your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Device</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loginHistory.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="flex items-center gap-2">
                                                    {item.type === 'Laptop' ? <Laptop className="w-4 h-4 text-muted-foreground"/> : <Smartphone className="w-4 h-4 text-muted-foreground"/>}
                                                    {item.device}
                                                </TableCell>
                                                <TableCell>{item.location}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{item.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                             <Button variant="outline">Log out all other devices</Button>
                        </CardFooter>
                    </Card>
                     <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive"><Trash2/> Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full mt-4 sm:w-auto sm:mt-0">
                                            Delete My Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            account and remove your data from our servers.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                            Yes, delete my account
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="subscription" className="mt-6">
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Manage Subscription</CardTitle>
                            <CardDescription>You are currently on the <span className="font-semibold text-primary">{user?.plan}</span> plan. Your trial of Pro features ends in 7 days.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                             {subscriptionPlans.map((plan) => (
                                <Card key={plan.name} className={`flex flex-col ${user?.plan === plan.name ? 'border-primary ring-2 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <div>
                                            <span className="text-3xl font-bold">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.pricePeriod}</span>
                                        </div>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-3">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" disabled={user?.plan === plan.name}>
                                            {user?.plan === plan.name ? 'Current Plan' : plan.cta}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </CardContent>
                         <CardFooter className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between">
                            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                                Need more? <Link href="/#contact-sales" className="text-primary hover:underline">Contact sales</Link> for our Enterprise plan.
                            </p>
                            <Button variant="outline">Cancel Subscription</Button>
                         </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>The credit card that will be used for your next payment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Visa ending in 4242</p>
                                        <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Update Card</Button>
                                    </DialogTrigger>
                                     <DialogContent className="sm:max-w-md">
                                        <form onSubmit={handleBillingSubmit}>
                                            <DialogHeader>
                                                <DialogTitle>Update Payment Method</DialogTitle>
                                                <DialogDescription>
                                                   Enter your new card details. Your subscription will be billed to this card.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                 <div className="space-y-2">
                                                    <Label htmlFor="card-name">Name on card</Label>
                                                    <Input id="card-name" placeholder="Dhairya Yadav" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="card-number">Card number</Label>
                                                    <Input id="card-number" placeholder="•••• •••• •••• 4242" />
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="expiry-date">Expiry</Label>
                                                        <Input id="expiry-date" placeholder="MM/YY" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cvc">CVC</Label>
                                                        <Input id="cvc" placeholder="123" />
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor="postal-code">Postal Code</Label>
                                                        <Input id="postal-code" placeholder="560001" />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save and Update</Button>
                                            </DialogFooter>
                                        </form>
                                     </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>View and download your past invoices.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentHistory.map((item, index) => (
                                           <PaymentHistoryRow key={index} item={item} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Choose how you want to be notified.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-1 text-muted-foreground" />
                                <div>
                                    <h3 className="font-semibold">Email Notifications</h3>
                                    <p className="text-sm text-muted-foreground">Receive weekly summary reports and important account updates via email.</p>
                                </div>
                            </div>
                            <Switch id="email-switch" defaultChecked/>
                        </div>
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                           <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 mt-1 text-muted-foreground" />
                                <div>
                                    <h3 className="font-semibold">AI Summary Alerts</h3>
                                    <p className="text-sm text-muted-foreground">Get notified when AI insights for your uploaded data are ready.</p>
                                </div>
                            </div>
                            <Switch id="summary-switch" defaultChecked />
                        </div>
                         <div className="flex items-start justify-between p-4 border rounded-lg">
                           <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 mt-1 text-muted-foreground" />
                                <div>
                                    <h3 className="font-semibold">New Trend Alerts</h3>
                                    <p className="text-sm text-muted-foreground">Be alerted when the system detects a significant new trend in your data.</p>
                                </div>
                            </div>
                            <Switch id="trend-switch" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
       </Tabs>
    </div>
  );
}

    