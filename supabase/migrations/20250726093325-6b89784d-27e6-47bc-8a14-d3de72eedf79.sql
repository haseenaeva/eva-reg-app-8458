-- Fix RLS policies for admin_users table to ensure proper access
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Enable all access for admin_users" ON admin_users;

-- Create a proper policy that allows all operations for admin users
CREATE POLICY "Allow all access to admin_users" 
ON admin_users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;