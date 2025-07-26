-- Drop existing RLS policy if it exists
DROP POLICY IF EXISTS "Allow all access to admin_users" ON admin_users;

-- Disable RLS temporarily to allow access
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations
CREATE POLICY "Enable all operations on admin_users" 
ON admin_users 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);