import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { Product } from '../product';
import { useRouter, useFocusEffect } from 'expo-router';

export default function WishlistScreen() {
    // Harusnya ambil dari Global State / Context / API
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { wishlist } = useApp();

    const fetchCartProducts = useCallback(async () => {
        try {
            setLoading(true);

            // Penyesuaian IP untuk Android Emulator (10.0.2.2) atau iOS/Web (localhost)
            const apiUrl = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/products'
                : 'http://localhost:3000/products';

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Gagal memuat produk');
            }

            const data = await response.json();
            const productsList = data.products ? data.products : data;
            const favoriteProducts = productsList.filter(p => wishlist.includes(p.id));
            setProducts(favoriteProducts);
        } catch (error) {
            console.error('Fetch error di keranjang:', error);
            Alert.alert('Error', 'Gagal menyinkronkan data keranjang');
        } finally {
            setLoading(false);
        }
    }, []);

    // Gunakan useFocusEffect agar data selalu ter-refresh setiap kali user membuka tab Keranjang
    useFocusEffect(
        useCallback(() => {
            fetchCartProducts();
        }, [fetchCartProducts])
    );
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu Favorit</Text>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.wishlistCard}>
                        <Image source={{ uri: item.image }} style={styles.img} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>Rp {item.price.toLocaleString()}</Text>
                        </View>
                        <Ionicons name="heart" size={24} color="#FF4757" />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { padding: 20, backgroundColor: '#FFF' },
    title: { fontSize: 20, fontWeight: 'bold' },
    wishlistCard: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12
    },
    img: { width: 60, height: 60, borderRadius: 8 },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: '600' },
    price: { color: '#FF6B35', fontWeight: '700' }
});