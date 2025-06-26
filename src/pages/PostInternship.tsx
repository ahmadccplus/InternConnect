import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useInternships } from '../contexts/InternshipContext';
import { useAuth } from '../contexts/AuthContext';
import { BriefcaseIcon } from 'lucide-react';
import InternshipForm, { InternshipFormValues } from '@/components/forms/InternshipForm';

const PostInternship = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addInternship } = useInternships();
  const { user } = useAuth();

  const defaultValues = {
    title: '',
    company: '',
    location: '',
    type: '',
    category: '',
    description: '',
    skills: '',
    startDate: '',
    deadline: '',
    duration: '',
    stipend: '',
    companyWebsite: '',
  };

  const onSubmit = (data: InternshipFormValues) => {
    // Convert skills string to array
    const skillsArray = data.skills.split(',').map(skill => skill.trim());
    
    const currentDate = new Date();
    // Format date as dd/mm/yyyy
    const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // --- START DATE FORMATTING ---
    const formatDateForDB = (dateString: string | undefined | null): string | null => {
      if (!dateString) return null;
      try {
        const dateObj = new Date(dateString);
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn(`Invalid date string received: ${dateString}`);
          return null; 
        }
        // Format to YYYY-MM-DD
        return dateObj.toISOString().split('T')[0];
      } catch (error) {
        console.error(`Error parsing date string: ${dateString}`, error);
        return null;
      }
    };

    const formattedStartDate = formatDateForDB(data.startDate);
    const formattedDeadline = formatDateForDB(data.deadline);
    // --- END DATE FORMATTING ---
    
    // Add the new internship with all required fields explicitly defined
    addInternship({
      title: data.title,
      location: data.location,
      type: data.type,
      category: data.category,
      description: data.description,
      skills: skillsArray,
      start_date: formattedStartDate, // Use formatted date or null
      deadline: formattedDeadline,   // Use formatted date or null
      duration: data.duration,
      stipend: data.stipend,
      companylogo: "/placeholder.svg",
      companywebsite: data.companyWebsite,
    });
    
    toast({
      title: "Internship Posted!",
      description: "Your internship has been successfully posted.",
    });
    
    // Trigger an explicit refresh before navigation
    window.dispatchEvent(new Event('internshipsChanged'));
    
    // Navigate with a slight delay to ensure state updates complete
    setTimeout(() => {
      navigate('/company-dashboard');
    }, 100);
  };

  const handleCancel = () => {
    navigate('/company-dashboard');
  };

  return (
    <div className="page-container py-8">
      <div className="flex items-center mb-6">
        <BriefcaseIcon className="h-6 w-6 text-intern-dark mr-2" />
        <h1 className="text-3xl font-bold">Post a New Internship</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Internship Details</CardTitle>
          <CardDescription>
            Fill in the details of the internship opportunity you want to post.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InternshipForm 
            defaultValues={defaultValues} 
            onSubmit={onSubmit} 
            onCancel={handleCancel}
            submitButtonText="Post Internship"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PostInternship;
