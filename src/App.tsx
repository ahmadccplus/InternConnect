import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentRegister from "./pages/StudentRegister";
import CompanyRegister from "./pages/CompanyRegister";
import StudentProfileCreation from "./pages/StudentProfileCreation";
import CompanyProfileCreation from "./pages/CompanyProfileCreation";
import InternshipList from "./pages/InternshipList";
import InternshipDetail from "./pages/InternshipDetail";
import EditInternship from "./pages/EditInternship";
import CompanyDashboard from "./pages/CompanyDashboard";
import PostInternship from "./pages/PostInternship";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";
import EditProfile from "./pages/EditProfile";
import { AuthProvider } from "./contexts/AuthContext";
import { InternshipProvider } from "./contexts/InternshipContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentApplications from "./pages/StudentApplications";
import ApplyInternship from "./pages/ApplyInternship";
import CompanyApplications from "./pages/CompanyApplications";
import ApplicationDetail from "./pages/ApplicationDetail";
import StudentProfile from "./pages/StudentProfile";
import CompanyProfile from "./pages/CompanyProfile";
import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <InternshipProvider>
          <ApplicationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route element={<Layout />}>

                    {/* --- PUBLIC Routes (Accessible to Everyone) --- */}
                    {/* These routes are accessible regardless of auth state */}
                    <Route path="/" element={<Index />} />
                    <Route path="/internships" element={<InternshipList />} />
                    <Route path="/internships/:id" element={<InternshipDetail />} />
                    <Route path="/company/:id" element={<CompanyProfile />} />

                    {/* --- PUBLIC-ONLY Routes (Accessible only if NOT Authenticated) --- */}
                    {/* PublicRoute now wraps individual routes needing this logic */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/student-register" element={<PublicRoute><StudentRegister /></PublicRoute>} />
                    <Route path="/company-register" element={<PublicRoute><CompanyRegister /></PublicRoute>} />
                    {/* Profile creation might need specific logic - assuming they are public-only for now */}
                    <Route path="/student-profile-creation" element={<PublicRoute><StudentProfileCreation /></PublicRoute>} />
                    <Route path="/company-profile-creation" element={<PublicRoute><CompanyProfileCreation /></PublicRoute>} />

                    {/* --- AUTHENTICATED Routes --- */}
                    {/* --- Student Protected Routes --- */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                      <Route path="/student-portal" element={<StudentDashboard />} />
                      <Route path="/student-profile" element={<StudentProfile />} />
                      <Route path="/internships/:id/apply" element={<ApplyInternship />} />
                      <Route path="/student-applications" element={<StudentApplications />} />
                      {/* Add other student-only routes here */}
                    </Route>

                    {/* --- Company Protected Routes --- */}
                    <Route element={<ProtectedRoute allowedRoles={['company']} />}>
                      <Route path="/company-dashboard" element={<CompanyDashboard />} />
                      <Route path="/post-internship" element={<PostInternship />} />
                      <Route path="/edit-internship/:id" element={<EditInternship />} />
                      <Route path="/company-applications" element={<CompanyApplications />} /> 
                      <Route path="/internships/:id/applications" element={<CompanyApplications />} /> 
                      <Route path="/applications/:id/review" element={<ApplicationDetail />} />
                      {/* Add other company-only routes here */}
                    </Route>

                    {/* --- Shared Protected Routes (Student & Company) --- */}
                    <Route element={<ProtectedRoute allowedRoles={['student', 'company']} />}>
                      <Route path="/edit-profile" element={<EditProfile />} />
                      {/* Define route for ApplicationDetail accessible by both */}
                      <Route path="/applications/:id" element={<ApplicationDetail />} />
                      {/* Add other shared authenticated routes here */}
                    </Route>

                    {/* Catch-all 404 - Must be last */}
                    <Route path="*" element={<NotFound />} />

                  </Route>{/* End Layout Route */}
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ApplicationProvider>
        </InternshipProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
