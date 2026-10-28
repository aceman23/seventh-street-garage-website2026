import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Inquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  pickup_location: string | null;
  dropoff: string | null;
  vehicle: string | null;
  company: string | null;
  details: string | null;
  form_type: string;
  status: string;
  created_at: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Setting = {
  key: string;
  value: string;
  updated_at: string;
};
