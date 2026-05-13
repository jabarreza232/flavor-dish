import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenManager } from '../../lib/auth/tokenManager';
import { useApp } from '../context/AppContext';
import { Product } from '../product';
const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CONTAINER_PADDING = width * 0.05;
const ITEM_WIDTH = (width - (CONTAINER_PADDING * 2) - COLUMN_GAP) / 2;

// --- Interfaces tetap sama ---

export default function HomeScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cart, setCartItems] = useState<{ [key: string]: number }>({}); // Simpan {productId: quantity}
    const { wishlist, toggleWishlist, addToCart, cartCount } = useApp();
    // --- LOGIKA WISHLIST ---


    // --- LOGIKA ADD TO CART ---
    // 1. PINDAHKAN SEMUA HOOK KE ATAS (Sangat Penting!)
    const loadHomeData = useCallback(async () => {
        try {
            // Simulasi fetch data user & produk sekaligus
            const token = await TokenManager.getAccessToken();
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }

            // Mock Data
            const mockUser = { name: 'John Doe' };
            const mockStats = { totalOrders: 4, totalSpent: 567300, favoriteDishes: 8 };
            const mockProducts: Product[] = [
                {
                    id: '1',
                    name: 'Rendang Sapi Premium',
                    description: 'Daging empuk bumbu rempah melimpah.',
                    price: 45000,
                    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400',
                    rating: 4.8,
                },
                {
                    id: '2',
                    name: 'Soto Ayam Kuning',
                    description: 'Segar dengan koya dan ayam kampung.',
                    price: 35000,
                    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=400',
                    rating: 4.5,
                },
                {
                    id: '3',
                    name: 'Salad Sayur Organik',
                    description: 'Sayuran hidroponik & saus wijen.',
                    price: 28000,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400',
                    rating: 4.7,
                },
                {
                    id: '4',
                    name: 'Nasi Goreng Spesial',
                    description: 'Dilengkapi telur mata sapi dan sate.',
                    price: 32000,
                    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400',
                    rating: 4.9,
                }
            ];

            setUser(mockUser);
            setStats(mockStats);
            setProducts(mockProducts);
            setRecentOrders([
                { orderId: 'ORD-001', status: 'completed', totalAmount: 147500, createdAt: '2026-05-09T10:30:00Z', itemCount: 3 }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHomeData();
    }, [loadHomeData]);

    useFocusEffect(
        useCallback(() => {
            loadHomeData();
        }, [loadHomeData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHomeData();
        setRefreshing(false);
    };
    const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);
    // 2. Loading State (Setelah Hook)
    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Menyiapkan hidangan...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header dengan Badge Cart */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat datang,</Text>
                        <Text style={styles.userName}>John Doe</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => router.push('/(authenticated)/cart')} // Tambahkan ini!
                    >
                        <Ionicons name="cart-outline" size={26} color="#FF6B35" />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Katalog Section */}
                <View style={styles.catalogSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Katalog Makanan</Text>
                        <TouchableOpacity onPress={() => router.push('/(authenticated)/wishlist')}>
                            <Text style={styles.wishlistLink}>❤ Wishlist ({wishlist.length})</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gridContainer}>
                        {products.map((product) => (
                            <CatalogGridCard
                                key={product.id} // WAJIB ADA: Agar React tidak bingung saat render
                                product={product} // INI YANG KETINGGALAN: Lempar data produknya!
                                isFavorite={wishlist.includes(product.id)}
                                onWishlistPress={() => toggleWishlist(product.id)}
                                onPlusPress={() => addToCart(product)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}
function CatalogGridCard({ product, isFavorite, onWishlistPress, onPlusPress }: any) {
    // SAFETY GUARD: Jika product undefined/null, jangan render apa-apa
    if (!product) return null;

    return (
        <View style={styles.gridCard}>
            <View style={styles.imageContainer}>
                {/* Gunakan optional chaining (?.) untuk proteksi ganda */}
                <Image source={{ uri: product?.image }} style={styles.gridImage} />
                <TouchableOpacity style={styles.heartIcon} onPress={onWishlistPress}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite ? "#FF4757" : "#FFFFFF"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{product?.name}</Text>
                <View style={styles.gridBottom}>
                    {/* Tambahkan pengecekan harga agar aplikasi tidak crash jika harga kosong */}
                    <Text style={styles.gridPrice}>Rp {product?.price?.toLocaleString() || 0}</Text>
                    <TouchableOpacity style={styles.plusButton} onPress={onPlusPress}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666', fontWeight: '500' },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: CONTAINER_PADDING,
        paddingTop: 20,
        paddingBottom: 10,
    },
    greeting: { fontSize: 14, color: '#999' },
    userName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    iconButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12 },

    // Promo
    promoBanner: {
        marginHorizontal: CONTAINER_PADDING,
        marginVertical: 20,
        backgroundColor: '#FF6B35',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    promoContent: { flex: 1 },
    promoTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    promoSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
    promoImage: { width: 80, height: 80, position: 'absolute', right: -10, bottom: -10, opacity: 0.5 },

    // Section Header
    sectionContainer: { paddingHorizontal: CONTAINER_PADDING },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { marginLeft: 10, marginRight: 10, fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    viewAllText: { color: '#FF6B35', fontWeight: '600', fontSize: 14 },


    ratingFloating: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#1A1A1A' },
    gridContent: { padding: 10 },
    gridDesc: { fontSize: 11, color: '#999', marginTop: 2 },
    gridFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    addButton: {
        backgroundColor: '#FF6B35',
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
    },
    gridCard: {
        width: '48%', // Membuat 2 kolom
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        overflow: 'hidden'
    },
    imageContainer: {
        height: 120,
        width: '100%',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    heartIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 5,
        borderRadius: 20,
    },
    gridInfo: {
        padding: 10,
    },
    cartButton: {
        width: 46,
        height: 46,
        backgroundColor: '#FFF3E0', // Warna orange sangat muda agar ikon orange-nya kontras
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Penting agar badge bisa nempel di pojok
    },
    gridName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    gridBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    gridPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FF6B35',
    },
    plusButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 8,
        padding: 4,
    },
    catalogSection: {
        marginTop: 8,
        paddingBottom: 20,
    },
    wishlistLink: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF4757', // Warna merah lembut untuk nuansa wishlist
        backgroundColor: '#FFF1F2', // Background pink tipis biar kelihatan clickable
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    }
});