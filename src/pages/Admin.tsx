import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, DollarSign, Download, LogOut, Home, Phone, Edit, Plus } from 'lucide-react';
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
  notes?: string;
  admin_notes?: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  booking_items: Array<{
    quantity: number;
    services: { name: string };
  }>;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  todayBookings: number;
}

const Admin: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, pendingBookings: 0, totalRevenue: 0, todayBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:customer_id (first_name, last_name, email, phone),
          booking_items (
            quantity,
            services (name)
          )
        `)
        .order('booking_date', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch bookings.",
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

  const fetchStats = async () => {
    try {
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('status, total_amount, booking_date');

      if (allBookings) {
        const today = new Date().toISOString().split('T')[0];
        const stats = {
          totalBookings: allBookings.length,
          pendingBookings: allBookings.filter(b => b.status === 'pending').length,
          totalRevenue: allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
          todayBookings: allBookings.filter(b => b.booking_date === today).length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateBookingStatus = async () => {
    if (!selectedBooking || !statusUpdate || !profile?.id) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: statusUpdate as any,
          admin_notes: adminNotes 
        })
        .eq('id', selectedBooking.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update booking status.",
          variant: "destructive",
        });
        return;
      }

      // Add to status history
      await supabase
        .from('booking_status_history')
        .insert([{
          booking_id: selectedBooking.id,
          old_status: selectedBooking.status as any,
          new_status: statusUpdate as any,
          changed_by: profile.id,
          notes: adminNotes || `Status changed from ${selectedBooking.status} to ${statusUpdate}`
        }]);

      toast({
        title: "Success",
        description: "Booking status updated successfully.",
      });

      fetchBookings();
      setSelectedBooking(null);
      setStatusUpdate('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const exportBookingsCSV = async () => {
    setExportLoading(true);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
      const endDate = new Date();

      const { data, error } = await supabase.functions.invoke('export-bookings-csv', {
        body: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      if (error) {
        throw error;
      }

      // Create and download CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cleandigo-bookings-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Bookings exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export bookings.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
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
    <AuthGuard requireAuth={true} requiredRole="admin">
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
                <Badge variant="secondary">Admin</Badge>
                <span className="font-medium">
                  {profile?.first_name} {profile?.last_name}
                </span>
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
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage bookings and business operations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <CalendarDays className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <CalendarDays className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">{stats.todayBookings}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={exportBookingsCSV} disabled={exportLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    {exportLoading ? "Exporting..." : "Export Bookings CSV"}
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="tel:+61234567890">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Management */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings Management</CardTitle>
                <CardDescription>
                  View and manage all customer bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-medium">
                                  {booking.profiles.first_name} {booking.profiles.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {booking.profiles.email}
                                </p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {formatStatus(booking.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Date & Time:</span>
                                <p className="text-muted-foreground">
                                  {new Date(booking.booking_date).toLocaleDateString('en-AU')} at {booking.start_time}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Address:</span>
                                <p className="text-muted-foreground">
                                  {booking.address}, {booking.suburb}, {booking.state} {booking.postcode}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Total:</span>
                                <p className="text-muted-foreground font-semibold">
                                  ${booking.total_amount.toFixed(2)} AUD
                                </p>
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-sm">Services:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {booking.booking_items?.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {item.services?.name} {item.quantity > 1 && `(${item.quantity}x)`}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {booking.admin_notes && (
                              <div>
                                <span className="font-medium text-sm">Admin Notes:</span>
                                <p className="text-sm text-muted-foreground mt-1">{booking.admin_notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setStatusUpdate(booking.status);
                                    setAdminNotes(booking.admin_notes || '');
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Booking Status</DialogTitle>
                                  <DialogDescription>
                                    Change the status and add notes for booking #{booking.id.slice(0, 8)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
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
                                    <Label htmlFor="notes">Admin Notes</Label>
                                    <Textarea
                                      id="notes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add any notes about this booking..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={updateBookingStatus}>
                                      Update Booking
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${booking.profiles.phone || booking.profiles.email}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {bookings.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground">
                          Bookings will appear here once customers start booking services.
                        </p>
                      </div>
                    )}
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

export default Admin;