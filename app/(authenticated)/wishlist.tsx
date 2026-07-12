import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    Image, 
    StyleSheet, 
    SafeAreaView, 
    Alert, 
    Platform, 
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Product } from '../product';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WishlistScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Ambil wishlist dan fungsi toggleWishlist dari Global Context
    const { wishlist, toggleWishlist } = useApp();

    const fetchWishlistProducts = useCallback(async () => {
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
            
            // Filter hanya produk yang id-nya ada di array wishlist
            const favoriteProducts = productsList.filter((p: Product) => wishlist.includes(p.id));
            setProducts(favoriteProducts);
        } catch (error) {
            console.error('Fetch error di wishlist:', error);
            Alert.alert('Error', 'Gagal menyinkronkan data favorit');
        } finally {
            setLoading(false);
        }
    }, [wishlist]);

    useFocusEffect(
        useCallback(() => {
            fetchWishlistProducts();
        }, [fetchWishlistProducts])
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Memuat menu favorit...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
        
                <Text style={styles.title}>Menu Favorit</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* List Makanan Favorit */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                contentContainerStyle={products.length === 0 ? styles.emptyListContent : styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.wishlistCard}
                        activeOpacity={0.9}
                        onPress={() => router.push({
                            pathname: '/(authenticated)/detail_food',
                            params: { productData: JSON.stringify(item) }
                        })}
                    >
                        <Image source={{ uri: item.image }} style={styles.img} />
                        
                        <View style={styles.info}>
                            <View style={styles.titleRow}>
                                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                                <TouchableOpacity 
                                    style={styles.heartButton}
                                    onPress={() => toggleWishlist(item.id)}
                                >
                                    <Ionicons name="heart" size={24} color="#FF4757" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.bottomRow}>
                                <Text style={styles.price}>
                                    Rp {item.price.toLocaleString('id-ID')}
                                </Text>
                                
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{item.rating}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-dislike-outline" size={80} color="#CCCCCC" />
                        <Text style={styles.emptyText}>Daftar favoritmu masih kosong nih</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(authenticated)')}>
                            <Text style={styles.shopBtnText}>Cari Makanan</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#666', fontWeight: '500' },
    
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: 20, 
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    
    listContent: { paddingBottom: 20 },
    emptyListContent: { flex: 1, justifyContent: 'center' },
    
    wishlistCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    img: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F5F5F5' },
    
    info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    name: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginRight: 10 },
    heartButton: { padding: 2 },
    
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    price: { color: '#FF6B35', fontWeight: '800', fontSize: 16 },
    
    ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: '#FFB800' },
    
    // Empty State Styles
    emptyContainer: { alignItems: 'center', paddingHorizontal: 20 },
    emptyText: { marginTop: 16, color: '#999', fontSize: 16, fontWeight: '500', textAlign: 'center' },
    shopBtn: { marginTop: 24, backgroundColor: '#FFF3E0', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
    shopBtnText: { color: '#FF6B35', fontWeight: '700', fontSize: 15 }
});