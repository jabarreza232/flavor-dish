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
    Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenManager } from '../../lib/auth/tokenManager';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CONTAINER_PADDING = width * 0.05;
const ITEM_WIDTH = (width - (CONTAINER_PADDING * 2) - COLUMN_GAP) / 2;

// Menyesuaikan interface dengan response JSON dari API kamu
export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    thumbnail: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    quantity: number;
    prepTime: number;
    servings: number;
    ingredients: string[];
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { wishlist, toggleWishlist, addToCart, cartCount } = useApp();

    const loadHomeData = useCallback(async () => {
        try {
            const token = await TokenManager.getAccessToken();
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }

            // Mock Data User
            setUser({ name: 'John Doe' });
            setStats({ totalOrders: 4, totalSpent: 567300, favoriteDishes: 8 });
            setRecentOrders([
            ]);

            // FETCH DATA DARI API
            // Catatan: Ubah 'localhost' menjadi '10.0.2.2' jika kamu memakai Android Emulator!
            const apiUrl = Platform.OS === 'android' 
                ? 'http://10.0.2.2:3000/products' // IP khusus Android Emulator ke localhost komputer
                : 'http://localhost:3000/products';

            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server');
            }
            
            const data = await response.json();
            
            // Mengecek apakah JSON berbentuk { "products": [...] } atau langsung [...]
            const productsList = data.products ? data.products : data;
            setProducts(productsList);

        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Gagal memuat data produk. Pastikan server lokal menyala.');
        } finally {
            setLoading(false);
        }
    }, [router]);

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

    const handleLogout = () => {
        Alert.alert(
            "Konfirmasi Logout",
            "Apakah Anda yakin ingin keluar?",
            [
                { text: "Batal", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            router.replace('/(auth)/login');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal melakukan logout');
                        }
                    } 
                }
            ]
        );
    };

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
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat datang,</Text>
                        <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
                    </View>
                    
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#FF4757" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => router.push('/(authenticated)/cart')}
                        >
                            <Ionicons name="cart-outline" size={26} color="#FF6B35" />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Komponen Log Aktivitas / Pesanan Terakhir */}
                {recentOrders.length > 0 && (
                    <View style={styles.logSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Log Pesanan Terakhir</Text>
                        </View>
                        {recentOrders.map((order, index) => (
                            <View key={index} style={styles.logCard}>
                                <View style={styles.logLeft}>
                                    <View style={styles.logIconBg}>
                                        <MaterialCommunityIcons name="receipt" size={20} color="#FF6B35" />
                                    </View>
                                    <View>
                                        <Text style={styles.logOrderId}>{order.orderId}</Text>
                                        <Text style={styles.logDate}>
                                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.logRight}>
                                    <Text style={styles.logAmount}>Rp {order.totalAmount.toLocaleString('id-ID')}</Text>
                                    <Text style={[
                                        styles.logStatus, 
                                        { color: order.status === 'Selesai' ? '#4CAF50' : '#FF9800' }
                                    ]}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Katalog Section */}
                <View style={styles.catalogSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Katalog Makanan</Text>
                        <TouchableOpacity onPress={() => router.push('/(authenticated)/wishlist')}>
                            <Text style={styles.wishlistLink}>❤ Wishlist ({wishlist.length})</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.gridContainer}>
                        {products.length === 0 ? (
                            <Text style={{ textAlign: 'center', width: '100%', color: '#999', marginTop: 20 }}>
                                Belum ada produk yang dimuat.
                            </Text>
                        ) : (
                            products.map((product) => (
                                <CatalogGridCard
                                    key={product.id}
                                    product={product}
                                    isFavorite={wishlist.includes(product.id)}
                                    onWishlistPress={() => toggleWishlist(product.id)}
                                    onPlusPress={() => addToCart(product)}
                                />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function CatalogGridCard({ product, isFavorite, onWishlistPress, onPlusPress }: any) {
    if (!product) return null;

    return (
        <View style={styles.gridCard}>
            <View style={styles.imageContainer}>
                {/* Menggunakan property image dari JSON endpoint */}
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
                
                {/* Tambahan: Menampilkan Kategori ringan sesuai JSON */}
                <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{product?.category}</Text>
                
                <View style={styles.gridBottom}>
                    <Text style={styles.gridPrice}>Rp {product?.price?.toLocaleString('id-ID') || 0}</Text>
                    <TouchableOpacity style={styles.plusButton} onPress={onPlusPress}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666', fontWeight: '500' },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: CONTAINER_PADDING,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    greeting: { fontSize: 14, color: '#999999' },
    userName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    
    logoutButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF1F2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartButton: {
        width: 46,
        height: 46,
        backgroundColor: '#FFF3E0',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4757',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    // Log Section
    logSection: {
        paddingHorizontal: CONTAINER_PADDING,
        marginTop: 15,
        marginBottom: 10,
    },
    logCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    logLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logIconBg: {
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 10,
    },
    logOrderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    logDate: {
        fontSize: 12,
        color: '#999999',
    },
    logRight: {
        alignItems: 'flex-end',
    },
    logAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    logStatus: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Section Header
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1A1A1A' 
    },

    // Catalog Section
    catalogSection: {
        paddingHorizontal: CONTAINER_PADDING,
        marginTop: 10,
        paddingBottom: 20,
    },
    wishlistLink: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF4757',
        backgroundColor: '#FFF1F2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    imageContainer: {
        height: 120,
        width: '100%',
        backgroundColor: '#F5F5F5',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 6,
        borderRadius: 20,
    },
    gridInfo: { padding: 10 },
    gridName: {
        fontSize: 13,
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
});