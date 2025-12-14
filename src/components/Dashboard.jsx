import { useStore } from '../lib/store';
import { DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useMemo, useReducer } from 'react';

export default function Dashboard() {
    const { products, sales } = useStore();

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const outOfStock = products.filter(p => p.stock === 0).length;

        // Calculate sales today
        const today = new Date().toISOString().split('T')[0];
        const salesToday = sales
            .filter(s => s.sale_date && s.sale_date.startsWith(today))
            .reduce((acc, curr) => acc + curr.total, 0);

        // Total Revenue and Items Sold
        const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
        const itemsSold = sales.reduce((acc, curr) => acc + (curr.items ? curr.items.reduce((sum, item) => sum + item.quantity, 0) : 0), 0);

        // Inventory Value (Cost)
        const totalCost = products.reduce((acc, curr) => acc + (curr.cost * curr.stock), 0);

        // Total Cost of All Pieces (investment = current stock + sold items at cost price)
        const totalPiecesCost = products.reduce((acc, curr) => acc + curr.cost, 0) +
            sales.reduce((acc, sale) => {
                if (!sale.items) return acc;
                return acc + sale.items.reduce((sum, item) => {
                    const product = products.find(p => p.id === item.product_id);
                    // Use the product's cost price, not the sale price
                    return sum + (product ? product.cost * item.quantity : 0);
                }, 0);
            }, 0);

        // Potential Revenue (current stock valued at sale prices)
        const potentialRevenue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

        // Group by Category and Color
        // Structure: { 'CategoryName': { stock: 0, cost: 0, sales: 0 } }
        const byCategory = {};
        const byColor = {};

        // 1. Inventory Stats (Stock & Cost)
        products.forEach(p => {
            // Category
            const cat = p.category || 'Sem Categoria';
            if (!byCategory[cat]) byCategory[cat] = { stock: 0, cost: 0, sales: 0 };
            byCategory[cat].stock += p.stock;
            byCategory[cat].cost += (p.cost * p.stock);

            // Color
            const col = p.color || 'Sem Cor';
            if (!byColor[col]) byColor[col] = { stock: 0, cost: 0, sales: 0 };
            byColor[col].stock += p.stock;
            byColor[col].cost += (p.cost * p.stock);
        });

        // 2. Sales Stats (Revenue)
        // We need to map sold items back to their products to know the category/color
        const productMap = products.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

        sales.forEach(sale => {
            if (sale.items) {
                sale.items.forEach(item => {
                    const product = productMap[item.product_id];
                    if (product) {
                        const itemTotal = item.price * item.quantity;

                        // Add to Category Sales
                        const cat = product.category || 'Sem Categoria';
                        if (!byCategory[cat]) byCategory[cat] = { stock: 0, cost: 0, sales: 0 };
                        byCategory[cat].sales += itemTotal;

                        // Add to Color Sales
                        const col = product.color || 'Sem Cor';
                        if (!byColor[col]) byColor[col] = { stock: 0, cost: 0, sales: 0 };
                        byColor[col].sales += itemTotal;
                    }
                });
            }
        });

        return { totalProducts, outOfStock, salesToday, totalRevenue, itemsSold, totalCost, totalPiecesCost, potentialRevenue, byCategory, byColor };
    }, [products, sales]);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {/* Sales Today Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mr-4">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vendas Hoje</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {formatCurrency(stats.salesToday)}
                        </p>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mr-4">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Vendido</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stats.itemsSold} peças vendidas</p>
                    </div>
                </div>

                {/* Inventory Value Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mr-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Custo do Estoque</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {formatCurrency(stats.totalCost)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{products.reduce((acc, p) => acc + p.stock, 0)} peças</p>
                    </div>
                </div>

                {/* Total Pieces Cost Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Investimento Total</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {formatCurrency(stats.totalPiecesCost)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {products.reduce((acc, p) => acc + p.stock, 0) + stats.itemsSold} peças compradas
                        </p>
                    </div>
                </div>

                {/* Potential Revenue Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mr-4">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Potencial do Estoque</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {formatCurrency(stats.potentialRevenue)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">se vender tudo</p>
                    </div>
                </div>

                {/* Low Stock Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mr-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sem Estoque</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.outOfStock} itens</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatsTable
                    title="Desempenho por Categoria"
                    data={stats.byCategory}
                    label="Categoria"
                    formatCurrency={formatCurrency}
                />
                <StatsTable
                    title="Desempenho por Cor"
                    data={stats.byColor}
                    label="Cor"
                    formatCurrency={formatCurrency}
                />
            </div>

            {/* Recent Sales Section (Placeholder) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Vendas Recentes</h2>
                </div>
                <div className="p-6 text-gray-500 dark:text-gray-400 text-center">
                    {sales.length === 0 ? "Nenhuma venda registrada ainda." : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sales.slice(-5).reverse().map((sale) => (
                                <li key={sale.id} className="py-3 flex justify-between items-center text-left">
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-800 dark:text-white block">
                                            {sale.customer_name || 'Cliente'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(sale.sale_date).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{sale.items.length} itens</span>
                                    <span className="font-bold text-green-600 dark:text-green-400 ml-4">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsTable({ title, data, label, formatCurrency }) {
    const [sortConfig, setSortConfig] = useReducer((state, action) => {
        if (state.key === action) {
            return { key: action, direction: state.direction === 'desc' ? 'asc' : 'desc' };
        }
        return { key: action, direction: 'desc' };
    }, { key: 'sales', direction: 'desc' });

    // Convert object to array: [{ name: 'Top', stock: 10... }]
    const tableData = useMemo(() => {
        return Object.entries(data).map(([name, stats]) => ({
            name,
            ...stats
        }));
    }, [data]);

    const sortedData = useMemo(() => {
        const sorted = [...tableData];
        sorted.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [tableData, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const Header = ({ _key, text, align = 'right' }) => (
        <th
            className={`px-6 py-3 text-${align} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition select-none`}
            onClick={() => setSortConfig(_key)}
        >
            {text} {getSortIcon(_key)}
        </th>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-96">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
            </div>
            <div className="overflow-auto flex-1">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 shadow-sm">
                        <tr>
                            <Header _key="name" text={label} align="left" />
                            <Header _key="stock" text="Estoque" />
                            <Header _key="cost" text="$$ Custo" />
                            <Header _key="sales" text="$$ Vendas" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sortedData.map((row) => (
                            <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{row.name}</td>
                                <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{row.stock} un</td>
                                <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(row.cost)}</td>
                                <td className="px-6 py-3 text-right font-medium text-green-600 dark:text-green-400">{formatCurrency(row.sales)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
