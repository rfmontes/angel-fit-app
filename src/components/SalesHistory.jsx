import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Search, Calendar, User, ShoppingBag, DollarSign } from 'lucide-react';

export default function SalesHistory() {
    const { sales } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

    const filteredAndSortedSales = useMemo(() => {
        let filtered = sales.filter(sale =>
            sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.sale_date);
            const dateB = new Date(b.sale_date);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [sales, searchTerm, sortOrder]);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Histórico de Vendas</h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Sort Toggle */}
                    <button
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200 text-sm font-medium"
                    >
                        {sortOrder === 'desc' ? '↓ Mais Recentes' : '↑ Mais Antigas'}
                    </button>
                </div>
            </div>

            {/* Sales List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {filteredAndSortedSales.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        {searchTerm ? 'Nenhuma venda encontrada com esse nome.' : 'Nenhuma venda registrada ainda.'}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Telefone
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Itens
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredAndSortedSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(sale.sale_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {sale.customer_name || 'Cliente'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {sale.customer_phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-400">
                                                {sale.items.length}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(sale.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredAndSortedSales.map((sale) => (
                                <div key={sale.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {sale.customer_name || 'Cliente'}
                                            </div>
                                            {sale.customer_phone && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {sale.customer_phone}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(sale.total)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(sale.sale_date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ShoppingBag className="w-4 h-4" />
                                            {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Summary */}
            {filteredAndSortedSales.length > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-100 dark:border-pink-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Vendas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {filteredAndSortedSales.length} {filteredAndSortedSales.length === 1 ? 'venda' : 'vendas'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(filteredAndSortedSales.reduce((acc, sale) => acc + sale.total, 0))}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
