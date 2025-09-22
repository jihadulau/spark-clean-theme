-- Update handle_new_user function to handle admin@lovable.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        CASE 
            WHEN NEW.email = 'admin@lovable.com' THEN 'admin'::app_role
            WHEN NEW.email = 'admin@cleandigo.com.au' THEN 'admin'::app_role
            WHEN NEW.email LIKE '%cleaner%' THEN 'cleaner'::app_role
            ELSE 'customer'::app_role
        END
    );
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();