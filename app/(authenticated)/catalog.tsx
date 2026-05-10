import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
}

export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Menggunakan useEffect biasa lebih aman untuk inisialisasi data awal
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Data valid dengan gambar makanan asli
      const mockData: Product[] = [
        {
          id: '1',
          name: 'Rendang Daging Sapi Premium',
          description: 'Rendang tradisional khas Padang dengan bumbu rempah kaya rasa, dimasak perlahan hingga empuk.',
          price: 45000,
          image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop',
          rating: 4.8,
        },
        {
          id: '2',
          name: 'Soto Ayam Kuah Kuning',
          description: 'Soto ayam segar dengan perasan jeruk nipis, soun, koya, dan suwiran ayam kampung pilihan.',
          price: 35000,
          image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=400&auto=format&fit=crop',
          rating: 4.5,
        },
        {
          id: '3',
          name: 'Salad Sayur Organik',
          description: 'Sayuran segar hidroponik dengan siraman saus wijen sangrai yang sehat dan lezat.',
          price: 28000,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
          rating: 4.7,
        },
        {
          id: '4',
          name: 'Nasi Goreng Spesial',
          description: 'Nasi goreng dengan bumbu rahasia, dilengkapi telur mata sapi dan sate ayam.',
          price: 32000,
          image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400&auto=format&fit=crop',
          rating: 4.9,
        }
      ];

      // Simulasi delay jaringan agar animasi loading terlihat natural (opsional)
      setTimeout(() => {
        setProducts(mockData);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>FlavorDash Katalog</Text>
        <Text style={styles.headerSubtitle}>Pilihan makanan terbaik untuk Anda</Text>
      </View>

      <View style={styles.catalogContainer}>
        {products.map((product) => (
          <CatalogCard key={product.id} product={product} />
        ))}
      </View>
    </ScrollView>
  );
}

interface CatalogCardProps {
  product: Product;
}

function CatalogCard({ product }: CatalogCardProps) {
  return (
    <View style={styles.card}>
      {/* Image Container yang sudah diperbaiki dimensinya */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Content Container */}
      <View style={styles.contentWrapper}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.bottomRow}>
          {/* Format ke Rupiah standar Indonesia */}
          <Text style={styles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {product.rating}</Text>
          </View>
        </View>
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
  headerContainer: {
    paddingHorizontal: '5%',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  catalogContainer: {
    paddingHorizontal: '5%',
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  // Perbaikan utama ada di area ini ke bawah
  imageWrapper: {
    width: 100, // Ukuran pasti (fixed size) lebih aman dari flex
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: 120, // Tinggi pasti agar gambar tidak collapse
  },
  contentWrapper: {
    flex: 1, // Memenuhi sisa ruang yang ada
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // Mendorong harga dan rating ke paling bawah
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  ratingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
});