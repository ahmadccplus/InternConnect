import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader2 } from 'lucide-react';

// Define the expected props, including allowedRoles
interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'company')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { profile, loading: isLoadingProfile } = useProfile();
  const location = useLocation();

  const combinedLoading = isLoadingAuth || isLoadingProfile;

  console.log(`ProtectedRoute: isLoadingAuth=${isLoadingAuth}, isLoadingProfile=${isLoadingProfile}, isAuthenticated=${isAuthenticated}, profileRole=${profile?.role}, profileCompleted=${profile?.profile_completed}`);

  if (combinedLoading) {
    console.log("ProtectedRoute: Auth or Profile loading, showing spinner.");
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-intern-dark" />
        </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated after load, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!profile) {
      console.error("ProtectedRoute: Authenticated user has no profile data. Redirecting based on assumed role...");
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile.profile_completed) {
      const creationPath = profile.role === 'student' ? '/student-profile-creation' : '/company-profile-creation';
      console.log(`ProtectedRoute: Profile incomplete, redirecting to ${creationPath}.`);
      if (location.pathname !== creationPath) { 
          return <Navigate to={creationPath} replace />;
      }
  }

  // ---- START NEW ROLE CHECK ----
  // Check role access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Determine the correct dashboard based on the user's actual role
    const correctDashboard = profile.role === 'student' ? '/student-portal' : '/company-dashboard';
    console.warn(`ProtectedRoute: Role mismatch. User role '${profile.role}' not in allowed roles [${allowedRoles.join(', ')}]. Redirecting to ${correctDashboard}.`);
    return <Navigate to={correctDashboard} replace />;
  }
  // ---- END NEW ROLE CHECK ----

  console.log("ProtectedRoute: Authenticated with complete profile and correct role (or role check not required), rendering Outlet.");
  return <Outlet />;
};

export default ProtectedRoute;
