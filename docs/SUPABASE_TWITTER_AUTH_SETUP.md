# Twitter Authentication Setup Guide for Supabase

This guide walks you through setting up Twitter (X) authentication for your Callmybluff app using Supabase.

## Step 1: Get Supabase Project URL and Anonymous Key

Your `.env.local` file already contains the correct values:

```
NEXT_PUBLIC_SUPABASE_URL=https://girjiysdwesteyedywlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcmppeXNkd2VzdGV5ZWR5d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NjI3MTEsImV4cCI6MjA2MDIzODcxMX0.phYPTqj1MYleEcWIzaVZY2-zS5-af4rk6p1ezKS9X0A
```

## Step 2: Create a Twitter Developer Account and App

1. Go to [developer.twitter.com](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Create a new project and app (or use an existing one)
4. Make sure you turn ON "Request email from users" in your Twitter app settings
5. Set the app type to "Web App"

## Step 3: Configure OAuth Callback URL in Twitter

1. In your Twitter Developer Dashboard, select your project and app
2. Go to "User authentication settings" section
3. Click "Set up" or "Edit" if already set up
4. Add your callback URL in the following format:

   ```
   https://girjiysdwesteyedywlb.supabase.co/auth/v1/callback
   ```

   > ⚠️ **IMPORTANT**: This must match EXACTLY what's shown in your Supabase Dashboard. Go to Authentication > URL Configuration in your Supabase dashboard to verify the correct callback URL.

5. Also set the following:

   - Website URL: `http://localhost:4000` (for development)
   - Terms of service URL: Your terms page URL (or use a placeholder like `http://localhost:4000/terms`)
   - Privacy policy URL: Your privacy policy URL (or use a placeholder like `http://localhost:4000/privacy`)

6. Save your changes

## Step 4: Configure Twitter Auth in Supabase

1. In the Supabase Dashboard, go to Authentication > Providers
2. Find Twitter in the list and turn it ON
3. Enter your:
   - Twitter Client ID (API Key from Twitter Developer Portal)
   - Twitter Client Secret (API Secret Key from Twitter Developer Portal)
4. Save the configuration

## Step 5: Set Up Redirect URLs in Supabase

This is a **CRUCIAL** step that is often missed!

1. In the Supabase Dashboard, go to Authentication > URL Configuration
2. In the "Redirect URLs" section, add the following URLs:

   - `http://localhost:4000/api/auth/callback`
   - `http://localhost:4000`

   > ⚠️ **IMPORTANT**: The `/api/auth/callback` path must match the path in your application code.

3. Click "Save" to update the redirect URLs

## Step 6: Test the Authentication

1. Run your development server: `npm run dev`
2. Open your browser to [http://localhost:4000](http://localhost:4000)
3. Try logging in with Twitter
4. You should be redirected to Twitter for authentication and then back to your app

## Common Issues and Solutions

### "Invalid path" Error

If you get an error saying "requested path is invalid" after Twitter authentication:

1. **Check your redirect URLs** in Supabase Dashboard > Authentication > URL Configuration
2. Make sure `http://localhost:4000/auth/callback` is added exactly as shown
3. Verify that your Twitter Developer app has the correct callback URL: `https://girjiysdwesteyedywlb.supabase.co/auth/v1/callback`

### CORS Errors

If you see CORS errors in your browser console:

1. Make sure your site URL is correctly set in Supabase Dashboard under Authentication > URL Configuration
2. The Site URL should be set to `http://localhost:4000` for development

### Authentication Not Working

If the authentication flow starts but fails:

1. Check your browser console for errors
2. Verify that the Twitter app has "Request email from users" enabled
3. Make sure your API Key and Secret in Supabase match exactly what's in your Twitter Developer Portal

## Resources

- [Supabase Twitter Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-twitter)
- [Twitter Developer Portal](https://developer.twitter.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
