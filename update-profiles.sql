-- ====================
-- Database Setup Script
-- ====================

-- 1. Create or Update Profiles Table Structure
DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        fullname TEXT,
        email TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        avatar_url TEXT,
        is_online BOOLEAN DEFAULT false,
        last_seen TIMESTAMPTZ
    );
    
    -- Ensure all required columns exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_online'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_seen'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'fullname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN fullname TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Create indexes for better performance
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname = 'profiles_is_online_idx'
    ) THEN
        CREATE INDEX profiles_is_online_idx ON profiles(is_online);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname = 'profiles_last_seen_idx'
    ) THEN
        CREATE INDEX profiles_last_seen_idx ON profiles(last_seen);
    END IF;
END $$;

-- 2. Create Function to Handle User Status Changes
CREATE OR REPLACE FUNCTION handle_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.is_online IS DISTINCT FROM OLD.is_online OR NEW.last_seen IS DISTINCT FROM OLD.last_seen) THEN
    -- Publish RealTime event when user connects, disconnects or updates status
    PERFORM pg_notify('user_status_change', json_build_object('id', NEW.id, 'is_online', NEW.is_online, 'last_seen', NEW.last_seen)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger for User Status Changes
DROP TRIGGER IF EXISTS on_user_status_change ON profiles;
CREATE TRIGGER on_user_status_change
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION handle_user_status_change();

-- 4. Create Helper Function for RLS Policies
CREATE OR REPLACE FUNCTION is_admin_or_self(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = current_user_id;

  -- Return true if user is admin or it's the user themselves
  RETURN (is_admin OR current_user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Set Up Row Level Security (RLS)
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create policies
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 6. Create or Update Admin User
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Check if admin email exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'liad@gmail.com'
    ) INTO admin_exists;

    IF admin_exists THEN
        -- Get admin user ID
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'liad@gmail.com';
        
        -- Update admin user in profiles table
        UPDATE profiles
        SET 
            role = 'admin',
            updated_at = now()
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user updated with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Please create admin user manually.';
    END IF;
END $$;