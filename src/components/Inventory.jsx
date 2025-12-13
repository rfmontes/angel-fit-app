import { useState, useEffect, useMemo, useReducer } from 'react';
import { useStore } from '../lib/store';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

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


    const [sortConfig, setSortConfig] = useReducer((state, action) => {
        if (state.key === action) {
            return { key: action, direction: state.direction === 'desc' ? 'asc' : 'desc' };
        }
        return { key: action, direction: 'asc' };
    }, { key: 'name', direction: 'asc' });

    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        sorted.sort((a, b) => {
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
    }, [products, sortConfig]);

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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciar Estoque</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-pink-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Produto
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentId ? 'Editar Produto' : 'Novo Produto'}</h2>
                        <button onClick={resetForm}><X className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
                            <input required value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>

                        {/* Grouped Row: Category, Color, Size */}
                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                                <input
                                    list="categories"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Selecione ou digite"
                                />
                                <datalist id="categories">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
                                <input
                                    list="colors"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Selecione ou digite"
                                />
                                <datalist id="colors">
                                    {COLORS.map(color => <option key={color} value={color} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho</label>
                                <input
                                    list="sizes"
                                    value={formData.size}
                                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Selecione ou digite"
                                />
                                <datalist id="sizes">
                                    {SIZES.map(size => <option key={size} value={size} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço Venda (R$)</label>
                            <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo (R$)</label>
                            <input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade Atual</label>
                            <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Mínimo</label>
                            <input type="number" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>
                        <div className="col-span-2 pt-4">
                            <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition font-medium flex justify-center items-center">
                                <Save className="w-5 h-5 mr-2" />
                                Salvar Produto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
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
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.supplier} | {product.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {product.color ? `${product.color} / ` : ''}{product.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock <= (product.min_stock || 0) ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {product.stock} un
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
        </div>
    );
}
