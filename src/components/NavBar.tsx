import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { profile } = useProfile();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    return profile?.role === 'student' ? '/student-portal' : '/company-dashboard';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-intern-medium to-intern-dark bg-clip-text text-transparent">
              InternConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/internships" className="text-gray-700 hover:text-intern-dark transition">
              Internships
            </Link>
            
            {isAuthenticated && profile ? (
              <div className="flex items-center space-x-4">
                {profile.role === 'student' && (
                  <Link 
                    to="/student-profile"
                    className="text-gray-700 hover:text-intern-dark transition"
                  >
                    My Profile
                  </Link>
                )}
                <Link 
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-intern-dark transition flex items-center"
                >
                  <User className="h-4 w-4 mr-1" />
                  {profile.role === 'student' 
                    ? profile.full_name
                    : profile.company_name}
                </Link>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-intern-medium hover:bg-intern-dark" asChild>
                  <Link to="/student-register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-intern-dark focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <Link 
              to="/internships" 
              className="block py-2 text-gray-700 hover:text-intern-dark"
              onClick={() => setIsMenuOpen(false)}
            >
              Internships
            </Link>
            
            {isAuthenticated && profile ? (
              <>
                {profile.role === 'student' && (
                  <Link 
                    to="/student-profile"
                    className="block py-2 text-gray-700 hover:text-intern-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
                <Link 
                  to={getDashboardLink()}
                  className="block py-2 text-gray-700 hover:text-intern-dark flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-1" />
                  {profile.role === 'student' 
                    ? profile.full_name
                    : profile.company_name}
                </Link>
                <Button 
                  variant="outline" 
                  className="flex items-center mt-2"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex space-x-2 mt-3">
                <Button variant="outline" asChild className="w-1/2" onClick={() => setIsMenuOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-intern-medium hover:bg-intern-dark w-1/2" asChild onClick={() => setIsMenuOpen(false)}>
                  <Link to="/student-register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
