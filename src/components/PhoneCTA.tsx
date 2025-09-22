import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PhoneCTAProps {
  title?: string;
  description?: string;
  phoneNumber?: string;
  variant?: 'default' | 'prominent' | 'inline';
  className?: string;
}

const PhoneCTA: React.FC<PhoneCTAProps> = ({
  title = "Need to change your booking?",
  description = "Call us for reschedules, cancellations, or special requests",
  phoneNumber = "0420331350",
  variant = 'default',
  className = ''
}) => {
  const formatPhoneForDisplay = (phone: string) => {
    // Format 0420331350 as 0420 331 350
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const formatPhoneForTel = (phone: string) => {
    // Ensure it starts with +61 for international format
    if (phone.startsWith('0')) {
      return `+61${phone.substring(1)}`;
    }
    return phone;
  };

  if (variant === 'inline') {
    return (
      <Button 
        asChild 
        size="sm" 
        className={`bg-orange-600 hover:bg-orange-700 ${className}`}
      >
        <a href={`tel:${formatPhoneForTel(phoneNumber)}`} className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          Call Now
        </a>
      </Button>
    );
  }

  if (variant === 'prominent') {
    return (
      <Card className={`bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center text-center sm:text-left">
              <Phone className="h-8 w-8 text-orange-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900">{title}</h3>
                <p className="text-sm text-orange-700">{description}</p>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
            >
              <a href={`tel:${formatPhoneForTel(phoneNumber)}`} className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {formatPhoneForDisplay(phoneNumber)}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-4 text-center sm:text-left">
        <Phone className="h-6 w-6 text-orange-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900">{title}</p>
          <p className="text-xs text-orange-700">{description}</p>
        </div>
        <Button 
          asChild 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
        >
          <a href={`tel:${formatPhoneForTel(phoneNumber)}`} className="flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            Call
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PhoneCTA;