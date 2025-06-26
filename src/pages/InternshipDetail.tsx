import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPinIcon, ClockIcon, CalendarIcon, DollarSignIcon, BuildingIcon, BriefcaseIcon, ExternalLinkIcon, SendIcon } from 'lucide-react';
import { useInternships, SupabaseInternship } from '../contexts/InternshipContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from "@/contexts/ProfileContext";
import { useApplications } from "@/contexts/ApplicationContext";
import { timeAgo } from './InternshipList'; // Import the utility function
import { useToast } from "@/components/ui/use-toast";

const InternshipDetail = () => {
  const { id } = useParams<{ id: string }>(); // id is the string UUID
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth();
  const { profile, loading: profileIsLoading } = useProfile();
  const { getInternshipById, fetchInternshipById, deleteInternship, loading: internshipsAreLoading, error: errorInternships } = useInternships();
  const { applications, loading: appsAreLoading, error: errorApps } = useApplications();
  const [internship, setInternship] = useState<SupabaseInternship | null | undefined>(undefined); // State to hold the internship data (undefined: loading, null: not found)
  const [loading, setLoading] = useState(true);

  // Combine loading states
  const isLoading = authIsLoading || profileIsLoading || internshipsAreLoading || appsAreLoading || internship === undefined;

  useEffect(() => {
    if (!id) {
      console.error("No internship ID found in URL");
      setInternship(null); // Mark as not found if ID is missing
      setLoading(false);
      return;
    }

    setLoading(true);
    // --- Restored original cache check logic --- 
    const cachedInternship = getInternshipById(id); 
    if (cachedInternship) {
      setInternship(cachedInternship);
      setLoading(false);
    } else { 
    // --- Fetch if not in cache --- 
      fetchInternshipById(id)
        .then(fetchedInternship => {
          setInternship(fetchedInternship); // Will be null if not found
        })
        .catch(error => {
          console.error("Error fetching internship details:", error);
          setInternship(null); // Set to null on fetch error
        })
        .finally(() => {
          setLoading(false);
        });
    } 
    // --- End of restored logic --- 
  }, [id, getInternshipById, fetchInternshipById]); // Restored getInternshipById dependency

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this internship listing?')) {
      deleteInternship(id) // Use the correct string ID
        .then((error) => {
          if (!error) {
            navigate('/company-dashboard');
          } else {
            // Handle error (e.g., show toast)
            console.error("Error deleting internship:", error);
            alert("Failed to delete internship. See console for details.");
          }
        });
    }
  };
  
  if (loading) {
     return (
      <div className="page-container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-intern-dark"></div>
        </div>
      </div>
    );
  }

  if (internship === null) { // Check for null (explicitly not found or error)
    return (
      <div className="page-container py-12">
        <Card className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Internship Not Found</h2>
            <p className="mb-4">The internship you're looking for doesn't exist, has been removed, or couldn't be loaded.</p>
            <Link to="/internships">
              <Button className="bg-intern-medium hover:bg-intern-dark">
                Back to Internship List
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Derived states - ensure internship is not null here
  const isCompany = profile?.role === 'company';
  const isCompanyOwner = isCompany && profile?.id === internship.company_id;
  const isStudent = profile?.role === 'student';
  const alreadyApplied = user ? applications.some(app => app.internship_id === id && app.student_id === user.id) : false;
  
  return (
    <div className="page-container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{internship.title}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <BuildingIcon className="h-5 w-5 mr-2" />
                {/* Use internship.company (fetched name) or fallback */}
                <span className="font-medium">{internship.company || 'Company N/A'}</span> 
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {isCompanyOwner ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/edit-internship/${id}`)} // Use string id
                  >
                    Edit Listing
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button 
                    className="bg-intern-medium hover:bg-intern-dark"
                    onClick={() => navigate(`/internships/${id}/applications`)} // Use string id
                  >
                    View Applications
                  </Button>
                </div>
              ) : isStudent ? (
                alreadyApplied ? (
                  <Button variant="outline" disabled>
                    Already Applied
                  </Button>
                ) : (
                  <Button 
                    className="bg-intern-medium hover:bg-intern-dark"
                    onClick={() => navigate(`/internships/${id}/apply`)} // Use string id
                  >
                    <SendIcon className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                )
              ) : (
                <Button 
                  className="bg-intern-medium hover:bg-intern-dark"
                  onClick={() => navigate('/login')}
                >
                  <SendIcon className="mr-2 h-4 w-4" />
                  Login to Apply
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-intern-light p-4 rounded-lg">
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span>Location: <span className="font-medium">{internship.location}</span></span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span>Type: <span className="font-medium">{internship.type || 'Not specified'}</span></span>
            </div>
            <div className="flex items-center">
              <DollarSignIcon className="h-5 w-5 mr-2 text-gray-600" />
              {/* Use stipend field */}
              <span>Compensation: <span className="font-medium">{internship.stipend || 'Not specified'}</span></span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
              {/* Use formatted created_at instead of posted */}
              <span>Posted: <span className="font-medium">{timeAgo(internship.created_at)}</span></span>
            </div>
            {internship.deadline && (
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                {/* Format deadline if needed, assuming it's a readable string for now */}
                <span>Application Deadline: <span className="font-medium">{internship.deadline}</span></span>
              </div>
            )}
            <div className="flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-600" />
              {/* Use category field */}
              <span>Category: <span className="font-medium">{internship.category || 'Not specified'}</span></span>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <div className="whitespace-pre-line text-gray-700">
              {internship.description}
            </div>
          </div>
          
          {/* Use requirements field */}
          {internship.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <div className="whitespace-pre-line text-gray-700">
                {internship.requirements}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {/* Use skills array, handle if null/undefined */}
              {internship.skills?.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-intern-light text-intern-dark border-intern">
                  {skill}
                </Badge>
              )) || <span className="text-gray-500">No specific skills listed.</span>}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Use companywebsite field (lowercase) */}
          {internship.companywebsite ? (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Company Website</h3>
                <p className="text-sm text-gray-600">Learn more about {internship.company || 'the company'}</p>
              </div>
              <Button variant="outline" asChild>
                {/* Prepend https:// if the protocol is missing */}
                <a 
                  href={
                    internship.companywebsite.startsWith('http://') || internship.companywebsite.startsWith('https://')
                      ? internship.companywebsite 
                      : `https://${internship.companywebsite}`
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Visit Website
                  <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-medium">Company Website</h3>
              <p className="text-sm text-gray-500">Company website not provided.</p>
            </div>
          )}
          
          {isStudent && !alreadyApplied && !isCompanyOwner && (
            <div className="mt-8 text-center">
              <Button 
                size="lg" 
                className="bg-intern-medium hover:bg-intern-dark px-8"
                onClick={() => navigate(`/internships/${id}/apply`)} // Use string id
              >
                <SendIcon className="mr-2 h-4 w-4" />
                Apply for this Internship
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InternshipDetail;
