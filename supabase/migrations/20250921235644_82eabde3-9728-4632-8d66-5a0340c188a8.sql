-- Enable realtime for bookings table
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Add bookings to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Create storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', false)
ON CONFLICT (id) DO NOTHING;