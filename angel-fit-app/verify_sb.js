// Fixed import


// We need to polyfill/mock the env vars since we are running in Node context
// but importing a file that expects Vite env vars (import.meta.env).
// Actually, `src/lib/supabase.js` uses `import.meta.env` which Node doesn't support by default in commonjs or without flag.
// So we can't import `src/lib/supabase.js` directly in this standalone script easily without setup.

// Better: create a standalone verify script with manual client creation like before.
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { resolve } from 'path';

function getEnv(key) {
    try {
        const envPath = resolve('.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const match = content.match(new RegExp(`${key}=(.*)`));
            if (match) return match[1].trim();
        }
    } catch (e) { }
    return process.env[key];
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { count, error } = await client.from('products').select('*', { count: 'exact', head: true });
    if (error) console.error("Error:", error.message);
    else console.log(`Total Products in DB: ${count}`);
}

check();
