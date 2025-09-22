import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  start_date?: string;
  end_date?: string;
  status?: string[];
  postcode?: string;
  page?: number;
  limit?: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

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

    const params: ExportRequest = await req.json();
    const {
      start_date,
      end_date,
      status,
      postcode,
      page = 1,
      limit = 1000
    } = params;

    console.log('Export request:', params);

    // Build query with filters
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_customer_id_fkey (first_name, last_name, email, phone),
        booking_items (
          quantity,
          unit_price,
          total_price,
          services (name)
        ),
        assignments (
          profiles!assignments_cleaner_id_fkey (first_name, last_name)
        ),
        payments (amount, payment_status, payment_date, invoice_number)
      `)
      .order('booking_date', { ascending: true });

    // Apply filters
    if (start_date) {
      query = query.gte('booking_date', start_date);
    }
    
    if (end_date) {
      query = query.lte('booking_date', end_date);
    }

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    if (postcode) {
      query = query.eq('postcode', postcode);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Generate CSV headers
    const csvHeaders = [
      'Booking ID',
      'Date',
      'Start Time',
      'End Time',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Address',
      'Suburb',
      'Postcode',
      'State',
      'Services',
      'Total Amount (AUD)',
      'Status',
      'Assigned Cleaner',
      'Payment Status',
      'Invoice Number',
      'Created At',
      'Updated At',
      'Notes',
      'Admin Notes'
    ].join(',');

    // Generate CSV rows
    const csvRows = (bookings || []).map(booking => {
      const customer = booking.profiles;
      const services = booking.booking_items
        ?.map((item: any) => `${item.services?.name} (${item.quantity}x @ $${item.unit_price})`)
        .join('; ') || '';
      const cleaner = booking.assignments?.[0]?.profiles ? 
        `${booking.assignments[0].profiles.first_name} ${booking.assignments[0].profiles.last_name}` : 
        'Not assigned';
      const payment = booking.payments?.[0];

      // Escape quotes and commas for CSV
      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        booking.id,
        booking.booking_date,
        booking.start_time,
        booking.end_time || '',
        `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
        customer?.email || '',
        customer?.phone || '',
        booking.address,
        booking.suburb,
        booking.postcode,
        booking.state,
        escapeCSV(services),
        booking.total_amount,
        booking.status,
        cleaner,
        payment?.payment_status || 'Pending',
        payment?.invoice_number || '',
        booking.created_at,
        booking.updated_at,
        escapeCSV(booking.notes || ''),
        escapeCSV(booking.admin_notes || '')
      ].map(escapeCSV).join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    const filterSummary = [
      start_date && `from ${start_date}`,
      end_date && `to ${end_date}`,
      status?.length && `status: ${status.join(', ')}`,
      postcode && `postcode: ${postcode}`
    ].filter(Boolean).join(', ');

    const filename = `cleandigo-bookings-${start_date || 'all'}-to-${end_date || 'all'}-page-${page}.csv`;
    
    console.log(`Generated CSV export: ${(bookings || []).length} bookings, ${filterSummary || 'no filters'}`);

    // Add export audit log
    await supabase.from('audit_log').insert({
      table_name: 'bookings',
      record_id: null,
      action: 'CSV_EXPORT',
      new_values: {
        filters: { start_date, end_date, status, postcode, page, limit },
        record_count: bookings?.length || 0,
        exported_by: user.id
      },
      changed_by: user.id
    });

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Total-Count': count?.toString() || '0',
        'X-Page': page.toString(),
        'X-Limit': limit.toString(),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error exporting bookings CSV:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: error.message.includes('permissions') ? 403 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);