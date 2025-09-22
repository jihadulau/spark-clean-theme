import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
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
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
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
  payments?: Array<{
    id: string;
    amount: number;
    payment_method?: string;
    payment_status: string;
    payment_date?: string;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    created_at: string;
  }>;
}

export const useBookings = (filters?: { status?: string; customerId?: string }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {

    try {
      setLoading(true);
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_customer_id_fkey (first_name, last_name, email, phone),
          booking_items (
            id,
            quantity,
            unit_price,
            total_price,
            services (id, name, description)
          ),
          assignments (
            id,
            cleaner_id,
            assigned_at,
            notes,
            profiles!assignments_cleaner_id_fkey (first_name, last_name)
          ),
          payments (
            id,
            amount,
            payment_method,
            payment_status,
            payment_date
          ),
          reviews (
            id,
            rating,
            comment,
            created_at
          )
        `)
        .order('booking_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data as Booking[] || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters?.status, filters?.customerId]);

  // Set up real-time subscription
  useEffect(() => {

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  };
};

export const useBookingById = (id: string) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles!bookings_customer_id_fkey (first_name, last_name, email, phone),
            booking_items (
              id,
              quantity,
              unit_price,
              total_price,
              services (id, name, description)
            ),
            assignments (
              id,
              cleaner_id,
              assigned_at,
              notes,
              profiles!assignments_cleaner_id_fkey (first_name, last_name)
            ),
            payments (
              id,
              amount,
              payment_method,
              payment_status,
              payment_date
            ),
            reviews (
              id,
              rating,
              comment,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setBooking(data as Booking);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  return { booking, loading, error };
};