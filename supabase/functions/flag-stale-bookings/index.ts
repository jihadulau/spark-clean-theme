import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log('Starting stale booking cleanup job...');

    // Find bookings that have been pending for more than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: staleBookings, error: selectError } = await supabase
      .from('bookings')
      .select('id, customer_id, profiles!bookings_customer_id_fkey(email, first_name)')
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (selectError) {
      throw selectError;
    }

    if (!staleBookings || staleBookings.length === 0) {
      console.log('No stale bookings found');
      return new Response(JSON.stringify({ 
        message: 'No stale bookings found',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${staleBookings.length} stale bookings`);

    // Add audit log entries for each stale booking
    const auditEntries = staleBookings.map(booking => ({
      table_name: 'bookings',
      record_id: booking.id,
      action: 'STALE_FLAGGED',
      new_values: { flagged_stale: true, flagged_at: new Date().toISOString() },
      changed_by: null, // System action
      notes: `Booking flagged as stale after 24 hours in pending status`
    }));

    const { error: auditError } = await supabase
      .from('audit_log')
      .insert(auditEntries);

    if (auditError) {
      console.error('Error logging audit entries:', auditError);
    }

    // Send notifications to admin about stale bookings
    for (const booking of staleBookings) {
      try {
        await supabase.functions.invoke('enhanced-send-email', {
          body: {
            to: 'admin@cleandigo.com.au',
            subject: `Stale Booking Alert - Customer: ${booking.profiles?.first_name}`,
            html: `
              <h2>Stale Booking Alert</h2>
              <p>The following booking has been pending for over 24 hours:</p>
              <ul>
                <li><strong>Booking ID:</strong> ${booking.id}</li>
                <li><strong>Customer:</strong> ${booking.profiles?.first_name} (${booking.profiles?.email})</li>
                <li><strong>Status:</strong> Pending for over 24 hours</li>
              </ul>
              <p>Please review and contact the customer to confirm or update the booking status.</p>
            `,
            type: 'booking_stale',
            idempotencyKey: `stale-${booking.id}-${new Date().toDateString()}`
          }
        });
      } catch (emailError) {
        console.error(`Failed to send stale notification for booking ${booking.id}:`, emailError);
      }
    }

    const result = {
      message: 'Stale booking cleanup completed',
      processed: staleBookings.length,
      bookingIds: staleBookings.map(b => b.id),
      timestamp: new Date().toISOString()
    };

    console.log('Stale booking cleanup completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in stale booking cleanup:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString() 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// This function is designed to be called by a cron job
// Example cron schedule: "0 9 * * *" (daily at 9 AM)
serve(handler);