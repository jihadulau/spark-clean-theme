import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  newBookings7d: number;
  assignedBookings: number;
  inProgressBookings: number;
  completed30d: number;
  cancellations: number;
  totalRevenue30d: number;
  averageRating: number;
  totalCustomers: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    newBookings7d: 0,
    assignedBookings: 0,
    inProgressBookings: 0,
    completed30d: 0,
    cancellations: 0,
    totalRevenue30d: 0,
    averageRating: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all bookings for calculations
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*');

      // Fetch reviews for average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (bookings) {
        const newBookings7d = bookings.filter(booking => 
          new Date(booking.created_at) >= sevenDaysAgo
        ).length;

        const assignedBookings = bookings.filter(booking => 
          booking.status === 'assigned'
        ).length;

        const inProgressBookings = bookings.filter(booking => 
          booking.status === 'in_progress'
        ).length;

        const completed30d = bookings.filter(booking => 
          booking.status === 'completed' && 
          new Date(booking.updated_at) >= thirtyDaysAgo
        ).length;

        const cancellations = bookings.filter(booking => 
          booking.status === 'cancelled'
        ).length;

        const totalRevenue30d = bookings
          .filter(booking => 
            booking.status === 'completed' && 
            new Date(booking.updated_at) >= thirtyDaysAgo
          )
          .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

        const averageRating = reviews && reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        setStats({
          newBookings7d,
          assignedBookings,
          inProgressBookings,
          completed30d,
          cancellations,
          totalRevenue30d,
          averageRating,
          totalCustomers: totalCustomers || 0,
        });
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};