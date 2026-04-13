# FalconAI Backend - Complete Project Overview

## 1) What has been done till now

This repository currently contains a working backend foundation built with NestJS + Prisma + MySQL, with the following status:

- Core backend app bootstrapped with:
  - NestJS modular architecture
  - Global `/api` prefix
  - Global request validation (`ValidationPipe`) with strict DTO filtering
  - Environment validation using Joi
- Database layer integrated through Prisma:
  - MySQL datasource configured via `DATABASE_URL`
  - Prisma schema with campaign, lead, email, queue, logs, and email log entities
- Functional modules created:
  - `Campaign` module (CRUD endpoints)
  - `Lead` module (campaign lead listing + CSV upload/import)
  - `Email`, `Queue`, and `Logs` health modules (basic health endpoints)
- Lead upload flow has important validation and deduplication behavior:
  - CSV parsing with `fast-csv`
  - Required fields validation (`name`, `email`, `company`)
  - Email format validation
  - Duplicate skipping (within file + existing in campaign)
  - Invalid row tracking in API response

---

## 2) Implemented features

## Campaign Management
- Create campaign
- List campaigns (sorted by latest created)
- Get campaign by ID
- Update campaign
- Delete campaign
- Status values controlled in DTOs: `draft`, `active`, `paused`, `completed`

## Lead Management
- Health endpoint
- Get leads for a campaign with:
  - Pagination (`page`, `limit`)
  - Email search (`email`)
  - Name search (`name`) on first/last name
- Upload leads from CSV for a campaign:
  - Multipart file upload
  - Campaign existence check
  - CSV row validation and normalization
  - Duplicate handling and skipped row reporting

## Supporting Modules
- Email module: health endpoint only (placeholder for future sending flow)
- Queue module: health endpoint only (placeholder for async processing)
- Logs module:
  - health endpoint
  - service method to write email logs to DB (`createEmailLog`)

---

## 3) Current API flow (how project works)

1. Client calls REST APIs under `/api/*`.
2. NestJS validates incoming data via DTO + global validation pipe.
3. Controllers delegate to services.
4. Services perform business logic and call Prisma.
5. Prisma reads/writes MySQL and returns structured results.
6. API returns JSON response.

### Lead CSV import flow
1. Client uploads CSV + `campaignId` to `POST /api/lead/upload`.
2. Service verifies campaign exists.
3. CSV rows are parsed and validated.
4. Invalid rows are collected with row number + reason.
5. Duplicates are skipped:
   - Duplicate in same CSV
   - Duplicate already present in that campaign
   - DB unique conflict fallback handling
6. Valid rows are inserted.
7. Response includes counts (`created`, `skippedCount`, `invalidCount`) and details.

---

## 4) High-level architecture

- **Framework:** NestJS (modular, dependency injection)
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** MySQL
- **Validation:** class-validator + class-transformer + Joi
- **Data import:** fast-csv

### Module map
- `CampaignModule`: campaign CRUD
- `LeadModule`: campaign lead listing + CSV upload
- `EmailModule`: email health placeholder
- `QueueModule`: queue health placeholder
- `LogsModule`: health + email log writer
- `PrismaModule`: global Prisma service provider

---

## 5) What is going great

- Clean modular structure that is easy to extend.
- Good input validation baseline (global + DTO + env validation).
- Practical lead import with row-level feedback and dedupe safeguards.
- Clear service/controller separation.
- Prisma integration is simple and production-friendly for growth.

---

## 6) Limitations right now

- No authentication/authorization layer.
- No API documentation (Swagger/OpenAPI) yet.
- Email module is not implementing real send workflows yet.
- Queue module does not process real jobs yet.
- Logging module has partial implementation (only health endpoint + service helper).
- No test cases present yet (`test` script exists but no visible test suites).
- No deployment/runtime docs currently (this document fills local documentation gap).
- Lead CSV fields include `company` and `customFields`, but current `Lead` schema does not persist them.

---

## 7) Cautions and things to be careful about

- `Lead` uniqueness is campaign-scoped using composite unique key (`email`, `campaignId`):
  - Same email can exist across different campaigns.
  - Duplicate email in the same campaign will be rejected by DB constraint.
- Campaign delete may fail if related records exist, depending on relation behavior and DB state.
- CSV upload reads full buffer in memory; large files can increase memory usage.
- `DATABASE_URL` is mandatory and must be valid URI format.
- Keep `.env` secure; never commit real credentials.
- Validate database collation/charset and indexes for production scale.

---

## 8) Database details

## Database type
- MySQL via Prisma datasource.

## Environment variable
- `DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"`

## Default local example (from `.env.example`)
- `mysql://root:password@localhost:3306/falconai_db`

## Main tables/entities
- `Campaign`
  - core campaign metadata + status
- `Lead`
  - campaign-scoped unique email (`email + campaignId`), optional names, optional campaign relation
- `Email`
  - campaign-linked email content + send status
- `QueueJob`
  - queue job payload/status scaffold
- `Log`
  - generic log entries with optional campaign/lead relation
- `EmailLog`
  - email delivery status per campaign + lead

---

## 9) How to start on local system

## Prerequisites
- Node.js (LTS recommended)
- npm
- MySQL server running

## Setup steps
1. Open project:
   - `cd /home/yash-sharma/projects/falconai`
2. Install dependencies:
   - `npm install`
3. Create env file:
   - `cp .env.example .env`
4. Update `.env` with your actual MySQL credentials.
5. Generate Prisma client:
   - `npm run prisma:generate`
6. Run migrations:
   - `npm run prisma:migrate`
7. Start backend in watch mode:
   - `npm run start:dev`
8. Base URL:
   - `http://localhost:3000/api`

---

## 10) How to navigate project locally

## Key directories
- `src/main.ts` -> app bootstrap, global prefix and validation
- `src/app.module.ts` -> module wiring + env schema validation
- `src/modules/` -> business modules (campaign, lead, email, queue, logs)
- `src/prisma/` -> Prisma service/module
- `prisma/schema.prisma` -> DB models
- `.env.example` -> required env template

## Useful dev commands
- `npm run start:dev` -> run locally in watch mode
- `npm run build` -> build production bundle
- `npm run lint` -> lint and autofix
- `npm run prisma:studio` -> inspect DB visually

---

## 11) Available endpoints (current)

All routes are prefixed with `/api`.

### Campaign
- `POST /api/campaign`
- `GET /api/campaign`
- `GET /api/campaign/:id`
- `PATCH /api/campaign/:id`
- `DELETE /api/campaign/:id`

### Lead
- `GET /api/lead/health`
- `GET /api/lead/campaign/:campaignId?page=1&limit=10&email=&name=`
- `POST /api/lead/upload` (multipart form-data: `file`, `campaignId`)

### Email / Queue / Logs
- `GET /api/emails/health`
- `GET /api/queue/health`
- `GET /api/logs/health`

---

## 12) Recommended next improvements

- Add Swagger/OpenAPI docs.
- Implement auth (JWT/session) and role-based permissions.
- Implement real email sending provider integration.
- Build queue processor and retry handling.
- Add unit/integration tests.
- Add structured logger and centralized error handling strategy.
- Extend lead schema for `company` and `customFields` persistence.

