import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Product } from '../product';

export default function WishlistScreen() {
    // Harusnya ambil dari Global State / Context / API

    const { wishlist } = useApp();
    const allProducts: Product[] = [
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
    const favoriteProducts = allProducts.filter(p => wishlist.includes(p.id));
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu Favorit</Text>
            </View>

            <FlatList
                data={favoriteProducts}
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