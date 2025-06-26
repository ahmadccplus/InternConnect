import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient'; // Import the initialized Supabase client
// Remove import of local Profile type if not needed anymore
// import { User as Profile } from '../types/user'; // Assuming your user type matches the profile table

// Define the profile type based on your 'profiles' table structure
// Example: You might need properties like 'id', 'role', 'full_name', 'company_name', etc.
// interface Profile {
//   id: string; // Usually matches SupabaseAuthUser id
//   role: 'student' | 'company';
//   full_name?: string;
//   company_name?: string;
//   // Add other profile fields here
// }

interface AuthContextType {
  // Use SupabaseAuthUser for authentication state
  session: Session | null; // Store the whole session for access to token etc.
  user: SupabaseAuthUser | null; // The authenticated user object from Supabase
  // Remove profile state and related functions
  // profile: Profile | null;
  login: (email: string, password: string) => Promise<{ error: Error | null }>; // Removed role, handled by profile
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // updateUserProfile: (profileData: Partial<Profile>) => Promise<{ error: Error | null }>;
  isLoading: boolean; // Loading state for initial auth check
  // getUserById is removed - fetch profile on login or as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log("AuthProvider Render - Simplified");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  // Remove profile state
  // const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simplified initial auth check (no profile fetching)
  useEffect(() => {
    let ignore = false; 
    console.log("AuthProvider Mounting - Running simplified checkAuth");

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log("AuthProvider checkAuth: Getting session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("AuthProvider checkAuth: Session received, user:", session?.user?.id, "Error:", sessionError);

        if (ignore) {
          console.log("AuthProvider checkAuth: Unmounted, ignoring result.");
          return;
        }

        if (sessionError) {
          console.error("AuthProvider checkAuth: Error getting initial session:", sessionError);
        }
        
        // Set session and user state
        setSession(session);
        setUser(session?.user ?? null);
        
      } catch (e) {
        console.error("AuthProvider checkAuth: Unexpected error during auth check:", e);
        // Ensure state is cleared on unexpected errors too
        if (!ignore) {
            setSession(null);
            setUser(null);
        }
      } finally {
         // Stop loading after session check is done
         if (!ignore) {
             console.log("AuthProvider checkAuth: Session check complete, setting isLoading=false.");
             setIsLoading(false);
         }
      }
    };

    checkAuth();

    console.log("AuthProvider: Subscribing to onAuthStateChange");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider onAuthStateChange: Event:", event, "Session:", session?.user?.id);
        if (ignore) {
          console.log("AuthProvider onAuthStateChange: Unmounted, ignoring event.");
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        // No longer fetches profile here - ProfileContext will handle it based on user change
        if (event === 'SIGNED_IN') {
          console.log("AuthProvider onAuthStateChange: SIGNED_IN event.");
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthProvider onAuthStateChange: SIGNED_OUT event.");
        } 
      }
    );

    return () => {
      console.log("AuthProvider: Unsubscribing from onAuthStateChange and setting ignore=true");
      ignore = true;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("AuthContext login: Attempting login for:", email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("AuthContext login: Supabase response - Error:", error);
    if(error) {
        console.error("Login error:", error);
    }
    return { error };
  };

  const logout = async () => {
    console.log("AuthContext logout: Attempting logout");
    const { error } = await supabase.auth.signOut();
    console.log("AuthContext logout: Supabase response - Error:", error);
    if (error) {
        console.error("Logout error:", error);
    }
  };

  // Provide the context value
  return (
    <AuthContext.Provider value={{
      session,
      user,
      // remove profile
      login,
      logout,
      isAuthenticated: !!user,
      // remove updateUserProfile
      isLoading, 
    }}>
      {/* Render children only when the initial auth check is complete */}
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
