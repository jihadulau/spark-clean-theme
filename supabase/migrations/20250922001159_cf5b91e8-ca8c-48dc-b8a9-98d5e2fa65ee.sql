-- Add sample data to complete the Supabase setup

-- Insert sample services if not exists
INSERT INTO public.services (name, description, base_price, duration_hours) 
VALUES 
  ('Regular House Clean', 'Standard cleaning including bathrooms, kitchen, bedrooms and living areas', 120.00, 2),
  ('Deep Clean', 'Comprehensive deep cleaning service including inside ovens, fridges, and detailed cleaning', 180.00, 3),
  ('End of Lease Clean', 'Complete property cleaning for rental bond returns', 250.00, 4),
  ('Commercial Cleaning', 'Office and commercial space cleaning services', 80.00, 1),
  ('Carpet Cleaning', 'Professional carpet and upholstery cleaning', 150.00, 2),
  ('Window Cleaning', 'Interior and exterior window cleaning', 60.00, 1)
ON CONFLICT (name) DO NOTHING;

-- Create a sample admin user profile if it doesn't exist
DO $$
BEGIN
  -- Check if admin profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    -- Insert a sample admin (this would typically be created through auth signup)
    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
    VALUES (
      gen_random_uuid(),
      'admin@cleandigo.com.au',
      'Admin',
      'User',
      'admin',
      '0420 331 350'
    );
  END IF;
END $$;

-- Create sample customer profiles
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, address, suburb, postcode, state)
VALUES 
  (gen_random_uuid(), 'john.smith@email.com', 'John', 'Smith', 'customer', '0412 345 678', '123 Main Street', 'Sydney', '2000', 'NSW'),
  (gen_random_uuid(), 'sarah.jones@email.com', 'Sarah', 'Jones', 'customer', '0423 456 789', '456 Queen Street', 'Melbourne', '3000', 'VIC'),
  (gen_random_uuid(), 'mike.brown@email.com', 'Mike', 'Brown', 'customer', '0434 567 890', '789 King Street', 'Brisbane', '4000', 'QLD')
ON CONFLICT (email) DO NOTHING;

-- Create sample cleaner profiles
INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
VALUES 
  (gen_random_uuid(), 'cleaner1@cleandigo.com.au', 'Emma', 'Wilson', 'cleaner', '0445 678 901'),
  (gen_random_uuid(), 'cleaner2@cleandigo.com.au', 'James', 'Taylor', 'cleaner', '0456 789 012')
ON CONFLICT (email) DO NOTHING;

-- Create sample bookings
DO $$
DECLARE
  customer1_id uuid;
  customer2_id uuid;
  customer3_id uuid;
  service1_id uuid;
  service2_id uuid;
  service3_id uuid;
  booking1_id uuid;
  booking2_id uuid;
  booking3_id uuid;
  booking4_id uuid;
  cleaner1_id uuid;
BEGIN
  -- Get customer IDs
  SELECT id INTO customer1_id FROM public.profiles WHERE email = 'john.smith@email.com';
  SELECT id INTO customer2_id FROM public.profiles WHERE email = 'sarah.jones@email.com';
  SELECT id INTO customer3_id FROM public.profiles WHERE email = 'mike.brown@email.com';
  
  -- Get service IDs
  SELECT id INTO service1_id FROM public.services WHERE name = 'Regular House Clean';
  SELECT id INTO service2_id FROM public.services WHERE name = 'Deep Clean';
  SELECT id INTO service3_id FROM public.services WHERE name = 'End of Lease Clean';
  
  -- Get cleaner ID
  SELECT id INTO cleaner1_id FROM public.profiles WHERE email = 'cleaner1@cleandigo.com.au';

  -- Create sample bookings if customers exist
  IF customer1_id IS NOT NULL AND service1_id IS NOT NULL THEN
    -- Future booking (pending)
    booking1_id := gen_random_uuid();
    INSERT INTO public.bookings (id, customer_id, booking_date, start_time, status, total_amount, address, suburb, postcode, state, notes)
    VALUES (
      booking1_id,
      customer1_id,
      CURRENT_DATE + INTERVAL '5 days',
      '09:00:00',
      'pending',
      120.00,
      '123 Main Street',
      'Sydney',
      '2000',
      'NSW',
      'First floor apartment, key under mat'
    );

    -- Add booking items
    INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
    VALUES (booking1_id, service1_id, 1, 120.00, 120.00);

    -- Confirmed booking
    booking2_id := gen_random_uuid();
    INSERT INTO public.bookings (id, customer_id, booking_date, start_time, status, total_amount, address, suburb, postcode, state)
    VALUES (
      booking2_id,
      customer2_id,
      CURRENT_DATE + INTERVAL '2 days',
      '14:00:00',
      'confirmed',
      180.00,
      '456 Queen Street',
      'Melbourne',
      '3000',
      'VIC'
    );

    INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
    VALUES (booking2_id, service2_id, 1, 180.00, 180.00);

    -- Completed booking
    booking3_id := gen_random_uuid();
    INSERT INTO public.bookings (id, customer_id, booking_date, start_time, status, total_amount, address, suburb, postcode, state, admin_notes)
    VALUES (
      booking3_id,
      customer1_id,
      CURRENT_DATE - INTERVAL '5 days',
      '10:00:00',
      'completed',
      250.00,
      '123 Main Street',
      'Sydney',
      '2000',
      'NSW',
      'Job completed successfully, customer very happy'
    );

    INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
    VALUES (booking3_id, service3_id, 1, 250.00, 250.00);

    -- Add assignment for completed booking
    IF cleaner1_id IS NOT NULL THEN
      INSERT INTO public.assignments (booking_id, cleaner_id, assigned_by, notes)
      SELECT booking3_id, cleaner1_id, id, 'Assigned to Emma - experienced with end of lease cleans'
      FROM public.profiles WHERE role = 'admin' LIMIT 1;
    END IF;

    -- Add payment for completed booking
    INSERT INTO public.payments (booking_id, amount, payment_status, payment_method, payment_date)
    VALUES (booking3_id, 250.00, 'completed', 'credit_card', CURRENT_DATE - INTERVAL '5 days');

    -- Add review for completed booking
    INSERT INTO public.reviews (booking_id, customer_id, rating, comment, is_published)
    VALUES (booking3_id, customer1_id, 5, 'Excellent service! The cleaner was thorough and professional. Highly recommend!', true);

    -- In progress booking
    booking4_id := gen_random_uuid();
    INSERT INTO public.bookings (id, customer_id, booking_date, start_time, status, total_amount, address, suburb, postcode, state)
    VALUES (
      booking4_id,
      customer3_id,
      CURRENT_DATE,
      '13:00:00',
      'in_progress',
      120.00,
      '789 King Street',
      'Brisbane',
      '4000',
      'QLD'
    );

    INSERT INTO public.booking_items (booking_id, service_id, quantity, unit_price, total_price)
    VALUES (booking4_id, service1_id, 1, 120.00, 120.00);

    -- Add assignment for in progress booking
    IF cleaner1_id IS NOT NULL THEN
      INSERT INTO public.assignments (booking_id, cleaner_id, assigned_by, notes)
      SELECT booking4_id, cleaner1_id, id, 'Currently in progress'
      FROM public.profiles WHERE role = 'admin' LIMIT 1;
    END IF;
  END IF;
END $$;

-- Update company settings with proper ABN
INSERT INTO public.company_settings (abn, company_name, phone, email, address) 
VALUES ('12 345 678 901', 'Cleandigo Pty Ltd', '0420 331 350', 'info@cleandigo.com.au', '123 Business St, Sydney NSW 2000')
ON CONFLICT DO NOTHING;