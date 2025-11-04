# Gozy MVP - Development Estimate

**Taxi Driver Trade Union Platform - Copenhagen**

**Tech Stack:** Cloudflare Workers + D1 (SQLite) + Prisma + Gemini LLM + WhatsApp Business API

---

## Infrastructure Setup (Week 1: 5-7 days)

### Core Infrastructure

- **Cloudflare Workers setup** - 1 day
  - Worker configuration, routing, environment setup
  - Domain configuration and DNS
- **D1 Database + Prisma** - 2 days
  - Schema design (users, documents, reminders, leads, compliance)
  - Prisma client setup for Cloudflare Workers
  - Migrations and seed data
- **WhatsApp Business API Integration** - 2 days
  - Webhook setup and verification
  - Message sending/receiving
  - QR code generation flow
  - File upload/download handling

- **Gemini LLM Integration** - 1 day
  - API setup and authentication
  - Prompt engineering framework
  - Context management for conversations
  - Function calling setup for intent recognition

**Subtotal: 6 days**

---

## Phase 1: Core Onboarding Flow (Week 2-3: 10 days)

### MVP Onboarding Features

- **QR Code → WhatsApp onboarding** - 2 days
  - Generate unique QR codes for RTT physical visits
  - Link customer to WhatsApp conversation
  - Initial greeting and Taxi ID collection

- **Customer registration** - 2 days
  - Taxi ID/CVR validation
  - Link customer to vehicle in system
  - Store in D1 via Prisma

- **Document delivery via WhatsApp** - 2 days
  - Receive taximeter certificate from RTT
  - Store documents in R2 (Cloudflare object storage)
  - Send documents to customer via WhatsApp
  - Retrieval system ("find min taximeterattest")

- **RTT Data Integration** - 2 days
  - RTT data storage schema
  - Sync mechanism (webhook or API)
  - Taximeter approval workflow

- **Gemini conversation handling** - 2 days
  - Intent classification (greeting, document request, help)
  - Natural language understanding for Danish
  - Context-aware responses
  - Fallback to human support

**Subtotal: 10 days**

---

## Phase 2: Compliance & Reminders (Week 4-5: 8 days)

### Compliance Dashboard

- **Document upload system** - 2 days
  - Multi-document upload (inspection, insurance, driver's license, criminal record, leasing)
  - File validation and storage in R2
  - Link to user profile

- **Reminder system** - 3 days
  - Configurable reminders (taximeter cert, inspection, TaxiID, winter tires, driver's license)
  - Scheduling with Cloudflare Queues or Durable Objects
  - WhatsApp notification delivery
  - Reminder preferences

- **Compliance scoring** - 2 days
  - Calculate compliance score based on document expiry
  - Dashboard view in WhatsApp (text-based)
  - Alert system for expiring documents

- **Compliance report generation** - 1 day
  - Generate report for kørselskontoret (taxi authority)
  - PDF generation (using Cloudflare or external service)
  - Delivery via WhatsApp or email

**Subtotal: 8 days**

---

## Phase 3: Lead Generation & CRM (Week 6: 5 days)

### CRM Integration

- **Lead tracking system** - 2 days
  - Lead schema (insurance, car, rental, RTT booking)
  - Status tracking workflow
  - Assignment to partners

- **Insurance quote flow** - 1 day
  - Gemini-powered form filling via conversation
  - Lead capture and CRM storage
  - Partner notification

- **Car quote flow** - 1 day
  - Similar to insurance with different fields
  - Integration with car dealers

- **Referral system** - 1 day
  - Generate referral codes
  - Track referrals and rewards
  - Notification system

**Subtotal: 5 days**

---

## Phase 4: Booking & Support (Week 7: 5 days)

### RTT Integration & Support

- **Book en tid (RTT appointment booking)** - 2 days
  - Calendar availability check (API or manual)
  - Booking confirmation flow
  - Lead to RTT system

- **Problem reporting system** - 1 day
  - Issue categorization via Gemini
  - Ticket creation and tracking
  - Escalation to phone support

- **Damage report (Skadesanmeldelse)** - 1 day
  - Structured form via conversation
  - Photo upload support
  - Insurance company notification

- **Self-service guide** - 1 day
  - FAQ system powered by Gemini
  - Context-aware help
  - Escalation to human support with tracking

**Subtotal: 5 days**

---

## Phase 5: Nice-to-Have Features (Week 8-9: 7 days)

### Extended Services

- **Rental car booking (Lejebil)** - 2 days
  - Availability check
  - Booking flow
  - Lead to rental partners

- **Car valuation ("Giv mig en pris")** - 2 days
  - Collect car details via conversation
  - Integration with valuation APIs
  - Price estimation

- **Report to RTT** - 1 day
  - Aggregate reminder data
  - Generate reports for RTT
  - Delivery mechanism

- **Gozy.dk web interface** - 2 days
  - Basic web portal for document access
  - Login with Taxi ID
  - Mobile-responsive design

**Subtotal: 7 days**

---

## Testing & Deployment (Week 10: 5 days)

### Quality Assurance

- **Integration testing** - 2 days
  - WhatsApp flow testing
  - Gemini conversation testing
  - Database integrity checks

- **Danish language optimization** - 1 day
  - Gemini prompt tuning for Danish
  - Language testing with native speakers
  - Edge case handling

- **GDPR compliance** - 1 day
  - Data processing agreement (DPA) implementation
  - User consent flows
  - Data retention policies
  - Right to deletion

- **Production deployment** - 1 day
  - Cloudflare Workers production setup
  - Monitoring and logging (Cloudflare Analytics, Sentry)
  - Performance optimization

**Subtotal: 5 days**

---

## Total Estimate: 51 Days (~10 Weeks / 2.5 Months)

### Critical Path (MVP for Launch)

**Recommended first launch: Phases 1-4 = 34 days (7 weeks)**

- Core onboarding ✓
- Compliance & reminders ✓
- Basic lead generation ✓
- RTT booking & support ✓

### Key Assumptions

1. WhatsApp Business API account already approved (can take 2-4 weeks)
2. RTT willing to provide API/webhook access or manual process
3. Single developer working full-time
4. Gemini API access secured
5. Partner integrations (insurance, car dealers) require manual lead handoff initially

### Risks & Dependencies

- **WhatsApp API approval delays** - Start application immediately
- **RTT integration complexity** - May need manual processes initially
- **Gemini Danish language quality** - May need fine-tuning or Claude fallback
- **D1 with Prisma limitations** - Prisma + D1 still maturing, may need workarounds
- **GDPR complexity** - May need legal consultation

### Cost Estimate (Monthly Operational)

- Cloudflare Workers: $5/month (included in free tier initially)
- D1 Database: Free tier (5 million rows)
- R2 Storage: ~$0.015/GB stored
- WhatsApp Business API: ~€0.005-0.04 per message (conversation-based pricing)
- Gemini API: ~$0.00025 per 1K tokens (very cheap)
- **Estimated: $50-200/month for 500 active drivers**

---

## Recommended Approach

### Sprint 1-2 (Weeks 1-3): Foundation

Build infrastructure + core onboarding flow. Get first driver through complete flow.

### Sprint 3-4 (Weeks 4-5): Compliance

Add compliance features. This is the core value proposition.

### Sprint 5-6 (Weeks 6-7): Revenue

Add lead generation and booking. Start generating revenue.

### Sprint 7+ (Week 8+): Scale

Add nice-to-have features based on user feedback.

**Suggested team: 1 full-stack developer + 1 part-time for testing/support**
