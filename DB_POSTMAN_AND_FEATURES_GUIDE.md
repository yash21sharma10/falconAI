# FalconAI Backend: DB Relationships, Postman Data Flow, and Implemented Features

## 1) Database table relationships

The project uses MySQL with Prisma ORM. Main entities and connections:

- `Campaign` (parent entity)
  - One campaign can have many leads (`Lead`)
  - One campaign can have many emails (`Email`)
  - One campaign can have many logs (`Log`)
  - One campaign can have many email logs (`EmailLog`)

- `Lead`
  - Belongs to one campaign through `campaignId` (nullable in schema, but campaign-scoped logic is enforced in APIs)
  - Can have many logs (`Log`)
  - Can have many email logs (`EmailLog`)
  - Unique constraint: `@@unique([email, campaignId])`
    - Same email can exist in different campaigns
    - Same email cannot exist twice in the same campaign

- `Email`
  - Belongs to one campaign through required `campaignId`

- `Log`
  - Can optionally link to `Campaign` via `campaignId`
  - Can optionally link to `Lead` via `leadId`

- `EmailLog`
  - Belongs to one `Campaign` via required `campaignId`
  - Belongs to one `Lead` via required `leadId`

- `QueueJob`
  - Standalone table for queue/job payload and status
  - Not currently linked by FK to other tables in schema

## 2) Simple relationship view

- `Campaign` 1 -> many `Lead`
- `Campaign` 1 -> many `Email`
- `Campaign` 1 -> many `Log`
- `Campaign` 1 -> many `EmailLog`
- `Lead` 1 -> many `Log`
- `Lead` 1 -> many `EmailLog`

## 3) How to insert data using Postman

Base URL:

- `http://localhost:3000/api`

### Step A: Create a campaign

Request:

- Method: `POST`
- URL: `http://localhost:3000/api/campaign`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "name": "Summer Outreach",
  "description": "Initial campaign for testing",
  "status": "draft"
}
```

Expected:

- You get created campaign object with `id` (save this id for next requests).

### Step B: List campaigns (optional verification)

Request:

- Method: `GET`
- URL: `http://localhost:3000/api/campaign`

### Step C: Upload leads CSV for a campaign

Request:

- Method: `POST`
- URL: `http://localhost:3000/api/lead/upload`
- Body type: `form-data`
  - Key: `campaignId` (Text) -> value: campaign id from Step A (example `1`)
  - Key: `file` (File) -> choose `.csv` file

CSV headers expected:

- `name,email,company,customFields`

Example CSV:

```csv
name,email,company,customFields
John Doe,john@example.com,Acme,"{""source"":""linkedin""}"
Jane Smith,jane@example.com,Globex,"{""tier"":""gold""}"
```

Important validation behavior:

- `name`, `email`, and `company` are required in CSV rows.
- Invalid email rows are reported as invalid.
- Duplicate rows in same CSV are skipped.
- Existing email duplicates in same campaign are skipped.
- `customFields` must be valid JSON object string if provided.

### Step D: Fetch leads for campaign

Request:

- Method: `GET`
- URL:
  - `http://localhost:3000/api/lead/campaign/1?page=1&limit=10`
  - Replace `1` with your campaign id

Supported query params:

- `page` (default `1`)
- `limit` (default `10`, max `100`)
- `email` (contains filter)
- `name` (matches firstName/lastName contains)

### Step E: Update campaign

Request:

- Method: `PATCH`
- URL: `http://localhost:3000/api/campaign/1`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "status": "active",
  "description": "Campaign activated"
}
```

Allowed status values:

- `draft`
- `active`
- `paused`
- `completed`

### Step F: Delete campaign

Request:

- Method: `DELETE`
- URL: `http://localhost:3000/api/campaign/1`

Note:

- Delete may fail if related rows exist depending on relation and DB state.

## 4) Health endpoints to validate running modules

- `GET /api/lead/health`
- `GET /api/emails/health`
- `GET /api/queue/health`
- `GET /api/logs/health`

## 5) Functionalities implemented so far

### Campaign module

- Create campaign
- List campaigns (latest first)
- Get campaign by id
- Update campaign
- Delete campaign
- DTO validation for input and status values

### Lead module

- Health endpoint
- Fetch campaign leads with pagination and filters
- CSV upload for campaign leads
- Campaign existence validation before insert
- CSV row-level validation and invalid row reporting
- Duplicate handling:
  - duplicate within same CSV
  - duplicate already in same campaign
  - DB unique conflict fallback handling

### Logs module

- Health endpoint
- Service helper to insert email log records

### Email module

- Health endpoint (placeholder for full send workflow)

### Queue module

- Health endpoint (placeholder for queue processing)

## 6) Known current limitations

- No auth/authorization layer yet
- Email send workflow is not fully implemented
- Queue processing is not fully implemented
- Swagger/OpenAPI docs not added yet
- Lead schema currently stores uploaded full name in `firstName`
- CSV contains `company` and `customFields`, but those fields are not persisted in `Lead` table right now

