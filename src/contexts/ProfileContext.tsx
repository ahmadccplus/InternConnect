import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext'; // Depend on AuthContext for user ID
import { PostgrestError } from '@supabase/supabase-js';

// Define the shape of the profile data based on the Supabase 'profiles' table
export interface SupabaseProfile {
  id: string; // UUID, Foreign Key to auth.users.id
  role: 'student' | 'company';
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;

  // Common / Both
  location?: string | null;
  linkedin?: string | null; // Changed case to match DB column

  // Student Specific
  full_name?: string | null; // Changed from firstName/lastName structure
  university?: string | null;
  major?: string | null;
  graduation_year?: number | null; // Changed name and type
  skills?: string[] | null; // Array of strings
  bio?: string | null;
  github?: string | null;
  portfolio?: string | null;

  // Add education field (array of objects)
  education?: { 
    id: string;
    school: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    description?: string | null;
    gpa?: string | null;
  }[] | null;

  // Add experience field (array of objects)
  experience?: { 
    id: string;
    title: string;
    company: string;
    location?: string | null;
    startDate: string; // Consider using date type if storing full dates
    endDate: string;   // Consider using date type if storing full dates
    description?: string | null;
  }[] | null;

  // Add documents field (array of metadata objects)
  documents?: {
    id: string;         // Unique ID for this metadata entry
    name: string;       // User-defined name (e.g., "My Resume")
    storagePath: string; // Path in Supabase Storage (e.g., "uuid/resume.pdf")
    fileType: string;   // Category (e.g., "resume", "cover_letter", "transcript")
    uploadedAt: string; // ISO timestamp string
  }[] | null;

  // Company Specific
  company_name?: string | null; // Changed from companyName
  industry?: string | null;
  company_size?: string | null; // Changed from companySize
  founded_year?: number | null; // Changed name and type
  long_description?: string | null; // Changed from longDescription
  twitter?: string | null;
}

type ProfileContextProps = {
  profile: SupabaseProfile | null;
  loading: boolean;
  error: PostgrestError | null;
  fetchProfile: () => Promise<void>;
  // Update function takes partial profile data matching Supabase column names
  updateProfile: (profileData: Partial<Omit<SupabaseProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>) => Promise<{ error: PostgrestError | null }>;
};

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get the authenticated user
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return; // No user, no profile to fetch
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all columns
        .eq('id', user.id)
        .single(); // Expect only one profile per user ID

      if (error && error.code !== 'PGRST116') { // PGRST116: row not found, ok if profile not created yet
        throw error;
      }

      setProfile(data as SupabaseProfile || null); // Set profile or null if not found

    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err as PostgrestError);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency on user object

  // Fetch profile when user logs in or changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile function
  const updateProfile = async (profileData: Partial<Omit<SupabaseProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>) => {
    if (!user || !profile) {
      console.error("User or profile not available for update.");
      return { error: { message: "User or profile not available", details: "", hint: "", code: "401" } as PostgrestError };
    }

    setLoading(true); // Indicate loading during update
    setError(null);
    try {
       const dataToUpdate = {
         ...profileData,
         updated_at: new Date().toISOString(), // Manually set updated_at timestamp
         // id and role are not updated here, they are set on creation/auth
       };
      
      const { error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id); // Ensure update targets the correct user

      if (error) throw error;

      // Refetch profile after successful update to get the latest data
      await fetchProfile(); 
      return { error: null };

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err as PostgrestError); // Set context error state
      return { error: err as PostgrestError };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      error,
      fetchProfile,
      updateProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the ProfileContext
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}; 