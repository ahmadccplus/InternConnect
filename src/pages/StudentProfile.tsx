import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ExperienceSection from '@/components/profile/ExperienceSection';
import DocumentsSection from '@/components/profile/DocumentsSection';
import SkillsSection from '@/components/profile/SkillsSection';
import EducationSection from '@/components/profile/EducationSection';
import { User as UserIcon, Book, Briefcase, FileText, Edit, Loader2, AlertTriangleIcon } from 'lucide-react';

const StudentProfile = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { profile, loading: isLoadingProfile, error: profileError } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('experience');
  
  const isLoading = isLoadingAuth || isLoadingProfile;

  if (isLoading) {
    return (
      <div className="page-container flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-intern-dark" />
      </div>
    );
  }

  if (!user || !profile) {
    navigate('/login');
    return null;
  }
  
  if (profileError) {
      return (
          <div className="page-container">
              <Card className="max-w-lg mx-auto mt-10 p-6">
                  <CardHeader className="text-center">
                      <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
                      <CardTitle className="text-xl text-destructive">Error Loading Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">
                          {profileError.message || "Could not load your profile data. Please try again later."}
                      </p>
                      <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  if (profile.role !== 'student') {
      console.warn("Non-student accessed student profile page.");
      navigate('/');
      return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile Overview</h1>
        <Button variant="outline" onClick={() => navigate('/edit-profile')}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileSidebar profile={profile} />
        </div>
        
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-2xl font-semibold">Your Information</h2>
                <div className="flex space-x-2 flex-wrap gap-2">
                  <Button 
                      variant={activeTab === 'experience' ? 'default' : 'outline'} 
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2"
                      onClick={() => setActiveTab('experience')}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden sm:inline">Experience</span>
                    </Button>
                    <Button 
                      variant={activeTab === 'education' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2"
                      onClick={() => setActiveTab('education')}
                    >
                      <Book className="h-4 w-4" />
                      <span className="hidden sm:inline">Education</span>
                    </Button>
                    <Button 
                      variant={activeTab === 'skills' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2"
                      onClick={() => setActiveTab('skills')}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Skills</span>
                    </Button>
                </div>
            </div>
            
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="hidden">
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>
                
                <TabsContent value="experience" className="mt-0">
                  <ExperienceSection />
                </TabsContent>
                
                <TabsContent value="education" className="mt-0">
                  <EducationSection />
                </TabsContent>
                
                <TabsContent value="skills" className="mt-0">
                  <SkillsSection />
                </TabsContent>
              </Tabs>
            </div>
          </Card>
          
          <div className="mt-8">
            <DocumentsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

