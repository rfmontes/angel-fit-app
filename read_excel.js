import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { resolve } from 'path';

const excelPath = resolve('../Estoque.xlsx');
console.log(`Reading: ${excelPath}`);

try {
  const fileBuffer = fs.readFileSync(excelPath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  // Procura especificamente pela aba "Estoque"
  const sheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'estoque') ||
    workbook.SheetNames.find(n => n.toLowerCase().includes('estoque')) ||
    workbook.SheetNames[0];

  console.log(`Using Sheet: ${sheetName}`);
  console.log('All sheets:', workbook.SheetNames.join(', '));

  const sheet = workbook.Sheets[sheetName];

  // Converte para JSON com headers automáticos e limpa linhas vazias
  let data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,  // Usa primeira linha como headers
    defval: "",
    blankrows: false  // Remove linhas completamente vazias
  });

  if (data.length > 0) {
    // Define headers explicitamente baseados na estrutura da aba Estoque
    const headers = [
      'Categoria', 'Produto', 'Cor', 'Tamanho', 'Loja',
      'Qtd Inicial', 'Valor Compra Unitrio', 'Valor Venda Unitrio',
      'Qtd Vendida', 'Qtd em Estoque', 'Total Compra', 'Total Venda Potencial'
    ];

    // Usa headers definidos e converte para objetos
    const jsonData = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return obj;
    }).filter(row =>
      // Filtra linhas com dados válidos (pelo menos Categoria ou Produto preenchido)
      row.Categoria || row.Produto || row['Qtd em Estoque'] > 0
    );

    console.log(`Total valid rows: ${jsonData.length}`);

    // Converte números adequadamente
    const processedData = jsonData.map(row => ({
      ...row,
      'Qtd Inicial': parseFloat(row['Qtd Inicial']) || 0,
      'Valor Compra Unitrio': parseFloat(row['Valor Compra Unitrio']) || 0,
      'Valor Venda Unitrio': parseFloat(row['Valor Venda Unitrio']) || 0,
      'Qtd Vendida': parseFloat(row['Qtd Vendida']) || 0,
      'Qtd em Estoque': parseFloat(row['Qtd em Estoque']) || 0,
      'Total Compra': parseFloat(row['Total Compra']) || 0,
      'Total Venda Potencial': parseFloat(row['Total Venda Potencial']) || 0
    }));

    // Salva JSON completo
    const outputPath = resolve('./estoque_completo.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2), 'utf8');

    console.log(`✅ JSON salvo em: ${outputPath}`);
    console.log(`📊 Resumo:`);
    console.log(`   - Total itens: ${processedData.length}`);
    console.log(`   - Itens em estoque: ${processedData.filter(item => item['Qtd em Estoque'] > 0).length}`);
    console.log(`   - Total valor compra: R$ ${processedData.reduce((sum, item) => sum + item['Total Compra'], 0).toFixed(2)}`);
    console.log(`   - Total venda potencial: R$ ${processedData.reduce((sum, item) => sum + item['Total Venda Potencial'], 0).toFixed(2)}`);

    // Mostra primeiras 3 linhas como exemplo
    console.log("\n📋 Primeiros 3 itens:");
    console.log(JSON.stringify(processedData.slice(0, 3), null, 2));

  } else {
    console.log('❌ Nenhuma linha de dados encontrada');
  }

} catch (error) {
  console.error("❌ Erro:", error.message);
  if (error.code === 'ENOENT') {
    console.log('💡 Dica: Verifique se o arquivo está no caminho correto:');
    console.log(`   Esperado: ${excelPath}`);
  }
}
