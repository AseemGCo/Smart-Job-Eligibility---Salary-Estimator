# 🗄️ TalentScope — Entity Relationship Diagram (ERD)

## Overview

The schema models a simple but realistic recruitment domain:

- **One `user` → many `candidates`** (a recruiter evaluates many candidates).
- Deleting a user cascades to remove their candidates (`ON DELETE CASCADE`).
- Computed evaluation fields are persisted so historical reports stay stable
  even if business rules change later.

## Diagram

```
┌─────────────────────────────────────┐
│                users                 │
├─────────────────────────────────────┤
│ PK  id              BIGINT UNSIGNED  │
│     name            VARCHAR(100)     │
│ UQ  email           VARCHAR(190)     │
│     password_hash   VARCHAR(255)     │  ← bcrypt hash (never plain text)
│     role            ENUM(user,admin) │
│     created_at      TIMESTAMP        │
│     updated_at      TIMESTAMP        │
└───────────────┬─────────────────────┘
                │ 1
                │
                │ has many
                │
                │ N
┌───────────────┴─────────────────────────────────┐
│                  candidates                      │
├──────────────────────────────────────────────────┤
│ PK  id                BIGINT UNSIGNED             │
│ FK  user_id           BIGINT UNSIGNED  ──────────┐│  → users.id
│     candidate_name    VARCHAR(120)               ││
│     age               TINYINT UNSIGNED           ││
│     education         ENUM(Graduate,             ││
│                            Postgraduate,         ││
│                            Non-IT Background)     ││
│     skill_score       TINYINT UNSIGNED (0..100)  ││
│     projects          SMALLINT UNSIGNED          ││
│     relocate          ENUM(Yes, No)              ││
│  ── computed by the backend engine ──            ││
│     eligibility       ENUM(Eligible,             ││
│                            Not Eligible)          ││
│     priority_status   TINYINT(1) (boolean)       ││
│     confidence_level  ENUM(High, Medium, Low)    ││
│     salary_min        DECIMAL(5,1)  (LPA)        ││
│     salary_max        DECIMAL(5,1)  (LPA)        ││
│     ranking_score     DECIMAL(6,1)               ││
│     suggestions       JSON (array of strings)    ││
│     created_at        TIMESTAMP                  ││
└──────────────────────────────────────────────────┘
                                                   │
            FK: candidates.user_id → users.id  ────┘
            ON DELETE CASCADE · ON UPDATE CASCADE
```

## Relationship summary

| From | To | Type | Constraint |
| --- | --- | --- | --- |
| `users.id` | `candidates.user_id` | One-to-Many | `fk_candidates_user`, `ON DELETE CASCADE` |

## Indexes

| Table | Index | Purpose |
| --- | --- | --- |
| `users` | `uq_users_email` (UNIQUE) | Enforce unique emails / fast login lookup |
| `candidates` | `idx_candidates_user` | Fast per-user candidate listing |
| `candidates` | `idx_candidates_eligibility` | Fast eligibility filtering |
| `candidates` | `idx_candidates_priority` | Fast priority filtering |
| `candidates` | `idx_candidates_ranking` | Fast "top performer" / rank sorting |

## Notes

- **Security:** Only `password_hash` is stored for credentials. The plain
  password never touches the database or logs.
- **Integrity:** ENUMs constrain categorical fields at the database level,
  complementing the application-layer validation.
- **Auditability:** `created_at` / `updated_at` provide a basic audit trail.
