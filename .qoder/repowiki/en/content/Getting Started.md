# Getting Started

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [package.json](file://package.json)
- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md)
- [next.config.ts](file://next.config.ts)
- [src/lib/env-validation.ts](file://src/lib/env-validation.ts)
- [src/app/api/health/route.ts](file://src/app/api/health/route.ts)
- [CONTRIBUTING.md](file://CONTRIBUTING.md)
- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md)
</cite>

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Environment Configuration](#environment-configuration)
4. [Development Server Startup](#development-server-startup)
5. [Demo Mode](#demo-mode)
6. [Production Configuration](#production-configuration)
7. [Common Setup Issues](#common-setup-issues)

## Prerequisites

Before setting up Kafkasder-panel, ensure your system meets the following requirements:

- **Node.js 20.9.0 or higher** - The application requires Node.js version 20.9.0 or later, as specified in the package.json engines field
- **npm 9.0.0 or higher** - Required for dependency management and script execution
- **Convex account** - Needed for backend services and database functionality
- **Optional: Sentry account** - Recommended for error tracking and monitoring

The project uses modern JavaScript features and dependencies that require these specific versions to function properly. You can verify your Node.js and npm versions using:

```bash
node --version
npm --version
```

**Section sources**

- [package.json](file://package.json#L6-L8)
- [README.md](file://README.md#L41-L43)

## Repository Setup

To get started with Kafkasder-panel, follow these steps to clone the repository and install dependencies:

### Clone the Repository

```bash
git clone https://github.com/your-username/Kafkasder-panel.git
cd Kafkasder-panel
```

### Install Dependencies

The project recommends using `npm ci` instead of `npm install` for dependency installation. This ensures a clean, reproducible installation based on the exact versions specified in package-lock.json.

```bash
npm ci
```

**Expected Output:**

```
added 1,234 packages in 30s
```

Using `npm ci` provides several advantages:

- Faster installation compared to `npm install`
- Ensures consistent dependency versions across all environments
- Prevents accidental updates to package-lock.json
- Required for CI/CD pipelines and production deployments

The package.json file contains all necessary dependencies, including Next.js 16, React 19, TypeScript, Tailwind CSS, and Convex for real-time database functionality.

**Section sources**

- [README.md](file://README.md#L48-L57)
- [package.json](file://package.json#L49-L152)
- [CONTRIBUTING.md](file://CONTRIBUTING.md#L70-L73)

## Environment Configuration

Proper environment configuration is essential for Kafkasder-panel to function correctly. The application uses environment variables for configuration, with different requirements for development and production environments.

### Create Environment File

Start by creating a local environment file from the example template:

```bash
cp .env.example .env.local
```

### Required Environment Variables

The following environment variables are required for the application to run:

```env
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Authentication
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=http://localhost:3000

# CSRF Protection
CSRF_SECRET=another-32-character-secret-here
```

### Environment Validation

The application includes comprehensive environment validation through `src/lib/env-validation.ts`. This file defines schemas for both client-side and server-side environment variables, ensuring all required variables are present and correctly formatted.

Key validation features:

- Client-side variables are prefixed with `NEXT_PUBLIC_`
- Server-side variables include security secrets that must be at least 32 characters
- Optional services (email, SMS) are validated only if configured
- Feature flags are automatically parsed as boolean values

The validation process occurs at runtime, and the application will fail to start if required environment variables are missing or invalid.

**Section sources**

- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md#L1-L267)
- [src/lib/env-validation.ts](file://src/lib/env-validation.ts#L1-L187)
- [README.md](file://README.md#L60-L64)

## Development Server Startup

Once the repository is set up and environment variables are configured, you can start the development server.

### Initialize Convex

Before starting the application, set up Convex for local development:

```bash
npx convex dev
```

This command initializes the Convex backend, creates the necessary deployment configuration, and starts the Convex development server. It automatically generates the required environment variables in your `.env.local` file.

### Start the Development Server

With Convex running, start the Next.js development server:

```bash
npm run dev
```

**Expected Output:**

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in 5.2s (243 modules)
```

The application will be accessible at [http://localhost:3000](http://localhost:3000). The development server includes:

- Hot Module Replacement (HMR) for instant code updates
- Automatic TypeScript compilation
- Built-in error reporting
- API route handling

### Available Scripts

The package.json file includes several useful scripts for development:

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run end-to-end tests
npm run e2e

# Check code quality
npm run lint:check
```

**Section sources**

- [README.md](file://README.md#L67-L75)
- [package.json](file://package.json#L10-L38)
- [CONTRIBUTING.md](file://CONTRIBUTING.md#L98-L103)

## Demo Mode

Kafkasder-panel includes a demo mode that allows you to explore the application's features without requiring a full production setup.

### Demo Features

- Pre-configured with sample data for demonstration purposes
- Analytics and some financial reports use demo data
- Real-time database functionality is simulated
- All core features are available for testing

### Enabling Demo Mode

Demo mode is automatically enabled when certain environment variables are not configured. The application detects missing Convex configuration and falls back to demo mode with appropriate warnings.

To verify demo mode status, check the health endpoint:

```bash
curl http://localhost:3000/api/health?detailed=true
```

The response will indicate if the application is running in demo mode and list any missing configurations.

**Section sources**

- [README.md](file://README.md#L13-L14)
- [src/app/api/health/route.ts](file://src/app/api/health/route.ts#L84-L135)

## Production Configuration

When preparing Kafkasder-panel for production deployment, additional configuration is required beyond the development setup.

### Required Production Variables

In addition to the development variables, production deployments require:

```env
# Production URL
NEXTAUTH_URL=https://yourdomain.com

# Production secrets (must be strong, 32+ characters)
NEXTAUTH_SECRET=production-auth-secret-here
CSRF_SECRET=production-csrf-secret-here

# Rate limiting (recommended production values)
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
```

### Deployment Options

The application supports multiple deployment methods:

**Vercel (Recommended)**

- Native Next.js integration
- Automatic CI/CD pipeline
- Easy environment variable management
- Global CDN and edge functions

**Docker**

- Containerized deployment
- Consistent environment across platforms
- Easy scaling and orchestration

**VPS (Ubuntu)**

- Full control over server configuration
- Custom domain and SSL management
- Direct access to server logs and monitoring

Detailed deployment instructions are available in the [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md) file.

**Section sources**

- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md#L1-L460)
- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md#L76-L90)
- [vercel.json](file://vercel.json)

## Common Setup Issues

This section addresses frequently encountered setup issues and their solutions.

### Convex URL Not Configured

**Error:** "NEXT_PUBLIC_CONVEX_URL is not set"

**Solution:**

1. Run `npx convex dev` to initialize Convex
2. Verify the Convex URL is present in `.env.local`
3. Restart the development server

### Invalid Authentication Secrets

**Error:** "CSRF secret must be at least 32 characters"

**Solution:**
Generate a proper 32-character secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32
```

### Rate Limiting in Development

**Issue:** API requests being blocked during development

**Solution:**
Increase rate limits in `.env.local`:

```env
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=60000
```

### Build Failures

**Issue:** `npm run build` fails with dependency errors

**Solution:**
Clean the installation and retry:

```bash
npm run clean:all
npm ci
npm run build
```

### Health Check Failures

**Issue:** Health endpoint returns connectivity errors

**Solution:**

1. Verify Convex is running (`npx convex dev`)
2. Check environment variables
3. Ensure network connectivity to Convex cloud

The application's health check endpoint provides detailed diagnostics at `/api/health?detailed=true`.

**Section sources**

- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md#L242-L258)
- [src/app/api/health/route.ts](file://src/app/api/health/route.ts#L84-L135)
- [package.json](file://package.json#L23-L24)
