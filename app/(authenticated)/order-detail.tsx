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
    Platform,
    Image // Tambahkan import Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TokenManager } from '../../lib/auth/tokenManager';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderDetail {
    id: string;
    orderId: string;
    userId: string;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
    deliveryAddress: string;
    notes: string;
    paymentMethod: string; 
}

export default function OrderDetailScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>(); 
    
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    
    // State untuk menyimpan URI foto bukti
    const [proofUri, setProofUri] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail();
        } else {
            setLoading(false);
            Alert.alert('Error', 'ID Pesanan tidak valid');
        }
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const token = await TokenManager.getAccessToken();

            if (!token) {
                Alert.alert('Error', 'Anda harus login terlebih dahulu');
                router.replace('/(auth)/login');
                return;
            }

            const apiUrl = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/orders'
                : 'http://localhost:3000/orders';

            const response = await fetch(apiUrl);
            
            if (!response.ok) throw new Error('Gagal mengambil data dari server');

            const data = await response.json();
            const ordersList: OrderDetail[] = data.orders ? data.orders : data;
            const foundOrder = ordersList.find((o) => o.orderId === orderId);

            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                Alert.alert('Error', 'Pesanan tidak ditemukan di database');
            }

        } catch (error) {
            console.error('Error fetching order detail:', error);
            Alert.alert('Error', 'Gagal memuat detail pesanan. Pastikan server lokal menyala.');
        } finally {
            setLoading(false);
        }
    };

 const handlePickImageFromLibrary = async () => {
    // Minta izin akses galeri/media library
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (libraryPermission.granted === false) {
        Alert.alert('Akses Ditolak', 'Anda harus mengizinkan akses galeri untuk memilih foto.');
        return;
    }

    // Buka galeri foto
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
    });

    if (!result.canceled) {
        setProofUri(result.assets[0].uri);
    }
};

// 2. Perbarui fungsi handleUploadProof dengan blok try-catch
const handleUploadProof = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
        Alert.alert('Akses Ditolak', 'Anda harus mengizinkan akses kamera untuk mengunggah bukti.');
        return;
    }

    try {
        // Mencoba membuka kamera fisik
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProofUri(result.assets[0].uri);
            Alert.alert('Berhasil', 'Foto bukti berhasil ditambahkan!');
        }
    } catch (error) {
        console.log('Kamera tidak tersedia, beralih ke galeri:', error);
        
        // Menampilkan dialog pilihan jika kamera gagal dibuka (terjadi di simulator)
        Alert.alert(
            'Kamera Tidak Tersedia',
            'Perangkat ini tidak memiliki kamera aktif (Simulator). Apakah Anda ingin mengambil foto dari galeri perangkat?',
            [
                { text: 'Batal', style: 'cancel' },
                { 
                    text: 'Buka Galeri', 
                    onPress: handlePickImageFromLibrary // Jalankan fungsi galeri
                }
            ]
        );
    }
};
    const handleSaveReceipt = () => {
        Alert.alert('Sukses', 'Struk berhasil disimpan ke perangkat');
    };

    const handlePrintReceipt = () => {
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
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#FF6B35', fontWeight: '600' }}>Kembali</Text>
                </TouchableOpacity>
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                    </View>

                    <Text style={styles.createdDate}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                    </Text>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rincian Pesanan</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.productName || (item as any).name}</Text>
                                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                            </View>
                            <View style={styles.itemPrice}>
                                <Text style={styles.itemPriceText}>
                                    Rp {item.subtotal?.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalPrice}>Rp {order.totalAmount?.toLocaleString('id-ID')}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
                    <View style={styles.paymentBox}>
                        <Ionicons name="wallet-outline" size={20} color="#FF6B35" />
                        <Text style={styles.paymentText}>{order.paymentMethod || 'Metode tidak diketahui'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Alamat Pengiriman</Text>
                        <Text style={styles.infoValue}>{order.deliveryAddress || 'Alamat tidak tersedia'}</Text>
                    </View>
                    {order.notes && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Catatan Khusus</Text>
                            <Text style={styles.infoValue}>{order.notes}</Text>
                        </View>
                    )}
                </View>

                {/* SEKSI BUKTI PENERIMAAN (Hanya muncul jika status processing atau completed) */}
                {(order.status === 'processing' || order.status === 'completed') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bukti Penerimaan</Text>
                        
                        {proofUri ? (
                            // Jika Foto Sudah Diambil
                            <View style={styles.proofContainer}>
                                <Image source={{ uri: proofUri }} style={styles.proofImage} />
                                {/* Tombol ubah hanya bisa jika statusnya belum selesai murni, ubah sesuai kebutuhan */}
                                <TouchableOpacity style={styles.reuploadBtn} onPress={handleUploadProof}>
                                    <Ionicons name="camera-reverse-outline" size={16} color="#FF6B35" />
                                    <Text style={styles.reuploadText}>Ubah Foto Bukti</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Jika Foto Belum Diambil
                            <TouchableOpacity style={styles.uploadBox} onPress={handleUploadProof}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="camera" size={24} color="#FF6B35" />
                                </View>
                                <View style={styles.uploadTextContainer}>
                                    <Text style={styles.uploadTitle}>Ambil Foto Bukti Terima</Text>
                                    <Text style={styles.uploadSub}>Pesanan sudah sampai? Fotokan buktinya</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CCC" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSaveReceipt}>
                        <Ionicons name="download-outline" size={20} color="#FF6B35" />
                        <Text style={styles.saveButtonText}>Simpan Struk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={handlePrintReceipt}>
                        <Ionicons name="print-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.printButtonText}>Print Struk</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    scrollContent: { paddingHorizontal: '5%', paddingVertical: 20, paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
    headerCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    orderIdRow: { marginBottom: 12 },
    orderIdLabel: { fontSize: 12, color: '#999999', marginBottom: 4 },
    orderId: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
    statusText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
    createdDate: { fontSize: 12, color: '#666666' },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    itemInfo: { flex: 1, paddingRight: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
    itemQuantity: { fontSize: 12, color: '#666666' },
    itemPrice: { alignItems: 'flex-end' },
    itemPriceText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
    totalLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    totalPrice: { fontSize: 18, fontWeight: '700', color: '#FF6B35' },
    paymentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8, gap: 8 },
    paymentText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    infoBox: { backgroundColor: '#FAFAFA', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    infoLabel: { fontSize: 12, color: '#999999', marginBottom: 4 },
    infoValue: { fontSize: 13, color: '#1A1A1A', lineHeight: 18 },
    
    // Upload Proof Styles
    uploadBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 10, padding: 16 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    uploadTextContainer: { flex: 1 },
    uploadTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
    uploadSub: { fontSize: 12, color: '#999' },
    proofContainer: { alignItems: 'center' },
    proofImage: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#F0F0F0' },
    reuploadBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFF3E0', borderRadius: 20, gap: 6 },
    reuploadText: { fontSize: 13, fontWeight: '600', color: '#FF6B35' },

    actionContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
    actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 10, gap: 8 },
    saveButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF6B35' },
    saveButtonText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
    printButton: { backgroundColor: '#FF6B35', elevation: 2, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    printButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    errorText: { fontSize: 16, color: '#F44336', fontWeight: '600' },
});