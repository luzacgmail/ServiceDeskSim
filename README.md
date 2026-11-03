# ServiceHub Desk (IT service desk simulator)
## Setup (Codespaces or local)
1. `npm install`, then copy `.env.example` to `.env.local` and fill every value.
2. In Supabase: run `supabase/migrations/001_init.sql`, then `supabase/seed.sql` in the SQL editor.
3. Supabase Auth settings: email provider on, "Confirm email" off, minimum password length 6.
4. `npm run dev`, open port 3000, create an account with a username and 6+ digit PIN.
## Vercel
Import the repo and add the same variables from `.env.example` under Project Settings, then deploy.
## Tests
`npm test` runs the auth validation and ticket logic tests (vitest).
## Simulated
Attachments, ticket arrival (timer while the app is open, faster on hard), random slow loads, and the customer (Groq, with fallback replies).
