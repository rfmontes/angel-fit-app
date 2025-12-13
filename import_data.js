import * as XLSX from 'xlsx';
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

const excelPath = resolve('../controle_vendas_estoque.xlsx');

async function importData() {
    console.log(`Reading: ${excelPath}`);
    try {
        const fileBuffer = fs.readFileSync(excelPath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        
        // Find 'Estoque' sheet
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('estoque'));
        if (!sheetName) {
            console.error("Sheet 'Estoque' not found!");
            return;
        }

        console.log(`Processing Sheet: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`Found ${rows.length} rows.`);

        // Clear existing products to avoid duplicates during dev
        // CAREFUL: This deletes everything.
        console.log("Clearing existing products...");
        await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Cascade might handle this but be safe
        await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

        let count = 0;
        for (const row of rows) {
             // Headers: "Categoria", "Produto", "Cor", "Tamanho", "Loja", "Qtd Inicial", "Valor Compra Unitário", "Valor Venda Unitário", "Qtd Vendida", "Qtd em Estoque", "Total Compra", "Total Venda Potencial"
            
            const name = row['Produto'];
            if (!name) continue;

            const category = row['Categoria'] || 'Geral';
            // Size needs to be string
            const size = row['Tamanho'] ? String(row['Tamanho']) : 'U';
            const color = row['Cor'] || '';
            const supplier = row['Loja'] || '';
            
            const price = parseFloat(row['Valor Venda Unitário'] || 0);
            const cost = parseFloat(row['Valor Compra Unitário'] || 0);
            
            // Use current stock "Qtd em Estoque" first
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

            // console.log("Inserting:", name); // Debug
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
