# RestCrew Hostel Network Architecture

## What is implemented now

- `Owner` is the parent hostel record.
- `Student.ownerId` links every student to the hostel owner who created them.
- Owner registration, owner login, student login, and owner student CRUD now run through Prisma-backed API routes.
- When an owner adds a student, that student can log in with the same credentials and is resolved back to the same hostel.

## Database relationship

```text
Owner (Hostel)
  -> Student[]
  -> Room[]
  -> Meal[]
  -> Complaint[]
  -> Fee[]
  -> Expense[]
  -> Investment[]
```

## Recommended network shape

```text
Owner Portal / Student Portal
        ->
Next.js API Routes
        ->
Prisma ORM
        ->
Primary SQL Database
```

## Blockchain recommendation

Blockchain is not necessary for hostel login or owner-student linking. A relational database is the correct source of truth for:

- hostel ownership
- student onboarding
- room allocation
- fee records
- complaint records

If you want blockchain later, use it only as an audit layer, not as the main login database.

```text
Primary SQL Database -> Audit Events -> Permissioned Ledger
```

Good blockchain use cases for this project:

- tamper-evident fee payment receipts
- immutable owner activity audit logs
- signed hostel admission history

Poor blockchain use cases for this project:

- student login authentication
- real-time room assignment
- normal CRUD data updates
