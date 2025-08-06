
"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
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
                    <h1>Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: {lastUpdated || '...'}</p>
                    
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to BizTrend AI. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@biztrendai.in.
                    </p>
                    <p>
                        When you visit our website biztrendai.in and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it. We hope you take some time to read through it carefully, as it is important.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, when you participate in activities on the Services or otherwise when you contact us.</p>
                    <p>The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
                    <ul>
                        <li><strong>Personal Information Provided by You.</strong> We collect names; email addresses; passwords; contact preferences; and other similar information.</li>
                        <li><strong>Data Uploaded by You.</strong> We process the data you upload to our platform (e.g., CSV, JSON files) to provide our services. We do not own your data. We treat it as confidential and do not share it with third parties, except as required to provide the service or as required by law.</li>
                    </ul>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We use the information we collect or receive:</p>
                    <ul>
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send administrative information to you.</li>
                        <li>To protect our Services.</li>
                        <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
                        <li>To respond to legal requests and prevent harm.</li>
                    </ul>
                    
                    <h2>4. Will Your Information Be Shared With Anyone?</h2>
                    <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information or your uploaded data.</p>
                    
                    <h2>5. How Do We Keep Your Information Safe?</h2>
                    <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</p>

                    <h2>6. Contact Us</h2>
                    <p>If you have questions or comments about this policy, you may email us at <strong>support@biztrendai.in</strong>.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
