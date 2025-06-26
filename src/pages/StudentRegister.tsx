import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../supabaseClient'; // Import Supabase client

type StudentFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  university: string;
};

const StudentRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => { // Make async
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Supabase auth enforces password length, no need for manual check unless you want stricter rules
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
            // Pass additional data to be used for profile creation (e.g., by a trigger)
            role: 'student',
            full_name: `${formData.firstName} ${formData.lastName}`,
            // You might store university in the profile table too
            // university: formData.university, 
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
          variant: "default", // Or appropriate variant
        });
         // Optional: navigate to a page telling them to check email
         // navigate('/check-email'); 
      } else if (data.user) {
        // User is signed up and potentially logged in (if email confirmation is off)
        toast({
          title: "Registration Successful!",
          description: "Now let's complete your student profile.", // Adjusted message
        });
        // AuthContext listener will handle the session, navigate to profile creation
        navigate('/student-profile-creation');
      } else {
         // Handle unexpected cases, though signUp should usually return a user or an error
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
              <GraduationCap className="h-8 w-8 text-intern-dark" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
          <CardDescription className="text-center">
            Create an account to search and apply for internships
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@university.edu" 
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University/College</Label>
              <Input 
                id="university" 
                placeholder="University of Technology" 
                required 
                value={formData.university}
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

export default StudentRegister;
