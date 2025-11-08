# Gozy - Taxi Driver Trade Union Platform

## Project Overview

Gozy is a WhatsApp-based platform for Copenhagen taxi drivers that helps manage compliance documents, reminders, and service requests. Built on Cloudflare Workers with AI-powered conversational interface via Gemini LLM.

## Architecture & Stack

### Framework & Runtime

- **Cloudflare Workers**: Edge computing runtime
- **D1 Database**: SQLite with Drizzle ORM
- **R2 Storage**: Object storage for documents

### AI & Integrations

- **Google Gemini API**: Natural language processing for Danish conversations
- **WhatsApp Business API**: Primary user interface
- **Function calling**: Intent recognition and conversation routing

### Validation

- **Zod**: Runtime type validation
- **TypeScript**: Strict typing throughout

## Database Migrations

**Workflow**: Modify schema → Generate migration → Apply migration

### Generate Migration

```bash
npm run db:generate  # Creates SQL migration in drizzle/
```

### Apply Migration

```bash
npm run db:migrate:local   # Apply to local database
npm run db:migrate:remote  # Apply to production database
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
npm test             # Run test suite
npm run format       # Format code with Prettier
```

### Database Operations

```bash
npm run db:generate        # Generate migration from schema changes
npm run db:migrate:local   # Apply migrations locally
npm run db:migrate:remote  # Apply migrations to production
npx wrangler d1 execute DB --local --command "SELECT * FROM users LIMIT 5"
```

### Deployment

```bash
npm run deploy:staging      # Deploy to staging
npm run deploy:production   # Deploy to production
```

## Code Organization

```
src/
├── db/              # Database schema (Drizzle)
├── models/          # Database access layer
├── services/        # External integrations (WhatsApp, Gemini)
├── routes/          # HTTP route handlers
├── lib/             # Business logic
├── views/           # UI components (if any)
└── scheduled/       # Cron jobs (reminders, compliance checks)

Root:
├── docs/            # Documentation
├── drizzle/         # Database migrations
└── tests/           # End-to-end tests
```

### Architecture Guidelines

- **services/**: External API integrations only. NO business logic. Only API client code, type definitions, and low-level communication with external services.
  - ❌ Bad: Function declarations with business rules in `services/gemini/client.ts`
  - ✅ Good: Generic Gemini API wrapper, function declarations moved to `lib/` or co-located with business logic

- **lib/**: Business logic, orchestration, function call handlers. This is where application-specific logic lives.

- **models/**: Database queries only. No business logic, just CRUD operations on database entities.

## Memories & Guidelines

- **Always start with `npm test`**: Run tests first when debugging
- **Import statements**: Place all imports at the top
- Avoid using class unless necessary (streams, etc), prefer functions
- Never use any type
- Always add types to function input and output
- Use Zod for validation of external data
- Avoid generic types.ts files
- Prefer type over interface
- Run `npm run format` after changes
- Never do `git add -A`, stage specific files
- Never use `as unknown as Type` - validate with Zod instead
- Do not use echo >>
- Do not use emojis
- Avoid nested ternary operators

## MVP Phases (See gozy_mvp_estimate.md)

1. **Phase 1**: Core onboarding (QR code, registration, document delivery)
2. **Phase 2**: Compliance & reminders (document tracking, notifications)
3. **Phase 3**: Lead generation (insurance, car quotes, referrals)
4. **Phase 4**: Booking & support (RTT appointments, problem reporting)

Critical path for first launch: Phases 1-4 = 34 days
