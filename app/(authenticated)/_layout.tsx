import { Drawer } from 'expo-router/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppProvider } from '../context/AppContext';
import { Stack } from 'expo-router';
export default function AuthenticatedLayout() {
  return (
    <AppProvider>

      <Drawer
        screenOptions={{
          headerShown: true,
          headerTintColor: '#FF6B35',
          drawerActiveTintColor: '#FF6B35',

        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Beranda',

          }}
        />
        <Drawer.Screen
          name="catalog"
          options={{
            title: 'Katalog',
            drawerItemStyle: { display: 'none' }, // Menyembunyikan dari menu
            drawerLabel: () => null,
          }}
        />
        <Drawer.Screen
          name="orders"
          options={{
            title: 'Pesanan Saya',
            drawerLabel: 'Pesanan Saya',
          }}
        />
        <Drawer.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            drawerLabel: 'Wishlist',
          }}
        />
        <Drawer.Screen
          name="cart"
          options={{
            title: 'Keranjang Belanja',
            drawerItemStyle: { display: 'none' }, // Menyembunyikan dari menu
            drawerLabel: () => null,
            headerShown: false, // Kita sudah pakai custom header di cart.tsx
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen
          name="order-detail"
          options={{
            title: 'Detail Pesanan',
            drawerItemStyle: { display: 'none' }, // Menyembunyikan dari menu
            drawerLabel: () => null,
            headerShown: false, // Kita sudah pakai custom header di cart.tsx
            swipeEnabled: false,
          }}
        />

      </Drawer>
    </AppProvider>

  );
}