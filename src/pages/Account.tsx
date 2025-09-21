import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, MapPin, Phone, User, LogOut, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  status: string;
  total_amount: number;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  booking_items: Array<{
    quantity: number;
    services: { name: string };
  }>;
}

const Account: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_items (
            quantity,
            services (name)
          )
        `)
        .order('booking_date', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch your bookings.",
          variant: "destructive",
        });
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

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

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Back to Home</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {profile?.first_name}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your cleaning bookings and account details
              </p>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Need to make changes to your bookings? Give us a call!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1">
                    <a href="tel:+61234567890" className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Call to Book: (02) 3456 7890
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/#contact" className="flex items-center justify-center">
                      Get Quote Online
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> To reschedule or cancel your booking, please call us at{" "}
                    <a href="tel:+61234567890" className="text-primary font-medium hover:underline">
                      (02) 3456 7890
                    </a>
                    . Our team will be happy to assist you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  Track the status of your cleaning appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Ready to get your space cleaned? Contact us to book your first cleaning service.
                    </p>
                    <Button asChild>
                      <a href="tel:+61234567890">
                        <Phone className="h-4 w-4 mr-2" />
                        Call to Book Now
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
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
                                {booking.start_time}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">
                                {booking.address}, {booking.suburb}, {booking.state} {booking.postcode}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {formatStatus(booking.status)}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Services:</h4>
                          <div className="space-y-1">
                            {booking.booking_items?.map((item, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                {item.services?.name} {item.quantity > 1 && `(${item.quantity}x)`}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-semibold">
                            ${booking.total_amount.toFixed(2)} AUD
                          </span>
                          <div className="text-sm text-muted-foreground">
                            Booking #{booking.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Account;