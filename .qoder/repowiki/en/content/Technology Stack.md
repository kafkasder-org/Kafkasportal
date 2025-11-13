# Technology Stack

<cite>
**Referenced Files in This Document**   
- [next.config.ts](file://next.config.ts)
- [tailwind.config.js](file://tailwind.config.js)
- [sentry.client.config.ts](file://sentry.client.config.ts)
- [sentry.server.config.ts](file://sentry.server.config.ts)
- [src/lib/rate-limit.ts](file://src/lib/rate-limit.ts)
- [src/lib/csrf.ts](file://src/lib/csrf.ts)
- [src/stores/authStore.ts](file://src/stores/authStore.ts)
- [src/lib/api/convex-api-client.ts](file://src/lib/api/convex-api-client.ts)
- [convex/schema.ts](file://convex/schema.ts)
- [package.json](file://package.json)
- [src/lib/security.ts](file://src/lib/security.ts)
- [src/types/auth.ts](file://src/types/auth.ts)
- [src/types/permissions.ts](file://src/types/permissions.ts)
- [src/types/database.ts](file://src/types/database.ts)
- [src/lib/api/crud-factory.ts](file://src/lib/api/crud-factory.ts)
- [src/hooks/useInfiniteScroll.ts](file://src/hooks/useInfiniteScroll.ts)
- [src/components/ui/data-table.tsx](file://src/components/ui/data-table.tsx)
</cite>

## Table of Contents

1. [Frontend Technologies](#frontend-technologies)
2. [Backend Technologies](#backend-technologies)
3. [State Management](#state-management)
4. [Security Features](#security-features)
5. [Technology Integration](#technology-integration)
6. [Technology Selection Rationale](#technology-selection-rationale)

## Frontend Technologies

The Kafkasder-panel frontend is built on a modern React-based stack with a focus on performance, developer experience, and user interface quality. The core technologies include Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion.

### Next.js 16

Next.js 16 serves as the foundation of the frontend architecture, providing server-side rendering, static site generation, and API routes. The application leverages several advanced features of Next.js 16 as configured in the `next.config.ts` file. The configuration includes performance optimizations such as package import optimization for tree-shaking, critical CSS extraction, and partial prerendering. The experimental `optimizePackageImports` feature is used to optimize imports for libraries like `lucide-react`, `framer-motion`, `zod`, and `@tanstack/react-query`, reducing bundle size by automatically importing only the necessary components.

The application also implements comprehensive security headers through the `headers()` function in the Next.js configuration. These include X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and a strict Content-Security-Policy that varies between development and production environments. In production, the application enforces HTTPS with HSTS (HTTP Strict Transport Security) and implements Cross-Origin policies to prevent various types of attacks.

Image optimization is configured to support modern formats like AVIF and WebP, with aggressive caching strategies that set a one-year cache TTL for static assets. The configuration also includes webpack optimizations for production builds, such as code splitting with cache groups for framework, Radix UI components, and other vendor libraries, ensuring optimal loading performance.

**Section sources**

- [next.config.ts](file://next.config.ts#L1-L441)

### React 19

React 19 is used as the core UI library, providing the component model and rendering engine for the application. The specific version 19.2.0 is specified in the `package.json` file, ensuring consistency across the development team. React 19 introduces several improvements over previous versions, including enhanced server components, improved streaming capabilities, and better performance characteristics.

The application leverages React's component-based architecture extensively, with components organized in the `src/components` directory. The use of React Server Components (indicated by the `'use client'` directive in client components) allows for optimal data fetching and rendering strategies, where server components can directly access data sources without the need for API calls, while client components handle interactive elements.

React's context API is used in conjunction with Zustand for state management, providing a clean separation between global application state and component-specific state. The application also takes advantage of React's concurrent rendering features, enabling smoother user experiences during data loading and state transitions.

**Section sources**

- [package.json](file://package.json#L93-L95)

### TypeScript

TypeScript is used throughout the codebase to provide static type checking and improve code quality. The application uses TypeScript 5+ (specified in package.json) with a comprehensive type system that defines interfaces for all data models, API responses, and component props.

The type system is particularly robust in the `src/types` directory, where interfaces are defined for authentication (`auth.ts`), permissions (`permissions.ts`), and database documents (`database.ts`). The `database.ts` file contains detailed type definitions for all Convex collections, including `UserDocument`, `BeneficiaryDocument`, `DonationDocument`, and others, ensuring type safety when working with database records.

TypeScript's utility types are used extensively, such as `CreateDocumentData<T>` and `UpdateDocumentData<T>` which are `Omit` types that exclude system fields like `_id` and `_creationTime` when creating or updating documents. This prevents accidental modification of immutable fields and provides a clear API for data manipulation.

The application also uses TypeScript's const assertions and literal types to define permission values and status enums, ensuring that only valid values can be used in the code. For example, the `PermissionValue` type is a union of string literals defined in `permissions.ts`, preventing typos and ensuring consistency across the application.

**Section sources**

- [src/types/auth.ts](file://src/types/auth.ts#L1-L44)
- [src/types/permissions.ts](file://src/types/permissions.ts#L1-L39)
- [src/types/database.ts](file://src/types/database.ts#L1-L552)

### Tailwind CSS

Tailwind CSS is used as the utility-first CSS framework for styling the application. The configuration in `tailwind.config.js` specifies the content sources, including all pages, components, and app directory files, ensuring that all used classes are included in the final CSS bundle.

The application follows a utility-first approach, with most styling done directly in the JSX using Tailwind classes. This approach enables rapid UI development and ensures consistency across the application. The configuration does not include custom theme extensions, relying on Tailwind's default design tokens for spacing, colors, and typography.

The application also uses several Tailwind-compatible libraries such as `class-variance-authority` and `clsx` for conditional class composition, and `tailwind-merge` for safely merging Tailwind classes. These utilities help manage complex class compositions while avoiding conflicts and ensuring that the most specific classes take precedence.

**Section sources**

- [tailwind.config.js](file://tailwind.config.js#L1-L13)

### Framer Motion

Framer Motion is used for animations and transitions throughout the application, providing a smooth and engaging user experience. The library is included in the `optimizePackageImports` configuration in `next.config.ts`, ensuring that only the necessary animation functions are included in the bundle.

Framer Motion is used in several key components, including the `DataTable` component which uses `motion.tr` and `AnimatePresence` for row animations when data changes. The `DataTable` component implements a staggered animation effect where rows appear sequentially with a slight delay, creating a polished loading experience.

The application also uses Framer Motion for page transitions, modal animations, and interactive feedback. The integration with React is seamless, allowing for declarative animation definitions that respond to state changes. For example, the loading state in the `DataTable` component uses a `Loader2` icon with the `animate-spin` class, while error states use motion components to animate the appearance of error messages.

**Section sources**

- [next.config.ts](file://next.config.ts#L36)
- [src/components/ui/data-table.tsx](file://src/components/ui/data-table.tsx#L4)

## Backend Technologies

The backend of Kafkasder-panel is built on a modern serverless architecture using Convex as the real-time database and Next.js API Routes for server-side logic. This combination provides a scalable, secure, and efficient backend solution.

### Convex Real-Time Database

Convex serves as the primary database for the application, providing a serverless, real-time data layer that integrates seamlessly with the Next.js frontend. The database schema is defined in `convex/schema.ts`, which uses Convex's type-safe schema definition API to define collections and their fields.

The schema includes a comprehensive set of collections for managing the organization's operations, including `users`, `beneficiaries`, `donations`, `tasks`, `meetings`, and many others. Each collection is defined with specific field types and validation rules, ensuring data integrity. For example, the `beneficiaries` collection includes fields for personal information, family size, income level, health status, and aid history, with appropriate data types for each field.

Convex provides several key advantages for this application:

- **Real-time updates**: Clients automatically receive updates when data changes, enabling collaborative features like shared task management and meeting coordination.
- **Serverless functions**: Database operations are performed through serverless functions, eliminating the need for traditional API endpoints for basic CRUD operations.
- **Type safety**: The schema definition generates TypeScript types that are used throughout the application, ensuring consistency between the database and frontend code.
- **Security**: Convex includes built-in security features, with the application layer adding additional security measures like CSRF protection and rate limiting.

The schema also includes search indexes on key collections like `users`, `beneficiaries`, and `messages`, enabling efficient full-text search capabilities. These indexes are configured to search specific fields and support filtering, making it easy to implement search functionality in the UI.

**Section sources**

- [convex/schema.ts](file://convex/schema.ts#L1-L800)

### Next.js API Routes

Next.js API Routes provide the server-side endpoint layer for the application, acting as a bridge between the frontend and the Convex database. These routes are defined in the `src/app/api` directory, with each route corresponding to a specific resource or operation.

The API routes follow a RESTful pattern, with routes for each major entity in the system, such as `/api/beneficiaries`, `/api/donations`, and `/api/tasks`. Each route directory contains a `route.ts` file that defines the HTTP methods supported by that endpoint. For example, the `/api/beneficiaries/route.ts` file implements GET, POST, PUT, and DELETE methods for managing beneficiary records.

The API routes serve several important purposes:

- **Security layer**: They implement security measures like CSRF protection and rate limiting before forwarding requests to Convex.
- **Authentication**: They handle session management and authentication, verifying user credentials and managing session cookies.
- **Data transformation**: They transform data between the format expected by the frontend and the format stored in Convex.
- **Business logic**: They implement complex business logic that cannot be handled by simple database operations.

The routes are organized hierarchically, with nested routes for related operations. For example, `/api/beneficiaries/[id]/route.ts` handles operations on a specific beneficiary, while `/api/meeting-action-items/[id]/route.ts` handles operations on specific meeting action items. This organization makes the API intuitive and easy to navigate.

**Section sources**

- [src/app/api](file://src/app/api)

## State Management

The application uses a combination of Zustand and TanStack Query for state management, providing a comprehensive solution for managing both client state and server state.

### Zustand

Zustand is used for managing global client state, particularly authentication state and user preferences. The primary state store is defined in `src/stores/authStore.ts`, which uses Zustand's `create` function to define a store with actions and state.

The auth store manages several key pieces of state:

- **Authentication state**: Whether the user is authenticated, their user information, and session details.
- **UI state**: Modal visibility, loading states, and error messages.
- **Permissions**: The user's role and permissions, used for access control.

The store uses several Zustand middleware:

- **persist**: Persists the authentication state to localStorage, allowing users to remain logged in between sessions.
- **devtools**: Integrates with Redux DevTools for debugging state changes.
- **immer**: Allows for mutable-style updates to state while maintaining immutability.
- **subscribeWithSelector**: Enables selective subscription to parts of the store, optimizing re-renders.

The store is designed with a clear separation between state and actions, with actions like `login`, `logout`, and `initializeAuth` that encapsulate the logic for authentication operations. The store also includes permission helper functions like `hasPermission` and `hasRole` that make it easy to implement access control in components.

**Section sources**

- [src/stores/authStore.ts](file://src/stores/authStore.ts#L1-L403)

### TanStack Query

TanStack Query (formerly React Query) is used for managing server state, providing a powerful caching and synchronization layer for data fetched from the API. The library is configured in the `optimizePackageImports` section of `next.config.ts`, ensuring optimal bundle size.

The application uses TanStack Query extensively for data fetching, particularly through the `useInfiniteQuery` hook in the `useInfiniteScroll` custom hook defined in `src/hooks/useInfiniteScroll.ts`. This hook implements infinite scrolling for large datasets, automatically fetching additional pages of data as the user scrolls.

Key features of the TanStack Query implementation include:

- **Caching**: Responses are cached automatically, reducing unnecessary network requests.
- **Background refetching**: Data is refreshed in the background to ensure it stays up-to-date.
- **Error handling**: Built-in error handling and retry mechanisms.
- **Pagination**: Support for paginated data through the `getNextPageParam` function.

The `useInfiniteScroll` hook provides a clean API for implementing infinite scrolling in components, handling the complexity of page management and intersection observation. It returns data, loading states, and a ref to attach to the scroll sentinel element, making it easy to implement in any component.

**Section sources**

- [next.config.ts](file://next.config.ts#L41)
- [src/hooks/useInfiniteScroll.ts](file://src/hooks/useInfiniteScroll.ts#L1-L124)

## Security Features

The application implements a comprehensive security strategy with multiple layers of protection, including CSRF protection, rate limiting, and error monitoring with Sentry.

### CSRF Protection

CSRF (Cross-Site Request Forgery) protection is implemented to prevent unauthorized actions on behalf of authenticated users. The implementation is defined in `src/lib/csrf.ts`, which provides utilities for generating and validating CSRF tokens.

The CSRF protection works as follows:

1. When a user visits the site, a CSRF token is generated and stored in a cookie.
2. For state-changing requests (POST, PUT, PATCH, DELETE), the client includes the CSRF token in the `x-csrf-token` header.
3. The server validates that the token in the header matches the token in the cookie.

The `generateCsrfToken` function creates a cryptographically secure token using Node.js's `crypto.randomBytes` function. The `validateCsrfToken` function performs a constant-time comparison to prevent timing attacks, ensuring that the validation cannot be exploited to determine the correct token character by character.

The client-side `fetchWithCsrf` function wraps the native `fetch` API, automatically adding the CSRF token to requests that require it. This makes it easy for components to make secure requests without having to manually manage tokens.

The authentication flow in the `authStore` uses CSRF protection when logging in, ensuring that login requests cannot be forged by malicious sites.

**Section sources**

- [src/lib/csrf.ts](file://src/lib/csrf.ts#L1-L90)
- [src/stores/authStore.ts](file://src/stores/authStore.ts#L153-L164)

### Rate Limiting

Rate limiting is implemented to prevent abuse of the API and protect against brute force attacks. The implementation is defined in `src/lib/rate-limit.ts` and `src/lib/security.ts`, providing a flexible and configurable rate limiting system.

The rate limiting system uses a token bucket algorithm, tracking the number of requests from each client within a specified time window. The `RateLimiter` class in `security.ts` manages the rate limit records in memory, with configurable limits for different types of requests.

The application defines several pre-configured rate limiters for different endpoints:

- **authRateLimit**: Limits authentication attempts to 10 per 10 minutes, with successful and failed attempts not counted to prevent denial of service.
- **dataModificationRateLimit**: Limits data modification requests to 50 per 15 minutes.
- **readOnlyRateLimit**: Allows up to 200 read-only requests per 15 minutes.
- **uploadRateLimit**: Limits uploads to 10 per minute.
- **searchRateLimit**: Limits searches to 30 per minute.
- **dashboardRateLimit**: Limits dashboard requests to 60 per minute.

The rate limiting middleware in `rate-limit.ts` extracts the client's IP address from request headers and combines it with the HTTP method and URL path to create a unique identifier for rate limiting. This prevents a single client from overwhelming the server with requests.

The system also includes configurable whitelists and blacklists for IP addresses, allowing trusted clients to bypass rate limits or blocking known malicious clients. Violations are logged for monitoring and analysis.

**Section sources**

- [src/lib/rate-limit.ts](file://src/lib/rate-limit.ts#L1-L148)
- [src/lib/security.ts](file://src/lib/security.ts#L78-L280)

### Sentry Integration

Sentry is integrated for error monitoring and performance tracking, providing visibility into client-side and server-side errors. The configuration is defined in `sentry.client.config.ts` and `sentry.server.config.ts`, with separate configurations for browser and server environments.

The Sentry integration captures:

- **Errors**: Unhandled exceptions and promise rejections.
- **Performance**: Page load times and API request durations.
- **User context**: Information about the user and their environment.
- **Releases**: Tracking of deployed versions.

The client-side configuration sets a higher sampling rate for errors in development (100%) and a lower rate in production (10%), balancing detailed debugging information with performance and cost considerations. The server-side configuration similarly adjusts sampling rates based on the environment.

Sentry is configured to include release tracking, allowing errors to be correlated with specific code deployments. This makes it easier to identify when issues were introduced and to verify that fixes have resolved the problems.

The integration also includes environment-specific settings, with additional filtering in production to avoid sending development errors to the production Sentry project.

**Section sources**

- [sentry.client.config.ts](file://sentry.client.config.ts#L1-L25)
- [sentry.server.config.ts](file://sentry.server.config.ts#L1-L23)

## Technology Integration

The technologies in Kafkasder-panel work together to create a cohesive and efficient application architecture. The integration between frontend and backend technologies enables a smooth development experience and optimal performance.

### Frontend-Backend Communication

The application uses a clean separation between frontend and backend, with API routes acting as the interface between the two. The `convex-api-client.ts` file provides a client-side wrapper that calls Next.js API routes, which in turn use Convex for data operations.

This architecture provides several benefits:

- **Security**: Sensitive operations are performed on the server, preventing direct client access to the database.
- **Consistency**: All data operations go through a standardized API, ensuring consistent behavior.
- **Flexibility**: Business logic can be implemented in the API routes without requiring changes to the frontend.

The API client uses a CRUD factory pattern defined in `crud-factory.ts` to generate consistent API clients for different entities. This reduces code duplication and ensures that all entities have the same interface for common operations like create, read, update, and delete.

### Data Flow

The data flow in the application follows a predictable pattern:

1. Components initiate data operations through the API client.
2. The API client makes HTTP requests to Next.js API routes.
3. API routes validate requests, apply security measures, and call Convex functions.
4. Convex performs the database operations and returns data.
5. API routes transform the data and return it to the client.
6. The API client caches the response and returns it to the component.
7. TanStack Query manages the server state, updating components when data changes.

This flow ensures that data is always consistent and that components receive updates when data changes, either through direct mutations or background refetching.

### Component Architecture

The component architecture follows a modular pattern, with components organized by feature in the `src/components` directory. UI components are further organized in the `src/components/ui` directory, following the Headless UI pattern with unstyled components that can be customized with Tailwind classes.

The application uses a combination of server and client components, with server components handling data fetching and client components handling interactivity. This separation allows for optimal performance, with server components able to directly access data sources without the overhead of API calls.

## Technology Selection Rationale

The technology choices for Kafkasder-panel were made to balance developer productivity, application performance, security, and long-term maintainability.

### Next.js and React

Next.js was chosen as the framework because it provides a complete solution for React applications, including routing, server-side rendering, and API routes. The ability to co-locate API routes with the frontend simplifies development and deployment. React 19 was selected for its improved performance and new features that enhance the developer experience.

### Convex

Convex was chosen as the database because it provides a serverless, real-time data layer that integrates seamlessly with React applications. Its type-safe API and real-time capabilities make it ideal for collaborative applications like Kafkasder-panel, where multiple users may be working with the same data simultaneously.

### TypeScript

TypeScript was selected to improve code quality and developer productivity. The type system catches errors at compile time, reducing bugs and making the codebase easier to understand and maintain. The integration with Convex's type generation ensures consistency between the database schema and application code.

### Tailwind CSS

Tailwind CSS was chosen for its utility-first approach, which enables rapid UI development and ensures consistency across the application. The ability to style components directly in the JSX reduces context switching and makes it easier to see the relationship between markup and styling.

### Zustand and TanStack Query

Zustand was selected for global state management because of its simplicity and performance. It provides a lightweight solution for managing authentication state and other global data. TanStack Query was chosen for server state management because of its powerful caching and synchronization capabilities, which are essential for a data-intensive application like Kafkasder-panel.

### Security Technologies

The security technologies were chosen to provide comprehensive protection against common web vulnerabilities. CSRF protection prevents unauthorized actions, rate limiting prevents abuse, and Sentry provides visibility into errors and performance issues. These technologies work together to create a secure and reliable application.
