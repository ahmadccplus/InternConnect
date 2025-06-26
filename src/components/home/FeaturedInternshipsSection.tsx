
import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FeaturedInternshipsSection: React.FC = () => {
  const featuredInternships = [
    {
      title: "Software Engineering Intern",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
    },
    {
      title: "Marketing Coordinator",
      company: "Brand Solutions",
      location: "New York, NY",
      type: "Part-time",
    },
    {
      title: "UX/UI Design Intern",
      company: "Creative Studio",
      location: "Remote",
      type: "Full-time",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Internships</h2>
          <Link to="/internships" className="text-intern-dark hover:underline flex items-center">
            View All <SearchIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredInternships.map((job, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span className="mx-2">•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <div className="bg-intern-light p-2 rounded">
                    <BriefcaseIcon className="h-5 w-5 text-intern-dark" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="text-intern-dark border-intern" asChild>
                    <Link to={`/internships/${index}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInternshipsSection;
