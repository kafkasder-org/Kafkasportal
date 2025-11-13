# Deployment Guide

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [vercel.json](file://vercel.json)
- [next.config.ts](file://next.config.ts)
- [package.json](file://package.json)
- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md)
- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md)
- [src/lib/env-validation.ts](file://src/lib/env-validation.ts)
- [src/lib/convex/client.ts](file://src/lib/convex/client.ts)
- [convex/schema.ts](file://convex/schema.ts)
</cite>

## Table of Contents

1. [Environment Configuration Requirements](#environment-configuration-requirements)
2. [Build Process and Optimization Techniques](#build-process-and-optimization-techniques)
3. [Deployment to Vercel](#deployment-to-vercel)
4. [Alternative Deployment Options](#alternative-deployment-options)
5. [Common Deployment Issues and Solutions](#common-deployment-issues-and-solutions)
6. [Performance Optimization Tips for Production](#performance-optimization-tips-for-production)

## Environment Configuration Requirements

The Kafkasder-panel application requires specific environment variables to be configured for different deployment environments. These variables are validated at both build time and runtime using Zod schema validation defined in `src/lib/env-validation.ts`.

For development, create a `.env.local` file based on the `.env.example` template. The application requires Convex configuration, authentication secrets, and optional service integrations. The `NEXT_PUBLIC_CONVEX_URL` variable must point to your Convex deployment URL, while `NEXTAUTH_SECRET` and `CSRF_SECRET` must be strong, randomly generated secrets of at least 32 characters.

In production, additional security considerations apply. Secrets should be stored in secure vaults or key management systems rather than plaintext files. The environment validation ensures that critical variables are present and properly formatted, preventing the application from starting with invalid configuration.

The application distinguishes between client-side and server-side environment variables. Client-side variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, while server-side variables remain private. This includes optional integrations for email (SMTP), SMS (Twilio), analytics (Sentry), and rate limiting configurations.

**Section sources**

- [src/lib/env-validation.ts](file://src/lib/env-validation.ts#L8-L77)
- [docs/ENVIRONMENT.md](file://docs/ENVIRONMENT.md#L1-L267)
- [README.md](file://README.md#L59-L64)

## Build Process and Optimization Techniques

The build process for Kafkasder-panel leverages Next.js 16's advanced optimization features to produce highly efficient production bundles. The `next.config.ts` file contains extensive configuration for performance optimization, including bundle analysis, image optimization, and webpack configuration.

Key optimization techniques include:

- **Bundle splitting**: The configuration implements sophisticated code splitting with cache groups for framework code, UI libraries, and vendor dependencies to maximize caching efficiency
- **Image optimization**: Aggressive image optimization with support for modern formats (AVIF, WebP) and long cache TTLs (1 year) for static assets
- **Tree-shaking**: The `optimizePackageImports` configuration enables tree-shaking for UI libraries like Radix UI and Lucide React
- **Security headers**: Comprehensive security headers are configured including HSTS, CSP, and XSS protection
- **Compression**: Built-in compression and optimized asset delivery

The build process can be analyzed using the `ANALYZE=true` flag which enables bundle analysis. The configuration also includes development optimizations that disable certain optimizations during development for faster build times.

**Section sources**

- [next.config.ts](file://next.config.ts#L1-L441)
- [package.json](file://package.json#L11-L22)

## Deployment to Vercel

Vercel is the recommended deployment platform for Kafkasder-panel due to its native integration with Next.js and streamlined deployment workflow.

### Prerequisites

1. A Vercel account connected to your GitHub/GitLab repository
2. A production Convex deployment URL obtained via `npx convex deploy --prod`
3. Properly configured environment variables in Vercel's dashboard

### Deployment Steps

1. Initialize Vercel CLI: `npm install -g vercel` and `vercel login`
2. Deploy using the production script: `npm run vercel:prod`
3. Alternatively, connect your repository to Vercel and enable automatic deployment on git push to main branch

### Environment Variables Configuration

In Vercel Dashboard > Project Settings > Environment Variables, configure:

- `NEXT_PUBLIC_CONVEX_URL`: Your Convex production URL
- `CSRF_SECRET` and `SESSION_SECRET`: Strong, randomly generated secrets
- Optional: Sentry DSN, Twilio credentials, and other service integrations

The `vercel.json` configuration file specifies the build command, regions, and environment variable mapping, including the use of Vercel's secret management system with the `@` prefix for secret references.

Convex integration is automatically handled through the environment variables, with the client-side Convex URL validation ensuring proper configuration before client initialization.

**Section sources**

- [vercel.json](file://vercel.json#L1-L22)
- [package.json](file://package.json#L29-L32)
- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md#L31-L118)
- [src/lib/convex/client.ts](file://src/lib/convex/client.ts#L4-L42)

## Alternative Deployment Options

### Docker Deployment

The application can be containerized using Docker with a multi-stage build process. The Dockerfile (not present in repository but standard practice) would:

1. Use Node.js 20-alpine as base image
2. Install dependencies in a builder stage
3. Copy build artifacts to a production runner stage
4. Expose port 3000 and run the application

Environment variables are passed at runtime, and the container can be orchestrated with Docker Compose for local production-like environments.

### VPS Deployment (Ubuntu)

For self-hosted deployments on Ubuntu VPS:

1. Install Node.js 20+, PM2 process manager, Nginx, and Certbot
2. Clone the repository and install dependencies
3. Configure environment variables in `.env.production`
4. Build the application with `npm run build`
5. Run with PM2 and configure Nginx as reverse proxy
6. Set up SSL with Certbot

This approach provides full control over the infrastructure but requires manual maintenance and monitoring.

**Section sources**

- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md#L121-L307)
- [package.json](file://package.json#L11-L14)

## Common Deployment Issues and Solutions

### Convex Connection Issues

**Symptom**: "Convex connection failed" or invalid Convex URL
**Solution**:

- Verify the `NEXT_PUBLIC_CONVEX_URL` is correctly formatted with `.convex.cloud` domain
- Ensure the Convex deployment is active and accessible
- Check that CORS settings allow your domain

### Environment Variable Validation Failures

**Symptom**: Application fails to start with environment validation errors
**Solution**:

- Verify all required environment variables are present
- Ensure `CSRF_SECRET` and `SESSION_SECRET` are at least 32 characters
- Check that `NEXT_PUBLIC_CONVEX_URL` is a valid HTTPS URL

### Build Failures

**Symptom**: `npm run build` fails
**Solution**:

- Clean the build cache: `rm -rf .next` and reinstall node_modules if necessary
- Verify Node.js version is 20.9.0 or higher
- Check for TypeScript or linting errors that might block production builds

### Authentication Issues

**Symptom**: "NEXTAUTH_URL not set" or authentication failures
**Solution**:

- Ensure `NEXTAUTH_URL` is set to your production domain with HTTPS
- Verify `NEXTAUTH_SECRET` is properly configured and consistent across deployments

### Rate Limiting Issues

**Symptom**: API endpoints returning 429 Too Many Requests
**Solution**:

- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` values
- For development, increase limits to avoid interference with development workflow

**Section sources**

- [src/lib/env-validation.ts](file://src/lib/env-validation.ts#L96-L106)
- [docs/DEPLOYMENT.md](file://docs/DEPLOYMENT.md#L423-L450)
- [src/lib/convex/client.ts](file://src/lib/convex/client.ts#L41-L42)

## Performance Optimization Tips for Production

### Caching Strategy

Implement aggressive caching for static assets with long TTLs (1 year) as configured in `next.config.ts`. Use Vercel's edge caching for dynamic content where appropriate.

### Bundle Optimization

Monitor bundle size using the built-in analyzer (`ANALYZE=true npm run build`). Focus on optimizing the largest chunks, particularly framework and UI library bundles.

### Database Optimization

Leverage Convex's real-time capabilities efficiently by:

- Using appropriate indexes defined in `convex/schema.ts`
- Implementing proper data fetching patterns to minimize unnecessary queries
- Utilizing Convex's query optimization features

### Monitoring and Analytics

Enable Sentry error tracking for production error monitoring. Use Vercel Analytics or alternative solutions like Google Analytics for performance monitoring.

### Security Hardening

Ensure all security headers are properly configured as defined in `next.config.ts`, including:

- HSTS for HTTPS enforcement
- Strict CSP policies
- X-Frame-Options and X-XSS-Protection headers
- Proper CORS configuration

Regularly update dependencies and perform security audits to maintain application security.

**Section sources**

- [next.config.ts](file://next.config.ts#L101-L232)
- [convex/schema.ts](file://convex/schema.ts#L1-L800)
- [package.json](file://package.json#L69)
