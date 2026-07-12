import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    [key: string]: any; 
}

export default function CartScreen() {
    const { cartItems, addToCart, removeFromCart } = useApp();
    const router = useRouter();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCartProducts = useCallback(async () => {
        try {
            setLoading(true);
            
            const apiUrl = Platform.OS === 'android' 
                ? 'http://10.0.2.2:3000/products' 
                : 'http://localhost:3000/products';

            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Gagal memuat produk');
            }
            
            const data = await response.json();
            const productsList = data.products ? data.products : data;
            
            setProducts(productsList);
        } catch (error) {
            console.error('Fetch error di keranjang:', error);
            Alert.alert('Error', 'Gagal menyinkronkan data keranjang');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCartProducts();
        }, [fetchCartProducts])
    );

    const cartListData = products
        .filter(p => cartItems[p.id] > 0)
        .map(p => ({
            ...p,
            quantity: cartItems[p.id]
        }));

    const totalPrice = cartListData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // FUNGSIONALITAS BARU: Mengarahkan ke halaman metode pembayaran
    const handleCheckout = () => {
        if (cartListData.length === 0) {
            Alert.alert('Keranjang Kosong', 'Silakan pilih makanan terlebih dahulu sebelum melakukan pesanan.');
            return;
        }

        router.push({
            pathname: '/(authenticated)/payment',
            params: {
                items: JSON.stringify(cartListData),
                total: totalPrice
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Memuat keranjang...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keranjang Belanja</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <FlatList
                data={cartListData}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cartCard}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
                            
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => removeFromCart(item.id)}
                                >
                                    <Ionicons name="remove" size={18} color="#FF6B35" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => addToCart(item)} 
                                >
                                    <Ionicons name="add" size={18} color="#FF6B35" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={80} color="#CCCCCC" />
                        <Text style={styles.emptyText}>Keranjangmu kosong nih...</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(authenticated)/home')}>
                            <Text style={styles.shopBtnText}>Cari Makanan</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {cartListData.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Harga</Text>
                        <Text style={styles.totalValue}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
                    </View>
                    
                    {/* Mengaktifkan fungsi checkout saat tombol diklik */}
                    <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                        <Text style={styles.checkoutText}>Pesan Sekarang</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666666', fontWeight: '500' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    listContent: { padding: 20, paddingBottom: 40 },
    cartCard: { 
        flexDirection: 'row', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 16, 
        padding: 12, 
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F5F5F5' },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    price: { fontSize: 14, color: '#FF6B35', fontWeight: '700', marginTop: 4 },
    quantityContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 10,
        gap: 15 
    },
    qtyBtn: { 
        borderWidth: 1, 
        borderColor: '#FF6B35', 
        borderRadius: 8, 
        padding: 4,
        backgroundColor: '#FFF3E0'
    },
    qtyText: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
    footer: { 
        backgroundColor: '#FFFFFF', 
        padding: 20, 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalLabel: { fontSize: 14, color: '#666666', fontWeight: '500' },
    totalValue: { fontSize: 20, fontWeight: '800', color: '#FF6B35' },
    checkoutBtn: { 
        backgroundColor: '#FF6B35', 
        paddingVertical: 16, 
        borderRadius: 12, 
        alignItems: 'center' 
    },
    checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 16, color: '#999999', fontSize: 16, fontWeight: '500' },
    shopBtn: { marginTop: 24, backgroundColor: '#FFF3E0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
    shopBtnText: { color: '#FF6B35', fontWeight: '700', fontSize: 15 }
});