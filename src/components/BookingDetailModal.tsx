import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PhotoUpload } from './PhotoUpload';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  FileText,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  open,
  onOpenChange,
  onUpdate
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [statusUpdate, setStatusUpdate] = useState(booking?.status || '');
  const [adminNotes, setAdminNotes] = useState(booking?.admin_notes || '');
  const [loading, setLoading] = useState(false);
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    if (booking) {
      setStatusUpdate(booking.status);
      setAdminNotes(booking.admin_notes || '');
    }
  }, [booking]);

  useEffect(() => {
    fetchCleaners();
  }, []);

  const fetchCleaners = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'cleaner');
      
      setCleaners(data || []);
    } catch (error) {
      console.error('Error fetching cleaners:', error);
    }
  };

  const updateBookingStatus = async () => {
    if (!booking || !profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: statusUpdate as any,
          admin_notes: adminNotes 
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('booking_status_history')
        .insert([{
          booking_id: booking.id,
          old_status: booking.status as any,
          new_status: statusUpdate as any,
          changed_by: profile.id,
          notes: adminNotes || `Status changed from ${booking.status} to ${statusUpdate}`
        }]);

      toast({
        title: "Success",
        description: "Booking updated successfully.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignCleaner = async () => {
    if (!booking || !selectedCleaner || !profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assignments')
        .insert([{
          booking_id: booking.id,
          cleaner_id: selectedCleaner,
          assigned_by: profile.id,
          notes: assignmentNotes
        }]);

      if (error) throw error;

      // Update booking status to assigned if it's confirmed
      if (booking.status === 'confirmed') {
        await supabase
          .from('bookings')
          .update({ status: 'assigned' })
          .eq('id', booking.id);
      }

      toast({
        title: "Success",
        description: "Cleaner assigned successfully.",
      });

      setSelectedCleaner('');
      setAssignmentNotes('');
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markRescheduledByPhone = async () => {
    if (!booking || !profile?.id) return;

    setLoading(true);
    try {
      const rescheduledNote = `Rescheduled by phone on ${new Date().toLocaleDateString('en-AU')}. ${adminNotes}`;
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          admin_notes: rescheduledNote
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Add to status history
      await supabase
        .from('booking_status_history')
        .insert([{
          booking_id: booking.id,
          old_status: booking.status as any,
          new_status: booking.status as any,
          changed_by: profile.id,
          notes: 'Booking rescheduled by phone'
        }]);

      toast({
        title: "Success",
        description: "Booking marked as rescheduled by phone.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
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

  if (!booking) return null;

  const customer = booking.profiles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Booking Details #{booking.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Comprehensive booking information and management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Status & Quick Actions */}
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 px-3 py-1`}>
              {getStatusIcon(booking.status)}
              {booking.status.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Badge>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markRescheduledByPhone}
                disabled={loading}
              >
                Mark Rescheduled (by phone)
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Booking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {new Date(booking.booking_date).toLocaleDateString('en-AU')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {booking.start_time} {booking.end_time && `- ${booking.end_time}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {booking.booking_items?.[0]?.services?.duration_hours || 2} hours
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Amount:</span>
                      <span className="font-bold text-lg text-green-600">
                        ${booking.total_amount.toFixed(2)} AUD
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Service Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{booking.address}</p>
                    <p className="text-muted-foreground">
                      {booking.suburb}, {booking.state} {booking.postcode}
                    </p>
                    {booking.notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-1">Customer Notes:</p>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Requested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {booking.booking_items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.services?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-medium">${item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="en_route">En Route</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this booking..."
                    />
                  </div>
                  <Button onClick={updateBookingStatus} disabled={loading}>
                    {loading ? "Updating..." : "Update Booking"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{customer?.first_name} {customer?.last_name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${customer?.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {customer?.email}
                        </a>
                      </div>
                    </div>
                    {customer?.phone && (
                      <div>
                        <Label>Phone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${customer.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {customer.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Cleaner Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.assignments?.length > 0 ? (
                    <div className="space-y-2">
                      {booking.assignments.map((assignment: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium">
                            {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assigned: {new Date(assignment.assigned_at).toLocaleDateString('en-AU')}
                          </p>
                          {assignment.notes && (
                            <p className="text-sm mt-1">{assignment.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">No cleaner assigned yet.</p>
                      <div className="space-y-2">
                        <Label htmlFor="cleaner">Assign Cleaner</Label>
                        <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cleaner" />
                          </SelectTrigger>
                          <SelectContent>
                            {cleaners.map((cleaner) => (
                              <SelectItem key={cleaner.id} value={cleaner.id}>
                                {cleaner.first_name} {cleaner.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assignment-notes">Assignment Notes</Label>
                        <Textarea
                          id="assignment-notes"
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                          placeholder="Add notes for the assigned cleaner..."
                        />
                      </div>
                      <Button 
                        onClick={assignCleaner} 
                        disabled={!selectedCleaner || loading}
                      >
                        Assign Cleaner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.payments?.length > 0 ? (
                    <div className="space-y-2">
                      {booking.payments.map((payment: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">${payment.amount.toFixed(2)} AUD</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_method} • {payment.payment_status}
                              </p>
                              {payment.payment_date && (
                                <p className="text-sm text-muted-foreground">
                                  Paid: {new Date(payment.payment_date).toLocaleDateString('en-AU')}
                                </p>
                              )}
                            </div>
                            <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                              {payment.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No payment information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Booking Photos
                  </CardTitle>
                  <CardDescription>
                    Before and after photos for this booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoUpload bookingId={booking.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};