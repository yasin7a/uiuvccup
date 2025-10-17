'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userService } from '../lib/firebaseService';

// Admin email allowlist - add admin emails here
const ADMIN_EMAILS = [
  'uiuvccup@gmail.com',
  // Add more admin emails here as needed
  // 'another-admin@example.com',
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

  // Login function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    console.log('🔧 AuthContext: Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AuthContext: Auth state changed', {
        user: user ? { uid: user.uid, email: user.email } : null,
        timestamp: new Date().toISOString()
      });
      
      setCurrentUser(user);
      
      if (user) {
        // Keep loading true while fetching user data
        setLoading(true);
        
        // Check if user is admin by email allowlist
        if (isAdminEmail(user.email)) {
          console.log('👑 AuthContext: Admin email detected:', user.email);
          setUserRole('admin');
          setUserTeam(null);
          setLoading(false);
          console.log('🏁 AuthContext: Admin loading complete');
          return;
        }
        
        try {
          console.log('👤 AuthContext: Fetching user data for team owner:', user.uid);
          // Fetch user role and team info for team owners
          const userData = await userService.getByUid(user.uid);
          console.log('📊 AuthContext: User data received', userData);
          
          if (userData && userData.role === 'team_owner') {
            setUserRole(userData.role);
            setUserTeam(userData.teamName);
            console.log('✅ AuthContext: Team owner role set, Team:', userData.teamName);
          } else {
            // Not admin and no team owner data - unauthorized user
            console.log('❌ AuthContext: Unauthorized user - not admin and no team owner data');
            setUserRole(null);
            setUserTeam(null);
          }
          
          // Only set loading false after role is determined
          setLoading(false);
          console.log('🏁 AuthContext: Loading complete', {
            hasUser: !!user,
            role: userData?.role || null,
            loading: false
          });
        } catch (error) {
          console.error('❌ AuthContext: Error fetching user data:', error);
          setUserRole(null);
          setUserTeam(null);
          setLoading(false);
        }
      } else {
        console.log('🚫 AuthContext: No user, clearing role and team');
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