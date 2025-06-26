
import React from 'react';
import { BriefcaseIcon, Building, GraduationCap } from 'lucide-react';
import CountingAnimation from '@/components/animations/CountingAnimation';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, suffix = "+" }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-intern-light p-3 rounded-full mb-4">
        {icon}
      </div>
      <p className="text-4xl font-bold text-intern-dark mb-2">
        <CountingAnimation endValue={value} suffix={suffix} />
      </p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: <BriefcaseIcon className="h-6 w-6 text-intern-dark" />,
      value: 1000,
      label: "Active Internships"
    },
    {
      icon: <Building className="h-6 w-6 text-intern-dark" />,
      value: 500,
      label: "Partner Companies"
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-intern-dark" />,
      value: 10000,
      label: "Student Success Stories"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
