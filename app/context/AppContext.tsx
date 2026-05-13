import React, { createContext, useState, useContext } from 'react';
import { Product } from '../product';
import { Alert } from 'react-native'; // 1. Import Alert
// Definisi tipe data
interface AppContextType {
    wishlist: string[];
    toggleWishlist: (id: string) => void;
    cartCount: number;
    cartItems: { [key: string]: number };
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<string[]>([]);

    // 3. Tambahkan state untuk menyimpan detail item keranjang
    const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});

    const toggleWishlist = (id: string) => {
        setWishlist(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const addToCart = (product: Product) => {
        // 4. Update state keranjang (object)
        setCartItems(prev => ({
            ...prev,
            [product.id]: (prev[product.id] || 0) + 1
        }));

        // 5. Alert butuh import dari react-native
        // Alert.alert("Sukses", `${product.name} ditambah ke keranjang`);
    };
    const removeFromCart = (productId: string) => {
        setCartItems(prev => {
            const newItems = { ...prev };
            if (newItems[productId] > 1) {
                newItems[productId] -= 1;
            } else {
                delete newItems[productId]; // Hapus jika sisa 1 lalu dikurangi
            }
            return newItems;
        });
    };
    // 6. Hitung total item secara otomatis berdasarkan cartItems
    const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

    return (
        <AppContext.Provider value={{
            wishlist,
            toggleWishlist,
            cartCount,
            cartItems, // Sertakan ini jika butuh detail di screen Cart
            addToCart,
            removeFromCart
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};