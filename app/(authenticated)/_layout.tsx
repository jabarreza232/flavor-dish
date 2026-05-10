import { Drawer } from 'expo-router/drawer';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function AuthenticatedLayout() {
  return (
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
          drawerLabel: 'Katalog Makanan',
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
        name="order-detail"
        options={{
          title: 'Detail Pesanan',
          drawerItemStyle: { display: 'none' }, // Menyembunyikan dari menu
          drawerLabel: () => null,
        }}
      />

    </Drawer>
  );
}