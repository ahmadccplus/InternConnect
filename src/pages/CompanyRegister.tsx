import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../supabaseClient';

type CompanyFormData = {
  companyName: string;
  industry: string;
  website: string;
  email: string;
  password: string;
  companyDescription: string;
};

const CompanyRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    industry: '',
    website: '',
    email: '',
    password: '',
    companyDescription: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic password validation (optional, Supabase handles min length)
    // if (formData.password.length < 6) {
    //   setError('Password must be at least 6 characters');
    //   return;
    // }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            // Pass additional data for the profile trigger
            role: 'company',
            company_name: formData.companyName
            // You could also pass industry, website, companyDescription here
            // if you want them in the profiles table initially.
          }
        }
      });

      if (error) {
        throw error; // Throw error to be caught below
      }

      // Handle case where user needs email confirmation (if enabled in Supabase)
      if (data.user && data.user.identities?.length === 0) {
         toast({
          title: "Check your email",
          description: "We've sent a confirmation link to your email address.",
          variant: "default",
        });
         // Optional: navigate to a page telling them to check email
         // navigate('/check-email');
      } else if (data.user) {
        // User is signed up and potentially logged in (if email confirmation is off)
        toast({
          title: "Registration Successful!",
          description: "Now let's complete your company profile.", // Adjusted message
        });
        // AuthContext listener will handle the session, navigate to profile creation
        navigate('/company-profile-creation');
      } else {
         throw new Error("Signup completed but no user data received.");
      }

    } catch (err: any) {
      console.error("Signup error:", err);
      // Provide more specific error messages
      if (err.message.includes("User already registered")) {
        setError('Email already registered');
      } else if (err.message.includes("Password should be at least 6 characters")) {
          setError('Password must be at least 6 characters');
      } else {
         setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-intern-light p-3 rounded-full">
              <Building className="h-8 w-8 text-intern-dark" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Company Registration</CardTitle>
          <CardDescription className="text-center">
            Create an account to post internships and find talented students
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                placeholder="Acme Inc." 
                required 
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                placeholder="Technology, Healthcare, etc." 
                required 
                value={formData.industry}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input 
                id="website" 
                type="url" 
                placeholder="https://www.example.com" 
                required 
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contact@acme.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea 
                id="companyDescription" 
                placeholder="Tell us about your company, culture, and mission..." 
                className="resize-none"
                rows={4}
                value={formData.companyDescription}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-intern-medium hover:bg-intern-dark" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-intern-dark hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CompanyRegister;
