import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../../lib/api/client';
import { TokenManager } from '../../lib/auth/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderDetail {
    orderId: string;
    userId: string;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
    deliveryAddress: string;
    notes: string;
    paymentMethod: string; // Tambahan properti paymentMethod
}

export default function OrderDetailScreen() {
    const route = useRoute();
    const router = useRouter(); // Perbaikan: Deklarasi router
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const orderId = (route.params as any)?.orderId || 'mock-order-001';

    useEffect(() => {
        fetchOrderDetail();
    }, []);

    const fetchOrderDetail = async () => {
        try {
            const token = await TokenManager.getAccessToken();

            if (!token) {
                Alert.alert('Error', 'Anda harus login terlebih dahulu');
                setLoading(false);
                return;
            }

            // Mock API Response
            const mockOrderData: OrderDetail = {
                orderId: 'ORDER-2026-001',
                userId: 'user-123',
                status: 'completed', // Diubah menjadi completed agar lebih logis untuk dicetak struknya
                items: [
                    {
                        productId: '1',
                        name: 'Rendang Ayam Premium',
                        quantity: 2,
                        price: 45000,
                        subtotal: 90000,
                    },
                    {
                        productId: '2',
                        name: 'Soto Ayam Kuning',
                        quantity: 1,
                        price: 35000,
                        subtotal: 35000,
                    },
                ],
                totalAmount: 125000,
                createdAt: '2026-05-09T10:30:00Z',
                deliveryAddress: 'Jl. Merdeka No. 123, Jakarta Selatan',
                notes: 'Tolong dipanaskan ulang sebelum diantar',
                paymentMethod: 'Transfer Bank BCA', // Tambahan data mock payment
            };

            setOrder(mockOrderData);
        } catch (error) {
            console.error('Error fetching order detail:', error);
            Alert.alert('Error', 'Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReceipt = () => {
        // Logika untuk menyimpan struk (misal ke PDF atau Gallery)
        Alert.alert('Sukses', 'Struk berhasil disimpan ke perangkat');
    };

    const handlePrintReceipt = () => {
        // Logika untuk print struk (misal via Bluetooth Printer)
        Alert.alert('Mencetak', 'Sedang mengirim data ke printer...');
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Pesanan tidak ditemukan</Text>
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: '#FFA500',
            confirmed: '#4CAF50',
            processing: '#2196F3',
            completed: '#8BC34A',
            cancelled: '#F44336',
        };
        return colors[status] || '#999999';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Menunggu Konfirmasi',
            confirmed: 'Dikonfirmasi',
            processing: 'Sedang Diproses',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return labels[status] || status;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Order Header - Dikeluarkan dari ScrollView agar tetap di atas (sticky) */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.replace('/(authenticated)/orders')} // Sesuaikan dengan path file OrdersScreen Anda
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Pesanan</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerCard}>
                    <View style={styles.orderIdRow}>
                        <Text style={styles.orderIdLabel}>No. Pesanan</Text>
                        <Text style={styles.orderId}>{order.orderId}</Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                    </View>

                    <Text style={styles.createdDate}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rincian Pesanan</Text>

                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                            </View>

                            <View style={styles.itemPrice}>
                                <Text style={styles.itemPriceText}>
                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalPrice}>
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                        </Text>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
                    <View style={styles.paymentBox}>
                        <Ionicons name="wallet-outline" size={20} color="#FF6B35" />
                        <Text style={styles.paymentText}>{order.paymentMethod}</Text>
                    </View>
                </View>

                {/* Delivery Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
                        <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
                    </View>

                    {order.notes && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Catatan Khusus</Text>
                            <Text style={styles.infoValue}>{order.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSaveReceipt}
                    >
                        <Ionicons name="download-outline" size={20} color="#FF6B35" />
                        <Text style={styles.saveButtonText}>Simpan Struk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.printButton]}
                        onPress={handlePrintReceipt}
                    >
                        <Ionicons name="print-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.printButtonText}>Print Struk</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        paddingHorizontal: '5%',
        paddingVertical: 20,
        paddingBottom: 40, // Memberikan ruang di bawah tombol
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    orderIdRow: {
        marginBottom: 12,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
    createdDate: {
        fontSize: 12,
        color: '#666666',
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemInfo: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 12,
        color: '#666666',
    },
    itemPrice: {
        alignItems: 'flex-end',
    },
    itemPriceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF6B35',
    },
    paymentBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    infoBox: {
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 13,
        color: '#1A1A1A',
        lineHeight: 18,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    saveButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    saveButtonText: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '600',
    },
    printButton: {
        backgroundColor: '#FF6B35',
        elevation: 2,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    printButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        fontWeight: '600',
    },
});