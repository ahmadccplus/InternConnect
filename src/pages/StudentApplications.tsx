import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications, SupabaseApplication } from '@/contexts/ApplicationContext';
import { ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, Loader2, SendIcon, ListChecksIcon } from 'lucide-react';

// Helper to format date
const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  // Explicitly format as dd/mm/yyyy
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const StudentApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Get applications and loading state directly from context
  const { applications, loading, error } = useApplications(); 

  // Redirect if not a logged-in student (can happen briefly before context loads)
  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="page-container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }
  
  // Handle potential errors from context
  if (error) {
     return (
      <div className="page-container py-12">
         <Card className="max-w-4xl mx-auto p-6 text-center">
           <CardHeader>
             <CardTitle>Error Loading Applications</CardTitle>
             <CardDescription>{error.message || "Could not load your applications."}</CardDescription>
           </CardHeader>
         </Card>
       </div>
    );
  }
  
  // Ensure user is loaded and is a student before proceeding
  if (!user || user.role !== 'student') {
    return null; // Or a placeholder/message
  }
  
  // Group applications by status using the correct status values
  // Remove 'viewing' as it's not in the defined type
  const inProgressApplications = applications.filter(app => app.status === 'submitted' || app.status === 'reviewing');
  const shortlistedApplications = applications.filter(app => app.status === 'shortlisted');
  const completedApplications = applications.filter(app => app.status === 'accepted' || app.status === 'rejected');
  
  // Helper function to get the badge for each status
  // Type annotation is now correct because SupabaseApplication is imported
  const getStatusBadge = (status: SupabaseApplication['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Submitted</Badge>;
      // Remove 'viewing' case if it was here implicitly
      case 'reviewing':
         return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Under Review</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">Shortlisted</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">Not Selected</Badge>;
      default:
        // Handle any other statuses defined in your type/enum
        return <Badge variant="outline">{status}</Badge>; 
    }
  };
  
  // Helper function to render the application card using fetched data
  const renderApplicationCard = (application: SupabaseApplication) => {
    // Use data joined in ApplicationContext
    const internshipTitle = application.internships?.title || 'Internship Title N/A';
    // Assuming company name needs another join level - for now, use ID or placeholder
    // const companyName = application.internships?.profiles?.company_name || 'Company N/A'; 

    return (
      <Card key={application.id} className="mb-4 card-hover">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{internshipTitle}</h3>
              {/* <p className="text-gray-600">{companyName}</p> */}
              <div className="flex items-center mt-2 text-gray-500 text-sm">
                <ClockIcon className="h-4 w-4 mr-1" />
                {/* Use submitted_at and format it */}
                Applied on {formatDate(application.submitted_at)} 
              </div>
            </div>
            <div className="flex flex-col items-end">
              {getStatusBadge(application.status)}
              {/* Keep navigation for now, assuming the route exists */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-intern-dark hover:text-intern-dark/80"
                // Changed navigation back to application detail page
                onClick={() => navigate(`/applications/${application.id}`)} 
                // onClick={() => navigate(`/internships/${application.internship_id}`)} // Old: Link to internship detail instead?
              >
                <EyeIcon className="h-4 w-4 mr-1" /> View Application {/* Changed button text */}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="page-container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-600 mt-1">Track and manage your internship applications</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgressApplications.length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApplications.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedApplications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {applications.length > 0 ? (
            applications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                <ListChecksIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <CardTitle className="text-xl">No Applications Yet</CardTitle>
                <CardDescription>
                  You haven't applied to any internships. Start exploring opportunities!
                </CardDescription>
                <Button 
                  className="mt-4 bg-intern-medium hover:bg-intern-dark"
                  onClick={() => navigate('/internships')}
                >
                  Browse Internships
                </Button>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="inProgress">
          {inProgressApplications.length > 0 ? (
            inProgressApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                 <ListChecksIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <CardTitle className="text-xl">No Pending Applications</CardTitle>
                <CardDescription>
                  You don't have any applications currently under review.
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
                <CardTitle className="text-xl">No Shortlisted Applications</CardTitle>
                <CardDescription>
                  None of your applications have been shortlisted yet.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedApplications.length > 0 ? (
            completedApplications.map(renderApplicationCard)
          ) : (
            <Card>
              <CardHeader className="text-center py-8">
                <CardTitle className="text-xl">No Completed Applications</CardTitle>
                <CardDescription>
                  You don't have any applications that have received a final decision.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentApplications;
