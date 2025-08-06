
"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function TermsOfServicePage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        // This ensures the date is only generated on the client, avoiding hydration mismatch.
        setLastUpdated(new Date().toLocaleDateString());
    }, []);
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
                <div className="prose dark:prose-invert max-w-4xl mx-auto">
                    <h1>Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: {lastUpdated || '...'}</p>
                    
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to BizTrend AI ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website located at biztrendai.in (together or individually "Service") operated by BizTrend AI.
                    </p>
                    <p>
                        Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Please read it here /legal/privacy-policy.
                    </p>
                    <p>
                        Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound of them.
                    </p>
                    <p>
                        If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at support@biztrendai.in so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.
                    </p>

                    <h2>2. Your Account</h2>
                    <p>
                        When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on Service.
                    </p>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password, including but not to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                    </p>

                    <h2>3. Prohibited Uses</h2>
                    <p>You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:</p>
                    <ul>
                        <li>In any way that violates any applicable national or international law or regulation.</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                        <li>To impersonate or attempt to impersonate Company, a Company employee, another user, or any other person or entity.</li>
                    </ul>

                    <h2>4. Termination</h2>
                    <p>
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not to a breach of Terms.
                    </p>
                    <p>
                        If you wish to terminate your account, you may simply discontinue using the Service or use the account deletion feature in your settings.
                    </p>

                    <h2>5. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                    </p>

                     <h2>6. Contact Us</h2>
                    <p>
                        Please send your feedback, comments, requests for technical support by email: <strong>support@biztrendai.in</strong>.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
