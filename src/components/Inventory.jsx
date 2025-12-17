import { useState, useEffect, useMemo, useReducer } from 'react';
import { useStore } from '../lib/store';
import { Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react';

const CATEGORIES = ['Top', 'Conjunto', 'Shorts', 'Macacão', 'Conjunto Importado', 'Calça'];
const SIZES = ['P', 'M', 'G', 'GG', 'P/M', 'G/GG'];
const COLORS = ['Preto', 'Verde', 'Azul', 'Rosa', 'Rose', 'Roxo', 'Vermelho', 'Marrom', 'Cinza', 'Azul Marinho', 'Branco'];

export default function Inventory() {
    const { products, fetchData, addProduct, deleteProduct, updateProduct } = useStore();

    useEffect(() => {
        fetchData();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        supplier: '',
        category: '',
        color: '',
        size: '',
        price: '',
        cost: '',
        stock: '',
        min_stock: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: Number(formData.price),
            cost: Number(formData.cost),
            stock: Number(formData.stock),
            min_stock: Number(formData.min_stock)
        };

        if (currentId) {
            await updateProduct(currentId, productData);
        } else {
            await addProduct(productData);
        }

        resetForm();
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            supplier: product.supplier || '',
            category: product.category,
            color: product.color || '',
            size: product.size,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            min_stock: product.min_stock || 0
        });
        setCurrentId(product.id);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            supplier: '',
            category: '',
            color: '',
            size: '',
            price: '',
            cost: '',
            stock: '',
            min_stock: ''
        });
        setIsEditing(false);
        setCurrentId(null);
    };


    const uniqueNames = useMemo(() => [...new Set(products.map(p => p.name))].sort(), [products]);
    const uniqueSuppliers = useMemo(() => [...new Set(products.map(p => p.supplier).filter(Boolean))].sort(), [products]);
    const uniqueCategories = useMemo(() => {
        const merged = new Set([...CATEGORIES, ...products.map(p => p.category).filter(Boolean)]);
        return [...merged].sort();
    }, [products]);
    const uniqueColors = useMemo(() => {
        const merged = new Set([...COLORS, ...products.map(p => p.color).filter(Boolean)]);
        return [...merged].sort();
    }, [products]);

    const [sortConfig, setSortConfig] = useReducer((state, action) => {
        if (state.key === action) {
            return { key: action, direction: state.direction === 'desc' ? 'asc' : 'desc' };
        }
        return { key: action, direction: 'asc' };
    }, { key: 'name', direction: 'asc' });

    const sortedProducts = useMemo(() => {
        let filtered = products.filter(p => {
            const search = searchTerm.toLowerCase();
            return p.name.toLowerCase().includes(search) ||
                (p.supplier && p.supplier.toLowerCase().includes(search)) ||
                (p.category && p.category.toLowerCase().includes(search));
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            // Always push zero stock items to the end
            if (a.stock === 0 && b.stock !== 0) return 1;
            if (a.stock !== 0 && b.stock === 0) return -1;

            // Normal sorting for non-zero items
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle special cases
            if (sortConfig.key === 'category') {
                aValue = `${a.supplier} | ${a.category}`;
                bValue = `${b.supplier} | ${b.category}`;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [products, sortConfig, searchTerm]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const SortHeader = ({ _key, label }) => (
        <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 select-none"
            onClick={() => setSortConfig(_key)}
        >
            {label} {getSortIcon(_key)}
        </th>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciar Estoque</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-pink-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Produto
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentId ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                            <X className="text-gray-400 w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Seção 1: Identificação */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Identificação</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                                    <input required list="existing-names" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Digite ou selecione" />
                                    <datalist id="existing-names">
                                        {uniqueNames.map(name => <option key={name} value={name} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fornecedor</label>
                                    <input required list="existing-suppliers" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Digite ou selecione" />
                                    <datalist id="existing-suppliers">
                                        {uniqueSuppliers.map(sup => <option key={sup} value={sup} />)}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Atributos */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Atributos</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                                    <input list="dynamic-categories" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Selecione" />
                                    <datalist id="dynamic-categories">{uniqueCategories.map(cat => <option key={cat} value={cat} />)}</datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
                                    <input list="dynamic-colors" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Selecione" />
                                    <datalist id="dynamic-colors">{uniqueColors.map(color => <option key={color} value={color} />)}</datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamanho</label>
                                    <input list="sizes" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Selecione" />
                                    <datalist id="sizes">{SIZES.map(size => <option key={size} value={size} />)}</datalist>
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Valores e Estoque */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Valores</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venda (R$)</label>
                                        <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custo (R$)</label>
                                        <input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Estoque</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atual</label>
                                        <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mínimo</label>
                                        <input type="number" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: e.target.value })} className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-all font-bold flex justify-center items-center shadow-md hover:shadow-lg active:scale-[0.98]">
                                <Save className="w-5 h-5 mr-2" />
                                Salvar Produto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="mb-6">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por produto, fornecedor ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <SortHeader _key="name" label="Produto" />
                                <SortHeader _key="color" label="Cor/Tam" />
                                <SortHeader _key="stock" label="Estoque" />
                                <SortHeader _key="price" label="Preço" />
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedProducts.map((product) => (
                                <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${product.stock === 0 ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.supplier} | {product.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {product.color ? `${product.color} / ` : ''}{product.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock === 0
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-400 dark:ring-red-600'
                                            : product.stock <= (product.min_stock || 0)
                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {product.stock === 0 ? 'SEM ESTOQUE' : `${product.stock} un`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"><Edit2 className="w-5 h-5" /></button>
                                        <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {sortedProducts.map((product) => (
                    <div
                        key={product.id}
                        className={`p-4 rounded-xl shadow-sm border transition-colors ${product.stock === 0
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">{product.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {product.supplier} • {product.category}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {product.color}{product.color && product.size ? ' / ' : ''}{product.size}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-pink-600 dark:text-pink-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.cost)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock === 0
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-400 dark:ring-red-600'
                                : product.stock <= (product.min_stock || 0)
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                {product.stock === 0 ? 'SEM ESTOQUE' : `${product.stock} em estoque`}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
