import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
    products: [],
    sales: [],
    loading: false,

    // Initial Fetch
    fetchData: async () => {
        set({ loading: true });
        const { data: products } = await supabase.from('products').select('*');
        const { data: sales } = await supabase.from('sales').select('*, items:sale_items(*)');
        set({ products: products || [], sales: sales || [], loading: false });
    },

    // Product Actions
    addProduct: async (product) => {
        const { data, error } = await supabase.from('products').insert([product]).select().single();
        if (data) {
            set((state) => ({ products: [...state.products, data] }));
        }
    },

    updateProduct: async (id, updatedFields) => {
        const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select().single();
        if (data) {
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? data : p))
            }));
        }
    },

    deleteProduct: async (id) => {
        await supabase.from('products').delete().eq('id', id);
        set((state) => ({
            products: state.products.filter((p) => p.id !== id)
        }));
    },

    // Sales Actions
    addSale: async (sale) => {
        // 1. Create Sale
        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert([{
                total: sale.total,
                payment_method: sale.payment_method,
                customer_name: sale.customer_name,
                customer_phone: sale.customer_phone,
                sale_date: sale.sale_date || new Date().toISOString()
            }])
            .select()
            .single();

        if (saleError || !saleData) return;

        // 2. Create Sale Items
        const itemsToInsert = sale.items.map(item => ({
            sale_id: saleData.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name
        }));

        await supabase.from('sale_items').insert(itemsToInsert);

        // 3. Update Stock (Simulated locally for now, real app would use RPC or trigger)
        // We'll update state and trigger DB updates for stock
        const newProducts = [...get().products];

        for (const item of sale.items) {
            const product = newProducts.find(p => p.id === item.productId);
            if (product) {
                const newStock = product.stock - item.quantity;
                // Optimistic local update
                product.stock = newStock;
                // Async DB update
                await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
            }
        }

        set((state) => ({
            sales: [...state.sales, { ...saleData, items: itemsToInsert }],
            products: newProducts
        }));
    },
}))
