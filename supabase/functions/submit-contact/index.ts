import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Contact form submission received');
    
    const requestBody = await req.json();
    const { name, email, phone, service, message, form_type, subject, ...otherFields } = requestBody;
    
    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and phone are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const web3formsApiKey = Deno.env.get('WEB3FORMS_API_KEY')?.trim();
    
    if (!web3formsApiKey) {
      console.error('WEB3FORMS_API_KEY not found or empty');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the form data for Web3Forms according to their API guidelines
    const formData = new FormData();
    formData.append('access_key', web3formsApiKey);
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('phone', phone.trim());
    
    // Handle different form types
    if (form_type === 'careers') {
      formData.append('subject', subject || `New Cleaning EOI — ${name}`);
      
      // Create detailed careers message
      const careersMessage = `
New employment expression of interest from Cleandigo website:

=== PERSONAL DETAILS ===
Name: ${name}
Email: ${email}
Mobile: ${phone}
Suburb: ${otherFields.suburb || 'Not provided'}
Postcode: ${otherFields.postcode || 'Not provided'}

=== WORK PREFERENCES ===
Preferred Work Type: ${otherFields.workType || 'Not specified'}
Roles of Interest: ${otherFields.rolesOfInterest || 'Not specified'}
Availability: ${otherFields.availability || 'Not provided'}
Desired Hours per Week: ${otherFields.desiredHours || 'Not provided'}
Earliest Start Date: ${otherFields.startDate || 'Not provided'}

=== WORK AUTHORIZATION ===
Work Rights in Australia: ${otherFields.workRights || 'Not specified'}
${otherFields.visaType ? `Visa Type: ${otherFields.visaType}` : ''}
${otherFields.visaExpiry ? `Visa Expiry: ${otherFields.visaExpiry}` : ''}

=== TRANSPORT & LICENSING ===
Driver's Licence: ${otherFields.license || 'Not specified'}
Own Reliable Vehicle: ${otherFields.vehicle || 'Not specified'}
Distance Willing to Travel: ${otherFields.travelDistance || 'Not specified'}

=== ADDITIONAL INFORMATION ===
Languages: ${otherFields.languages || 'Not provided'}
Experience Summary: ${otherFields.experience || 'Not provided'}
Areas Can Service: ${otherFields.serviceAreas || 'Not provided'}

=== REFERENCES ===
Referee #1: ${otherFields.referee1 || 'Not provided'}
Referee #2: ${otherFields.referee2 || 'Not provided'}

=== CERTIFICATIONS ===
Police Check Status: ${otherFields.policeCheck || 'Not specified'}
WWCC Status: ${otherFields.wwcc || 'Not specified'}

=== CONTACT PREFERENCES ===
Contact Preference: ${otherFields.contactPreference || 'Not specified'}
Best Time to Contact: ${otherFields.contactTime || 'Not specified'}
Marketing Consent: ${otherFields.marketingConsent === 'on' ? 'Yes' : 'No'}

---
This application was submitted through the Cleandigo careers portal.
      `.trim();
      
      formData.append('message', careersMessage);
    } else {
      // Regular contact form
      formData.append('subject', `New Cleandigo Quote Request - ${service || 'General Inquiry'}`);
      
      const messageContent = `
New quote request from Cleandigo website:

Customer Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Service Requested: ${service || 'Not specified'}

Customer Message:
${message || 'No additional message provided'}

---
This message was sent from the Cleandigo website contact form.
      `.trim();
      
      formData.append('message', messageContent);
    }
    
    formData.append('replyto', email.trim());
    formData.append('from_name', 'Cleandigo Website');
    formData.append('botcheck', ''); // Anti-spam field
    
    console.log('Submitting to Web3Forms...');
    
    // Submit to Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Form submitted successfully to Web3Forms');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Thank you for your inquiry! We\'ll contact you within 24 hours.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('Web3Forms submission failed:', result);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit form. Please try again or contact us directly.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in submit-contact function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});