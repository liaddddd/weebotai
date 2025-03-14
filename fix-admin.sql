-- First, let's get the existing admin user's ID
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Get the user ID for admin@admin.com
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@admin.com';
    
    -- Update the user's password and ensure account is active
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('admin123', gen_salt('bf')),
        email_confirmed_at = NOW(),
        is_sso_user = false,
        recovery_sent_at = NULL,
        banned_until = NULL,
        updated_at = NOW()
    WHERE id = admin_id;
    
    -- Check if admin exists in profiles table
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id) THEN
        -- Insert into profiles table
        INSERT INTO profiles (id, fullname, email, role, created_at)
        VALUES (
            admin_id,
            'Admin User',
            'admin@admin.com',
            'admin',
            NOW()
        );
    ELSE
        -- Update existing profile
        UPDATE profiles
        SET
            fullname = 'Admin User',
            role = 'admin',
            updated_at = NOW()
        WHERE id = admin_id;
    END IF;
    
    -- Make sure RLS is enabled
    -- Update RLS policies to allow admin access
    PERFORM EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Allow admin to view all profiles'
    );
    
    IF NOT FOUND THEN
        CREATE POLICY "Allow admin to view all profiles"
        ON profiles FOR SELECT
        TO authenticated
        USING (auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        ));
    END IF;
    
    PERFORM EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Allow admin to update all profiles'
    );
    
    IF NOT FOUND THEN
        CREATE POLICY "Allow admin to update all profiles"
        ON profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        ));
    END IF;
END
$$; 