
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Former Marketing Intern",
      company: "Brand Solutions",
      quote: "InternConnect helped me land my dream internship, which eventually turned into a full-time position!",
    },
    {
      name: "Sarah Chen",
      role: "Tech Recruiter",
      company: "TechCorp Inc.",
      quote: "We've found amazing talent through this platform. The quality of applicants has exceeded our expectations.",
    },
    {
      name: "Michael Rodriguez",
      role: "Former Design Intern",
      company: "Creative Studio",
      quote: "The application process was seamless, and I received updates every step of the way.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="pt-6">
                <div className="h-32">
                  <p className="italic text-gray-600">"{testimonial.quote}"</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
