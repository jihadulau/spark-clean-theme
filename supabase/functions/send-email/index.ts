import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  type: 'booking_created' | 'booking_assigned' | 'booking_completed' | 'booking_cancelled' | 'booking_rescheduled';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, type }: EmailRequest = await req.json();
    
    console.log(`Sending email notification - Type: ${type}, To: ${to}`);
    
    // In a real implementation, you would use a service like Resend
    // For now, we'll log the email details
    console.log('Email Details:', {
      to,
      subject,
      html: html.substring(0, 200) + '...', // Log first 200 chars
      type,
      timestamp: new Date().toISOString()
    });
    
    // Simulate email sending success
    const emailResponse = {
      id: crypto.randomUUID(),
      to,
      subject,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
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