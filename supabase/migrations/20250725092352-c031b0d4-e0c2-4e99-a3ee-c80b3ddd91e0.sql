-- Create admin authentication system
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for important tables
ALTER TABLE public.user_registration_requests REPLICA IDENTITY FULL;
ALTER TABLE public.management_teams REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.team_notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_registration_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.management_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_notifications;

-- Create a default super admin user (password: admin123)
-- Hash generated for 'admin123' using bcrypt
INSERT INTO public.admin_users (username, password_hash, role) 
VALUES ('superadmin', '$2b$10$8K1p/a0dB12U2KqJL7vBv.VqQCRcl5Dl0Q2H5tULQrG5UvKsW1L/K', 'super_admin')
ON CONFLICT (username) DO NOTHING;