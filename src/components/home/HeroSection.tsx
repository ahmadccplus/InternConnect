
import React from 'react';
import ButtonLink from '@/components/common/ButtonLink';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-intern-light to-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Connect to Your <span className="text-intern-dark">Future</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          InternConnect bridges the gap between ambitious students and innovative companies,
          creating meaningful internship opportunities.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ButtonLink 
            to="/student-register" 
            className="bg-intern-medium hover:bg-intern-dark text-lg"
          >
            I'm a Student
          </ButtonLink>
          <ButtonLink 
            to="/company-register" 
            variant="outline" 
            className="border-intern-medium text-intern-dark hover:bg-intern-light text-lg"
          >
            I'm a Company
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
