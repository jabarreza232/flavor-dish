import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenManager } from '../../lib/auth/tokenManager';
import { api } from '../../lib/api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface HomeStats {
  totalOrders: number;
  totalSpent: number;
  favoriteDishes: number;
}

interface RecentOrder {
  orderId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Get user data
      const token = await TokenManager.getAccessToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Mock user data
      const mockUser: User = {
        id: 'user-001',
        name: 'John Doe',
        email: 'user@example.com',
      };

      // Mock stats
      const mockStats: HomeStats = {
        totalOrders: 4,
        totalSpent: 567300,
        favoriteDishes: 8,
      };

      // Mock recent orders
      const mockRecentOrders: RecentOrder[] = [
        {
          orderId: 'ORDER-2026-001',
          status: 'completed',
          totalAmount: 147500,
          createdAt: '2026-05-09T10:30:00Z',
          itemCount: 3,
        },
        {
          orderId: 'ORDER-2026-002',
          status: 'processing',
          totalAmount: 104800,
          createdAt: '2026-05-08T14:20:00Z',
          itemCount: 2,
        },
      ];

      setUser(mockUser);
      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData().then(() => setRefreshing(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Anda yakin ingin keluar?', [
      {
        text: 'Batal',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Keluar',
        onPress: async () => {
          try {
            await TokenManager.removeTokens();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Gagal logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: string }> = {
      pending: { color: '#FFA500', label: 'Menunggu', icon: 'clock' },
      confirmed: { color: '#4CAF50', label: 'Dikonfirmasi', icon: 'check-circle' },
      processing: { color: '#2196F3', label: 'Diproses', icon: 'progress-check' },
      completed: { color: '#8BC34A', label: 'Selesai', icon: 'check-all' },
      cancelled: { color: '#F44336', label: 'Dibatalkan', icon: 'close-circle' },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Selamat datang,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Penawaran Spesial</Text>
            <Text style={styles.promoSubtitle}>Diskon hingga 40% untuk pesanan hari ini</Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push('/(authenticated)/catalog')}
            >
              <Text style={styles.promoButtonText}>Belanja Sekarang</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="food" size={80} color="#FFFFFF" opacity={0.3} />
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="shopping-bag"
            title="Total Pesanan"
            value={stats?.totalOrders.toString() || '0'}
            color="#FF6B35"
          />
          <StatCard
            icon="wallet"
            title="Total Belanja"
            value={`Rp ${stats?.totalSpent.toLocaleString() || '0'}`}
            color="#4CAF50"
          />
          <StatCard
            icon="star"
            title="Favorit"
            value={stats?.favoriteDishes.toString() || '0'}
            color="#FFC107"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Akses Cepat</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="menu-book"
              label="Katalog"
              onPress={() => router.push('/(authenticated)/catalog')}
            />
            <QuickActionCard
              icon="receipt"
              label="Pesanan"
              onPress={() => router.push('/(authenticated)/orders')}
            />
            <QuickActionCard
              icon="heart"
              label="Favorit"
              onPress={() => Alert.alert('Info', 'Fitur favorit segera tersedia')}
            />
            <QuickActionCard
              icon="cog"
              label="Pengaturan"
              onPress={() => Alert.alert('Info', 'Fitur pengaturan segera tersedia')}
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pesanan Terakhir</Text>
            <TouchableOpacity onPress={() => router.push('../(authenticated)/orders')}>
              <Text style={styles.viewAllLink}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <RecentOrderCard
                key={order.orderId}
                order={order}
                statusInfo={getStatusInfo(order.status)}
                onPress={() =>
                  router.push({
                    pathname: '../(authenticated)/order-detail',
                    params: { orderId: order.orderId },
                  })
                }
              />
            ))
          ) : (
            <EmptyOrdersCard onPress={() => router.push('/(authenticated)/catalog')} />
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <InfoCard
            icon="truck"
            title="Pengiriman Cepat"
            description="Pesan hari ini, terima dalam 2 jam"
            color="#FF6B35"
          />
          <InfoCard
            icon="shield-check"
            title="Aman & Terpercaya"
            description="Pembayaran aman dengan enkripsi SSL"
            color="#4CAF50"
          />
          <InfoCard
            icon="headphones"
            title="Customer Service"
            description="Tim support siap membantu 24/7"
            color="#2196F3"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FlavorDash © 2026</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component: Stat Card
interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// Component: Quick Action Card
interface QuickActionCardProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function QuickActionCard({ icon, label, onPress }: QuickActionCardProps) {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={styles.quickActionIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color="#FF6B35" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Component: Recent Order Card
interface RecentOrderCardProps {
  order: RecentOrder;
  statusInfo: { color: string; label: string; icon: string };
  onPress: () => void;
}

function RecentOrderCard({ order, statusInfo, onPress }: RecentOrderCardProps) {
  return (
    <TouchableOpacity style={styles.recentOrderCard} onPress={onPress}>
      <View style={styles.orderCardLeft}>
        <Text style={styles.orderId}>{order.orderId}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
          })}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color },
          ]}
        >
          <MaterialCommunityIcons name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.orderCardRight}>
        <Text style={styles.orderAmount}>Rp {order.totalAmount.toLocaleString()}</Text>
        <Text style={styles.orderItems}>{order.itemCount} item(s)</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#999999" />
      </View>
    </TouchableOpacity>
  );
}

// Component: Empty Orders Card
interface EmptyOrdersCardProps {
  onPress: () => void;
}

function EmptyOrdersCard({ onPress }: EmptyOrdersCardProps) {
  return (
    <TouchableOpacity style={styles.emptyOrderCard} onPress={onPress}>
      <MaterialCommunityIcons name="inbox-multiple" size={48} color="#CCCCCC" />
      <Text style={styles.emptyOrderTitle}>Belum ada pesanan</Text>
      <Text style={styles.emptyOrderSubtitle}>Mulai pesanan makanan favorit Anda sekarang</Text>
      <View style={styles.emptyOrderButton}>
        <Text style={styles.emptyOrderButtonText}>Pesan Sekarang</Text>
      </View>
    </TouchableOpacity>
  );
}

// Component: Info Card
interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
}

function InfoCard({ icon, title, description, color }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  // Promo Banner
  promoBanner: {
    marginHorizontal: '5%',
    marginBottom: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#FFFFDE',
    marginBottom: 12,
    lineHeight: 18,
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: '5%',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: '5%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },

  // Recent Orders
  recentOrdersContainer: {
    paddingHorizontal: '5%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  recentOrderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  orderCardLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderCardRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },

  // Empty Orders
  emptyOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyOrderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyOrderSubtitle: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyOrderButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyOrderButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Info Cards
  infoCardsContainer: {
    paddingHorizontal: '5%',
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 16,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: '#CCCCCC',
  },
});
