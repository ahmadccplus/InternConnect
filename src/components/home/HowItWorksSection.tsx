
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCapIcon, BuildingIcon } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How InternConnect Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-intern-light rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <GraduationCapIcon className="text-intern-dark h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">For Students</h3>
            <ol className="space-y-4">
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                <p>Create your student profile with your skills and interests</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                <p>Browse and search for internships that match your goals</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                <p>Apply directly through our platform with your profile</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">4</span>
                <p>Track your applications and receive status updates</p>
              </li>
            </ol>
            <Button className="mt-6 w-full bg-intern-medium hover:bg-intern-dark" asChild>
              <Link to="/student-register">Start Your Journey</Link>
            </Button>
          </div>
          
          {/* For Companies */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-intern-light rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <BuildingIcon className="text-intern-dark h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">For Companies</h3>
            <ol className="space-y-4">
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                <p>Create your company profile to showcase your culture</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                <p>Post detailed internship opportunities with requirements</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                <p>Review and filter applicants through our dashboard</p>
              </li>
              <li className="flex">
                <span className="bg-intern-medium text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">4</span>
                <p>Communicate with potential interns and manage offers</p>
              </li>
            </ol>
            <Button className="mt-6 w-full bg-intern-medium hover:bg-intern-dark" asChild>
              <Link to="/company-register">Find Your Interns</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
