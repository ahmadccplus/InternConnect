import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useInternships } from '../contexts/InternshipContext';
import { PencilIcon } from 'lucide-react';
import InternshipForm, { InternshipFormValues } from '@/components/forms/InternshipForm';
import { SupabaseInternship } from '@/contexts/InternshipContext';
import { Loader2 } from 'lucide-react';

const EditInternship = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getInternshipById, 
    fetchInternshipById, 
    updateInternship, 
    loading: contextLoading
  } = useInternships();
  
  const [internship, setInternship] = useState<SupabaseInternship | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInternship = async () => {
      if (!id) {
        console.error("EditInternship: No internship ID provided in URL");
        setInternship(null); 
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      let existingInternship = getInternshipById(id);
      
      if (existingInternship) {
        console.log(`EditInternship: Found internship ${id} in context cache.`);
        setInternship(existingInternship);
        setIsLoading(false);
      } else {
        console.log(`EditInternship: Internship ${id} not in context cache, fetching...`);
        try {
          const fetchedInternship = await fetchInternshipById(id);
          console.log(`EditInternship: Fetched internship ${id}:`, fetchedInternship);
          setInternship(fetchedInternship);
        } catch (error) {
          console.error(`EditInternship: Error fetching internship ${id}:`, error);
          setInternship(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInternship();
  }, [id, getInternshipById, fetchInternshipById]);

  const formDefaultValues = React.useMemo<InternshipFormValues | null>(() => {
    if (!internship) return null;
    
    console.log("EditInternship: Calculating formDefaultValues for", internship);
    return {
      title: internship.title || '',
      company: internship.company || '',
      location: internship.location || '',
      type: internship.type || '',
      category: internship.category || '',
      description: internship.description || '',
      skills: internship.skills?.join(', ') || '',
      startDate: internship.start_date || '',
      deadline: internship.deadline || '',
      duration: internship.duration || '',
      stipend: internship.stipend ? String(internship.stipend) : '',
      companyWebsite: internship.companywebsite || '',
    };
  }, [internship]);

  const formatDateForDB = (dateString: string | undefined | null): string | null => {
    if (!dateString) return null;
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) { console.warn(`Invalid date: ${dateString}`); return null; }
      return dateObj.toISOString().split('T')[0];
    } catch (error) { console.error(`Error parsing date: ${dateString}`, error); return null; }
  };

  const onSubmit = async (data: InternshipFormValues) => {
    if (!id) {
      console.error("EditInternship: Cannot submit, missing ID.");
      return;
    }

    console.log("EditInternship: Submitting update for", id, "Data:", data);

    const skillsArray = data.skills.split(',').map(skill => skill.trim());
    const formattedStartDate = formatDateForDB(data.startDate);
    const formattedDeadline = formatDateForDB(data.deadline);

    const updateData: Partial<SupabaseInternship> = {
      title: data.title,
      location: data.location,
      type: data.type,
      category: data.category,
      description: data.description,
      skills: skillsArray,
      start_date: formattedStartDate,
      deadline: formattedDeadline,
      duration: data.duration,
      stipend: data.stipend,
      companywebsite: data.companyWebsite,
    };
    
    const error = await updateInternship(id, updateData);
    
    if (error) {
      console.error("EditInternship: Update failed:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update the internship.",
        variant: "destructive",
      });
    } else {
      console.log("EditInternship: Update successful for", id);
      toast({
        title: "Internship Updated!",
        description: "Your internship has been successfully updated.",
      });
      navigate(`/company-dashboard`); 
    }
  };

  const handleCancel = () => {
    navigate('/company-dashboard');
  };

  if (isLoading) {
    console.log("EditInternship: Rendering Loader...");
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }

  if (internship === null) {
    console.log("EditInternship: Rendering Not Found...");
    return (
      <div className="page-container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Internship Not Found</h2>
          <p className="mt-4 text-gray-600">
            The internship you're trying to edit doesn't exist or has been removed.
          </p>
          <Button className="mt-6" onClick={() => navigate('/company-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  console.log("EditInternship: Rendering Form with defaultValues:", formDefaultValues);
  return (
    <div className="page-container py-8">
      <div className="flex items-center mb-6">
        <PencilIcon className="h-6 w-6 text-intern-dark mr-2" />
        <h1 className="text-3xl font-bold">Edit Internship</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Internship Details</CardTitle>
          <CardDescription>
            Update the details of your internship posting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formDefaultValues ? (
            <InternshipForm 
              defaultValues={formDefaultValues} 
              onSubmit={onSubmit} 
              onCancel={handleCancel}
              submitButtonText="Save Changes"
            />
          ) : (
            <p>Loading form data...</p> 
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditInternship;
