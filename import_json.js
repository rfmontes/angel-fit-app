import * as fs from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env from local directory manually since we are in Node.js
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase Credentials in .env!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const jsonPath = resolve('estoque_completo.json');

async function importData() {
    console.log(`Reading: ${jsonPath}`);
    try {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const rows = JSON.parse(fileContent);

        console.log(`Found ${rows.length} items.`);

        // Clear existing products to avoid duplicates during dev
        console.log("Clearing existing products...");
        // Be careful with cascades, delete dependent tables first if needed, though cascade should work
        await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        let count = 0;
        for (const row of rows) {
            // Mapping based on "estoque_completo.json" keys:
            // "Categoria", "Produto", "Cor", "Tamanho", "Loja", "Qtd Inicial", "Valor Compra Unitrio", "Valor Venda Unitrio", "Qtd Vendida", "Qtd em Estoque"

            const name = row['Produto'];
            if (!name) continue;

            const category = row['Categoria'] || 'Geral';
            const size = row['Tamanho'] ? String(row['Tamanho']) : 'U';
            const color = row['Cor'] || '';
            const supplier = row['Loja'] || '';

            // Note typo "Unitrio" from the JSON generation script
            const price = parseFloat(row['Valor Venda Unitrio'] || 0);
            const cost = parseFloat(row['Valor Compra Unitrio'] || 0);

            const stock = parseInt(row['Qtd em Estoque'] !== undefined ? row['Qtd em Estoque'] : (row['Qtd Inicial'] || 0));

            const product = {
                name,
                category,
                size,
                color,
                price,
                cost,
                stock,
                supplier,
                min_stock: 2
            };

            const { error } = await supabase.from('products').insert([product]);

            if (error) {
                console.error(`Failed to insert ${name}:`, error.message);
            } else {
                process.stdout.write('.');
                count++;
            }
        }
        console.log(`\nImported ${count} products successfully!`);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

importData();
