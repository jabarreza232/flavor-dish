import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    TextInput,
    Modal, // Tambahan import Modal
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenManager } from '../../lib/auth/tokenManager';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CONTAINER_PADDING = width * 0.05;
const ITEM_WIDTH = (width - (CONTAINER_PADDING * 2) - COLUMN_GAP) / 2;

const PROMO_BANNERS = [
    { id: 'b1', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600', title: 'Diskon Kilat 15%', desc: 'Khusus menu daging hari ini!' },
    { id: 'b2', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600', title: 'Gratis Ongkir', desc: 'Minimal belanja Rp 50.000' },
    { id: 'b3', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600', title: 'Menu Baru Festive', desc: 'Nikmati kehangatan tradisi nusanatara' },
];

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
    nutrition: { calories: number; protein: number; carbs: number; fat: number; };
    tags: string[];
    createdAt: string;
    updatedAt: string;
    restaurantName?: string;
    restaurantAddress?: string;
    latitude?: number;
    longitude?: number;
}

// Tambahan opsi lowest_rating
type SortOption = 'default' | 'cheapest' | 'expensive' | 'highest_rating' | 'lowest_rating';

export default function HomeScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSliderIndex, setActiveSliderIndex] = useState(0); 
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSort, setActiveSort] = useState<SortOption>('default');
    const [activeTag, setActiveTag] = useState<string>('Semua');
    
    // State untuk memunculkan Modal Filter
    const [isSortModalVisible, setSortModalVisible] = useState(false);

    const { wishlist, toggleWishlist, addToCart, cartCount } = useApp();

    const loadHomeData = useCallback(async () => {
        try {
            const token = await TokenManager.getAccessToken();
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }

            setUser({ name: 'Jabar Reza' });
            setStats({ totalOrders: 4, totalSpent: 567300, favoriteDishes: 8 });
            setRecentOrders([]);

            const apiUrl = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/products'
                : 'http://localhost:3000/products';

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Gagal mengambil data dari server');

            const data = await response.json();
            const productsList = data.products ? data.products : data;
            setProducts(productsList);

        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Gagal memuat data produk. Pastikan server lokal menyala.');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { loadHomeData(); }, [loadHomeData]);
    useFocusEffect(useCallback(() => { loadHomeData(); }, [loadHomeData]));

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHomeData();
        setRefreshing(false);
    };

    const handleSliderScroll = (event: any) => {
        const slideWidth = event.nativeEvent.layoutMeasurement.width;
        const offset = event.nativeEvent.contentOffset.x;
        const activeIndex = Math.floor((offset + slideWidth / 2) / slideWidth);
        setActiveSliderIndex(activeIndex);
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

    const availableTags = useMemo(() => {
        const tagsSet = new Set<string>();
        products.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach(t => tagsSet.add(t.toLowerCase()));
            }
        });
        return ['Semua', ...Array.from(tagsSet)];
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (p) => p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery)
            );
        }

        if (activeTag !== 'Semua') {
            result = result.filter(p => 
                p.tags && p.tags.map(t => t.toLowerCase()).includes(activeTag)
            );
        }

        switch (activeSort) {
            case 'cheapest':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'expensive':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'highest_rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'lowest_rating':
                result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                break;
            case 'default':
            default:
                break;
        }

        return result;
    }, [products, searchQuery, activeSort, activeTag]);

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Menyiapkan hidangan...</Text>
            </View>
        );
    }

    const sortOptionsList: { label: string, value: SortOption }[] = [
        { label: 'Urutan Default', value: 'default' },
        { label: 'Termurah', value: 'cheapest' },
        { label: 'Termahal', value: 'expensive' },
        { label: 'Rating Tertinggi', value: 'highest_rating' },
        { label: 'Rating Terendah', value: 'lowest_rating' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat datang,</Text>
                        <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#FF4757" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(authenticated)/cart')}>
                            <Ionicons name="cart-outline" size={26} color="#FF6B35" />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sliderContainer}>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleSliderScroll} scrollEventThrottle={16}>
                        {PROMO_BANNERS.map((banner) => (
                            <View key={banner.id} style={styles.slideCard}>
                                <Image source={{ uri: banner.image }} style={styles.slideImage} />
                                <View style={styles.slideOverlay} />
                                <View style={styles.slideTextContainer}>
                                    <Text style={styles.slideTitle}>{banner.title}</Text>
                                    <Text style={styles.slideDesc}>{banner.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.paginationDots}>
                        {PROMO_BANNERS.map((_, index) => (
                            <View key={index} style={[styles.dot, activeSliderIndex === index ? styles.activeDot : styles.inactiveDot]} />
                        ))}
                    </View>
                </View>

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

                <View style={styles.catalogSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Katalog Makanan</Text>
                        <TouchableOpacity style={styles.wishlistLinkContainer} onPress={() => router.push('/(authenticated)/wishlist')}>
                            <Ionicons name="heart" size={14} color="#FF4757" style={{ marginRight: 4 }} />
                            <Text style={styles.wishlistLinkText}>Wishlist ({wishlist.length})</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fitur Search & Filter Bar */}
                    <View style={styles.searchAndFilterRow}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari makanan favoritmu..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#999"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {/* Tombol Filter Dialog */}
                        <TouchableOpacity 
                            style={styles.filterIconButton} 
                            onPress={() => setSortModalVisible(true)}
                        >
                            <Ionicons name="options-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.tagScroll}
                        contentContainerStyle={{ paddingRight: CONTAINER_PADDING }}
                    >
                        {availableTags.map(tag => (
                            <FilterChip 
                                key={tag}
                                title={tag.charAt(0).toUpperCase() + tag.slice(1)} 
                                isActive={activeTag === tag} 
                                onPress={() => setActiveTag(tag)} 
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.gridContainer}>
                        {filteredAndSortedProducts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Makanan tidak ditemukan.</Text>
                            </View>
                        ) : (
                            filteredAndSortedProducts.map((product) => (
                                <CatalogGridCard
                                    key={product.id}
                                    product={product}
                                    isFavorite={wishlist.includes(product.id)}
                                    onWishlistPress={() => toggleWishlist(product.id)}
                                    onPlusPress={() => addToCart(product)}
                                    onPress={() => router.push({
                                        pathname: '/(authenticated)/detail_food',
                                        params: { productData: JSON.stringify(product) }
                                    })}
                                />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Modal Dialog untuk Pengurutan */}
            <Modal
                visible={isSortModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSortModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setSortModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Urutkan Makanan</Text>
                            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>
                        
                        {sortOptionsList.map((option) => (
                            <TouchableOpacity 
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setActiveSort(option.value);
                                    setSortModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    activeSort === option.value && styles.modalOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                                {activeSort === option.value && (
                                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

function FilterChip({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity style={[styles.filterChip, isActive && styles.filterChipActive]} onPress={onPress}>
            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{title}</Text>
        </TouchableOpacity>
    );
}

function CatalogGridCard({ product, isFavorite, onWishlistPress, onPlusPress, onPress }: any) {
    if (!product) return null;
    const hasDiscount = product.discount > 0;

    return (
        <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: product?.image }} style={styles.gridImage} />
                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.heartIcon} onPress={onWishlistPress}>
                    <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FF4757" : "#FFFFFF"} />
                </TouchableOpacity>
            </View>

            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{product?.name}</Text>
                <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{product?.category}</Text>

                <View style={styles.priceContainer}>
                    {hasDiscount && (
                        <Text style={styles.gridOriginalPrice}>Rp {product?.originalPrice?.toLocaleString('id-ID')}</Text>
                    )}
                    <Text style={styles.gridPrice}>Rp {product?.price?.toLocaleString('id-ID') || 0}</Text>
                </View>

                <View style={styles.gridBottom}>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{product?.rating || 0}</Text>
                    </View>
                    <TouchableOpacity style={styles.plusButton} onPress={onPlusPress}>
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666', fontWeight: '500' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: CONTAINER_PADDING, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFFFFF' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    greeting: { fontSize: 14, color: '#999999' },
    userName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    logoutButton: { width: 40, height: 40, backgroundColor: '#FFF1F2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cartButton: { width: 46, height: 46, backgroundColor: '#FFF3E0', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF4757', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    sliderContainer: { marginTop: 10, marginBottom: 15 },
    slideCard: { width: width - (CONTAINER_PADDING * 2), height: 160, marginLeft: CONTAINER_PADDING, marginRight: Platform.OS === 'ios' ? 0 : 0, borderRadius: 16, overflow: 'hidden', backgroundColor: '#EEE', position: 'relative' },
    slideImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    slideOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
    slideTextContainer: { position: 'absolute', bottom: 16, left: 16, right: 16 },
    slideTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
    slideDesc: { color: '#E0E0E0', fontSize: 13, fontWeight: '400' },
    paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    dot: { height: 6, borderRadius: 3, marginHorizontal: 4 },
    activeDot: { width: 18, backgroundColor: '#FF6B35' },
    inactiveDot: { width: 6, backgroundColor: '#D8D8D8' },

    logSection: { paddingHorizontal: CONTAINER_PADDING, marginTop: 15, marginBottom: 10 },
    logCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    logLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logIconBg: { backgroundColor: '#FFF3E0', padding: 10, borderRadius: 10 },
    logOrderId: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    logDate: { fontSize: 12, color: '#999999' },
    logRight: { alignItems: 'flex-end' },
    logAmount: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    logStatus: { fontSize: 12, fontWeight: '600' },

    catalogSection: { paddingHorizontal: CONTAINER_PADDING, marginTop: 10, paddingBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    wishlistLinkContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    wishlistLinkText: { fontSize: 12, fontWeight: '600', color: '#FF4757' },
    
    searchAndFilterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1A1A1A', padding: 0 },
    filterIconButton: { backgroundColor: '#FF6B35', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    
    tagScroll: { marginBottom: 15 },
    filterChip: { backgroundColor: '#FFF3E0', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#FFE0B2' },
    filterChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#FF6B35' },
    filterChipTextActive: { color: '#FFF' },
    
    emptyState: { width: '100%', paddingVertical: 30, alignItems: 'center' },
    emptyStateText: { color: '#999', fontSize: 14 },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCard: { width: ITEM_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, overflow: 'hidden' },
    imageContainer: { height: 120, width: '100%', backgroundColor: '#F5F5F5', position: 'relative' },
    gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF4757', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    discountBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    heartIcon: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 20 },

    gridInfo: { padding: 10 },
    gridName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    priceContainer: { marginTop: 6, minHeight: 34, justifyContent: 'flex-end' },
    gridOriginalPrice: { fontSize: 11, color: '#A0A0A0', textDecorationLine: 'line-through', marginBottom: 1 },
    gridPrice: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
    gridBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 11, color: '#666', fontWeight: '600' },
    plusButton: { backgroundColor: '#FF6B35', borderRadius: 8, padding: 4 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalOptionText: { fontSize: 16, color: '#1A1A1A' },
    modalOptionTextActive: { color: '#FF6B35', fontWeight: '700' },
});