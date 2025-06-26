import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Building, Loader2 } from 'lucide-react';

const CompanyProfileCreation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: loadingProfile, updateProfile } = useProfile();

  useEffect(() => {
    if (!loadingProfile) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (profile) {
        if (profile.role !== 'company') {
          navigate('/');
        } else if (profile.profile_completed) {
          navigate('/company-dashboard');
        }
      }
    }
  }, [user, profile, loadingProfile, navigate]);

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    founded_year: '',
    location: '',
    long_description: '',
    linkedin: '',
    twitter: '',
  });

  useEffect(() => {
    if (profile && user && profile.role === 'company' && !profile.profile_completed) {
        setFormData(prev => ({
            ...prev,
            company_name: profile.company_name || '',
            industry: profile.industry || '',
            company_size: profile.company_size || '',
            founded_year: profile.founded_year?.toString() || '',
            location: profile.location || '',
            long_description: profile.long_description || '',
            linkedin: profile.linkedin || '',
            twitter: profile.twitter || '',
        }));
    }
  }, [profile, user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001+ employees"
  ];

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (!updateProfile || isSubmitting) return;

    setIsSubmitting(true);
    
    const profileDataToUpdate = {
      company_name: formData.company_name,
      industry: formData.industry,
      company_size: formData.company_size,
      founded_year: formData.founded_year ? parseInt(formData.founded_year, 10) : null,
      location: formData.location,
      long_description: formData.long_description,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      profile_completed: true
    };

    try {
      const { error } = await updateProfile(profileDataToUpdate);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Created!",
        description: "Your company profile has been saved successfully.",
      });
      
      navigate('/company-dashboard');

    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Could not save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loadingProfile || !user) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }

  return (
    <div className="page-container flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-intern-light p-3 rounded-full">
              <Building className="h-8 w-8 text-intern-dark" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Complete Your Company Profile</CardTitle>
          <CardDescription className="text-center">
            Add details to help students learn more about your company
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input 
                  id="company_name" 
                  placeholder="Acme Corp"
                  required 
                  value={formData.company_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" 
                  placeholder="Technology" 
                  required 
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'company_size')} 
                    value={formData.company_size}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input 
                    id="founded_year" 
                    placeholder="2010" 
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    required 
                    value={formData.founded_year}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Headquarters Location</Label>
                <Input 
                  id="location" 
                  placeholder="San Francisco, CA" 
                  required 
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="long_description">Company Description</Label>
                <Textarea 
                  id="long_description" 
                  placeholder="Tell students more about your company's mission, culture, and values..." 
                  className="resize-none"
                  rows={6}
                  required
                  value={formData.long_description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                <Input 
                  id="linkedin" 
                  placeholder="https://linkedin.com/company/yourcompany" 
                  value={formData.linkedin}
                  onChange={handleChange}
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X URL (Optional)</Label>
                <Input 
                  id="twitter" 
                  placeholder="https://twitter.com/yourcompany" 
                  value={formData.twitter}
                  onChange={handleChange}
                  type="url"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-intern-medium hover:bg-intern-dark" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </fieldset>
        </form>
      </Card>
    </div>
  );
};

export default CompanyProfileCreation;
