import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    SafeAreaView,
    FlatList,
    Dimensions,
    Platform,

    TextInput, // Perbaikan: Import TextInput ditambahkan
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenManager } from '../../lib/auth/tokenManager';
import { api } from '../../lib/api/client';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: string;
    orderId: string;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');
    const [selectedSort, setSelectedSort] = useState<SortOption>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    useEffect(() => {
        applyFiltersAndSort();
    }, [orders, selectedFilter, selectedSort, searchQuery]);

    const loadOrders = async () => {
        try {
            setLoading(true);

            // Check token
            const token = await TokenManager.getAccessToken();
            if (!token) {
                router.replace('/(auth)/login');
                return;
            }


            // FETCH DATA DARI API
            // Catatan: Ubah 'localhost' menjadi '10.0.2.2' jika kamu memakai Android Emulator!
            const apiUrl = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/orders' // IP khusus Android Emulator ke localhost komputer
                : 'http://localhost:3000/orders';

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server');
            }

            const data = await response.json();

            // Mengecek apakah JSON berbentuk { "products": [...] } atau langsung [...]
            const mockOrders = data.orders ? data.orders : data;
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Gagal memuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrders().then(() => setRefreshing(false));
    }, []);

    const applyFiltersAndSort = () => {
        let filtered = [...orders];

        if (selectedFilter !== 'all') {
            filtered = filtered.filter((order) => order.status === selectedFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (order) =>
                    order.orderId.toLowerCase().includes(query) ||
                    order.items.some((item) => item.name.toLowerCase().includes(query))
            );
        }

        switch (selectedSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'highest':
                filtered.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.totalAmount - b.totalAmount);
                break;
        }

        setFilteredOrders(filtered);
    };

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
            pending: 'Menunggu',
            confirmed: 'Dikonfirmasi',
            processing: 'Diproses',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            pending: 'clock-outline',
            confirmed: 'check-circle',
            processing: 'progress-check',
            completed: 'check-all',
            cancelled: 'close-circle',
        };
        return icons[status] || 'help-circle';
    };

    const getSortLabel = (sort: SortOption) => {
        const labels: Record<SortOption, string> = {
            newest: 'Terbaru',
            oldest: 'Terlama',
            highest: 'Harga Tertinggi',
            lowest: 'Harga Terendah',
        };
        return labels[sort];
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Memuat pesanan...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Pesanan Saya</Text>
                    <Text style={styles.headerSubtitle}>Total {orders.length} pesanan</Text>
                </View>
            </View>

            {/* Search & Filter Bar */}
            <View style={styles.toolbarContainer}>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
                    <TextInputComponent
                        placeholder="Cari nomor pesanan..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Sort Button */}
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortMenu(!showSortMenu)}
                >
                    <MaterialCommunityIcons name="sort" size={20} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            {/* Sort Menu */}
            {showSortMenu && (
                <View style={styles.sortMenu}>
                    {(['newest', 'oldest', 'highest', 'lowest'] as SortOption[]).map((sort) => (
                        <TouchableOpacity
                            key={sort}
                            style={[styles.sortMenuItem, selectedSort === sort && styles.sortMenuItemActive]}
                            onPress={() => {
                                setSelectedSort(sort);
                                setShowSortMenu(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.sortMenuItemText,
                                    selectedSort === sort && styles.sortMenuItemTextActive,
                                ]}
                            >
                                {getSortLabel(sort)}
                            </Text>
                            {selectedSort === sort && (
                                <MaterialCommunityIcons name="check" size={18} color="#FF6B35" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterTabsContainer}
                contentContainerStyle={styles.filterTabsContent}
            >
                {(['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'] as FilterStatus[]).map(
                    (filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterTab,
                                selectedFilter === filter && styles.filterTabActive,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                numberOfLines={1} // Mencegah teks terlipat jadi 2 baris
                                style={[
                                    styles.filterTabText,
                                    selectedFilter === filter && styles.filterTabTextActive,
                                ]}
                            >
                                {filter === 'all' ? 'Semua' : getStatusLabel(filter)}
                            </Text>
                            {selectedFilter === filter && <View style={styles.filterTabIndicator} />}
                        </TouchableOpacity>
                    )
                )}
            </ScrollView>

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        statusColor={getStatusColor(item.status)}
                        statusLabel={getStatusLabel(item.status)}
                        statusIcon={getStatusIcon(item.status)}
                        onPress={() =>
                            router.push({
                                pathname: '/(authenticated)/order-detail',
                                params: { orderId: item.orderId },
                            })
                        }
                    />
                )}
                contentContainerStyle={styles.ordersList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState searchQuery={searchQuery} selectedFilter={selectedFilter} />
                }
                scrollEnabled={true}
            />
        </SafeAreaView>
    );
}

// Component: Text Input
interface TextInputComponentProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
}

function TextInputComponent({ placeholder, value, onChangeText }: TextInputComponentProps) {
    return (
        <View style={styles.textInputWrapper}>
            {/* Perbaikan: Mengganti <Text> menjadi <TextInput> agar bisa diketik */}
            <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#999999"
                autoCapitalize="none"
            />
        </View>
    );
}

// Component: Order Card
interface OrderCardProps {
    order: Order;
    statusColor: string;
    statusLabel: string;
    statusIcon: string;
    onPress: () => void;
}

function OrderCard({ order, statusColor, statusLabel, statusIcon, onPress }: OrderCardProps) {
    const firstItem = order.items[0];
    const moreItems = order.items.length > 1 ? order.items.length - 1 : 0;

    return (
        <TouchableOpacity style={styles.orderCard} onPress={onPress}>
            <View style={styles.orderCardTop}>
                <View style={styles.orderCardTopLeft}>
                    <Text style={styles.orderNumber}>{order.orderId}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '20', borderColor: statusColor },
                    ]}
                >
                    <MaterialCommunityIcons name={statusIcon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
            </View>

            <View style={styles.orderCardMiddle}>
                <View style={styles.itemPreview}>
                    <MaterialCommunityIcons name="clipboard-list" size={16} color="#FF6B35" />
                    <Text style={styles.itemCount}>{order.items.length} item</Text>
                </View>
                <Text style={styles.itemNames} numberOfLines={1}>
                    {firstItem.name}
                    {moreItems > 0 ? ` + ${moreItems} item` : ''}
                </Text>
            </View>

            <View style={styles.orderCardBottom}>
                <View>
                    <Text style={styles.totalLabel}>Total Pesanan</Text>
                    <Text style={styles.totalAmount}>Rp {order.totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.paymentBadge}>
                    <MaterialCommunityIcons
                        name={order.paymentStatus === 'paid' ? 'check-circle' : 'clock-outline'}
                        size={16}
                        color={order.paymentStatus === 'paid' ? '#4CAF50' : '#FFA500'}
                    />
                    <Text
                        style={[
                            styles.paymentText,
                            {
                                color: order.paymentStatus === 'paid' ? '#4CAF50' : '#FFA500',
                            },
                        ]}
                    >
                        {order.paymentStatus === 'paid' ? 'Dibayar' : 'Tertunda'}
                    </Text>
                </View>
            </View>

            <View style={styles.chevronContainer}>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCCCCC" />
            </View>
        </TouchableOpacity>
    );
}

// Component: Empty State
interface EmptyStateProps {
    searchQuery: string;
    selectedFilter: FilterStatus;
}

function EmptyState({ searchQuery, selectedFilter }: EmptyStateProps) {
    return (
        <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="inbox-multiple" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
                {searchQuery
                    ? `Tidak ada pesanan yang cocok dengan "${searchQuery}"`
                    : selectedFilter === 'all'
                        ? 'Mulai belanja sekarang untuk membuat pesanan pertama Anda'
                        : `Tidak ada pesanan dengan status "${selectedFilter}"`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666666',
    },

    // Header
    header: {
        paddingHorizontal: '5%',
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#999999',
        marginTop: 4,
    },

    // Search & Filter Toolbar
    toolbarContainer: {
        paddingHorizontal: '5%',
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 8,
    },
    textInputWrapper: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
    },
    // Perbaikan: Penambahan style baru khusus untuk komponen TextInput
    textInput: {
        flex: 1,
        fontSize: 13,
        color: '#1A1A1A',
        paddingVertical: 0, // Penting di Android agar teks tidak terpotong
    },
    sortButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Sort Menu
    sortMenu: {
        marginHorizontal: '5%',
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sortMenuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sortMenuItemActive: {
        backgroundColor: '#FFF3E0',
    },
    sortMenuItemText: {
        fontSize: 13,
        color: '#666666',
    },
    sortMenuItemTextActive: {
        color: '#FF6B35',
        fontWeight: '600',
    },

    // Filter Tabs
    filterTabsContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        flexGrow: 0, // Pastikan container tab tidak tertekan atau melar
    },
    filterTabsContent: {
        paddingHorizontal: '5%',
        alignItems: 'center', // Selaraskan item tepat di tengah vertikal
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
        justifyContent: 'center', // Pastikan teks berada di tengah tombol
        alignItems: 'center',
        minHeight: 36, // Berikan tinggi minimum agar teks punya ruang
    },
    filterTabActive: {
        backgroundColor: '#FFF3E0',
    },
    filterTabText: {
        fontSize: 13, // Sedikit diperbesar agar proporsional
        fontWeight: '500',
        color: '#666666',
    },
    filterTabTextActive: {
        color: '#FF6B35',
        fontWeight: '700',
    },
    filterTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '15%', // Menyesuaikan panjang garis bawah agar tidak mentok
        right: '15%',
        height: 3, // Ditebalkan sedikit
        backgroundColor: '#FF6B35',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },

    // Orders List
    ordersList: {
        paddingHorizontal: '5%',
        paddingVertical: 12,
    },

    // Order Card
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    orderCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderCardTopLeft: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 3,
    },
    orderDate: {
        fontSize: 12,
        color: '#999999',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderCardMiddle: {
        marginBottom: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    itemCount: {
        fontSize: 12,
        color: '#999999',
    },
    itemNames: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    orderCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 11,
        color: '#999999',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6B35',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        gap: 4,
    },
    paymentText: {
        fontSize: 11,
        fontWeight: '600',
    },
    chevronContainer: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -12 }],
    },

    // Empty State
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 13,
        color: '#999999',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
});