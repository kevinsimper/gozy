# Gozy - Taxi Driver Trade Union Platform

## Project Overview

Gozy is a WhatsApp-based platform for Copenhagen taxi drivers that helps manage compliance documents, reminders, and service requests. Built on Cloudflare Workers with AI-powered conversational interface via Gemini LLM.

## Architecture & Stack

### Framework & Runtime

- **Cloudflare Workers**: Edge computing runtime
- **D1 Database**: SQLite with Prisma ORM
- **R2 Storage**: Object storage for documents

### AI & Integrations

- **Google Gemini API**: Natural language processing for Danish conversations
- **WhatsApp Business API**: Primary user interface
- **Function calling**: Intent recognition and conversation routing

### Validation

- **Zod**: Runtime type validation
- **TypeScript**: Strict typing throughout

## Database & Prisma Guidelines

### SQLite Constraints and Indexing

Since we use SQLite with Cloudflare D1, follow these practices:

1. **Avoid Foreign Key Constraints**: Use `relationMode = "prisma"`
2. **Use Indexes Instead of Unique Constraints**: For flexibility
3. **Standard Indexing Pattern for Lists**:

   ```prisma
   model Example {
     id        Int      @id @default(autoincrement())
     createdAt DateTime @default(now())

     @@index([createdAt(sort: Desc), id(sort: Desc)])
   }
   ```

4. **Index on ID for Referenced Models**: Add `@@index([id])` when referenced
5. **Application-Level Validation**: Handle uniqueness in code, not database

## Development Commands

### Daily Development

```bash
npm run dev          # Start development server
npm test             # Run test suite
npm run format       # Format code with Prettier
```

### Database Operations

Workflow: Update schema → Generate client → Create migration

```bash
npm run db:generate  # Generate Prisma client types
npx wrangler d1 execute DB --local --command "SELECT * FROM User LIMIT 5"
```

### Deployment

```bash
npm run deploy:staging      # Deploy to staging
npm run deploy:production   # Deploy to production
```

## Code Organization

```
src/
├── models/          # Database access (Prisma)
├── services/        # External integrations (WhatsApp, Gemini)
├── routes/          # HTTP route handlers
├── lib/             # Business logic
├── views/           # UI components (if any)
└── scheduled/       # Cron jobs (reminders, compliance checks)

Root:
├── docs/            # Documentation
├── prisma/          # Database schema and migrations
└── tests/           # End-to-end tests
```

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
