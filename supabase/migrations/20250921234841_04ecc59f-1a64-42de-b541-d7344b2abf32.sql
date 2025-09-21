-- Create enums
CREATE TYPE public.app_role AS ENUM ('customer', 'cleaner', 'admin');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role app_role NOT NULL DEFAULT 'customer',
    address TEXT,
    suburb TEXT,
    postcode TEXT,
    state TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    address TEXT NOT NULL,
    suburb TEXT NOT NULL,
    postcode TEXT NOT NULL,
    state TEXT NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create booking_items table
CREATE TABLE public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    cleaner_id UUID NOT NULL REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID NOT NULL REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create booking_status_history table
CREATE TABLE public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    old_status booking_status,
    new_status booking_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id),
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        CASE 
            WHEN NEW.email = 'admin@cleandigo.com.au' THEN 'admin'::app_role
            ELSE 'customer'::app_role
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Services policies
CREATE POLICY "Everyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Bookings policies
CREATE POLICY "Customers can view own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Cleaners can view assigned bookings" ON public.bookings
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE booking_id = bookings.id AND cleaner_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Customers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Booking items policies
CREATE POLICY "Users can view booking items for accessible bookings" ON public.booking_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_items.booking_id AND (
            b.customer_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.assignments a WHERE a.booking_id = b.id AND a.cleaner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    ));

CREATE POLICY "Admins can manage booking items" ON public.booking_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Assignments policies
CREATE POLICY "Cleaners can view own assignments" ON public.assignments
    FOR SELECT USING (cleaner_id = auth.uid());

CREATE POLICY "Admins can manage assignments" ON public.assignments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Booking status history policies
CREATE POLICY "Users can view status history for accessible bookings" ON public.booking_status_history
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_status_history.booking_id AND (
            b.customer_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.assignments a WHERE a.booking_id = b.id AND a.cleaner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    ));

CREATE POLICY "Admins can manage status history" ON public.booking_status_history
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Payments policies
CREATE POLICY "Customers can view own payments" ON public.payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = payments.booking_id AND b.customer_id = auth.uid()
    ));

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Reviews policies
CREATE POLICY "Customers can view and create own reviews" ON public.reviews
    FOR ALL USING (customer_id = auth.uid());

CREATE POLICY "Everyone can view published reviews" ON public.reviews
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage reviews" ON public.reviews
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Audit log policies
CREATE POLICY "Admins can view audit log" ON public.audit_log
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Insert default services
INSERT INTO public.services (name, description, base_price, duration_hours) VALUES
('Regular House Cleaning', 'Complete house cleaning including all rooms, kitchen, and bathrooms', 120.00, 2),
('Deep Cleaning', 'Comprehensive deep clean including inside appliances, baseboards, and detailed work', 250.00, 4),
('End of Lease Cleaning', 'Professional cleaning to ensure bond return', 350.00, 5),
('Office Cleaning', 'Commercial office space cleaning', 80.00, 1),
('Window Cleaning', 'Interior and exterior window cleaning', 60.00, 1),
('Carpet Cleaning', 'Professional carpet steam cleaning', 150.00, 2);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_assignments_cleaner_id ON public.assignments(cleaner_id);
CREATE INDEX idx_assignments_booking_id ON public.assignments(booking_id);
CREATE INDEX idx_booking_items_booking_id ON public.booking_items(booking_id);
CREATE INDEX idx_booking_status_history_booking_id ON public.booking_status_history(booking_id);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);