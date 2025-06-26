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
import { GraduationCap, Loader2 } from 'lucide-react';

const StudentProfileCreation = () => {
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
        if (profile.role !== 'student') {
          navigate('/');
        } else if (profile.profile_completed) {
          navigate('/student-portal');
        }
      }
    }
  }, [user, profile, loadingProfile, navigate]);

  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    major: '',
    graduation_year: '',
    skills: '',
    bio: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  useEffect(() => {
    if (profile && user && profile.role === 'student' && !profile.profile_completed) {
        setFormData(prev => ({
            ...prev,
            full_name: profile.full_name || '',
            university: profile.university || '',
            major: profile.major || '',
            graduation_year: profile.graduation_year?.toString() || '',
            skills: profile.skills?.join(', ') || '',
            bio: profile.bio || '',
            location: profile.location || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            portfolio: profile.portfolio || '',
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile || isSubmitting) return;

    setIsSubmitting(true);
    
    const profileDataToUpdate = {
      full_name: formData.full_name,
      university: formData.university,
      major: formData.major,
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      bio: formData.bio,
      location: formData.location,
      linkedin: formData.linkedin,
      github: formData.github,
      portfolio: formData.portfolio,
      profile_completed: true
    };

    try {
      const { error } = await updateProfile(profileDataToUpdate);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Created!",
        description: "Your student profile has been saved successfully.",
      });
      
      navigate('/student-portal');

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
              <GraduationCap className="h-8 w-8 text-intern-dark" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Complete Your Student Profile</CardTitle>
          <CardDescription className="text-center">
            Add details to your profile to help companies get to know you better
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  placeholder="Jane Doe"
                  required 
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input 
                  id="university" 
                  placeholder="State University"
                  required 
                  value={formData.university}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input 
                    id="major" 
                    placeholder="Computer Science" 
                    required 
                    value={formData.major}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Expected Graduation Year</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'graduation_year')} 
                    value={formData.graduation_year}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input 
                  id="skills" 
                  placeholder="JavaScript, React, Python, Project Management" 
                  required 
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell employers about yourself..." 
                  className="resize-none"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (City, State)</Label>
                <Input 
                  id="location" 
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                <Input 
                  id="linkedin" 
                  placeholder="https://linkedin.com/in/yourusername" 
                  value={formData.linkedin}
                  onChange={handleChange}
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL (Optional)</Label>
                <Input 
                  id="github" 
                  placeholder="https://github.com/yourusername" 
                  value={formData.github}
                  onChange={handleChange}
                  type="url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website (Optional)</Label>
                <Input 
                  id="portfolio" 
                  placeholder="https://yourportfolio.com" 
                  value={formData.portfolio}
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

export default StudentProfileCreation;
