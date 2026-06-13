#!/usr/bin/env node
/**
 * Pushes EXPO_PUBLIC_* vars from .env to Vercel (production).
 * Requires: vercel login, .env with Supabase keys
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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

const KEYS = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];

const env = loadEnv();
const missing = KEYS.filter((k) => !env[k] || env[k].includes('your-'));
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(', ')}`);
  process.exit(1);
}

for (const key of KEYS) {
  console.log(`Setting ${key} on Vercel (production)…`);
  execSync(`npx vercel env add ${key} production`, {
    cwd: root,
    input: env[key],
    stdio: ['pipe', 'inherit', 'inherit'],
  });
}

console.log('✓ Done. Redeploy with: npx vercel --prod');
