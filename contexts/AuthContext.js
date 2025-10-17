'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userService } from '../lib/firebaseService';

// Admin email allowlist - hardcoded admin accounts
const ADMIN_EMAILS = [
  'uiuvccup@gmail.com'
];

// Check if email is in admin allowlist
const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function - handles both admin (Firebase Auth) and team owners (Firestore)
  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login for:', email);
      
      // Check if it's admin login (Firebase Auth)
      if (email === 'uiuvccup@gmail.com') {
        console.log('👑 AuthContext: Admin login via Firebase Auth');
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ AuthContext: Firebase admin login successful');
        return result;
      } else {
        // Team owner login - check Firestore database
        console.log('👤 AuthContext: Team owner login via Firestore');
        const userData = await userService.loginTeamOwner(email, password);
        
        if (userData) {
          // Set team owner data manually (no Firebase Auth)
          setCurrentUser({ email: userData.email, uid: userData.uid });
          setUserRole(userData.role);
          setUserTeam(userData.teamName);
          setLoading(false);
          
          console.log('✅ AuthContext: Team owner login successful', {
            email: userData.email,
            team: userData.teamName
          });
          
          return { user: { email: userData.email, uid: userData.uid } };
        } else {
          throw new Error('Invalid team owner credentials');
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      throw error;
    }
  };

  // Logout function - handles both admin and team owners
  function logout() {
    // Clear team owner state if it's a team owner
    if (userRole === 'team_owner') {
      setCurrentUser(null);
      setUserRole(null);
      setUserTeam(null);
      return Promise.resolve();
    } else {
      // Admin logout via Firebase Auth
      return signOut(auth);
    }
  }

  useEffect(() => {
    console.log('🔧 AuthContext: Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AuthContext: Auth state changed', {
        user: user ? { uid: user.uid, email: user.email } : null,
        timestamp: new Date().toISOString()
      });
      
      if (user) {
        console.log('👤 AuthContext: Firebase Auth user found (Admin only)');
        setCurrentUser(user);
        
        // Only admin should be in Firebase Auth
        if (user.email === 'uiuvccup@gmail.com') {
          console.log('👑 AuthContext: Admin detected:', user.email);
          setUserRole('admin');
          setUserTeam(null);
          setLoading(false);
          console.log('🏁 AuthContext: Admin loading complete');
        } else {
          console.log('❌ AuthContext: Unknown Firebase Auth user:', user.email);
          setUserRole(null);
          setUserTeam(null);
          setLoading(false);
        }
      } else {
        console.log('🚫 AuthContext: No user, clearing all state');
        setCurrentUser(null);
        setUserRole(null);
        setUserTeam(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userTeam,
    loading,
    isAdmin: userRole === 'admin',
    isTeamOwner: userRole === 'team_owner',
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}