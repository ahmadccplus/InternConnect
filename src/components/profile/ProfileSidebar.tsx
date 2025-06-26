import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, MapPin, Mail, GraduationCap, Edit } from 'lucide-react';
import { SupabaseProfile as Profile } from '@/contexts/ProfileContext';

interface ProfileSidebarProps {
  profile: Profile | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  if (!profile) return null;

  const getInitials = () => {
    if (profile.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col items-center mb-6">
        <Avatar className="h-24 w-24 bg-intern-light text-intern-dark mb-4">
          <AvatarFallback className="text-2xl font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{profile.full_name || 'Name not set'}</h2>
        <p className="text-gray-600">{profile.major || 'Major not set'} Student</p>
      </div>
      
      <div className="space-y-4 mb-6">
        {/* REMOVE EMAIL DISPLAY */}
        {/* {profile.email && (
          <div className="flex items-center text-gray-700">
            <Mail className="h-4 w-4 mr-2" />
            <p>{profile.email}</p>
          </div>
        )} */}
        
        {profile.university && (
          <div className="flex items-center text-gray-700">
            <GraduationCap className="h-4 w-4 mr-2" />
            <p>{profile.university}</p>
          </div>
        )}
        
        {profile.location && (
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-2" />
            <p>{profile.location}</p>
          </div>
        )}
        
        {profile.graduation_year && (
          <div className="flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2" />
            <p>Graduation: {profile.graduation_year}</p>
          </div>
        )}
      </div>
      
      <Button asChild variant="outline" className="w-full">
        <Link to="/edit-profile" className="flex items-center justify-center">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Link>
      </Button>
    </div>
  );
};

export default ProfileSidebar;
