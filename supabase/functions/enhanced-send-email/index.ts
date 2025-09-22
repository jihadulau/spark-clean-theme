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
  idempotencyKey?: string;
  retryAttempt?: number;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// In-memory store for idempotency (in production, use Redis or database)
const processedEmails = new Map<string, any>();

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, type, idempotencyKey, retryAttempt = 0 }: EmailRequest = await req.json();
    
    // Check idempotency
    if (idempotencyKey && processedEmails.has(idempotencyKey)) {
      console.log(`Email already processed with key: ${idempotencyKey}`);
      return new Response(JSON.stringify(processedEmails.get(idempotencyKey)), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Sending email notification - Type: ${type}, To: ${to}, Attempt: ${retryAttempt + 1}`);
    
    // Simulate email service call with potential failures
    const shouldFail = Math.random() < 0.1; // 10% failure rate for testing
    
    if (shouldFail && retryAttempt < MAX_RETRY_ATTEMPTS) {
      // Schedule retry
      setTimeout(async () => {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/enhanced-send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              to,
              subject,
              html,
              type,
              idempotencyKey,
              retryAttempt: retryAttempt + 1
            })
          });
        } catch (error) {
          console.error(`Retry ${retryAttempt + 1} failed:`, error);
        }
      }, RETRY_DELAY_MS * (retryAttempt + 1));
      
      throw new Error('Temporary email service failure - retrying');
    }
    
    // Simulate successful email sending
    const emailResponse = {
      id: crypto.randomUUID(),
      to,
      subject,
      type,
      status: 'sent',
      timestamp: new Date().toISOString(),
      retryAttempt
    };

    // Store for idempotency
    if (idempotencyKey) {
      processedEmails.set(idempotencyKey, emailResponse);
      
      // Clean up after 1 hour
      setTimeout(() => {
        processedEmails.delete(idempotencyKey);
      }, 3600000);
    }

    console.log('Email sent successfully:', emailResponse);

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
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);