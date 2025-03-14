-- First, create the user in auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    'authenticated',
    NOW(),
    NOW()
);

-- Then insert into profiles table
INSERT INTO profiles (id, fullname, email, role, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Admin User',
    'admin@admin.com',
    'admin',
    NOW()
);

-- Update RLS policies to allow admin access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admin to update all profiles" ON profiles;

-- Create new policies
CREATE POLICY "Allow admin to view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
));

CREATE POLICY "Allow admin to update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
)); 