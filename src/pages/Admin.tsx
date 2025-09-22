import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, DollarSign, Download, LogOut, Home, Phone, Edit, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useBookings } from '@/hooks/useBookings';
import { BookingDetailModal } from '@/components/BookingDetailModal';
import { NewBookingModal } from '@/components/NewBookingModal';
import { ServicesManagement } from '@/components/ServicesManagement';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';

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
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { bookings, loading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loading = statsLoading || bookingsLoading;

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const openBookingDetail = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleBookingUpdate = () => {
    refetchBookings();
    refetchStats();
  };


  const exportBookingsCSV = async () => {
    setExportLoading(true);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
      const endDate = new Date();

      const { data, error } = await supabase.functions.invoke('enhanced-export-bookings', {
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

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">New (7d)</p>
                    <p className="text-2xl font-bold">{stats.newBookings7d}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                    <p className="text-2xl font-bold">{stats.assignedBookings}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgressBookings}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Revenue (30d)</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue30d.toFixed(0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <CalendarDays className="h-8 w-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Completed (30d)</p>
                    <p className="text-2xl font-bold">{stats.completed30d}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}★</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Management Tabs */}
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Bookings Management</CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsNewBookingModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Booking
                        </Button>
                        <Button variant="outline" onClick={exportBookingsCSV} disabled={exportLoading}>
                          <Download className="h-4 w-4 mr-2" />
                          {exportLoading ? "Exporting..." : "Export CSV"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Status Filter */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-sm font-medium">Filter by status:</span>
                      <div className="flex gap-2">
                        {['all', 'pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => setStatusFilter(status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Bookings List */}
                    {loading ? (
                      <LoadingSkeleton />
                    ) : filteredBookings.length === 0 ? (
                      <EmptyState 
                        title="No bookings found"
                        description={statusFilter === 'all' ? "No bookings have been created yet." : `No bookings with status "${statusFilter}".`}
                        action={
                          <Button onClick={() => setIsNewBookingModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Booking
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h4 className="font-medium">
                                      {booking.profiles?.first_name} {booking.profiles?.last_name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.profiles?.email}
                                    </p>
                                  </div>
                                  <Badge className={`${getStatusColor(booking.status)} border`}>
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
                                    {booking.booking_items?.map((item: any, index: number) => (
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
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openBookingDetail(booking)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {booking.profiles?.phone && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    asChild
                                  >
                                    <a href={`tel:${booking.profiles.phone}`}>
                                      <Phone className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <ServicesManagement />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatic email notifications for booking updates
                          </p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Send SMS updates to customers
                          </p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Automated Assignments</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically assign cleaners based on availability
                          </p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Modals */}
            <BookingDetailModal
              booking={selectedBooking}
              open={isDetailModalOpen}
              onOpenChange={setIsDetailModalOpen}
              onUpdate={handleBookingUpdate}
            />

            <NewBookingModal
              open={isNewBookingModalOpen}
              onOpenChange={setIsNewBookingModalOpen}
              onSuccess={handleBookingUpdate}
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