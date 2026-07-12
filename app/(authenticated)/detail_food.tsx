import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Linking
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function DetailFoodScreen() {
    const router = useRouter();
    const { productData } = useLocalSearchParams();
    const { addToCart } = useApp();

    let product: any = null;
    try {
        product = productData ? JSON.parse(productData as string) : null;
    } catch (e) {
        console.error("Gagal mem-parsing data produk", e);
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Stack.Screen options={{ title: 'Error', headerShown: true }} />
                <Text style={styles.errorText}>Data makanan tidak ditemukan.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const openInGoogleMaps = () => {
        if (product.latitude && product.longitude) {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${product.latitude},${product.longitude}`;
            Linking.openURL(mapUrl).catch(() => {
                console.error("Gagal membuka Google Maps");
            });
        }
    };

    const hasDiscount = product.discount > 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ 
                title: 'Detail Makanan', 
                headerShown: false 
            }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Gambar Makanan & Tombol Kembali */}
                <View style={styles.imageHeaderContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    
                    <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Badge Diskon */}
                    {hasDiscount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
                        </View>
                    )}
                </View>

                {/* Konten Detail */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        
                        {/* Area Harga */}
                        <View style={styles.priceContainer}>
                            {hasDiscount && (
                                <Text style={styles.originalPrice}>
                                    Rp {product.originalPrice?.toLocaleString('id-ID')}
                                </Text>
                            )}
                            <Text style={styles.productPrice}>
                                Rp {product.price?.toLocaleString('id-ID')}
                            </Text>
                        </View>
                    </View>

                    {/* Rating & Tags */}
                    <View style={styles.metaRow}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>
                                {product.rating} ({product.reviews} ulasan)
                            </Text>
                        </View>
                        <View style={styles.tagsContainer}>
                            {product.tags?.map((tag: string, index: number) => (
                                <View key={index} style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.descriptionText}>{product.description}</Text>

                    {/* Informasi Lengkap Restoran */}
                    <View style={styles.restaurantCard}>
                        <View style={styles.restaurantHeader}>
                            <Ionicons name="restaurant" size={20} color="#FF6B35" />
                            <Text style={styles.restaurantTitle}>{product.restaurantName || "Pondok Makan Nusantara"}</Text>
                        </View>
                        
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={16} color="#FF4757" />
                            <Text style={styles.restaurantAddress}>
                                {product.restaurantAddress || "Alamat tidak tersedia"}
                            </Text>
                        </View>

                        {/* Menampilkan Maps Jika Latitude dan Longitude Tersedia */}
                        {(product.latitude && product.longitude) && (
                            <View style={styles.mapSection}>
                                <View style={styles.mapContainer}>
                                    <MapView
                                        style={styles.mapView}
                                        initialRegion={{
                                            latitude: product.latitude,
                                            longitude: product.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: product.latitude,
                                                longitude: product.longitude,
                                            }}
                                            title={product.restaurantName || "Lokasi Restoran"}
                                            description={product.restaurantAddress}
                                        />
                                    </MapView>
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.openMapButton}
                                    onPress={openInGoogleMaps}
                                >
                                    <Ionicons name="map-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                                    <Text style={styles.openMapText}>Buka di Google Maps</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar untuk Tambah ke Keranjang */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.addToCartBtn} 
                    onPress={() => {
                        addToCart(product);
                        router.push('/(authenticated)/cart');
                    }}
                >
                    <Ionicons name="cart" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.addToCartText}>Tambah ke Keranjang</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#666', marginBottom: 20 },
    backButton: { padding: 10, backgroundColor: '#FF6B35', borderRadius: 8 },
    backButtonText: { color: '#FFF', fontWeight: 'bold' },
    
    imageHeaderContainer: { position: 'relative', width: '100%', height: 300 },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    floatingBackButton: {
        position: 'absolute',
        top: 40, 
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    discountBadge: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#FF4757',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    discountBadgeText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    contentContainer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    productName: { flex: 1, fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginTop: 4 },
    
    priceContainer: {
        alignItems: 'flex-end',
        marginLeft: 15,
    },
    originalPrice: {
        fontSize: 14,
        color: '#A0A0A0',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    productPrice: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#FF6B35' 
    },
    
    metaRow: { flexDirection: 'column', gap: 10, marginBottom: 20 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ratingText: { fontSize: 14, fontWeight: '600', color: '#666' },
    
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tagBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: { fontSize: 12, color: '#FF6B35', fontWeight: '600', textTransform: 'capitalize' },
    
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, marginTop: 10 },
    descriptionText: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20 },
    
    restaurantCard: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        marginTop: 10,
    },
    restaurantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    restaurantTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginLeft: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    restaurantAddress: { flex: 1, fontSize: 13, color: '#666', marginLeft: 8, lineHeight: 18 },
    
    // Map Styles
    mapSection: {
        marginTop: 10,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
    },
    mapView: {
        width: '100%',
        height: '100%',
    },
    openMapButton: {
        backgroundColor: '#2E8B57',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    openMapText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#EFEFEF',
        flexDirection: 'row',
    },
    addToCartBtn: {
        flex: 1,
        backgroundColor: '#FF6B35',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 12,
    },
    addToCartText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});