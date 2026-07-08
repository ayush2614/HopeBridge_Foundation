# HopeBridge Foundation — Product Requirements

## Original Problem Statement
Modern, fully responsive NGO website for "HopeBridge Foundation" with 11 sections,
premium blue/green/white palette, smooth scrolling, subtle animations, Font Awesome
icons, Poppins + Inter fonts, high-quality Unsplash/Pexels imagery.

Iteration 2 add-ons (December 2026):
- Replace placeholder QR with real UPI QR code
- Admin dashboard to view submissions & donations
- Auto-generate 80G tax exemption certificates on successful donation
- Multi-language (Hindi + English) support
- Resend email notifications (toggleable)

## User Choices
- Full-stack build (React + FastAPI + MongoDB)
- Real Stripe donations (test keys) alongside UPI QR
- Poppins (headings) + Inter (body) from Google Fonts
- Imagery from Unsplash / Pexels
- lucide-react icons
- Real UPI QR (placeholder UPI id `hopebridge@upi` until user shares real one)
- Admin creds default: `admin@hopebridge.org` / `HopeBridge@2026`
- Languages: English + Hindi
- Resend key not provided → email sends skip silently

## Personas
- **Donors, Volunteers, Beneficiaries/Press, CSR partners** — plus
- **Foundation admin** — signs into `/admin` to view all submissions, donation stats & CSV-ready tables

## Architecture
- Backend: FastAPI (`/app/backend/server.py`, ~630 lines) + Motor async MongoDB
- Frontend: React 19 + Tailwind + framer-motion + react-countup + qrcode.react + i18next + shadcn UI
- Payments: Stripe Checkout via `emergentintegrations`
- PDF: reportlab (server-side, generated on demand)
- Auth: JWT HS256, bcrypt-hashed passwords, seeded admin on startup
- Email: Resend SDK, non-blocking `asyncio.create_task`, no-op when key missing
- Collections: `admins`, `volunteers`, `contact_messages`, `newsletter`, `payment_transactions`

## Implemented
### Iteration 1 (2026-07-08)
- All 11 marketing sections (hero, about, mission, programs, animated impact stats,
  gallery, volunteer form, donate, testimonials, FAQ, contact, footer + newsletter)
- Stripe checkout for ₹500 / ₹1000 / ₹2500 / custom
- Form submissions persist to MongoDB
- 15/15 backend tests + 100% frontend flows passing

### Iteration 2 (2026-07-08)
- **Real UPI QR** — `qrcode.react` renders `upi://pay?pa=…&pn=…&cu=INR&am=…`
  with dynamic amount + embedded heart icon
- **JWT Admin Dashboard** at `/admin/login` → `/admin` — overview stats,
  volunteers, contacts, newsletter and donations tables. Route-guarded via context.
- **80G tax-exemption PDF certificate** — auto-assigned receipt number on paid webhook,
  downloadable at `/api/donations/certificate/{session_id}` (reportlab)
- **i18n EN + HI** — 320-line bundle, LanguageSwitcher in navbar (compact pill),
  auto-detect + localStorage persistence
- **Resend email hooks** — welcome email on volunteer signup, donation receipt on
  paid webhook; silently skipped when `RESEND_API_KEY` is empty (env-toggled)
- 28/28 backend tests passing, 100% frontend flows passing

## Env variables (`/app/backend/.env`)
```
MONGO_URL, DB_NAME, CORS_ORIGINS,
STRIPE_API_KEY,
JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
UPI_ID, UPI_PAYEE_NAME,
RESEND_API_KEY (empty by default), SENDER_EMAIL,
ORG_REG_NUMBER, ORG_PAN, ORG_ADDRESS, ORG_SIGNATORY
```

## Backlog / Next Actions
- P1: Recurring / monthly donation subscriptions via Stripe
- P1: CSV/Excel export from admin tables (volunteers, donations)
- P1: Impact reports / annual audit PDF page
- P2: Blog/stories CMS section
- P2: Sponsor/CSR partner tier page
- P2: Add Marathi, Tamil, Bengali locales (bundle already extensible)
- P3: Split `server.py` into `auth.py`, `donations.py`, `admin.py`, `pdf.py`, `email.py`
