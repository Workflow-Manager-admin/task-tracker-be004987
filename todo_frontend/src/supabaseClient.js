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
 *
 * Diagnostic error handling and logging are provided to help surface issues with missing
 * environment variables, especially with create-react-app static build environment.
 * Ensure environment variables are set in a `.env` file at the root of your project.
 * Variable names must be prefixed with `REACT_APP_` for create-react-app.
 */

// Get env vars, fallback to undefined and warn if not set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Diagnostic: Log helpful errors for developers in non-production mode
if (
  (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') ||
  (!supabaseKey || typeof supabaseKey !== 'string' || supabaseKey.trim() === '')
) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabaseClient] ERROR: Missing Supabase environment variables!\n' +
    'Check that REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are defined in your .env file.\n' +
    `REACT_APP_SUPABASE_URL: "${supabaseUrl}"\n` +
    `REACT_APP_SUPABASE_KEY: "${supabaseKey && supabaseKey.substring(0, 6)}...<hidden>"\n` +
    'Did you forget to restart the dev server after editing .env?\n' +
    'See README for environment variable troubleshooting.'
  );
  // Provide readable error instance for runtime failures if needed
  throw new Error(
    '[supabaseClient] Cannot initialize Supabase: Supabase URL and/or Key not set. ' +
    'Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set in .env.'
  );
}

// PUBLIC_INTERFACE
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
