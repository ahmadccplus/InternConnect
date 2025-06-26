
export interface Application {
  id: number; // Will be a max 5-digit number
  internshipId: number;
  studentId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
  appliedDate: string;
  coverLetter: string;
  resume?: string; // Base64 encoded resume/CV file
  resumeFileName?: string; // Original file name of the uploaded resume
  notes?: string; // Company's internal notes about the application
}
