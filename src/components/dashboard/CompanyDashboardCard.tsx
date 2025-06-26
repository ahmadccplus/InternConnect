
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface CompanyDashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
}

const CompanyDashboardCard = ({ 
  title, 
  value, 
  description, 
  icon,
  action
}: CompanyDashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {action && (
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-xs text-intern-medium" 
            onClick={action.onClick}
          >
            {action.text}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyDashboardCard;
