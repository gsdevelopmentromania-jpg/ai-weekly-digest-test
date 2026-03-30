/**
 * Global test setup — runs before every test file.
 * Provides the env vars that lib/supabase.ts requires at import time,
 * so the module graph can be resolved even when Supabase is mocked.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
