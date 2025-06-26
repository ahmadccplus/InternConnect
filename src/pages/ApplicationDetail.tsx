import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useApplications, SupabaseApplication } from '@/contexts/ApplicationContext';
import { supabase } from '@/supabaseClient';
import { 
  ClockIcon, MapPinIcon, BriefcaseIcon, GraduationCap, BuildingIcon, 
  CheckCircleIcon, XCircleIcon, UserIcon, FileTextIcon, DownloadIcon, 
  MailIcon, GithubIcon, LinkedinIcon, GlobeIcon, BookOpenIcon,
  CalendarIcon, BookmarkIcon, Loader2, ArrowLeftIcon, AlertTriangleIcon,
  UniversityIcon,
  AwardIcon,
  InfoIcon,
  PencilIcon
} from 'lucide-react';

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useProfile();
  const { applications, updateApplicationStatus, fetchApplications, loading: loadingApps, error } = useApplications();
  
  const [application, setApplication] = useState<SupabaseApplication | null | undefined>(undefined);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [companyNotes, setCompanyNotes] = useState<string>('');
  const [initialNotes, setInitialNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const isLoading = loadingApps || loadingProfile || application === undefined;

  useEffect(() => {
    if (!loadingApps && id) {
      const foundApp = applications.find(app => app.id === id);
      setApplication(foundApp || null);
      if (foundApp) {
        const notes = foundApp.company_notes || '';
        setCompanyNotes(notes);
        setInitialNotes(notes);
      } else {
        setCompanyNotes('');
        setInitialNotes('');
      }
    }
  }, [id, applications, loadingApps]);

  useEffect(() => {
    if (isLoading || application === undefined) return;

    if (!application) {
       toast({ title: "Not Found", description: "Application could not be found.", variant: "destructive" });
       navigate(-1);
       return;
    }
    
    if (!user || !profile) {
        toast({ title: "Unauthorized", description: "You must be logged in and profile loaded.", variant: "destructive" });
        navigate('/login');
        return;
    }

    if (profile.role === 'student' && application.student_id !== profile.id) {
      toast({ title: "Access Denied", description: "You cannot view this application.", variant: "destructive" });
      navigate('/student-applications');
      return;
    }

    if (profile.role === 'company' && application.internships?.company_id !== profile.id) {
      toast({ title: "Access Denied", description: "You cannot view this application as this company.", variant: "destructive" });
      navigate('/company-applications');
      return;
    }

    const notes = application.company_notes || '';
     if (notes !== initialNotes) {
       setCompanyNotes(notes);
       setInitialNotes(notes);
     }

  }, [application, user, profile, isLoading, navigate, toast, initialNotes]);

  const getStatusBadge = (status: SupabaseApplication['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Submitted</Badge>;
      case 'reviewing':
         return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Reviewing</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">Shortlisted</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>; 
    }
  };

  const handleUpdateStatus = async (status: SupabaseApplication['status']) => {
    if (!application || !id || profile?.role !== 'company') return;

    setIsUpdatingStatus(true);
    try {
      const error = await updateApplicationStatus(id, status); 
      if (error) {
         toast({ title: "Update Failed", description: error.message || "Could not update status.", variant: "destructive" });
         console.error("Status update error:", error);
      } else {
         toast({ title: "Status Updated", description: `Application marked as ${status}.` });
         const updatedApp = applications.find(app => app.id === id);
         setApplication(updatedApp || null);
      }
    } catch (err) {
       console.error("Unexpected error updating status:", err);
       toast({ title: "Update Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!application || !id || profile?.role !== 'company' || isSavingNotes) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ company_notes: companyNotes })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({ title: "Notes Saved", description: "Company notes have been updated." });
      setInitialNotes(companyNotes);
      await fetchApplications();
      const updatedApp = applications.find(app => app.id === id);
      setApplication(updatedApp || null);

    } catch (err: any) {
      console.error("Error saving notes:", err);
      toast({ title: "Save Failed", description: err.message || "Could not save notes.", variant: "destructive" });
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }

  if (!application || !profile) {
    return (
      <div className="page-container py-12">
        <Card className="max-w-4xl mx-auto p-6 text-center">
           <CardHeader>
             <CardTitle>Application Not Found</CardTitle>
             <CardDescription>The requested application could not be loaded or you don't have permission.</CardDescription>
           </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(-1)} variant="outline">
                 <ArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
              </Button>
           </CardContent>
         </Card>
      </div>
    );
  }

  const isCompanyView = profile.role === 'company';
  const internshipTitle = application.internships?.title || 'N/A';
  const studentProfile = application.profiles;
  const studentName = studentProfile?.full_name || `Student ID: ${application.student_id}`;

  return (
    <div className="page-container py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
         <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
       </Button>

      <Card className="max-w-4xl mx-auto mb-6">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Application Review</CardTitle>
              <CardDescription className="flex items-center flex-wrap mt-1">
                <BriefcaseIcon className="h-4 w-4 mr-1" />
                {internshipTitle}
                 <span className="mx-2">•</span>
                <GraduationCap className="h-4 w-4 mr-1" />
                {studentName}
              </CardDescription>
            </div>
            <div>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="bg-gray-50/70 border rounded-lg p-6 space-y-4">
             <h3 className="font-semibold text-xl mb-4 flex items-center text-gray-800">
                  <UserIcon className="h-5 w-5 mr-2 text-intern-dark flex-shrink-0" />
                  Applicant Information
              </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex">
                      <span className="font-medium text-gray-600 w-[100px] flex-shrink-0">Name:</span>
                      <span className="text-gray-800">{studentName}</span>
                  </div>
                  
                  <div className="flex">
                      <span className="font-medium text-gray-600 w-[100px] flex-shrink-0">Submitted:</span> 
                      <span className="text-gray-800">{formatDate(application.submitted_at)}</span>
                  </div>
                  
                  <div className="sm:col-span-2 my-1"></div> 

                  {studentProfile?.education && studentProfile.education.length > 0 && (
                      <div className="sm:col-span-2 flex">
                          <span className="font-medium text-gray-600 w-[100px] flex-shrink-0">Latest Ed:</span> 
                          <div className="text-gray-800">
                             <span>{studentProfile.education[0].degree || 'N/A'}</span>
                             <span className="text-gray-500"> at </span>
                             <span>{studentProfile.education[0].school || 'N/A'}</span>
                             <span className="text-gray-500 text-xs"> (Ends: {studentProfile.education[0].endYear || 'N/A'})</span>
                          </div>
                      </div>
                  )}
                  
                  <div className="sm:col-span-2 my-1"></div>

                  {studentProfile?.portfolio && (
                      <div className="flex">
                          <span className="font-medium text-gray-600 w-[100px] flex-shrink-0 flex items-center">
                              <GlobeIcon className="h-4 w-4 mr-1.5 text-gray-400" />Portfolio:
                          </span>
                          <a href={studentProfile.portfolio.startsWith('http') ? studentProfile.portfolio : `https://${studentProfile.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-intern-dark hover:underline truncate">View Portfolio</a>
                      </div>
                  )}
                   {studentProfile?.linkedin && (
                       <div className="flex">
                          <span className="font-medium text-gray-600 w-[100px] flex-shrink-0 flex items-center">
                             <LinkedinIcon className="h-4 w-4 mr-1.5 text-gray-400" />LinkedIn:
                          </span>
                          <a href={studentProfile.linkedin.startsWith('http') ? studentProfile.linkedin : `https://${studentProfile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-intern-dark hover:underline truncate">View LinkedIn</a>
                      </div>
                  )}
                   {studentProfile?.github && (
                      <div className="flex">
                           <span className="font-medium text-gray-600 w-[100px] flex-shrink-0 flex items-center">
                              <GithubIcon className="h-4 w-4 mr-1.5 text-gray-400" />GitHub:
                           </span>
                           <a href={studentProfile.github.startsWith('http') ? studentProfile.github : `https://${studentProfile.github}`} target="_blank" rel="noopener noreferrer" className="text-intern-dark hover:underline truncate">View GitHub</a>
                      </div>
                  )}
                  
                  {!studentProfile?.portfolio && !studentProfile?.linkedin && !studentProfile?.github && (
                     <div className="sm:col-span-2 text-gray-500 italic text-xs">
                         No external links provided in profile.
                     </div>
                  )}
             </div>
          </div>

          {studentProfile?.bio && (
             <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-3 flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Bio / Summary
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                    {studentProfile.bio}
                </p>
             </div>
          )}

           {studentProfile?.skills && studentProfile.skills.length > 0 && (
             <div className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-3 flex items-center">
                   <AwardIcon className="h-5 w-5 mr-2 text-gray-600" />
                   Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {studentProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                            {skill}
                        </Badge>
                    ))}
                </div>
             </div>
           )}

          {application.cover_letter && (
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-3">Cover Letter</h3>
              <div className="whitespace-pre-line text-gray-700 bg-gray-50 p-3 rounded text-sm">
                 {application.cover_letter}
              </div>
            </div>
          )}

          <div className="border rounded-md p-4">
            <h3 className="font-medium text-lg mb-3">Resume/CV</h3>
            {application.resume_url ? (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={application.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            ) : (
              <p className="text-sm text-gray-500">No resume was submitted.</p>
            )}
          </div>
          
          <div className="border rounded-md p-4">
             <h3 className="font-medium text-lg mb-3 flex items-center">
                 <PencilIcon className="h-5 w-5 mr-2 text-gray-600" />
                 Application Notes
             </h3>
             {isCompanyView ? (
                 <div className="space-y-3">
                    <Textarea
                        placeholder="Add internal notes about this applicant..."
                        value={companyNotes}
                        onChange={(e) => setCompanyNotes(e.target.value)}
                        rows={4}
                        className="text-sm"
                    />
                    <div className="flex justify-end">
                         <Button
                             size="sm"
                             onClick={handleSaveNotes}
                             disabled={isSavingNotes || companyNotes === initialNotes}
                             className="bg-intern-medium hover:bg-intern-dark"
                         >
                             {isSavingNotes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Save Notes
                         </Button>
                     </div>
                 </div>
             ) : (
                 application.company_notes ? (
                    <div className="whitespace-pre-line text-gray-700 bg-gray-50 p-3 rounded text-sm">
                        {application.company_notes}
                    </div>
                 ) : (
                    <p className="text-sm text-gray-500 italic">No notes added by the company yet.</p>
                 )
             )}
           </div>

           {isCompanyView && (
             <>
               <Separator />
               <div className="space-y-2">
                  <Label className="text-lg font-medium">Update Application Status</Label>
                  <div className="flex flex-wrap gap-2 pt-1 justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {(['submitted', 'reviewing', 'shortlisted'] as const).map((status) => (
                        <Button
                          key={status}
                          variant={application.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleUpdateStatus(status)}
                          disabled={isUpdatingStatus || application.status === status}
                          className={application.status === status ? 'bg-intern-dark hover:bg-intern-dark/90' : ''}
                        >
                          {isUpdatingStatus && application.status !== status ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {status.charAt(0).toUpperCase() + status.slice(1)} 
                        </Button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                       <Button
                         key="rejected"
                         variant={application.status === 'rejected' ? "destructive" : "outline"}
                         size="sm"
                         onClick={() => handleUpdateStatus('rejected')}
                         disabled={isUpdatingStatus || application.status === 'rejected'}
                         className={`
                           border-red-300 hover:border-red-400 
                           ${application.status === 'rejected' 
                             ? 'bg-red-600 hover:bg-red-700 text-white'
                             : 'text-red-700 hover:bg-red-50'
                           }
                         `}
                       >
                         {isUpdatingStatus && application.status !== 'rejected' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Reject
                       </Button>

                       <Button
                         key="accepted"
                          variant={application.status === 'accepted' ? "default" : "outline"}
                         size="sm"
                         onClick={() => handleUpdateStatus('accepted')}
                         disabled={isUpdatingStatus || application.status === 'accepted'}
                         className={`
                           border-green-300 hover:border-green-400
                           ${application.status === 'accepted' 
                             ? 'bg-green-600 hover:bg-green-700 text-white'
                             : 'text-green-700 hover:bg-green-50'
                           }
                         `}
                       >
                         {isUpdatingStatus && application.status !== 'accepted' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Accept
                       </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetail;
