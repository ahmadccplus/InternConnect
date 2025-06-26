import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Internship } from '../types/internship';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { useAuth } from './AuthContext'; // Keep for user.id
import { useProfile } from './ProfileContext'; // Import useProfile for role check
import { PostgrestError } from '@supabase/supabase-js';

// Adjust Internship type if necessary (e.g., id is string/UUID)
// Ensure it includes company_id if not already present
// Omit fields from original type that are handled differently or don't exist in DB *unless added back*
export interface SupabaseInternship extends Omit<Internship, 'id' | 'company' | 'category' | 'skills' | 'stipend' | 'requirements' | 'posted' | 'compensation'> { 
  id: string; // Supabase typically uses string UUIDs
  company_id: string; // Assuming internships are linked to companies
  company?: string; // Fetched company name (optional)
  category?: string; // Added category field (optional)
  skills?: string[]; // Added skills field (optional)
  stipend?: string | number; // Define stipend independently (optional)
  requirements?: string; // Define requirements independently (optional)
  created_at?: string; // Supabase adds timestamps
  // Add other fields fetched from Supabase / Add back fields with columns
  deadline?: string; // RENAMED back to match actual DB column 'deadline'
  companywebsite?: string; // Column exists
  start_date?: string; // Column added 
  duration?: string; // Column added
  companylogo?: string; // RENAME to lowercase to match DB column
}

type InternshipContextProps = {
  internships: SupabaseInternship[];
  loading: boolean;
  error: PostgrestError | null;
  fetchInternships: () => Promise<void>; // Function to explicitly refetch all
  fetchInternshipById: (id: string) => Promise<SupabaseInternship | null>; // Function to fetch single
  addInternship: (internship: Omit<SupabaseInternship, 'id' | 'company_id' | 'created_at' | 'company' | 'posted'>) => Promise<PostgrestError | null>;
  updateInternship: (id: string, internship: Partial<Omit<SupabaseInternship, 'id' | 'company_id' | 'created_at' | 'company' | 'posted'>>) => Promise<PostgrestError | null>;
  deleteInternship: (id: string) => Promise<PostgrestError | null>;
  getInternshipById: (id: string) => SupabaseInternship | undefined;
};

const InternshipContext = createContext<InternshipContextProps | undefined>(undefined);

export const InternshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [internships, setInternships] = useState<SupabaseInternship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { user } = useAuth(); // Only get user from useAuth
  const { profile } = useProfile(); // Get profile from useProfile

  // Define the select query string centrally
  const internshipSelectQuery = `
    *,
    created_at, 
    skills, 
    category,
    stipend,
    deadline,
    requirements,
    companywebsite,
    company:profiles ( company_name )
  `;

  // Function to format fetched data
  const formatFetchedInternship = (item: any): SupabaseInternship => {
    return {
      ...item,
      company: item.company?.company_name,
      // Ensure other fields match SupabaseInternship type if needed
    } as SupabaseInternship; // Add type assertion
  };

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(internshipSelectQuery); 

      if (error) throw error;
      
      const formattedData = data?.map(formatFetchedInternship) || [];
      setInternships(formattedData);
    } catch (err: any) {
      console.error("Error fetching internships:", err);
      setError(err as PostgrestError);
      setInternships([]); // Clear internships on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const getInternshipById = (id: string): SupabaseInternship | undefined => {
    return internships.find(internship => internship.id === id);
  };

  // Function to fetch a single internship by ID
  const fetchInternshipById = async (id: string): Promise<SupabaseInternship | null> => {
    // Don't set global loading/error for single fetches unless desired
    // setLoading(true); 
    // setError(null);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(internshipSelectQuery)
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() to return null if not found

      if (error) throw error;

      if (data) {
        const formattedData = formatFetchedInternship(data);
        // Optionally update the main internships array if the fetched one isn't there or is different
        setInternships(prev => {
          const index = prev.findIndex(item => item.id === id);
          if (index !== -1) {
            // Update existing
            const updated = [...prev];
            updated[index] = formattedData;
            return updated;
          } else {
            // Add new
            return [...prev, formattedData];
          }
        });
        return formattedData;
      }
      return null;
    } catch (err: any) {
      console.error(`Error fetching internship ${id}:`, err);
      // setError(err as PostgrestError); // Optionally set global error
      return null;
    }
    // finally {
    //   setLoading(false); // Only if global loading was set
    // }
  };

  const addInternship = async (internshipData: Omit<SupabaseInternship, 'id' | 'company_id' | 'created_at' | 'company' | 'posted'>): Promise<PostgrestError | null> => {
    // Ensure user is logged in and is a company
    if (!user || !profile || profile.role !== 'company') {
      console.error("User must be a logged-in company to add internships.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('internships')
        .insert([{ 
            ...internshipData, 
            company_id: user.id // Set company_id from the logged-in user
        }])
        .select('id, company_id');

      if (error) throw error;
      
      await fetchInternships(); // Refetch after adding
      return null;
    } catch (err: any) {
      console.error("Error adding internship:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  const updateInternship = async (id: string, internshipUpdates: Partial<Omit<SupabaseInternship, 'id' | 'company_id' | 'created_at' | 'company' | 'posted'>>): Promise<PostgrestError | null> => {
     if (!user || !profile || profile.role !== 'company') {
      console.error("User must be a logged-in company to update internships.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }
    
    setLoading(true);
    setError(null);
    try {
        // Ensure we don't try to update company_id or id
      const { error } = await supabase
        .from('internships')
        .update(internshipUpdates)
        .eq('id', id)
        .eq('company_id', user.id); // Ensure company can only update their own internships (RLS should also enforce this)

      if (error) throw error;

      await fetchInternships(); // Refetch after updating
      return null;
    } catch (err: any) {
      console.error("Error updating internship:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  const deleteInternship = async (id: string): Promise<PostgrestError | null> => {
    if (!user || !profile || profile.role !== 'company') {
      console.error("User must be a logged-in company to delete internships.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id)
        .eq('company_id', user.id); // Ensure company can only delete their own internships (RLS should also enforce this)

      if (error) throw error;

      await fetchInternships(); // Refetch after deleting
      // Alternative: Filter locally for faster UI update
      // setInternships(prev => prev.filter(internship => internship.id !== id));
      return null;
    } catch (err: any) {
      console.error("Error deleting internship:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternshipContext.Provider value={{
      internships,
      loading,
      error,
      fetchInternships,
      fetchInternshipById,
      addInternship,
      updateInternship,
      deleteInternship,
      getInternshipById,
    }}>
      {children}
    </InternshipContext.Provider>
  );
};

export const useInternships = () => {
  const context = useContext(InternshipContext);
  if (context === undefined) {
    throw new Error('useInternships must be used within an InternshipProvider');
  }
  return context;
};
