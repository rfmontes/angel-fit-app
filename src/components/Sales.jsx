import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Search, ShoppingCart, Plus, Minus, Trash, Zap } from 'lucide-react';

export default function Sales() {
    const { products, addSale } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.stock > 0 && (
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [products, searchTerm]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
    };

    const buyNow = (product) => {
        addToCart(product);
        setActiveTab('cart');
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                const product = products.find(p => p.id === productId);
                if (newQty < 1) return item;
                if (newQty > product.stock) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [cart]);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [saleDate, setSaleDate] = useState('');

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (!customerName.trim()) {
            alert('Por favor, informe o nome da cliente.');
            return;
        }

        // Save sale
        addSale({
            items: cart,
            total: cartTotal,
            paymentMethod: 'Dinheiro', // Could be a dropdown
            customer_name: customerName,
            customer_phone: customerPhone,
            sale_date: saleDate ? new Date(saleDate).toISOString() : new Date().toISOString()
        });

        // Clear cart and notify (simple alert for now)
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setSaleDate('');
        alert('Venda realizada com sucesso!');
    };

    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'cart'

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm mb-4">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeTab === 'products'
                        ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Produtos
                </button>
                <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeTab === 'cart'
                        ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                </button>
            </div>

            {/* Product List */}
            <div className={`flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden transition-colors ${activeTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={`p-4 border rounded-lg transition dark:border-gray-600 relative ${product.stock > 0
                                ? 'bg-white dark:bg-gray-700 hover:shadow-md'
                                : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.size} | {product.color} | {product.category}</p>
                                </div>
                                <span className="font-bold text-pink-600 dark:text-pink-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                    Estoque: {product.stock}
                                </span>
                                {product.stock > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition"
                                            title="Adicionar ao carrinho"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                buyNow(product);
                                            }}
                                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                                            title="Comprar agora"
                                        >
                                            <Zap className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart */}
            <div className={`w-full md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors ${activeTab === 'products' ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
                    <h2 className="font-bold text-gray-800 dark:text-white flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Carrinho
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">Carrinho vazio</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl space-y-4">
                    {/* New Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Cliente</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Ex: Maria Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone (Opcional)</label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data (Opcional)</label>
                        <input
                            type="date"
                            value={saleDate}
                            onChange={e => setSaleDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-600 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-400">Deixe vazio para hoje</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
}
