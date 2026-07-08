# HopeBridge Foundation — Product Requirements

## Original Problem Statement
Build a modern, fully responsive NGO website for "HopeBridge Foundation" with 11 sections
(Home, About, Mission, Programs, Impact, Gallery, Volunteer, Donate, Testimonials, FAQ,
Contact), premium blue/green/white palette, smooth scrolling, subtle animations,
Font Awesome icons, Poppins + Inter fonts, high-quality Unsplash/Pexels imagery.

## User Choices
- Full-stack build (React + FastAPI + MongoDB)
- Real Stripe donation integration (test keys) alongside a QR placeholder
- Poppins (headings) + Inter (body) from Google Fonts
- Imagery from Unsplash / Pexels
- lucide-react icons (equivalent to Font Awesome; rendered as SVG)

## Personas
- **Donors** — want a trustworthy, fast, secure way to donate
- **Volunteers** — want to sign up and understand impact
- **Beneficiaries / press** — want to browse programs, impact stats and stories
- **Corporate CSR partners** — want to reach out via contact form

## Architecture
- Backend: FastAPI (`/app/backend/server.py`), Motor async MongoDB
- Frontend: React 19 + Tailwind + framer-motion + react-countup + shadcn UI
- Payments: Stripe Checkout via `emergentintegrations` library
- Collections: `volunteers`, `contact_messages`, `newsletter`, `payment_transactions`

## Implemented (2026-07-08)
- 11 anchored sections + smooth-scroll nav (glass-morphism on scroll)
- Hero with parallax-style background, dual CTA, live impact preview
- About bento grid with 4 feature cards + imagery
- Mission & Vision dual card
- Programs (6 cards, hover accent flip)
- Animated Impact counters via IntersectionObserver + react-countup
- Bento Gallery grid with hover reveals
- Volunteer form → POST /api/volunteers (persisted)
- Contact form + OpenStreetMap embed → POST /api/contact
- Testimonials grid (4 avatars, star ratings)
- FAQ accordion (shadcn Accordion, 6 Q&A)
- Footer with 4-col layout, newsletter form → POST /api/newsletter
- Donation flow: fixed packages (₹500 / ₹1000 / ₹2500) + custom amount, Stripe
  Checkout Session creation with server-side price authority, transaction record,
  QR placeholder, /donation-success page with polling status verification
- Backend tested end-to-end (15/15 pytest) — 100% pass
- Frontend flows Playwright-verified — 100% pass

## Backlog / Next Actions
- P1: Real UPI QR code (currently placeholder) — integrate BharatQR or GPay Business QR
- P1: Impact reports / financial transparency page (PDF hosting or CMS)
- P1: Admin dashboard to view volunteers / contact submissions / donations
- P2: Multi-language support (Hindi, regional)
- P2: Blog / stories CMS section with individual detail pages
- P2: Email notifications (Resend) on volunteer & donation events
- P2: 80G tax certificate auto-generation post-donation
- P3: Recurring / monthly donation subscriptions via Stripe
