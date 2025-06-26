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
import { useProfile, SupabaseProfile } from '@/contexts/ProfileContext';
import { GraduationCap, Building, Loader2 } from 'lucide-react';

const EditProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: loadingProfile, updateProfile } = useProfile();
  
  useEffect(() => {
    if (!loadingProfile) {
      if (!user) {
        navigate('/login');
      } else if (!profile) {
        toast({ title: "Profile Incomplete", description: "Please complete your profile first.", variant: "destructive" });
        if (user.role === 'student') {
          navigate('/student-profile-creation');
        } else if (user.role === 'company') {
          navigate('/company-profile-creation');
        } else {
          navigate('/');
        }
      }
    }
  }, [user, profile, loadingProfile, navigate, toast]);

  const [studentFormData, setStudentFormData] = useState({
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

  const [companyFormData, setCompanyFormData] = useState({
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
    if (profile) {
      if (profile.role === 'student') {
        setStudentFormData({
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
        });
      } else if (profile.role === 'company') {
        setCompanyFormData({
          company_name: profile.company_name || '',
          industry: profile.industry || '',
          company_size: profile.company_size || '',
          founded_year: profile.founded_year?.toString() || '',
          location: profile.location || '',
          long_description: profile.long_description || '',
          linkedin: profile.linkedin || '',
          twitter: profile.twitter || '',
        });
      }
    }
  }, [profile]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (profile?.role === 'student') {
      setStudentFormData(prev => ({ ...prev, [id]: value }));
    } else if (profile?.role === 'company') {
      setCompanyFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    if (profile?.role === 'student') {
      setStudentFormData(prev => ({ ...prev, [field]: value }));
    } else if (profile?.role === 'company') {
      setCompanyFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const companySizes = [
    "1-10 employees", "11-50 employees", "51-200 employees",
    "201-500 employees", "501-1000 employees", "1001+ employees"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile || !profile || isSubmitting) return;

    setIsSubmitting(true);
    let dataToUpdate: Partial<SupabaseProfile> = {};
    let navigateTo = '/';

    if (profile.role === 'student') {
      dataToUpdate = {
        full_name: studentFormData.full_name,
        university: studentFormData.university,
        major: studentFormData.major,
        graduation_year: studentFormData.graduation_year ? parseInt(studentFormData.graduation_year, 10) : null,
        skills: studentFormData.skills.split(',').map(s => s.trim()).filter(s => s),
        bio: studentFormData.bio,
        location: studentFormData.location,
        linkedin: studentFormData.linkedin,
        github: studentFormData.github,
        portfolio: studentFormData.portfolio,
      };
      navigateTo = '/student-portal';
    } else if (profile.role === 'company') {
      dataToUpdate = {
        company_name: companyFormData.company_name,
        industry: companyFormData.industry,
        company_size: companyFormData.company_size,
        founded_year: companyFormData.founded_year ? parseInt(companyFormData.founded_year, 10) : null,
        location: companyFormData.location,
        long_description: companyFormData.long_description,
        linkedin: companyFormData.linkedin,
        twitter: companyFormData.twitter,
      };
      navigateTo = '/company-dashboard';
    }

    const { id, role, created_at, updated_at, profile_completed, ...finalUpdateData } = dataToUpdate;

    try {
      const { error } = await updateProfile(finalUpdateData);
      if (error) throw error;

      toast({ title: "Profile Updated!", description: "Your profile was saved successfully." });
      navigate(navigateTo);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile || !profile) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
      </div>
    );
  }

  if (profile.role === 'student') {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-intern-light p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-intern-dark" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Edit Your Student Profile</CardTitle>
            <CardDescription className="text-center">
              Update your profile details to keep them current
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={studentFormData.full_name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input id="university" value={studentFormData.university} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">Major/Field of Study</Label>
                    <Input id="major" value={studentFormData.major} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Expected Graduation Year</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'graduation_year')} value={studentFormData.graduation_year}>
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" value={studentFormData.skills} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={studentFormData.bio} onChange={handleChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City, State)</Label>
                  <Input id="location" value={studentFormData.location} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" type="url" value={studentFormData.linkedin} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input id="github" type="url" value={studentFormData.github} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input id="portfolio" type="url" value={studentFormData.portfolio} onChange={handleChange} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full bg-intern-medium hover:bg-intern-dark" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Saving...' : 'Update Profile'}
                </Button>
              </CardFooter>
            </fieldset>
          </form>
        </Card>
      </div>
    );
  } else if (profile.role === 'company') {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-intern-light p-3 rounded-full">
                <Building className="h-8 w-8 text-intern-dark" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Edit Your Company Profile</CardTitle>
            <CardDescription className="text-center">
              Update your company details to attract the best candidates
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input id="company_name" value={companyFormData.company_name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={companyFormData.industry} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'company_size')} value={companyFormData.company_size}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>{companySizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input id="founded_year" type="number" value={companyFormData.founded_year} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={companyFormData.location} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="long_description">Company Description</Label>
                  <Textarea id="long_description" value={companyFormData.long_description} onChange={handleChange} rows={6} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" type="url" value={companyFormData.linkedin} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X URL</Label>
                  <Input id="twitter" type="url" value={companyFormData.twitter} onChange={handleChange} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full bg-intern-medium hover:bg-intern-dark" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Saving...' : 'Update Profile'}
                </Button>
              </CardFooter>
            </fieldset>
          </form>
        </Card>
      </div>
    );
  }

  return null;
};

export default EditProfile;
