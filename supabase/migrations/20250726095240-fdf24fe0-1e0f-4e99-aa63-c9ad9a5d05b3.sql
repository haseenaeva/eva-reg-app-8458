-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Allow authentication access" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated read access" ON admin_users;

-- Re-enable RLS on admin_users table 
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to read admin_users for authentication
CREATE POLICY "Allow authentication access" ON admin_users
FOR SELECT 
TO anon
USING (true);

-- Create policy to allow authenticated users to read admin_users  
CREATE POLICY "Allow authenticated read access" ON admin_users
FOR SELECT 
TO authenticated
USING (true);