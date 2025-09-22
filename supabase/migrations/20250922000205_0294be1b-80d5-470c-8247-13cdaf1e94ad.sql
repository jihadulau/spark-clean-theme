-- Enhanced RLS policies with WITH CHECK constraints
-- Drop existing policies to recreate with proper WITH CHECK
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Enhanced profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

-- Enhanced bookings policies  
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;

CREATE POLICY "Customers can view own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Data integrity constraints
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS valid_booking_date;
ALTER TABLE public.bookings ADD CONSTRAINT valid_booking_date 
    CHECK (booking_date >= CURRENT_DATE OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Status transition validation function
CREATE OR REPLACE FUNCTION public.validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow admin to set any status
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN NEW;
    END IF;
    
    -- Valid transitions for non-admins
    CASE OLD.status
        WHEN 'pending' THEN
            IF NEW.status NOT IN ('confirmed', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'confirmed' THEN
            IF NEW.status NOT IN ('assigned', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'assigned' THEN
            IF NEW.status NOT IN ('en_route', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'en_route' THEN
            IF NEW.status NOT IN ('in_progress') THEN
                RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'in_progress' THEN
            IF NEW.status NOT IN ('completed') THEN
                RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'completed', 'cancelled' THEN
            RAISE EXCEPTION 'Cannot change status from %', OLD.status;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create status transition trigger
DROP TRIGGER IF EXISTS validate_booking_status_transition ON public.bookings;
CREATE TRIGGER validate_booking_status_transition
    BEFORE UPDATE OF status ON public.bookings
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.validate_status_transition();

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abn TEXT NOT NULL,
    company_name TEXT NOT NULL DEFAULT 'Cleandigo Pty Ltd',
    phone TEXT NOT NULL DEFAULT '0420 331 350',
    email TEXT NOT NULL DEFAULT 'info@cleandigo.com.au',
    address TEXT,
    invoice_prefix TEXT NOT NULL DEFAULT 'CLD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on company settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Company settings policies (read by all, update by admin only)
CREATE POLICY "Everyone can view company settings" ON public.company_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage company settings" ON public.company_settings
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Insert default company settings
INSERT INTO public.company_settings (abn, company_name, phone, email) 
VALUES ('12 345 678 901', 'Cleandigo Pty Ltd', '0420 331 350', 'info@cleandigo.com.au')
ON CONFLICT DO NOTHING;

-- Payment constraints
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'AUD',
ADD COLUMN IF NOT EXISTS financial_year INTEGER;

-- Generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    fy INTEGER;
    seq_num INTEGER;
    prefix TEXT;
BEGIN
    -- Get financial year (July 1 - June 30)
    IF EXTRACT(MONTH FROM NOW()) >= 7 THEN
        fy := EXTRACT(YEAR FROM NOW());
    ELSE
        fy := EXTRACT(YEAR FROM NOW()) - 1;
    END IF;
    
    -- Get company prefix
    SELECT invoice_prefix INTO prefix FROM public.company_settings LIMIT 1;
    prefix := COALESCE(prefix, 'CLD');
    
    -- Get next sequence number for this financial year
    SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.payments
    WHERE financial_year = fy;
    
    NEW.financial_year := fy;
    NEW.invoice_number := format('%s-%s-%s', prefix, fy, LPAD(seq_num::TEXT, 4, '0'));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create invoice number trigger
DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON public.payments;
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION public.generate_invoice_number();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON public.bookings(status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_status ON public.bookings(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_created ON public.bookings(booking_date, created_at);
CREATE INDEX IF NOT EXISTS idx_assignments_cleaner_date ON public.assignments(cleaner_id, assigned_at);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_year ON public.payments(financial_year, invoice_number);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_rating ON public.reviews(customer_id, rating);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_date ON public.audit_log(table_name, created_at);

-- Storage policies for booking-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public;

-- Enhanced storage policies
DROP POLICY IF EXISTS "Customers can view their booking photos" ON storage.objects;
DROP POLICY IF EXISTS "Cleaners can manage assigned booking photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all booking photos" ON storage.objects;

-- Customers: read-only for their own booking files
CREATE POLICY "Customers can view their booking photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'booking-photos' AND
    EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id::text = (storage.foldername(name))[1]
        AND b.customer_id = auth.uid()
    )
);

-- Cleaners: read/write for assigned bookings
CREATE POLICY "Cleaners can manage assigned booking photos" ON storage.objects
FOR ALL USING (
    bucket_id = 'booking-photos' AND
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.bookings b ON b.id = a.booking_id
        WHERE b.id::text = (storage.foldername(name))[1]
        AND a.cleaner_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'booking-photos' AND
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.bookings b ON b.id = a.booking_id
        WHERE b.id::text = (storage.foldername(name))[1]
        AND a.cleaner_id = auth.uid()
    )
);

-- Admins: full access
CREATE POLICY "Admins can manage all booking photos" ON storage.objects
FOR ALL USING (
    bucket_id = 'booking-photos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'booking-photos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);