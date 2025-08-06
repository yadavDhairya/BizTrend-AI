
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    User as FirebaseUser, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';


export type Plan = "Free" | "Pro" | "Business";

interface User {
  uid: string;
  email: string | null;
  plan: Plan;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FOUNDER_EMAIL = "yadavdhairya.2003@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // In a real app, you would fetch the user's plan from your database (e.g., Firestore).
        // For this prototype, we retrieve from local storage or default to 'Free'.
        // The founder always gets the Business plan.
        const plan = firebaseUser.email === FOUNDER_EMAIL 
          ? 'Business' 
          : localStorage.getItem(`biztrend-plan-${firebaseUser.uid}`) as Plan || 'Free';
        
        const currentUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          plan: plan,
        };
        setUser(currentUser);
        localStorage.setItem(`biztrend-plan-${firebaseUser.uid}`, plan);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // New signups start on the Free plan, which includes a Pro trial.
      const newUser: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        plan: 'Free'
      };
      localStorage.setItem(`biztrend-plan-${newUser.uid}`, 'Free');
      setUser(newUser);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Sign Up Error", description: error.message });
        throw error;
    }
  };

  const login = async (email: string, password: string) => {
     try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Login Error", description: error.message });
        throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // Check if the user is new to set the free plan
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        if (isNewUser && result.user.email !== FOUNDER_EMAIL) {
            const newUser: User = {
                uid: result.user.uid,
                email: result.user.email,
                plan: 'Free'
            };
            localStorage.setItem(`biztrend-plan-${newUser.uid}`, 'Free');
            setUser(newUser);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Google Sign-In Error", description: error.message });
        throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);
  
    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    return <>{children}</>;
}

    