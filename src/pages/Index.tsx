
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Import the extracted components
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import FeaturedInternshipsSection from '@/components/home/FeaturedInternshipsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If user is authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'student' ? '/student-portal' : '/company-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // If user is not authenticated, render the homepage content
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturedInternshipsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Index;
