# Kafkasder Panel - Vercel & Convex Deployment Guide

This guide will walk you through deploying your application to Vercel with Convex backend.

## Prerequisites

- Node.js 20.x installed (check: `node -v`)
- npm installed (check: `npm -v`)
- Vercel CLI (install: `npm i -g vercel`)
- Git configured

## Step 1: Deploy Convex Backend

### 1.1 Login to Convex

```bash
npx convex login
```

This will open a browser window for authentication. Follow the prompts to log in with your GitHub account or email.

### 1.2 Deploy Convex

```bash
npx convex deploy --yes
```

This will:

- Create a new Convex project (if first time)
- Deploy your schema and functions
- Generate a deployment URL

**Important:** Copy the deployment URL that's displayed. It will look like:

```
https://your-project-name-123.convex.cloud
```

You'll need this URL for Vercel configuration.

### 1.3 Note Your Convex URL

Save the URL from the deployment output. You can also find it at:

- Convex Dashboard: https://dashboard.convex.dev
- Or run: `npx convex dashboard` to open your project

## Step 2: Generate Security Secrets

Run these commands to generate secure secrets:

```bash
# CSRF Secret
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"

# Session Secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

**Copy these values** - you'll need them for Vercel environment variables.

## Step 3: Configure Vercel

### 3.1 Login to Vercel

```bash
npx vercel login
```

### 3.2 Link Your Project (First Time)

```bash
npx vercel link
```

Follow the prompts:

- Set up and deploy? **Yes**
- Scope: Choose your account/team
- Link to existing project? **No** (or Yes if you already created one)
- Project name: `kafkasder-panel` (or your preferred name)
- Directory: `./` (current directory)

### 3.3 Set Environment Variables

You can set environment variables via:

- **Vercel Dashboard** (Recommended): https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- **CLI**: Using the commands below

#### Required Environment Variables

```bash
# Core Convex URL (use the URL from Step 1.2)
npx vercel env add NEXT_PUBLIC_CONVEX_URL production
# Paste your Convex URL: https://your-project-name-123.convex.cloud

# Security secrets (use generated values from Step 2)
npx vercel env add CSRF_SECRET production
# Paste the CSRF secret generated above

npx vercel env add SESSION_SECRET production
# Paste the session secret generated above

# First admin credentials (for initial setup)
npx vercel env add FIRST_ADMIN_EMAIL production
# Enter: baskan@dernek.org (or your preferred email)

npx vercel env add FIRST_ADMIN_PASSWORD production
# Enter a strong password (min 8 chars, uppercase, lowercase, number, symbol)

# App Configuration
npx vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: Kafkasder Panel

npx vercel env add NODE_ENV production
# Enter: production
```

#### Optional Environment Variables

For full functionality, you may also want to configure:

**Monitoring (Recommended for Production):**

```bash
# Sentry Error Tracking
npx vercel env add NEXT_PUBLIC_SENTRY_DSN production
npx vercel env add SENTRY_DSN production
```

**Email Service (Optional):**

```bash
npx vercel env add SMTP_HOST production
npx vercel env add SMTP_PORT production
npx vercel env add SMTP_USER production
npx vercel env add SMTP_PASSWORD production
npx vercel env add SMTP_FROM production
```

**SMS Service (Optional - Twilio):**

```bash
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production
npx vercel env add TWILIO_PHONE_NUMBER production
```

**AI Chat (Optional):**

```bash
npx vercel env add OPENAI_API_KEY production
```

### 3.4 Set Environment Variables for Preview & Development

For each environment variable you set above, also set it for `preview` and `development`:

```bash
# Example for NEXT_PUBLIC_CONVEX_URL
npx vercel env add NEXT_PUBLIC_CONVEX_URL preview
npx vercel env add NEXT_PUBLIC_CONVEX_URL development
```

Or use the Vercel Dashboard to copy production values to other environments.

## Step 4: Deploy to Vercel

### 4.1 Deploy Production

```bash
npm run vercel:prod
```

Or:

```bash
npx vercel --prod
```

This will:

- Build your Next.js application
- Deploy to Vercel production
- Output the deployment URL

### 4.2 Verify Deployment

Once deployed, Vercel will output a URL like:

```
https://kafkasder-panel.vercel.app
```

Visit the URL and verify:

1. ✅ Homepage loads
2. ✅ No console errors
3. ✅ Can access login page
4. ✅ Health check: `https://your-url.vercel.app/api/health?detailed=true`

## Step 5: Initial Setup

### 5.1 Login as Admin

1. Visit your deployment URL
2. Go to `/login`
3. Login with:
   - Email: The `FIRST_ADMIN_EMAIL` you configured
   - Password: The `FIRST_ADMIN_PASSWORD` you configured

### 5.2 Verify Convex Connection

1. Login to the dashboard
2. Check if data loads properly
3. Try creating a test record (beneficiary, donation, etc.)

## Automated Deployment Script

For convenience, use the provided deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Issue: "Convex deployment failed"

**Solution:**

1. Check you're logged in: `npx convex login`
2. Verify convex.config.ts exists in convex/ directory
3. Check for TypeScript errors: `npm run typecheck`

### Issue: "Vercel build failed"

**Solution:**

1. Check environment variables are set correctly
2. Ensure `NEXT_PUBLIC_CONVEX_URL` is set
3. Review build logs in Vercel dashboard
4. Test build locally: `npm run build`

### Issue: "Cannot connect to Convex"

**Solution:**

1. Verify `NEXT_PUBLIC_CONVEX_URL` is correct and includes `https://`
2. Check Convex deployment status at dashboard.convex.dev
3. Ensure Convex functions are deployed: `npx convex deploy`

### Issue: "CSRF token validation failed"

**Solution:**

1. Verify `CSRF_SECRET` is set and is at least 32 characters
2. Ensure the secret is the same across all deployment environments
3. Clear browser cache and cookies

### Issue: "Session expired immediately"

**Solution:**

1. Verify `SESSION_SECRET` is set correctly
2. Check that secrets aren't being regenerated on each deployment
3. Ensure environment variables are set for production environment

## Post-Deployment Checklist

- [ ] Convex backend deployed successfully
- [ ] Vercel production deployment successful
- [ ] All required environment variables set
- [ ] Health check endpoint returns OK
- [ ] Admin login works
- [ ] Can create/read/update/delete data
- [ ] Email notifications work (if configured)
- [ ] SMS notifications work (if configured)
- [ ] AI chat works (if configured)
- [ ] Error tracking configured (Sentry)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (if applicable)

## Continuous Deployment

### GitHub Integration

Vercel will automatically deploy:

- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

### Environment Variables

To update environment variables:

```bash
# Via CLI
npx vercel env add VARIABLE_NAME production

# Or via Dashboard
# https://vercel.com/dashboard → Project → Settings → Environment Variables
```

After updating environment variables, redeploy:

```bash
npx vercel --prod --force
```

## Monitoring

### Vercel Analytics

- View at: https://vercel.com/dashboard → Your Project → Analytics
- Monitors: Performance, traffic, errors

### Sentry Error Tracking

- View at: https://sentry.io (if configured)
- Real-time error reporting and alerting

### Convex Dashboard

- View at: https://dashboard.convex.dev
- Monitor: Database, functions, logs

## Support

- **Convex Docs**: https://docs.convex.dev
- **Vercel Docs**: https://vercel.com/docs
- **Project Issues**: https://github.com/Vadalov/Kafkasder-panel/issues

---

**Last Updated:** 2025-11-20
