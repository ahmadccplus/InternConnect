import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, SupabaseProfile } from '@/contexts/ProfileContext';
import { useInternships, SupabaseInternship } from '@/contexts/InternshipContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { supabase } from "@/supabaseClient";
import { SendIcon, BriefcaseIcon, FileTextIcon, AlertCircleIcon, Loader2, CheckCircleIcon, UserIcon, MailIcon, BookOpenIcon, GraduationCapIcon, AwardIcon, GithubIcon, InfoIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

// Corrected profile.documents structure assumption
interface ProfileDocument {
  id: string; // Assuming there's an ID
  name: string;
  storagePath: string; // Use the correct field name
  fileType: string; // Assuming this exists for filtering
  uploadedAt: string; // Added based on linter error
  // Add other relevant fields if they exist
}

const ApplyInternship = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useProfile();
  const { getInternshipById, fetchInternshipById } = useInternships();
  const { applications, applyToInternship } = useApplications();
  
  const [internship, setInternship] = useState<SupabaseInternship | null | undefined>(undefined);
  const [loadingInternship, setLoadingInternship] = useState(true);
  const [coverLetter, setCoverLetter] = useState<string>('');
  
  // Resume state
  const [resumeOption, setResumeOption] = useState<'upload' | 'select'>('upload');
  const [selectedDocument, setSelectedDocument] = useState<ProfileDocument | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);

  // Extract potential resumes from profile
  const profileResumes = React.useMemo(() => {
      if (profile && Array.isArray(profile.documents)) {
          // Filter based on name or potentially fileType if available
          return profile.documents.filter((doc): doc is ProfileDocument => 
              !!doc && 
              typeof doc.name === 'string' && 
              typeof doc.storagePath === 'string' &&
              typeof doc.fileType === 'string' && // Also check fileType exists
              typeof doc.uploadedAt === 'string' && // And uploadedAt
              (doc.name.toLowerCase().includes('resume') || 
               doc.name.toLowerCase().includes('cv') ||
               doc.fileType?.includes('pdf') || 
               doc.fileType?.includes('word')) 
          );
      }
      return [];
  }, [profile]);

  useEffect(() => {
    // Default to selecting the first available resume if any exist
    if (profileResumes.length > 0 && resumeOption !== 'upload') {
      setResumeOption('select');
      // Pre-select the first resume? Or require explicit selection? Let's require explicit selection for now.
      // setSelectedDocument(profileResumes[0]); 
    } else {
      setResumeOption('upload');
      setSelectedDocument(null);
    }
  }, [profileResumes]); // Rerun when resumes load

  useEffect(() => {
    if (!id) {
      console.error("No internship ID found in URL");
      toast({ title: "Error", description: "Internship ID is missing.", variant: "destructive" });
      setInternship(null);
      setLoadingInternship(false);
      return;
    }

    setLoadingInternship(true);
    const cachedInternship = getInternshipById(id);
    if (cachedInternship) {
      setInternship(cachedInternship);
      setLoadingInternship(false);
    } else {
      fetchInternshipById(id)
        .then(fetchedInternship => setInternship(fetchedInternship))
        .catch(error => {
          console.error("Error fetching internship details for apply page:", error);
          toast({ title: "Error", description: "Could not load internship details.", variant: "destructive" });
          setInternship(null);
        })
        .finally(() => setLoadingInternship(false));
    }
  }, [id, getInternshipById, fetchInternshipById, toast]);

  useEffect(() => {
    if (!loadingProfile && (!user || profile?.role !== 'student')) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as a student to apply for internships.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (id && user && profile?.role === 'student' && applications.length > 0) {
      const applied = applications.some(app => app.internship_id === id && app.student_id === user.id);
      if (applied) {
        toast({
          title: "Already Applied",
          description: "You have already submitted an application for this internship.",
        });
        setAlreadyApplied(true);
      } else {
        setAlreadyApplied(false);
      }
    }
  }, [id, user, profile, loadingProfile, applications, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
        setResumeFile(null);
        setResumeFileName('');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Resume file must be less than 5MB",
        variant: "destructive"
      });
      setResumeFile(null);
      setResumeFileName('');
      return;
    }

    const fileType = file.type;
    if (
      fileType !== 'application/pdf' && 
      fileType !== 'application/msword' && 
      fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      });
      setResumeFile(null);
      setResumeFileName('');
      return;
    }

    setResumeFileName(file.name);
    setResumeFile(file);
    setSelectedDocument(null); // Clear selected document if a new file is chosen
    setResumeOption('upload'); // Switch mode if needed
  };

  const handleSelectDocument = (selectedStoragePath: string) => {
    const selectedDoc = profileResumes.find(doc => doc.storagePath === selectedStoragePath);
    if (selectedDoc) {
      setSelectedDocument(selectedDoc);
      setResumeFile(null); // Clear any staged file upload
      setResumeFileName('');
      setResumeOption('select');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isResumeReady = (resumeOption === 'select' && selectedDocument) || (resumeOption === 'upload' && resumeFile);

    if (!user || !profile || !id || !internship || isSubmitting || alreadyApplied || !isResumeReady) {
         toast({
            title: "Missing Information",
            description: "Please select or upload a resume to submit the application.",
            variant: "destructive"
         });
         return;
    }

    setIsSubmitting(true);
    let finalResumeUrl = '';

    try {
        if (resumeOption === 'upload' && resumeFile) {
            // --- Upload new resume ---
            const filePath = `${user.id}/${Date.now()}_${resumeFile.name}`; // Add timestamp to avoid overwrites
            console.log(`Uploading new resume to: ${filePath}`);

            const { error: uploadError } = await supabase.storage
                .from('resumes') // Ensure this matches your bucket name
                .upload(filePath, resumeFile, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                console.error("Error uploading resume:", uploadError);
                toast({ title: "Upload Failed", description: `Could not upload resume: ${uploadError.message}`, variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            // getPublicUrl is synchronous, just constructs the URL
            const { data: uploadUrlData } = supabase.storage 
                .from('resumes')
                .getPublicUrl(filePath);
                
            // Check if the URL was constructed successfully
            if (!uploadUrlData?.publicUrl) {
                 console.error("Error constructing public URL for resume after upload"); // Adjusted log
                toast({ title: "Upload Failed", description: "Could not construct resume URL after upload.", variant: "destructive" }); // Adjusted toast
                setIsSubmitting(false);
                // No need to remove file here, as URL construction failure is unlikely if upload succeeded
                // and doesn't mean the file doesn't exist. Let's simplify.
                return;
            }
            finalResumeUrl = uploadUrlData.publicUrl;
            console.log("New resume uploaded, URL:", finalResumeUrl);

        } else if (resumeOption === 'select' && selectedDocument) {
             // --- Use existing resume: Get URL on submit ---
             console.log(`Getting public URL for existing resume: ${selectedDocument.storagePath}`);
             // getPublicUrl is synchronous
             const { data: selectUrlData } = supabase.storage 
                .from('resumes') // Use the correct bucket 
                .getPublicUrl(selectedDocument.storagePath);

              // Check if the URL was constructed successfully
              if (!selectUrlData?.publicUrl) {
                console.error("Error constructing public URL for selected resume");
                toast({ title: "Submission Error", description: `Could not construct the URL for the selected resume.`, variant: "destructive" });
                setIsSubmitting(false);
                return;
             }
             
             finalResumeUrl = selectUrlData.publicUrl; // Assign from data object
             console.log(`Using existing resume: ${selectedDocument.name}, URL: ${finalResumeUrl}`);

        } else {
            // Should be caught by initial validation, but good to double-check
            toast({ title: "Submission Error", description: "No resume selected or uploaded.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

      // --- Submit application data ---
      const resultError = await applyToInternship(id, { 
        cover_letter: coverLetter,
        resume_url: finalResumeUrl // Use the determined URL
      });

      if (resultError) {
        toast({ title: "Submission Failed", description: resultError.message || "Could not submit application.", variant: "destructive" });
         // If upload succeeded but DB insert failed, consider if the uploaded file should be removed.
         // This depends on whether you want to keep uploads even if the application fails.
         // Example cleanup (if needed):
         // if (resumeOption === 'upload' && finalResumeUrl) {
         //    const pathToRemove = finalResumeUrl.substring(finalResumeUrl.indexOf(user.id)); // Extract path from URL
         //    await supabase.storage.from('resumes').remove([pathToRemove]);
         // }
      } else {
        toast({
          title: "Application Submitted!",
          description: "Your application has been successfully submitted.",
        });
        navigate('/student-applications');
      }
    } catch (error: any) {
      console.error("Error during application submission process:", error);
      toast({ title: "Submission Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInternship || loadingProfile) {
    return (
      <div className="page-container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }

  if (!internship || !profile) {
    return (
      <div className="page-container py-12">
        <Card className="max-w-4xl mx-auto p-6 text-center">
          <CardHeader>
            <CardTitle>{!internship ? "Internship Not Found" : "Profile Not Loaded"}</CardTitle>
            <CardDescription>
              {!internship 
                ? "The internship you are trying to apply for could not be loaded." 
                : "Your profile information could not be loaded. Please try again later or contact support."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={!internship ? "/internships" : "/student-profile"}> 
              <Button className="bg-intern-medium hover:bg-intern-dark">
                {!internship ? "Back to Listings" : "Go to Profile"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if resume is ready for submission button state
  const isResumeReadyForSubmit = (resumeOption === 'select' && selectedDocument) || (resumeOption === 'upload' && resumeFile);

  return (
    <div className="page-container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Apply for Internship</CardTitle>
          <CardDescription>
            You're applying for the <span className="font-semibold">{internship.title}</span> position at <span className="font-semibold">{internship.company || 'N/A'}</span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting || alreadyApplied}>
            <CardContent className="space-y-6">
            
              {/* --- Display Student Profile Information --- */}
               <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                 <h3 className="font-medium flex items-center mb-3 text-lg text-gray-800">
                   <UserIcon className="h-5 w-5 mr-2 text-intern-dark" />
                   Your Profile Information
                 </h3>
                 
                 {/* Basic Info Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                   <p><strong className="font-medium text-gray-900">Name:</strong> {profile.full_name || 'Not Provided'}</p>
                   <p><strong className="font-medium text-gray-900">Email:</strong> {user?.email || 'Not Available'}</p> 
                   {/* Latest Education Entry */}
                   {profile.education && profile.education.length > 0 && (
                     <>
                       <p><strong className="font-medium text-gray-900">Latest Education:</strong></p>
                       <div className="pl-4 border-l border-gray-300 ml-1">
                         <p><BookOpenIcon className="h-4 w-4 inline mr-1 text-gray-500" /> {profile.education[0].degree || 'N/A'} at {profile.education[0].school || 'N/A'}</p>
                         <p><GraduationCapIcon className="h-4 w-4 inline mr-1 text-gray-500" /> Graduating: {profile.education[0].endYear || 'N/A'}</p>
                       </div>
                     </>
                   )}
                   {/* Links */}
                   <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2"> 
                     {profile.portfolio && <p><strong className="font-medium text-gray-900">Portfolio:</strong> <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">View</a></p>}
                     {profile.linkedin && <p><strong className="font-medium text-gray-900">LinkedIn:</strong> <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">View</a></p>}
                     {profile.github && <p><strong className="font-medium text-gray-900">GitHub:</strong> <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">View</a></p>}
                   </div>
                 </div>
                 
                 {/* Bio Section */}
                 {profile.bio && (
                    <div className="pt-2">
                        <h4 className="font-medium text-gray-900 flex items-center text-sm mb-1">
                            <InfoIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                            Bio/Summary
                        </h4>
                        <p className="text-sm text-gray-700 pl-5 leading-relaxed">{profile.bio}</p>
                    </div>
                 )}

                 {/* Skills Section */}
                 {profile.skills && profile.skills.length > 0 && (
                    <div className="pt-2">
                        <h4 className="font-medium text-gray-900 flex items-center text-sm mb-2">
                           <AwardIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-2 pl-5">
                            {profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                 )}

                 <p className="text-xs text-gray-500 pt-2"> 
                   This information is based on your profile. Ensure it's up-to-date. 
                   <Link to="/student-profile" className="text-blue-600 hover:underline ml-1">Edit Profile</Link>
                 </p>
               </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Explain why you're a good fit for this position..."
                  className="min-h-[200px] resize-none"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  A strong cover letter increases your chances of getting noticed by the employer.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <Label>Resume / CV (Required)</Label>
                
                {/* Option Selection */}
                 {profileResumes.length > 0 && (
                    <div className="flex space-x-4 items-center">
                        <Label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="resumeOption" 
                                value="select" 
                                checked={resumeOption === 'select'} 
                                onChange={() => {
                                    setResumeOption('select');
                                    setResumeFile(null); // Clear file if switching to select
                                    setResumeFileName('');
                                    // Don't automatically select, let user choose from dropdown
                                    // setSelectedDocument(profileResumes[0]); 
                                }}
                                className="mr-2"
                            />
                             Use Existing Resume
                        </Label>
                        <Label className="flex items-center cursor-pointer">
                           <input 
                                type="radio" 
                                name="resumeOption" 
                                value="upload" 
                                checked={resumeOption === 'upload'} 
                                onChange={() => {
                                    setResumeOption('upload');
                                    setSelectedDocument(null); // Clear selection if switching to upload
                                }}
                                className="mr-2"
                           />
                            Upload New Resume
                        </Label>
                    </div>
                 )}

                {/* Conditional Input Area */}
                {resumeOption === 'select' ? (
                    <div className="flex flex-col space-y-2">
                        <Select 
                            onValueChange={handleSelectDocument} 
                            value={selectedDocument?.storagePath}
                            required={resumeOption === 'select'}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a resume from your profile..." />
                            </SelectTrigger>
                            <SelectContent>
                                {profileResumes.map((doc) => (
                                <SelectItem key={doc.storagePath} value={doc.storagePath}>
                                    {doc.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         {selectedDocument && (
                            <div className="flex items-center text-green-600 text-sm mt-1">
                               <CheckCircleIcon className="h-4 w-4 mr-1" />
                               Selected: {selectedDocument.name}
                            </div>
                         )}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            id="resume"
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            className="flex-1"
                            required={resumeOption === 'upload'} // Only required if uploading
                          />
                          {resumeFile && (
                            <div className="flex items-center text-green-600">
                              <FileTextIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">{resumeFileName}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <AlertCircleIcon className="h-4 w-4 mr-1" />
                          Upload a new resume in PDF or Word format (max 5MB)
                        </p>
                   </div>
                )}
              </div>

              <div className="bg-intern-light rounded-lg p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Internship Details
                </h3>
                <p className="text-sm"><span className="font-medium">Position:</span> {internship.title}</p>
                <p className="text-sm"><span className="font-medium">Company:</span> {internship.company || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Location:</span> {internship.location || 'N/A'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(`/internships/${id}`)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-intern-medium hover:bg-intern-dark"
                disabled={isSubmitting || !isResumeReadyForSubmit}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <SendIcon className="h-4 w-4 mr-2" />}
                Submit Application
              </Button>
            </CardFooter>
          </fieldset>
        </form>
      </Card>
    </div>
  );
};

export default ApplyInternship;
