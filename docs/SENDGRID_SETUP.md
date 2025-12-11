# SendGrid Email Setup

This project uses SendGrid API for sending transactional emails (verification emails, password resets, etc.).

## Prerequisites

1. Create a SendGrid account at [https://sendgrid.com](https://sendgrid.com)
2. Verify your sender identity (either Single Sender Verification or Domain Authentication)

## Required Environment Variables

Add the following environment variables to your `.env` or `.env.local` file:

```env
# SendGrid API Key (required)
# Get this from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Sender Email (required)
# Must be a verified email address or domain in SendGrid
SENDGRID_FROM_EMAIL=noreply@callmybluff.io

# Sender Name (optional, defaults to "CallMyBluff.io")
SENDGRID_FROM_NAME=CallMyBluff.io
```

## Setup Steps

### 1. Create SendGrid API Key

1. Log in to your SendGrid account
2. Go to Settings > API Keys ([https://app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys))
3. Click "Create API Key"
4. Choose "Restricted Access" and enable the following permissions:
   - Mail Send: Full Access
5. Copy the generated API key (you won't be able to see it again!)
6. Add it to your environment variables as `SENDGRID_API_KEY`

### 2. Verify Your Sender Email

SendGrid requires you to verify the email address you're sending from. You have two options:

#### Option A: Single Sender Verification (Easier, for testing)

1. Go to Settings > Sender Authentication > Single Sender Verification
2. Click "Create New Sender"
3. Fill in the form with your sender details
4. Verify the email address by clicking the link sent to your inbox
5. Use the verified email as `SENDGRID_FROM_EMAIL`

#### Option B: Domain Authentication (Recommended for production)

1. Go to Settings > Sender Authentication > Domain Authentication
2. Follow the wizard to add DNS records to your domain
3. Once verified, you can send from any email address on that domain
4. Use any email on your verified domain as `SENDGRID_FROM_EMAIL`

### 3. Update Environment Variables

Add the environment variables to your deployment platform:

- **Vercel**: Project Settings > Environment Variables
- **Local Development**: Add to `.env.local` file (never commit this file!)

### 4. Test Email Sending

After setup, you can test email sending by:

1. Signing up for a new account (sends verification email)
2. Using the password reset feature
3. Checking SendGrid dashboard for email activity

## Migration from Old System

The old SMTP-based system used the following environment variables (now deprecated):

```env
# OLD - No longer needed, can be removed
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SENDER_EMAIL=noreply@example.com
SENDER_PASSWORD=password123
```

Replace these with the new SendGrid variables listed above.

## Email Types Sent

The system sends the following types of emails:

1. **Verification Email** - When users sign up, to confirm their email address
2. **Password Reset Email** - When users request a password reset
3. **Recovery Code Email** - For account recovery

## Troubleshooting

### Emails not sending

1. Check that `SENDGRID_API_KEY` is correctly set
2. Verify that `SENDGRID_FROM_EMAIL` is a verified sender in SendGrid
3. Check the server logs for detailed error messages
4. Check SendGrid Activity Feed for delivery status

### "Unauthorized" errors

- Your API key may be incorrect or expired
- Create a new API key in SendGrid dashboard

### "From email does not match verified sender" error

- The `SENDGRID_FROM_EMAIL` must be verified in SendGrid
- Complete Single Sender Verification or Domain Authentication

### Rate limits

- SendGrid free tier: 100 emails/day
- If you need more, upgrade your SendGrid plan

## SendGrid Dashboard

Monitor your email activity:

- Activity Feed: [https://app.sendgrid.com/email_activity](https://app.sendgrid.com/email_activity)
- Statistics: [https://app.sendgrid.com/statistics](https://app.sendgrid.com/statistics)

## Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authentication)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Sender Authentication Guide](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

## Support

For SendGrid-specific issues, contact SendGrid support or check their [Help Center](https://support.sendgrid.com/).
