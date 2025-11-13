# Developer Guide

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [CONTRIBUTING.md](file://CONTRIBUTING.md)
- [package.json](file://package.json)
- [eslint.config.mjs](file://eslint.config.mjs)
- [src/lib/env-validation.ts](file://src/lib/env-validation.ts)
- [src/lib/sanitization.ts](file://src/lib/sanitization.ts)
- [src/lib/error-tracker.ts](file://src/lib/error-tracker.ts)
- [src/components/ui/file-upload.tsx](file://src/components/ui/file-upload.tsx)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Environment Setup](#environment-setup)
3. [Coding Standards](#coding-standards)
4. [Contribution Guidelines](#contribution-guidelines)
5. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
6. [Extension Points and Customization](#extension-points-and-customization)
7. [Conclusion](#conclusion)

## Introduction

This Developer Guide provides comprehensive information for developers working with Kafkasder-panel, a nonprofit association management system built with Next.js 16, TypeScript, and Convex. The guide covers setup instructions, coding standards, contribution processes, debugging techniques, and customization options to ensure a consistent and productive development experience.

The system is designed for Turkish nonprofit organizations and includes modules for beneficiary management, donation tracking, scholarship programs, financial management, and communication tools. This documentation will help new developers get started quickly and contribute effectively to the project.

**Section sources**

- [README.md](file://README.md#L1-L179)

## Environment Setup

### Prerequisites

Before setting up the development environment, ensure you have the following prerequisites installed:

- Node.js 20.9.0 or higher
- npm 9.0.0 or higher (or pnpm)
- Convex account
- Optional: Sentry account for error tracking

### Installation Steps

Follow these steps to set up the development environment:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start Convex development server
npx convex dev

# 5. Start the Next.js development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Configuration

The application uses environment variables for configuration, validated through Zod schemas in `src/lib/env-validation.ts`. There are two types of environment variables:

**Client-side variables** (prefixed with `NEXT_PUBLIC_`):

- `NEXT_PUBLIC_CONVEX_URL`: Convex backend URL
- `NEXT_PUBLIC_APP_NAME`: Application name (default: "Dernek Yönetim Sistemi")
- `NEXT_PUBLIC_APP_VERSION`: Application version (default: "1.0.0")
- `NEXT_PUBLIC_ENABLE_REALTIME`: Enable real-time features (default: true)
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics tracking (default: false)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for client-side error tracking

**Server-side variables**:

- `NODE_ENV`: Environment mode (development, production, test)
- `CSRF_SECRET`: CSRF protection secret (required in production)
- `SESSION_SECRET`: Session encryption secret (required in production)
- `SENTRY_DSN`: Sentry DSN for server-side error tracking
- Email configuration (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`)
- SMS configuration (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
- Rate limiting settings (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`)
- File upload limits (`MAX_FILE_SIZE`, `MAX_FILES_PER_UPLOAD`)

The environment validation system provides helpful error messages when required variables are missing or invalid, making it easier to troubleshoot configuration issues.

**Section sources**

- [README.md](file://README.md#L46-L76)
- [CONTRIBUTING.md](file://CONTRIBUTING.md#L34-L52)
- [src/lib/env-validation.ts](file://src/lib/env-validation.ts#L1-L213)

## Coding Standards

### TypeScript and React

The project follows strict TypeScript and React coding conventions to ensure code quality and maintainability:

**Interface and Type Definitions:**

- Use `interface` for object shapes rather than `type` aliases
- Avoid the `any` type; use specific types or `unknown` with proper type guards
- Use union types for finite sets of values (e.g., `variant?: 'primary' | 'secondary'`)

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Avoid
type User = {
  id: any; // 'any' should be avoided
  name: string;
};
```

**React Components:**

- Use functional components with TypeScript interfaces for props
- Destructure props in function parameters
- Provide default values for optional props
- Use descriptive prop names and include JSDoc comments for complex props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  onClick,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### CSS and Styling

The project uses Tailwind CSS for styling with the following guidelines:

- Use Tailwind utility classes exclusively
- Avoid custom CSS and inline styles
- Implement responsive design using Tailwind's responsive prefixes
- Follow the design system defined in `src/config/design-tokens.ts`

```typescript
// ✅ Good - Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Avoid - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Code Formatting and Linting

The project uses ESLint and Prettier for code formatting and quality checks. Key rules include:

- No console.log in production code (console.warn and console.error are allowed)
- Prefer const over let and var
- Use object shorthand and template literals where appropriate
- Enforce consistent code style across the codebase

Pre-commit hooks (Husky + lint-staged) automatically run formatting and linting checks before commits, ensuring code quality is maintained.

Available scripts:

```bash
# Lint check
npm run lint:check

# Lint fix
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

**Section sources**

- [CONTRIBUTING.md](file://CONTRIBUTING.md#L91-L149)
- [eslint.config.mjs](file://eslint.config.mjs#L1-L105)

## Contribution Guidelines

### Branch Strategy

The project follows a Git branching model with the following conventions:

- `main`: Protected branch for production code
- `feature/*`: Branches for new features (e.g., `feature/user-profile`)
- `bugfix/*`: Branches for bug fixes (e.g., `bugfix/login-error`)
- `hotfix/*`: Branches for urgent production fixes

### Commit Messages

The project uses Conventional Commits for commit message formatting:

```
<type>(<scope>): <description>

[optional body]
```

**Commit types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code formatting (not related to functionality)
- `refactor:` - Code refactoring
- `test:` - Test additions or fixes
- `chore:` - Build or dependency updates

**Examples:**

```bash
feat(auth): add two-factor authentication
fix(api): resolve user creation bug
docs(readme): update installation instructions
refactor(utils): simplify date formatting
```

### Pull Request Process

Before creating a pull request, ensure the following:

- [ ] Code is linted and formatted
- [ ] Type checking passes
- [ ] All tests pass
- [ ] Changes have been tested

Pull requests should follow the provided template:

```markdown
## Description

Brief description of changes made...

## Change Type

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

...

## Checklist

- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
```

The review process includes:

1. Automated checks (CI/CD pipeline for lint, test, build)
2. Code review by at least one maintainer
3. All tests must pass
4. Merge using squash merge

**Section sources**

- [CONTRIBUTING.md](file://CONTRIBUTING.md#L56-L250)

## Debugging and Troubleshooting

### Error Tracking and Reporting

The application includes a comprehensive error tracking system that captures errors with context and sends them to monitoring services. Key components include:

**Error Categories:**

- runtime: Application runtime errors
- ui_ux: User interface and experience issues
- design_bug: Design implementation bugs
- system: System-level issues
- data: Data-related problems
- security: Security vulnerabilities
- performance: Performance issues
- integration: Third-party integration problems

**Error Severity Levels:**

- critical: System-breaking issues
- high: Major functionality affected
- medium: Minor functionality affected
- low: Cosmetic issues

The error tracking system automatically captures device information, performance metrics, and page context to help diagnose issues. Errors are reported to Sentry and stored in the application's error management system.

### Debugging Tools

The project provides several tools for debugging:

**Development Error Boundaries:**
In development mode, error boundaries provide detailed error information including:

- Error message and stack trace
- Component hierarchy
- Local storage contents
- Option to download error reports as JSON files

**Console Commands:**

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run E2E tests
npm run e2e
```

**Environment Validation:**
The environment validation system provides clear error messages when required environment variables are missing or invalid, helping to quickly identify configuration issues.

### Common Issues and Solutions

**Convex Development Server Not Working:**

```bash
# Ensure Convex CLI is installed globally
npm install -g convex
# Start Convex development server
npx convex dev
```

**Linting Errors:**

```bash
# Automatically fix linting issues
npm run lint:fix
```

**Test Failures:**

```bash
# Clean cache and reinstall dependencies
npm run clean
npm install
npm test
```

**PR Not Merging:**

- Ensure CI/CD checks are passing
- Obtain code review approval
- Resolve any merge conflicts

**Section sources**

- [src/lib/error-tracker.ts](file://src/lib/error-tracker.ts#L1-L360)
- [src/lib/sanitization.ts](file://src/lib/sanitization.ts#L1-L412)
- [src/components/ui/file-upload.tsx](file://src/components/ui/file-upload.tsx#L1-L426)
- [CONTRIBUTING.md](file://CONTRIBUTING.md#L273-L295)

## Extension Points and Customization

### File Upload Validation

The application includes a robust file upload validation system that can be customized for different use cases. The `validateFile` function in `src/lib/sanitization.ts` provides configurable validation for:

- Maximum file size
- Allowed MIME types
- Allowed file extensions
- Filename sanitization

Custom validation rules can be applied by passing options to the validation function:

```typescript
const validation = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB limit
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['.jpg', '.jpeg', '.png'],
});
```

### Input Sanitization

The input sanitization library provides functions to safely handle user input and prevent security vulnerabilities:

**Available sanitization functions:**

- `sanitizeHtml`: Clean HTML content to prevent XSS attacks
- `sanitizeText`: Remove HTML tags and special characters from text
- `sanitizeEmail`: Validate and normalize email addresses
- `sanitizePhone`: Validate and format Turkish phone numbers
- `sanitizeTcNo`: Validate Turkish ID numbers with checksum verification
- `sanitizeUrl`: Validate URLs and block dangerous protocols
- `sanitizeFilename`: Clean filenames to prevent path traversal
- `sanitizeSearchQuery`: Prevent SQL injection in search queries
- `sanitizeNumber`: Handle Turkish number formats (5.000,50) and convert to standard format
- `sanitizeDate`: Validate dates within reasonable ranges (1900-2100)

These functions can be extended or customized to meet specific organizational requirements.

### Error Reporting Customization

The error reporting system can be extended to integrate with different notification services. The `sendCriticalErrorEmail` function provides a placeholder for email integration that can be customized to work with various email providers.

Custom error categories and severity levels can be added to the system to better reflect organizational needs.

### UI Component Customization

The UI components are designed to be extensible and customizable:

- Use the `className` prop to add custom Tailwind classes
- Override default styles through component props
- Extend components by wrapping them with additional functionality
- Customize the design system by modifying `src/config/design-tokens.ts`

The component library follows a modular architecture that allows for easy customization while maintaining consistency across the application.

**Section sources**

- [src/lib/sanitization.ts](file://src/lib/sanitization.ts#L1-L412)
- [src/components/ui/file-upload.tsx](file://src/components/ui/file-upload.tsx#L1-L426)

## Conclusion

This Developer Guide provides a comprehensive overview of the Kafkasder-panel development environment, coding standards, contribution processes, debugging tools, and customization options. By following these guidelines, developers can effectively contribute to the project and extend its functionality to meet various organizational needs.

The project's focus on code quality, security, and maintainability ensures a robust foundation for nonprofit organizations to manage their operations efficiently. The combination of modern technologies like Next.js, TypeScript, and Convex with thoughtful architecture and development practices creates a powerful platform for social impact organizations.

For additional information, refer to the related documentation:

- [README.md](README.md) - Project overview
- [TODO.md](docs/TODO.md) - Planned features
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [ENVIRONMENT.md](docs/ENVIRONMENT.md) - Environment variables
- [API.md](docs/API.md) - API documentation
- [CHANGELOG.md](CHANGELOG.md) - Change history
