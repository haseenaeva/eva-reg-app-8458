-- Grant necessary permissions to the anon role for admin_users table
GRANT SELECT ON admin_users TO anon;
GRANT ALL ON admin_users TO authenticated;