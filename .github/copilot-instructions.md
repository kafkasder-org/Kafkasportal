# GitHub Copilot Instructions for Kafkasder Panel

## Overview

Non-profit association management system built with Next.js 16, React 19, and Convex.

## Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Complete AI assistant guide
- **[docs/](../docs/)** - Technical documentation
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

## Quick Reference

### Architecture

- **Backend**: Convex (not Next.js API routes)
- **Frontend**: Next.js 16 App Router + React 19
- **Styling**: Tailwind CSS 4 + Radix UI
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Auth**: Custom bcrypt-based (not NextAuth)

### Key Rules

- **NO `console.log`** - use `src/lib/logger.ts`
- **Convex functions** must use object syntax with `handler`
- **Zod validation** for all inputs
- **TypeScript strict mode** enabled

### Commands

```bash
npm run typecheck    # Type checking
npm run lint         # ESLint
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run build        # Production build
```

### Code Style

- Prefer `const` over `let`
- Use object shorthand
- Follow existing patterns
- Add Zod validation for inputs
