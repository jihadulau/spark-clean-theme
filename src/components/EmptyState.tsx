import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="text-center py-12 px-4">
      <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
      <h3 className="text-xl font-semibold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <>
          {action.href ? (
            <Button asChild>
              <a href={action.href}>
                {action.label}
              </a>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;