

import Link from 'next/link';
import Logo from './logo';

interface FooterProps {
  setLanguage?: (lang: "en" | "hi" | "kn") => void;
}

export default function Footer({ setLanguage }: FooterProps) {
  return (
    <footer className="bg-secondary/50">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold">BizTrend AI</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Unlock actionable insights from your data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
                  Pricing
                </Link>
              </li>
               <li>
                <Link href="/dashboard/help-support" className="text-sm text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
               <li>
                <Link href="/legal/cookie-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://x.com/dhairy_yadav" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://linkedin.com/in/dhairyayadav" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BizTrend AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
