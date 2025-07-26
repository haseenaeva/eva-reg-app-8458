-- Drop all existing policies on admin_users
DROP POLICY IF EXISTS "Allow all access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Enable all operations on admin_users" ON admin_users;

-- Completely disable RLS for admin_users table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;