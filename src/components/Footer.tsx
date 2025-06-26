import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-intern-medium to-intern-dark bg-clip-text text-transparent">
              InternConnect
            </Link>
            <p className="mt-3 text-gray-600 text-sm">
              Connecting students with meaningful internship opportunities.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">For Students</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/internships" className="text-gray-600 hover:text-intern-dark">Find Internships</Link></li>
              <li><Link to="/resources" className="text-gray-600 hover:text-intern-dark">Career Resources</Link></li>
              <li><Link to="/student-portal" className="text-gray-600 hover:text-intern-dark">Student Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">For Companies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-internship" className="text-gray-600 hover:text-intern-dark">Post Internship</Link></li>
              <li><Link to="/company-dashboard" className="text-gray-600 hover:text-intern-dark">Company Dashboard</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-intern-dark">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-intern-dark">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-intern-dark">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-intern-dark">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 InternConnect. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-intern-dark">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
