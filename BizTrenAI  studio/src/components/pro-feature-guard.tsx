
"use client";

import { useAuth } from "@/contexts/auth-context";
import { UpgradeProCard } from "./upgrade-pro-card";

// This should be your admin email
const ADMIN_EMAIL = 'yadavdhairya.2003@gmail.com';

interface ProFeatureGuardProps {
    children: React.ReactNode;
}

export function ProFeatureGuard({ children }: ProFeatureGuardProps) {
    const { user } = useAuth();
    
    // Grant access if user is the admin
    if (user?.email === ADMIN_EMAIL) {
        return <>{children}</>;
    }

    // Grant access if user is on a Pro or Business plan
    if (user?.plan === 'Pro' || user?.plan === 'Business') {
        return <>{children}</>;
    }
    
    // Otherwise, show the upgrade prompt
    return <UpgradeProCard />;
}

    