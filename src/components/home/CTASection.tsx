
import React from 'react';
import ButtonLink from '@/components/common/ButtonLink';

const CTASection: React.FC = () => {
  return (
    <section className="py-16 bg-intern-dark text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Whether you're a student looking for experience or a company searching for fresh talent,
          InternConnect is your platform for success.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonLink 
            to="/student-register" 
            variant="default" 
            className="bg-white text-intern-dark hover:bg-gray-100"
          >
            Join as Student
          </ButtonLink>
          <ButtonLink 
            to="/company-register" 
            variant="outline" 
            className="border-white text-white hover:bg-intern-dark/50"
          >
            Join as Company
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
