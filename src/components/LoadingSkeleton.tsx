import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'table-row';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  variant = 'card', 
  count = 1 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className={`animate-pulse ${className}`}>
      {variant === 'card' && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-muted rounded-full w-20"></div>
          </div>
          <div className="border-t pt-3">
            <div className="h-3 bg-muted rounded w-1/3 mb-2"></div>
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted rounded w-4/5"></div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </div>
      )}

      {variant === 'text' && (
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
          <div className="h-4 bg-muted rounded w-3/5"></div>
        </div>
      )}

      {variant === 'avatar' && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="space-y-1 flex-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      )}

      {variant === 'table-row' && (
        <div className="grid grid-cols-5 gap-4 py-3 border-b">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
        </div>
      )}
    </div>
  ));

  return count === 1 ? skeletons[0] : <>{skeletons}</>;
};

export default LoadingSkeleton;