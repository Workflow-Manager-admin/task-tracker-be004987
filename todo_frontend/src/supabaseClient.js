import { createClient } from '@supabase/supabase-js';

/**
 * Initializes and exports a Supabase client instance for use throughout the React app.
 * Uses environment variables:
 *   - REACT_APP_SUPABASE_URL: Your Supabase Project URL
 *   - REACT_APP_SUPABASE_KEY: Your Supabase Project anon/public key
 *
 * Usage:
 *   import { supabase } from './supabaseClient';
 *
 * The client is ready for authentication and CRUD integration.
 */

// PUBLIC_INTERFACE
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);
