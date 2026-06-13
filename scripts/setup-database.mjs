#!/usr/bin/env node
/**
 * Applies supabase/schema.sql to your Supabase Postgres database.
 *
 * Required in .env:
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *
 * Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI, Session mode)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

async function main() {
  const env = loadEnv();
  const dbUrl = process.env.SUPABASE_DB_URL ?? env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.error(`
Missing SUPABASE_DB_URL.

1. Open Supabase Dashboard → Project Settings → Database
2. Copy the "URI" connection string (Session pooler)
3. Add to shoe-laundry/.env:

   SUPABASE_DB_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@...

4. Re-run: npm run db:setup
`);
    process.exit(1);
  }

  let pg;
  try {
    pg = await import('pg');
  } catch {
    console.error('Installing pg dependency… run: npm install');
    process.exit(1);
  }

  const schemaPath = resolve(root, 'supabase/schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');

  const client = new pg.default.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connecting to Supabase Postgres…');
  await client.connect();

  try {
    console.log('Applying schema…');
    await client.query(sql);
    console.log('✓ Database schema applied successfully.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env');
    console.log('  2. Register an admin account in the app, then run in SQL Editor:');
    console.log("     update profiles set role = 'admin' where email = 'your@email.com';");
    console.log('  3. Add the same EXPO_PUBLIC_* vars on Vercel and redeploy.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
