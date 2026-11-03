import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
export const browser = () => createClient(url, anon);
export const admin = () => createClient(url, process.env.SUPABASE_SECRET_KEY!);
export const asUser = (token: string) => createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
export const emailFor = (u: string) => `${u.toLowerCase()}@users.simdesk.internal`;
export const validPin = (p: string) => /^\d{6,}$/.test(p);
export const validUser = (u: string) => /^[a-zA-Z0-9_.-]{3,24}$/.test(u);
