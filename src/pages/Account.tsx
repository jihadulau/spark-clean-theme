import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, MapPin, Phone, User, LogOut, Home, Star, Receipt, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import BookingCard from '@/components/BookingCard';
import PhoneCTA from '@/components/PhoneCTA';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

interface Review {
  id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

const Account: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { bookings, loading } = useBookings({ customerId: profile?.id });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchReviews();
    }
  }, [profile?.id]);

  const fetchReviews = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const submitReview = async () => {
    if (!selectedBooking || !profile?.id) return;

    setReviewLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          booking_id: selectedBooking,
          customer_id: profile.id,
          rating,
          comment: comment.trim() || null
        }]);

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setSelectedBooking(null);
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setReviewLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate >= new Date() && booking.status !== 'completed' && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date);
    return bookingDate < new Date() || booking.status === 'completed' || booking.status === 'cancelled';
  });

  const nextBooking = upcomingBookings[0];

  const hasReviewed = (bookingId: string) => {
    return reviews.some(review => review.booking_id === bookingId);
  };

  const canReview = (booking: any) => {
    return booking.status === 'completed' && !hasReviewed(booking.id);
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

            {/* Next Booking Card */}
            {nextBooking && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                    Your Next Cleaning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(nextBooking.booking_date).toLocaleDateString('en-AU', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{nextBooking.start_time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {nextBooking.address}, {nextBooking.suburb}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(nextBooking.status)}
                          <Badge className={`ml-2 ${getStatusColor(nextBooking.status)}`}>
                            {formatStatus(nextBooking.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            ${nextBooking.total_amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Timeline */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Booking Progress</span>
                        <span>Updated: {new Date(nextBooking.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {['pending', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed'].map((status, index) => {
                          const isActive = nextBooking.status === status;
                          const isCompleted = ['pending', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed'].indexOf(nextBooking.status) > index;
                          
                          return (
                            <div key={status} className={`flex-1 h-2 rounded-full ${
                              isActive ? 'bg-primary' : isCompleted ? 'bg-primary/60' : 'bg-muted'
                            }`} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call Banner */}
            <PhoneCTA 
              variant="prominent"
              title="Need to change your booking?"
              description="Call us for reschedules, cancellations, or special requests"
            />

            {/* Bookings Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  Manage your cleaning appointments and history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                      <Receipt className="h-4 w-4 mr-1" />
                      Invoices
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      <Star className="h-4 w-4 mr-1" />
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="space-y-4">
                        <LoadingSkeleton variant="card" count={3} />
                      </div>
                    ) : upcomingBookings.length === 0 ? (
                      <EmptyState
                        icon={CalendarDays}
                        title="No upcoming bookings"
                        description="Ready to schedule your next professional cleaning service?"
                        action={{
                          label: "Call to Book Now",
                          href: "tel:0420331350"
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4 mt-6">
                    {pastBookings.length === 0 ? (
                      <EmptyState
                        icon={CalendarDays}
                        title="No past bookings"
                        description="Your completed cleaning services will appear here once you've used our services."
                      />
                    ) : (
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="relative">
                            <BookingCard booking={booking} />
                            {canReview(booking) && (
                              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-green-900">Leave a Review</h4>
                                    <p className="text-xs text-green-700">Share your experience with this service</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedBooking(booking.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    Review
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="invoices" className="space-y-4 mt-6">
                    <EmptyState
                      icon={Receipt}
                      title="Payment History"
                      description="Your invoices and payment history will be available here soon. For immediate payment inquiries, please give us a call."
                      action={{
                        label: "Contact for Payment Info",
                        href: "tel:0420331350"
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 mt-6">
                    {reviews.length === 0 ? (
                      <EmptyState
                        icon={MessageSquare}
                        title="No reviews yet"
                        description="Complete a cleaning service to leave your first review and help us improve our services."
                      />
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('en-AU')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Review Modal */}
                {selectedBooking && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                      <CardHeader>
                        <CardTitle>Leave a Review</CardTitle>
                        <CardDescription>
                          Rate your cleaning service experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comment">Comment (Optional)</Label>
                          <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience..."
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedBooking(null);
                              setRating(5);
                              setComment('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1" 
                            onClick={submitReview}
                            disabled={reviewLoading}
                          >
                            {reviewLoading ? "Submitting..." : "Submit Review"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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