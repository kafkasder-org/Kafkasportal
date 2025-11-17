# Teknoloji Stack

## Frontend
- **Next.js 16**: App Router (React Server Components)
- **React 19.2.0**: UI framework
- **TypeScript 5**: Tip güvenliği
- **Tailwind CSS 4**: Styling (PostCSS ile)
- **Radix UI**: Headless UI components
- **Framer Motion**: Animasyonlar
- **Lucide React**: İkonlar

## Backend
- **Convex 1.29.1**: Primary backend (real-time database + functions)
  - Custom authentication (bcrypt)
  - File storage
  - Real-time subscriptions
- **Next.js API Routes**: Convex proxy katmanı

## State Management
- **TanStack Query (React Query)**: Server state
- **Zustand**: Client state
- **React Hook Form**: Form state
- **Zod**: Runtime validation

## Data Visualization & Tables
- **TanStack Table**: Data grids
- **Recharts**: Charts ve grafikler

## Testing
- **Vitest**: Unit/integration tests
- **Playwright**: E2E tests
- **React Testing Library**: Component testing
- **MSW**: API mocking

## Development Tools
- **ESLint 9**: Linting (@convex-dev/eslint-plugin dahil)
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks

## Integrations
- **Sentry**: Error tracking & monitoring
- **Vercel Analytics**: Performance tracking
- **WhatsApp Web.js**: WhatsApp messaging
- **Twilio**: SMS gönderimi
- **Nodemailer**: Email gönderimi
- **Google Maps API**: Konum servisleri
- **jsPDF**: PDF oluşturma
- **XLSX**: Excel export

## AI/ML
- **AI SDK (Vercel)**: AI chat interface
- **Anthropic API**: Claude AI
- **OpenAI API**: GPT modelleri

## Build & Deploy
- **SWC**: Fast compilation (Next.js 16 default)
- **Webpack**: Bundle customization
- **Vercel**: Hosting
- **Bundle Analyzer**: Bundle optimization

## Node Version
- **Required**: Node.js >= 20.9.0
- **Package Manager**: npm >= 9.0.0
- **Version File**: `.nvmrc` mevcut
