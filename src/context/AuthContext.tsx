import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface User {
  id: string;
  email: string;
  displayName: string;
  balance: number;
  kycCompleted: boolean;
  stripeAccountId?: string;
  accountType?: 'adult' | 'teen';
  accountStatus?: 'pending' | 'active' | 'restricted';
  guardianUid?: string;
  birthDate?: string;
  isAdmin?: boolean;
  cardFrozen?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
  completeKYC: () => Promise<void>;
  updateKYCStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ["spoinkosgithub@gmail.com", "blooper.it@gmail.com"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loginAdmin = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to bridge admin session:', error);
    }
  };

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect login error:', error);
    });

    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        if (ADMIN_EMAILS.includes(firebaseUser.email || '')) {
          loginAdmin();
        } else {
          setIsAdmin(false);
        }

        console.log('Auth state changed: User logged in', firebaseUser.uid);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Initial check to ensure profile exists
        try {
          const initialSnap = await getDoc(userDocRef);
          if (!initialSnap.exists()) {
            console.log('User profile does not exist, creating...');
            await createUserProfile(firebaseUser);
          }
        } catch (err: any) {
          console.warn('Initial profile check/creation failed, might be rule propagation. Continuing to snapshot...', err.message);
        }

        // Listen for real-time updates to the user profile
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          console.log(`Snapshot triggered for ${firebaseUser.uid}, exists: ${docSnap.exists()}`);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('User document data found:', data);
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: data.displayName || firebaseUser.displayName || 'User',
              balance: data.balance || 0,
              kycCompleted: data.kycCompleted || false,
              stripeAccountId: data.stripeAccountId,
              financialAccountId: data.financialAccountId,
              leaf: data.leaf,
              photoURL: data.photoURL || firebaseUser.photoURL || undefined,
              cardFrozen: data.cardFrozen || false,
              accountStatus: data.accountStatus || 'pending',
              accountType: data.accountType || 'lite',
              birthDate: data.birthDate,
              guardianUid: data.guardianUid,
              isAdmin: ADMIN_EMAILS.includes(firebaseUser.email || '')
            });
            setLoading(false);
          } else {
            console.log('User document missing, initiating creation...');
            createUserProfile(firebaseUser).catch((err) => {
              console.error('Failed to create profile from snapshot:', err);
              setLoading(false);
            });
          }
        }, (error) => {
          console.error('Firestore Snapshot Error:', error.code, error.message);
          
          if (error.code === 'permission-denied') {
            console.log('Permission denied on profile. Retrying creation after 1s...');
            setTimeout(() => {
              createUserProfile(firebaseUser).catch(e => console.error('Delayed creation failed:', e));
            }, 1000);
          }
          
          setLoading(false);
        });
      } else {
        console.log('Auth state changed: No user');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const createUserProfile = async (fUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', fUser.uid);
    const isUserAdmin = ADMIN_EMAILS.includes(fUser.email || '');
    try {
      await setDoc(userDocRef, {
        uid: fUser.uid,
        email: fUser.email || '',
        displayName: fUser.displayName || 'User',
        balance: 0,
        kycCompleted: isUserAdmin,
        accountStatus: isUserAdmin ? 'active' : 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('User profile set successfully');
    } catch (error) {
      console.error('Error in setDoc during profile creation:', error);
      handleFirestoreError(error, OperationType.WRITE, `/users/${fUser.uid}`);
    }
  };

  const refreshBalance = async () => {
    if (user && user.stripeAccountId) {
      try {
        const { fetchBalance } = await import('../services/stripeService');
        const balanceData = await fetchBalance();
        
        let total = 0;
        
        if (balanceData.treasuryBalance !== undefined) {
          total = parseFloat(balanceData.treasuryBalance);
        } else if (balanceData.available?.[0]?.amount !== undefined) {
          total = balanceData.available[0].amount / 100;
        }
        
        if (total !== user.balance) {
          const userDocRef = doc(db, 'users', user.id);
          await updateDoc(userDocRef, { 
            balance: total,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Always use redirect for full-page compatibility
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const completeKYC = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, { 
          kycCompleted: true,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `/users/${user.id}`);
      }
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, { 
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `/users/${user.id}`);
      }
    }
  };

  const updateKYCStatus = async () => {
    if (user && user.stripeAccountId) {
      try {
        const response = await fetch('/api/account-status', {
          headers: {
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.kycCompleted !== user.kycCompleted) {
            // Firestore listener will pick up the change
          }
        }
      } catch (error) {
        console.error('Failed to update KYC status:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, updateBalance, completeKYC, refreshBalance, updateKYCStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
