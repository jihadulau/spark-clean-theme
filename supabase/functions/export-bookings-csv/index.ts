import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  start_date: string;
  end_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user is an admin
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Insufficient permissions - admin access required');
    }

    const { start_date, end_date }: ExportRequest = await req.json();

    // Fetch bookings data with related information
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:customer_id (first_name, last_name, email, phone),
        booking_items (
          quantity,
          unit_price,
          total_price,
          services (name)
        ),
        assignments (
          profiles:cleaner_id (first_name, last_name)
        ),
        payments (amount, payment_status, payment_date)
      `)
      .gte('booking_date', start_date)
      .lte('booking_date', end_date)
      .order('booking_date', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Convert to CSV format
    const csvHeaders = [
      'Booking ID',
      'Date',
      'Time',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Address',
      'Services',
      'Total Amount (AUD)',
      'Status',
      'Assigned Cleaner',
      'Payment Status',
      'Created At'
    ].join(',');

    const csvRows = bookings.map(booking => {
      const customer = booking.profiles;
      const services = booking.booking_items
        ?.map((item: any) => `${item.services?.name} (${item.quantity})`)
        .join('; ') || '';
      const cleaner = booking.assignments?.[0]?.profiles ? 
        `${booking.assignments[0].profiles.first_name} ${booking.assignments[0].profiles.last_name}` : 
        'Not assigned';
      const paymentStatus = booking.payments?.[0]?.payment_status || 'Pending';

      return [
        booking.id,
        booking.booking_date,
        booking.start_time,
        `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
        customer?.email || '',
        customer?.phone || '',
        `${booking.address}, ${booking.suburb}, ${booking.state} ${booking.postcode}`,
        `"${services}"`, // Wrap in quotes for CSV safety
        booking.total_amount,
        booking.status,
        cleaner,
        paymentStatus,
        booking.created_at
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    console.log(`Generated CSV export for ${bookings.length} bookings from ${start_date} to ${end_date}`);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cleandigo-bookings-${start_date}-to-${end_date}.csv"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error exporting bookings CSV:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);