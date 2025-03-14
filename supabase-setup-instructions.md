# Supabase Setup Instructions

## Fix Row Level Security (RLS) Issues

You're experiencing RLS policy errors with your Supabase integration. Follow these steps to fix them:

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Select your project: "mssxqdocdctzpbeibgjj"
3. Go to "Table Editor" on the left sidebar
4. Select the "profiles" table
5. Go to "Authentication" > "Policies" tab

## Add These RLS Policies

### 1. Enable Authenticated Users to Insert Their Own Profile

```sql
CREATE POLICY "Users can insert their own profile"
ON "public"."profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### 2. Enable Authenticated Users to Select Their Own Profile

```sql
CREATE POLICY "Users can view their own profile"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### 3. Enable Authenticated Users to Update Their Own Profile

```sql
CREATE POLICY "Users can update their own profile"
ON "public"."profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## Email Validation Issues

For the email validation error, make sure that your sign-up form includes proper email validation before submitting. You can add a simple email regex check:

```javascript
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}
```

Apply this check before submitting the registration form.

## Testing Your Setup

Once you've set up these policies, test the registration flow again. The user should now be able to register and insert their profile data without row-level security violations. 