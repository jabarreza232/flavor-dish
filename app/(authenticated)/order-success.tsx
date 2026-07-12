import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OrderSuccessScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
                </View>
                
                <Text style={styles.title}>Pesanan Berhasil!</Text>
                <Text style={styles.subtitle}>
                    Terima kasih, pembayaran Anda telah kami terima. Dapur sedang menyiapkan hidangan lezat Anda.
                </Text>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={() => router.replace('/(authenticated)/orders')} // Sesuaikan dengan tab orders Anda
                >
                    <Text style={styles.primaryBtnText}>Cek Status Pesanan</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.secondaryBtn} 
                    onPress={() => router.replace('/(authenticated)/home')} // Sesuaikan dengan tab home Anda
                >
                    <Text style={styles.secondaryBtnText}>Kembali ke Beranda</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', justifyContent: 'space-between' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    iconContainer: { marginBottom: 24, backgroundColor: '#E8F5E9', borderRadius: 100, padding: 10 },
    title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
    bottomContainer: { padding: 20, paddingBottom: 40 },
    primaryBtn: { backgroundColor: '#FF6B35', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    secondaryBtn: { backgroundColor: '#FFF3E0', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    secondaryBtnText: { color: '#FF6B35', fontSize: 16, fontWeight: '700' }
});