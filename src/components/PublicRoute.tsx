import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader2 } from 'lucide-react';

// Define the expected props, allow children
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { profile, loading: isLoadingProfile } = useProfile();
  const location = useLocation();

  const combinedLoading = isLoadingAuth || isLoadingProfile;

  console.log(`PublicRoute: isLoadingAuth=${isLoadingAuth}, isLoadingProfile=${isLoadingProfile}, isAuthenticated=${isAuthenticated}, profileRole=${profile?.role}, profileCompleted=${profile?.profile_completed}`);

  if (combinedLoading) {
    console.log("PublicRoute: Auth or Profile loading, showing placeholder.");
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
        </div>
    );
  }

  // *** RESTORE ORIGINAL REDIRECT LOGIC ***
  if (isAuthenticated && profile?.profile_completed) {
    const dashboardPath = profile.role === 'student' ? '/student-portal' : '/company-dashboard';
    console.log(`PublicRoute: Authenticated with COMPLETE profile, redirecting to ${dashboardPath}.`);
    return <Navigate to={dashboardPath} replace />;
  }

  else if (isAuthenticated && profile && !profile.profile_completed) {
    const creationPath = profile.role === 'student' ? '/student-profile-creation' : '/company-profile-creation';
    console.log(`PublicRoute: Authenticated but profile incomplete, redirecting to ${creationPath}.`);
    if (location.pathname !== creationPath) { 
        return <Navigate to={creationPath} replace />;
    }
  }

  // *** Render children if not redirecting ***
  console.log("PublicRoute: Rendering children.");
  return <>{children}</>; 
};

export default PublicRoute;