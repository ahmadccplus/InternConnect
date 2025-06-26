
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';

interface ButtonLinkProps extends ButtonProps {
  to: string;
  children: React.ReactNode;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ 
  to, 
  children, 
  className = '', 
  variant = 'default', 
  size = 'lg',
  ...props 
}) => {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      asChild 
      {...props}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
};

export default ButtonLink;
