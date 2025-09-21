import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingCardProps {
  booking: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time?: string;
    status: string;
    total_amount: number;
    address: string;
    suburb: string;
    postcode: string;
    state: string;
    notes?: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    booking_items?: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      services: { 
        id: string;
        name: string; 
        description?: string;
      };
    }>;
    assignments?: Array<{
      id: string;
      cleaner_id: string;
      assigned_at: string;
      notes?: string;
      profiles: {
        first_name: string;
        last_name: string;
      };
    }>;
  };
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      assigned: 'bg-purple-100 text-purple-800 border-purple-200',
      en_route: 'bg-orange-100 text-orange-800 border-orange-200',
      in_progress: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {new Date(booking.booking_date).toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {booking.start_time} {booking.end_time && `- ${booking.end_time}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {booking.address}, {booking.suburb}, {booking.state} {booking.postcode}
            </span>
          </div>
        </div>
        
        <div className="flex items-center ml-4">
          {getStatusIcon(booking.status)}
          <Badge className={`ml-2 ${getStatusColor(booking.status)}`}>
            {formatStatus(booking.status)}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Services:</h4>
        <div className="space-y-1">
          {booking.booking_items?.map((item, index) => (
            <div key={index} className="text-sm text-muted-foreground flex justify-between">
              <span>
                {item.services?.name} {item.quantity > 1 && `(${item.quantity}x)`}
              </span>
              <span className="font-medium">
                ${item.total_price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {booking.assignments && booking.assignments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Assigned Cleaner:</h4>
          <div className="text-sm text-muted-foreground">
            {booking.assignments[0].profiles.first_name} {booking.assignments[0].profiles.last_name}
          </div>
        </div>
      )}

      {booking.admin_notes && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Notes:</h4>
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {booking.admin_notes}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-semibold text-primary">
          ${booking.total_amount.toFixed(2)} AUD
        </span>
        <div className="text-sm text-muted-foreground">
          #{booking.id.slice(0, 8)}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;