import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useApplications, SupabaseApplication } from '@/contexts/ApplicationContext';
import { useInternships, SupabaseInternship } from '@/contexts/InternshipContext';
import { SearchIcon, UsersIcon, UserCheckIcon, ClockIcon, EyeIcon, GraduationCap, Loader2, ListChecksIcon, LinkIcon, BookOpenIcon, AwardIcon, InfoIcon } from 'lucide-react';

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const CompanyApplications = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useProfile();
  const { applications, loading: loadingApps, error: errorApps } = useApplications();
  const { internships, loading: loadingInternships, error: errorInternships, getInternshipById } = useInternships();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string | null>(paramId || null);
  const [pageTitle, setPageTitle] = useState("Manage Applications");

  const validTabs = ["all", "submitted", "reviewing", "shortlisted", "final"];
  const requestedTab = searchParams.get('tab');
  const defaultTab = requestedTab && validTabs.includes(requestedTab) ? requestedTab : "all";

  useEffect(() => {
    const isLoading = loadingApps || loadingInternships || loadingProfile;
    if (!isLoading && (!user || !profile || profile.role !== 'company')) {
      navigate('/login');
    }
  }, [user, profile, loadingApps, loadingInternships, loadingProfile, navigate]);

  useEffect(() => {
    if (selectedInternshipId) {
       const selectedInternship = getInternshipById(selectedInternshipId);
       setPageTitle(selectedInternship 
          ? `Applications for ${selectedInternship.title}` 
          : "Applications for Selected Internship");
    } else {
       setPageTitle("Manage All Applications");
    }
  }, [selectedInternshipId, getInternshipById]);

  const companyInternships = React.useMemo(() => {
    if (!profile) return [];
    return internships.filter(internship => internship.company_id === profile.id);
  }, [internships, profile]);

  const filteredApplications = React.useMemo(() => {
    return applications.filter(application => {
      const isCompanyApplication = companyInternships.some(ci => ci.id === application.internship_id);
      if (!isCompanyApplication) return false; 

      const matchesInternship = !selectedInternshipId || application.internship_id === selectedInternshipId;
      if (!matchesInternship) return false;
      
      const studentName = application.profiles?.full_name || '';
      const matchesSearch = !searchQuery || studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [applications, companyInternships, selectedInternshipId, searchQuery]);

  const submittedApplications = filteredApplications.filter(app => app.status === 'submitted');
  const reviewingApplications = filteredApplications.filter(app => app.status === 'reviewing');
  const shortlistedApplications = filteredApplications.filter(app => app.status === 'shortlisted');
  const finalApplications = filteredApplications.filter(app => 
    app.status === 'accepted' || app.status === 'rejected'
  );

  const getStatusBadge = (status: SupabaseApplication['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">New</Badge>;
      case 'reviewing':
         return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Reviewing</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">Shortlisted</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>; 
    }
  };

  const getInternshipTitle = (application: SupabaseApplication) => {
    return application.internships?.title || 'Unknown Position';
  };

  const renderApplicationCard = (application: SupabaseApplication) => {
    const studentProfile = application.profiles;
    const studentName = studentProfile?.full_name || `Student ID: ${application.student_id}`; 
    const latestEducation = studentProfile?.education?.[0];

    return (
      <Card key={application.id} className="mb-4 card-hover overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 mr-2 text-intern-dark" />
                <span className="font-semibold text-lg">{studentName}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {latestEducation && (
                  <div className="flex items-center">
                     <BookOpenIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                     <span>{latestEducation.degree || 'N/A'} at {latestEducation.school || 'N/A'} (Ends: {latestEducation.endYear || 'N/A'})</span>
                  </div>
                )}
                
                {studentProfile?.skills && studentProfile.skills.length > 0 && (
                   <div className="flex items-start">
                     <AwardIcon className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                     <div>
                         <span className="font-medium text-gray-700">Skills:</span>
                         <span className="ml-1">{studentProfile.skills.slice(0, 3).join(', ')}{studentProfile.skills.length > 3 ? '...' : ''}</span> 
                     </div>
                  </div>
                )}

                 {studentProfile?.bio && (
                    <div className="flex items-center text-gray-500 italic">
                        <InfoIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span>Bio available in full review</span>
                    </div>
                 )}
                
                 {(studentProfile?.linkedin || studentProfile?.github || studentProfile?.portfolio) && (
                     <div className="flex items-center">
                       <LinkIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="font-medium text-gray-700">Links:</span>
                        <span className="ml-1">
                           {studentProfile.linkedin && <a href={studentProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">LinkedIn</a>}
                           {studentProfile.github && <a href={studentProfile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">GitHub</a>}
                           {studentProfile.portfolio && <a href={studentProfile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a>}
                        </span>
                    </div>
                 )}
              </div>
              
               <div className="flex items-center mt-3 text-gray-500 text-xs">
                <ClockIcon className="h-3 w-3 mr-1" />
                Applied on {formatDate(application.submitted_at)}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end flex-shrink-0 space-y-2">
              {getStatusBadge(application.status)}
              {!selectedInternshipId && (
                 <p className="text-sm text-gray-600 text-right">For: {getInternshipTitle(application)}</p>
              )}
              <Button 
                variant="default"
                size="sm" 
                className="bg-intern-medium hover:bg-intern-dark w-full md:w-auto"
                onClick={() => {
                  navigate(`/applications/${application.id}/review`);
                }}
              >
                <EyeIcon className="h-4 w-4 mr-1" /> Review Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const isLoading = loadingApps || loadingInternships;
  const contextError = errorApps || errorInternships;

  if (isLoading) {
    return (
      <div className="page-container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }
  
  if (contextError) {
     return (
      <div className="page-container py-12">
         <Card className="max-w-4xl mx-auto p-6 text-center">
           <CardHeader>
             <CardTitle>Error Loading Data</CardTitle>
             <CardDescription>{contextError.message || "Could not load applications or internship data."}</CardDescription>
           </CardHeader>
         </Card>
       </div>
    );
  }

  if (!user || !profile || profile.role !== 'company') {
    return null; 
  }

  return (
    <div className="page-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-gray-600 mt-1">
            Review candidates who applied to your listings.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
             value={selectedInternshipId || "all"} 
             onValueChange={(value) => setSelectedInternshipId(value === "all" ? null : value)}
           >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter by Internship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Internships</SelectItem>
              {companyInternships.map((internship) => (
                <SelectItem key={internship.id} value={internship.id}>
                  {internship.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({filteredApplications.length})</TabsTrigger>
          <TabsTrigger value="submitted">New ({submittedApplications.length})</TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing ({reviewingApplications.length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApplications.length})</TabsTrigger>
          <TabsTrigger value="final">Final Decision ({finalApplications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {filteredApplications.length > 0 ? (
            filteredApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                 <ListChecksIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <CardTitle className="text-xl">No Applications Found</CardTitle>
                <CardDescription>There are no applications matching your current filters.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
         <TabsContent value="submitted">
          {submittedApplications.length > 0 ? (
            submittedApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                 <ListChecksIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <CardTitle className="text-xl">No New Applications</CardTitle>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="reviewing">
          {reviewingApplications.length > 0 ? (
            reviewingApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                <CardTitle className="text-xl">No Applications Under Review</CardTitle>
                <CardDescription>
                  You don't have any applications currently marked as under review.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="shortlisted">
          {shortlistedApplications.length > 0 ? (
            shortlistedApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                <CardTitle className="text-xl">No Shortlisted Candidates</CardTitle>
                <CardDescription>
                  You haven't shortlisted any candidates yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="final">
          {finalApplications.length > 0 ? (
            finalApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                <CardTitle className="text-xl">No Finalized Applications</CardTitle>
                <CardDescription>
                  You haven't made any final decisions on applications yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyApplications;
