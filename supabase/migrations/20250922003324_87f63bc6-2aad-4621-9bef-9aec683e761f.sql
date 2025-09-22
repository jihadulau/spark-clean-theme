-- Complete database schema for cleaning company
-- Create app role enum
CREATE TYPE app_role AS ENUM ('admin', 'customer', 'cleaner');

-- Create booking status enum  
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled');

-- Update profiles table structure to match requirements
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'customer'::app_role;

-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Cleandigo',
  abn TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default company settings
INSERT INTO public.company_settings (company_name, abn, phone, email, address)
VALUES ('Cleandigo', '12345678901', '+61 400 000 000', 'admin@cleandigo.com.au', '123 Cleaning St, Sydney NSW 2000')
ON CONFLICT DO NOTHING;

-- Update services table to add more sample services
INSERT INTO public.services (name, description, base_price, duration_hours) VALUES
('Standard Cleaning', 'Regular house cleaning including dusting, vacuuming, and mopping', 120.00, 2),
('Deep Cleaning', 'Comprehensive cleaning including all areas, perfect for move-ins', 250.00, 4),
('End of Lease Cleaning', 'Bond-back guarantee cleaning for rental properties', 350.00, 6),
('Office Cleaning', 'Professional office and commercial space cleaning', 80.00, 2),
('Carpet Cleaning', 'Professional carpet steam cleaning service', 150.00, 3)
ON CONFLICT (name) DO NOTHING;

-- Create seed admin user profile (will be linked when user signs up)
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@lovable.com', 'Admin', 'User', 'admin', '+61 400 000 001')
ON CONFLICT (id) DO NOTHING;

-- Create sample customer profiles  
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, address, suburb, postcode, state) VALUES
('00000000-0000-0000-0000-000000000002', 'customer1@example.com', 'John', 'Smith', 'customer', '+61 400 000 002', '123 Main St', 'Sydney', '2000', 'NSW'),
('00000000-0000-0000-0000-000000000003', 'customer2@example.com', 'Jane', 'Doe', 'customer', '+61 400 000 003', '456 Oak Ave', 'Melbourne', '3000', 'VIC')
ON CONFLICT (id) DO NOTHING;

-- Create sample cleaner profile
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone) VALUES  
('00000000-0000-0000-0000-000000000004', 'cleaner1@example.com', 'Mike', 'Johnson', 'cleaner', '+61 400 000 004')
ON CONFLICT (id) DO NOTHING;

-- Create sample bookings
INSERT INTO public.bookings (customer_id, booking_date, start_time, address, suburb, postcode, state, status, total_amount, notes) VALUES
('00000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '3 days', '09:00:00', '123 Main St', 'Sydney', '2000', 'NSW', 'confirmed', 120.00, 'Standard cleaning for 3 bedroom house'),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '5 days', '14:00:00', '456 Oak Ave', 'Melbourne', '3000', 'VIC', 'pending', 250.00, 'Deep cleaning before moving in'),
('00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '7 days', '10:00:00', '123 Main St', 'Sydney', '2000', 'NSW', 'completed', 120.00, 'Weekly standard cleaning')
ON CONFLICT DO NOTHING;

-- Get the booking IDs for creating booking items
DO $$
DECLARE
    booking1_id UUID;
    booking2_id UUID; 
    booking3_id UUID;
    service1_id UUID;
    service2_id UUID;
BEGIN
    -- Get booking IDs
    SELECT id INTO booking1_id FROM public.bookings WHERE customer_id = '00000000-0000-0000-0000-000000000002' AND status = 'confirmed' LIMIT 1;
    SELECT id INTO booking2_id FROM public.bookings WHERE customer_id = '00000000-0000-0000-0000-000000000003' AND status = 'pending' LIMIT 1;  
    SELECT id INTO booking3_id FROM public.bookings WHERE customer_id = '00000000-0000-0000-0000-000000000002' AND status = 'completed' LIMIT 1;
    
    -- Get service IDs
    SELECT id INTO service1_id FROM public.services WHERE name = 'Standard Cleaning' LIMIT 1;
    SELECT id INTO service2_id FROM public.services WHERE name = 'Deep Cleaning' LIMIT 1;
    
    -- Insert booking items
    IF booking1_id IS NOT NULL AND service1_id IS NOT NULL THEN
        INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price) 
        VALUES (booking1_id, service1_id, 1, 120.00, 120.00)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF booking2_id IS NOT NULL AND service2_id IS NOT NULL THEN
        INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
        VALUES (booking2_id, service2_id, 1, 250.00, 250.00) 
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF booking3_id IS NOT NULL AND service1_id IS NOT NULL THEN
        INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
        VALUES (booking3_id, service1_id, 1, 120.00, 120.00)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_assignments_cleaner_id ON public.assignments(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_assignments_booking_id ON public.assignments(booking_id);

-- Enable realtime for admin dashboard  
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;