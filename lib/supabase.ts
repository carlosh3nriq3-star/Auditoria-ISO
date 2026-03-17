import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set them in your environment variables.');
}

let supabaseClient: any;
try {
  supabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Provide a dummy client that doesn't crash
  supabaseClient = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: error }) }) }),
      insert: () => Promise.resolve({ error }),
      update: () => ({ eq: () => Promise.resolve({ error }) }),
      delete: () => ({ eq: () => Promise.resolve({ error }) }),
      upsert: () => Promise.resolve({ error }),
    })
  };
}

export const supabase = supabaseClient;
