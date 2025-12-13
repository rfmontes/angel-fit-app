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

async function updateMinStock() {
    console.log("Updating all products min_stock to 0...");

    // Check if we need to do it in batches or if there is a bulk update method without filter
    // Supabase update requires a filter usually to prevent accidental updates, running with neq id 0 is a hacky way to select all
    const { data, error, count } = await supabase
        .from('products')
        .update({ min_stock: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000') // "All items"
        .select('id', { count: 'exact' });

    if (error) {
        console.error("Error updating:", error.message);
    } else {
        console.log(`Successfully updated ${data.length} products to min_stock = 0.`);
    }
}

updateMinStock();
