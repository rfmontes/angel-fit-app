import * as fs from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env logic
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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDB() {
    console.log("Checking DB...");

    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error connecting:", error);
    } else {
        console.log(`Product count in DB: ${count}`);
    }

    const { data: list, error: listError } = await supabase.from('products').select('id, name, stock').limit(5);
    if (listError) console.error(listError);
    else {
        console.log("First 5 products:", list);
        console.log("Found in list query: " + (list ? list.length : 0));
    }
}

checkDB();
