import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
    const router = useRouter();
    // Menangkap parameter total dan items dari keranjang
    const { total, items } = useLocalSearchParams();
    const [selectedPayment, setSelectedPayment] = useState<string>('Gopay');

    // Parse data items dari JSON string menjadi array object
    let parsedItems: any[] = [];
    try {
        parsedItems = items ? JSON.parse(items as string) : [];
    } catch (error) {
        console.error("Gagal mem-parsing data items", error);
    }

    const paymentMethods = [
        { id: 'Gopay', icon: 'wallet-outline', label: 'GoPay' },
        { id: 'OVO', icon: 'cash-outline', label: 'OVO' },
        { id: 'Transfer BCA', icon: 'card-outline', label: 'Transfer Bank BCA' },
        { id: 'COD', icon: 'home-outline', label: 'Cash on Delivery (COD)' },
    ];

    const handlePay = () => {
        // Simulasi proses bayar
        router.replace('/(authenticated)/order-success');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Metode Pembayaran</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Total Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Tagihan</Text>
                    <Text style={styles.summaryAmount}>Rp {Number(total || 0).toLocaleString('id-ID')}</Text>
                </View>

                {/* RINCIAN PESANAN SECTION */}
                <Text style={styles.sectionTitle}>Rincian Pesanan</Text>
                <View style={styles.orderDetailCard}>
                    {parsedItems.map((item, index) => {
                        const hasDiscount = item.discount > 0;
                        const subtotal = item.price * item.quantity;
                        // Kalkulasi harga original jika user membeli lebih dari 1 qty
                        const originalSubtotal = (item.originalPrice || item.price) * item.quantity;

                        return (
                            <View key={item.id || index}>
                                <View style={styles.itemRow}>
                                    <View style={styles.itemLeft}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={styles.itemMeta}>
                                            <Text style={styles.itemQty}>{item.quantity}x</Text>
                                            {hasDiscount && (
                                                <View style={styles.discountBadge}>
                                                    <Text style={styles.discountText}>Diskon {item.discount}%</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    
                                    <View style={styles.itemRight}>
                                        {hasDiscount && (
                                            <Text style={styles.originalPrice}>
                                                Rp {originalSubtotal.toLocaleString('id-ID')}
                                            </Text>
                                        )}
                                        <Text style={styles.itemPrice}>
                                            Rp {subtotal.toLocaleString('id-ID')}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Garis pembatas antar item, kecuali item terakhir */}
                                {index < parsedItems.length - 1 && <View style={styles.divider} />}
                            </View>
                        );
                    })}
                </View>

                {/* METODE PEMBAYARAN SECTION */}
                <Text style={styles.sectionTitle}>Pilih Pembayaran</Text>
                {paymentMethods.map((method) => (
                    <TouchableOpacity 
                        key={method.id} 
                        style={[
                            styles.paymentOption, 
                            selectedPayment === method.id && styles.paymentOptionActive
                        ]}
                        onPress={() => setSelectedPayment(method.id)}
                    >
                        <View style={styles.paymentLeftContainer}>
                            <Ionicons name={method.icon as any} size={24} color={selectedPayment === method.id ? '#FF6B35' : '#666'} />
                            <Text style={[styles.paymentLabel, selectedPayment === method.id && styles.paymentLabelActive]}>
                                {method.label}
                            </Text>
                        </View>
                        <Ionicons 
                            name={selectedPayment === method.id ? "radio-button-on" : "radio-button-off"} 
                            size={24} 
                            color={selectedPayment === method.id ? '#FF6B35' : '#CCC'} 
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                    <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    
    content: { padding: 20, paddingBottom: 40 },
    
    summaryCard: { backgroundColor: '#FF6B35', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 24, elevation: 3, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    summaryTitle: { color: '#FFF', fontSize: 14, marginBottom: 4, opacity: 0.9 },
    summaryAmount: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
    
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    
    // Rincian Pesanan Styles
    orderDetailCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemLeft: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemQty: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    discountBadge: {
        backgroundColor: '#FFF1F2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#FF4757',
        fontSize: 10,
        fontWeight: '700',
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
        borderStyle: 'dashed',
    },

    // Metode Pembayaran Styles
    paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#EFEFEF' },
    paymentOptionActive: { borderColor: '#FF6B35', backgroundColor: '#FFF3E0' },
    paymentLeftContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    paymentLabel: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
    paymentLabelActive: { color: '#FF6B35', fontWeight: '700' },
    
    // Bottom Bar Styles
    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    payButton: { backgroundColor: '#FF6B35', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    payButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});