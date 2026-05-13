import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ALL_PRODUCTS } from '../product';
export default function CartScreen() {
    const { cartItems, addToCart, removeFromCart } = useApp();
    const router = useRouter();

    // 1. Ambil detail produk yang ada di cartItems
    const cartListData = ALL_PRODUCTS.filter(p => cartItems[p.id] > 0).map(p => ({
        ...p,
        quantity: cartItems[p.id]
    }));

    // 2. Hitung Total Pembayaran
    const totalPrice = cartListData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
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
                            <Text style={styles.price}>Rp {item.price.toLocaleString()}</Text>
                            
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
                        <Ionicons name="cart-outline" size={80} color="#CCC" />
                        <Text style={styles.emptyText}>Keranjangmu kosong nih...</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
                            <Text style={styles.shopBtnText}>Cari Makanan</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {cartListData.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Harga</Text>
                        <Text style={styles.totalValue}>Rp {totalPrice.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutBtn}>
                        <Text style={styles.checkoutText}>Pesan Sekarang</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: '#FFF' 
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    listContent: { padding: 20 },
    cartCard: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        borderRadius: 16, 
        padding: 12, 
        marginBottom: 15,
        alignItems: 'center'
    },
    image: { width: 80, height: 80, borderRadius: 12 },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
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
        padding: 2 
    },
    qtyText: { fontSize: 16, fontWeight: '700' },
    footer: { 
        backgroundColor: '#FFF', 
        padding: 20, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalLabel: { fontSize: 14, color: '#999' },
    totalValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    checkoutBtn: { 
        backgroundColor: '#FF6B35', 
        padding: 16, 
        borderRadius: 15, 
        alignItems: 'center' 
    },
    checkoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
    shopBtn: { marginTop: 20, backgroundColor: '#FFF3E0', padding: 12, borderRadius: 10 },
    shopBtnText: { color: '#FF6B35', fontWeight: '700' }
});