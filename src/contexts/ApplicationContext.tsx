import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Application } from '../types/application';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { PostgrestError } from '@supabase/supabase-js';

// Define Application type based on Supabase table
// Omit conflicting/handled fields, including the old status
export interface SupabaseApplication extends Omit<Application, 'id' | 'appliedDate' | 'studentId' | 'internshipId' | 'status' | 'coverLetter' | 'resumeUrl'> {
  id: string; // UUID from Supabase
  student_id: string; // Foreign key
  internship_id: string; // Foreign key
  submitted_at?: string; // Supabase timestamp (replace appliedDate)
  status: 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'pending' | 'reviewing' | 'shortlisted'; // Match table CHECK constraint
  cover_letter?: string | null; // Added field
  resume_url?: string | null; // Added field
  company_notes?: string | null; // Added company_notes
  // Include related data fetched from joins
  profiles?: { // Re-Updated to reflect available profile fields
    full_name?: string | null;
    education?: Array<{ // Assuming education is JSONB array in profile
        school?: string | null;
        degree?: string | null;
        endYear?: string | number | null; 
        // Add other education fields if they exist in the JSONB
    }> | null;
    portfolio?: string | null; // Use correct field name
    linkedin?: string | null; // Use correct field name
    github?: string | null; // Use correct field name
    bio?: string | null; // Added bio
    skills?: string[] | null; // Added skills (assuming array of strings)
  } | null; // Student profile info
  internships?: { title?: string | null, company_id?: string | null } | null; // Internship info
}

type ApplicationContextProps = {
  applications: SupabaseApplication[];
  loading: boolean;
  error: PostgrestError | null;
  fetchApplications: () => Promise<void>; // Function to explicitly refetch based on role
  applyToInternship: (internshipId: string, applicationData: { cover_letter?: string, resume_url?: string }) => Promise<PostgrestError | null>; // Updated signature
  updateApplicationStatus: (applicationId: string, status: SupabaseApplication['status']) => Promise<PostgrestError | null>; // Company updates status
  deleteApplication: (applicationId: string) => Promise<PostgrestError | null>; // Student deletes own application
  // getApplicationById: (id: string) => SupabaseApplication | undefined; // Can be derived from state if needed
};

const ApplicationContext = createContext<ApplicationContextProps | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<SupabaseApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { user } = useAuth(); // Only get user from useAuth
  const { profile } = useProfile(); // Get profile from useProfile

  const fetchApplications = useCallback(async () => {
    // Use profile?.role for checks
    if (!user || !profile) { 
      setApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Re-Updated select query to fetch more profile details including education JSONB
      let query = supabase.from('applications').select(`
        id, 
        student_id,
        internship_id,
        submitted_at,
        status,
        cover_letter,
        resume_url,
        company_notes,
        profiles ( 
          full_name, 
          bio, 
          skills, 
          portfolio, 
          linkedin, 
          github,
          education  
        ), 
        internships ( title, company_id )
      `);

      // Filter based on profile.role
      if (profile.role === 'student') { 
        // Student ID likely matches auth user ID, but using profile.id is safer if they could differ
        query = query.eq('student_id', profile.id); 
      } else if (profile.role === 'company') {
        // *** FIX: Use profile.id for company ID check ***
        query = query.eq('internships.company_id', profile.id); 
      } else {
        console.warn("Unknown user role:", profile.role);
        setApplications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) {
         console.error("Supabase query error fetching applications:", error); 
         throw error;
      }
      
      setApplications(data as SupabaseApplication[] || []);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err as PostgrestError);
      setApplications([]);
    } finally {
      setLoading(false);
    }
    // Depend on profile as well as user
  }, [user, profile]); 

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // const getApplicationById = (id: string): SupabaseApplication | undefined => {
  //   return applications.find(application => application.id === id);
  // };

  const applyToInternship = async (internshipId: string, applicationData: { cover_letter?: string, resume_url?: string }): Promise<PostgrestError | null> => {
    // Use profile.role for check
    if (!user || !profile || profile.role !== 'student') { 
      console.error("User must be a logged-in student to apply.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }

    setLoading(true); // Indicate activity
    setError(null);
    try {
       // Check for duplicate application client-side (DB constraint also exists)
       const existing = applications.find(app => app.internship_id === internshipId && app.student_id === user.id);
       if (existing) {
         console.warn("Student has already applied to this internship.");
         return { message: "Already applied", details: "", hint: "", code: "409" } as PostgrestError; // 409 Conflict
       }

      const { error } = await supabase
        .from('applications')
        .insert([{ 
            student_id: user.id, 
            internship_id: internshipId,
            status: 'submitted', // Default status
            cover_letter: applicationData.cover_letter, // Add cover letter
            resume_url: applicationData.resume_url // Add resume URL
        }]);

      if (error) throw error;
      
      await fetchApplications(); // Refetch after applying
      return null;
    } catch (err: any) {
      console.error("Error applying to internship:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: SupabaseApplication['status']): Promise<PostgrestError | null> => {
     // Use profile.role for check
    if (!user || !profile || profile.role !== 'company') { 
      console.error("User must be a logged-in company to update status.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
      return null;
    } catch (err: any) {
      console.error("Error updating application status:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId: string): Promise<PostgrestError | null> => {
     // Use profile.role for check
    if (!user || !profile || profile.role !== 'student') { 
      console.error("User must be a logged-in student to delete application.");
      return { message: "Unauthorized", details: "", hint: "", code: "401" } as PostgrestError;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)
        .eq('student_id', user.id); // Ensure student deletes their own (RLS should also enforce this)

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      return null;
    } catch (err: any) {
      console.error("Error deleting application:", err);
      setError(err as PostgrestError);
      return err as PostgrestError;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      loading,
      error,
      fetchApplications,
      applyToInternship,
      updateApplicationStatus,
      deleteApplication,
      // getApplicationById, // Removed for now
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
