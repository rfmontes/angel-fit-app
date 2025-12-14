import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
    products: [],
    sales: [],
    loading: false,
    user: null,
    session: null,
    authInitialized: false,

    // Auth Actions
    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user || null, authInitialized: true });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user || null, authInitialized: true });
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
    },

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

    deleteSale: async (saleId) => {
        // 1. Get sale items to restore stock
        const { data: saleItems } = await supabase.from('sale_items').select('*').eq('sale_id', saleId);

        // 2. Restore stock for each item
        const newProducts = [...get().products];
        for (const item of saleItems) {
            const product = newProducts.find(p => p.id === item.product_id);
            if (product) {
                const newStock = product.stock + item.quantity;
                product.stock = newStock;
                await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
            }
        }

        // 3. Delete sale items
        await supabase.from('sale_items').delete().eq('sale_id', saleId);

        // 4. Delete sale
        await supabase.from('sales').delete().eq('id', saleId);

        // 5. Update state
        set((state) => ({
            sales: state.sales.filter(s => s.id !== saleId),
            products: newProducts
        }));
    },

    updateSale: async (saleId, updatedSale) => {
        // 1. Get original sale items
        const { data: originalItems } = await supabase.from('sale_items').select('*').eq('sale_id', saleId);

        // 2. Calculate stock adjustments
        const newProducts = [...get().products];

        // Restore stock from original items
        for (const item of originalItems) {
            const product = newProducts.find(p => p.id === item.product_id);
            if (product) {
                product.stock += item.quantity;
            }
        }

        // Deduct stock for new items
        for (const item of updatedSale.items) {
            const product = newProducts.find(p => p.id === item.productId);
            if (product) {
                if (product.stock < item.quantity) {
                    throw new Error(`Estoque insuficiente para ${product.name}`);
                }
                product.stock -= item.quantity;
            }
        }

        // 3. Update sale
        const saleData = {
            total: updatedSale.total,
            payment_method: updatedSale.paymentMethod,
            customer_name: updatedSale.customer_name,
            customer_phone: updatedSale.customer_phone,
            sale_date: updatedSale.sale_date
        };
        await supabase.from('sales').update(saleData).eq('id', saleId);

        // 4. Delete old items and insert new ones
        await supabase.from('sale_items').delete().eq('sale_id', saleId);

        const itemsToInsert = updatedSale.items.map(item => ({
            sale_id: saleId,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name
        }));
        await supabase.from('sale_items').insert(itemsToInsert);

        // 5. Update stock in database
        for (const product of newProducts) {
            await supabase.from('products').update({ stock: product.stock }).eq('id', product.id);
        }

        // 6. Refresh data
        await get().fetchData();
    },
}))
