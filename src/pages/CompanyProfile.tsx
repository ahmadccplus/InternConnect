
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Users, Globe, Linkedin, Twitter, Mail, Building, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getUserById, user: currentUser } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const companyData = getUserById(id);
      setCompany(companyData);
      setLoading(false);
    } else if (currentUser?.role === 'company') {
      // If no ID is provided and the current user is a company, show their profile
      setCompany(currentUser);
      setLoading(false);
    }
  }, [id, currentUser, getUserById]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!company) {
    return (
      <div className="page-container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
          <p className="mb-6">The company profile you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/internships">Browse Internships</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <Link to="/internships" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Internships
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileSidebar />
        </div>
        
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About {company.companyName || company.name}</CardTitle>
              <CardDescription>
                {company.companySize && `${company.companySize} • `}
                {company.foundedYear && `Founded ${company.foundedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.longDescription && (
                <p className="text-gray-700">{company.longDescription}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {company.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{company.location}</span>
                  </div>
                )}
                
                {company.foundedYear && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">Founded in {company.foundedYear}</span>
                  </div>
                )}
                
                {company.companySize && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{company.companySize}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              
              {company.linkedIn && (
                <div className="flex items-center">
                  <Linkedin className="h-4 w-4 text-gray-500 mr-2" />
                  <a href={company.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              
              {company.twitter && (
                <div className="flex items-center">
                  <Twitter className="h-4 w-4 text-gray-500 mr-2" />
                  <a href={company.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Twitter Profile
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
