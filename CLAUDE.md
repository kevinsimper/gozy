# Gozy - Taxi Driver Trade Union Platform

## Project Overview

Gozy is a WhatsApp-based platform for Copenhagen taxi drivers that helps manage compliance documents, reminders, and service requests. Built on Cloudflare Workers with AI-powered conversational interface via Gemini LLM.

## Architecture & Stack

### Framework & Runtime

- **Cloudflare Workers**: Edge computing runtime
- **Hono**: Web framework for routing and middleware
- **D1 Database**: SQLite with Drizzle ORM
- **R2 Storage**: Object storage for documents
- **JSX/TSX**: Server-side rendering with Hono's JSX support

### AI & Integrations

- **Google Gemini API**: Natural language processing for Danish conversations
- **WhatsApp Business API**: Primary user interface
- **Function calling**: Intent recognition and conversation routing
- **Multi-agent architecture**: Router-based system with specialized subagents (see docs/multi-agent-architecture.md)

### Services

- **gemini**: Google Gemini API client for AI conversations
- **auth**: Authentication and session management
- **resend**: Email service integration (Resend API)
- **hform**: Type-safe form handling library (see docs/hform-guide.md)
- **simple-cli**: CLI tooling utilities

### Validation & Testing

- **Zod**: Runtime type validation
- **TypeScript**: Strict typing throughout
- **Vitest**: Unit testing framework
- **Evals**: AI behavior evaluation tests (in evals/ directory)

## Database Migrations

**Workflow**: Modify schema → Generate migration → Apply migration

### Generate Migration

```bash
npm run db:generate  # Creates SQL migration in drizzle/
```

### Apply Migration

```bash
npm run db:migrate:local    # Apply to local database
npm run db:migrate:staging  # Apply to staging database
npm run db:migrate:remote   # Apply to production database
```

### Migration Files

- Located in `drizzle/` directory
- Auto-numbered (e.g., `0001_wakeful_corsair.sql`)
- Applied sequentially by Wrangler

### Schema Location

- Schema defined in `src/db/schema.ts`
- Uses Drizzle ORM with SQLite dialect

## Development Commands

### Daily Development

```bash
npm run dev          # Start development server
npm test             # Run test suite (types + unit tests)
npm run test:types   # Run TypeScript type checking only
npm run test:unit    # Run unit tests with Vitest
npm run test:evals   # Run AI behavior evaluation tests
npm run format       # Format code with Prettier
```

### Database Operations

```bash
npm run db:generate         # Generate migration from schema changes
npm run db:migrate:local    # Apply migrations locally
npm run db:migrate:staging  # Apply migrations to staging
npm run db:migrate:remote   # Apply migrations to production
npm run db:studio           # Open Drizzle Studio (database UI)
npx wrangler d1 execute DB --local --command "SELECT * FROM users LIMIT 5"
```

### Deployment

```bash
npm run deploy:staging  # Deploy to staging
npm run deploy          # Deploy to production
```

## Code Organization

```
src/
├── db/                    # Database schema (Drizzle)
├── models/                # Database access layer
├── services/              # External integrations
│   ├── gemini/           # Gemini AI client
│   ├── auth.ts           # Authentication utilities
│   ├── resend/           # Email service (Resend API)
│   ├── hform/            # Type-safe form library
│   └── simple-cli/       # CLI utilities
├── routes/                # HTTP route handlers
│   ├── admin/            # Admin panel routes
│   ├── dashboard/        # User dashboard routes
│   ├── api/              # API endpoints
│   ├── dev/              # Development/mock routes
│   └── login.tsx         # Login routes
├── lib/                   # Business logic
│   ├── conversation/     # Conversation handling
│   └── documents/        # Document processing
├── views/                 # UI components (JSX/TSX)
│   ├── admin/            # Admin UI components
│   ├── dashboard/        # Dashboard UI components
│   └── public/           # Public-facing UI
├── scheduled/             # Cron jobs (reminders, compliance checks)
└── index.tsx             # Main application entry point

Root:
├── docs/                  # Documentation
│   ├── hform-guide.md    # HForm library guide
│   └── multi-agent-architecture.md
├── drizzle/              # Database migrations
├── evals/                # AI behavior evaluation tests
├── static/               # Static assets
└── wrangler.jsonc        # Cloudflare Workers configuration
```

### Architecture Guidelines

- **services/**: External API integrations only. NO business logic. Only API client code, type definitions, and low-level communication with external services.
  - ❌ Bad: Function declarations with business rules in `services/gemini/client.ts`
  - ✅ Good: Generic Gemini API wrapper, function declarations moved to `lib/` or co-located with business logic

- **lib/**: Business logic, orchestration, function call handlers. This is where application-specific logic lives.

- **models/**: Database queries only. No business logic, just CRUD operations on database entities.

- **routes/**: HTTP handlers organized by feature area (admin, dashboard, api, dev)

- **views/**: JSX/TSX components for server-side rendering

## Environment Setup

### Required Environment Variables

Create a `.dev.vars` file in the root directory with the following variables:

```bash
GEMINI_API_KEY=""              # Google Gemini API key for AI conversations
COOKIE_SECRET=""               # Secret for cookie signing (use strong random string)
GOZY_API_TOKEN=""              # Webhook token for API security
RESEND_API_KEY=""              # Resend API key for sending emails
WHATSAPP_BOT_TOKEN=""          # WhatsApp Bot authentication token (optional in dev)
WHATSAPP_BOT_URL=""            # WhatsApp Bot webhook URL (optional in dev)
DEV="false"                    # Development mode flag
```

### Cloudflare Workers Configuration

The project uses `wrangler.jsonc` for configuration:

- D1 Database binding: `DB`
- R2 Storage binding: `FILES`
- Scheduled cron jobs: Daily at 8am (`0 8 * * *`)
- Environment-specific configs for dev, staging, and production

### Setting Up Staging Secrets

Staging environment secrets must be set via Cloudflare Workers CLI:

```bash
npx wrangler secret put GEMINI_API_KEY --env staging
npx wrangler secret put COOKIE_SECRET --env staging
npx wrangler secret put GOZY_API_TOKEN --env staging
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put WHATSAPP_BOT_TOKEN --env staging
```

Note: Production secrets are set similarly using `--env production`

## Key Technologies & Libraries

### Core Dependencies

- **@google/genai**: Google Gemini API client
- **@casperlabs/ts-results**: Result types for error handling
- **hono**: Fast web framework for Cloudflare Workers
- **drizzle-orm**: TypeScript ORM for database operations
- **zod**: Schema validation library
- **nanoid**: Unique ID generation
- **qrcode**: QR code generation for check-ins

### UI & Forms

- **JSX/TSX**: Server-side rendering with Hono's JSX
- **HForm**: Custom type-safe form library (see docs/hform-guide.md)
- **HTMX**: Partial page updates (used with HForm)

### Testing

- **Vitest**: Unit test runner with Cloudflare Workers support
- **@cloudflare/vitest-pool-workers**: Vitest integration for Workers
- **Node test runner**: For AI evaluation tests (evals/)

## Memories & Guidelines

### Development Workflow

- **Always start with `npm test`**: Run tests first when debugging
- **Run `npm run format` after changes**: Ensure consistent code formatting
- **Use `npm run db:studio`**: Visual database exploration and debugging

### Code Style

- **Import statements**: Place all imports at the top
- **Avoid using class** unless necessary (streams, etc), prefer functions
- **Never use any type**: Always provide explicit types
- **Always add types** to function input and output
- **Use Zod for validation** of external data
- **Avoid generic types.ts files**: Co-locate types with usage
- **Prefer type over interface**
- **Avoid nested ternary operators**
- **Lowercase file names**

### Type Safety

- **Never use `as unknown as Type`**: Validate with Zod instead
- **Use Result types**: From @casperlabs/ts-results for error handling
- **Validate at boundaries**: Use Zod schemas for API inputs, form data, env vars
- **Import Bindings type**: Always import `Bindings` from `src/index.tsx` instead of redefining it. The canonical definition lives in the main entry point.

### Git Practices

- **Never do `git add -A`**: Stage specific files intentionally
- **Do not use echo >>**: Use proper file writing tools

### Other

- **Do not use emojis**: Keep code professional and clear
- **JSX/TSX files**: Use .tsx extension for files with JSX

## Important Patterns & Documentation

### Multi-Agent Conversation System

Gozy uses a sophisticated multi-agent architecture for AI conversations:

- **Router agent** analyzes conversation and delegates to specialized subagents
- **Specialized agents** handle specific domains (vehicle offers, documents, compliance, booking)
- **Token optimization** through focused context windows
- See `docs/multi-agent-architecture.md` for detailed implementation guide

### Type-Safe Forms with HForm

All forms use the custom HForm library:

- Type-safe form definitions with Zod validation
- HTMX integration for dynamic updates
- Server-side rendering with JSX
- Consistent error handling
- See `docs/hform-guide.md` for usage examples and API reference

### AI Evaluation Tests

The `evals/` directory contains evaluation tests for AI behavior:

- Tests ensure AI agents behave correctly in specific scenarios
- Run with `npm run test:evals`
- Add new evals when implementing new conversation flows
- Currently focused on vehicle offer agent behavior

## MVP Phases (See gozy_mvp_estimate.md)

1. **Phase 1**: Core onboarding (QR code, registration, document delivery)
2. **Phase 2**: Compliance & reminders (document tracking, notifications)
3. **Phase 3**: Lead generation (insurance, car quotes, referrals)
4. **Phase 4**: Booking & support (RTT appointments, problem reporting)

Critical path for first launch: Phases 1-4 = 34 days
