import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { JWTMiddleware } from '../lib/auth/jwtMiddleware';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const verification = await JWTMiddleware.verifyToken();
        setIsAuthenticated(verification.valid);
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };
    checkAuth();
  }, []);

  // Tampilkan loading screen saat mengecek token
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Definisikan semua grup rute di sini. 
        Expo Router akan otomatis mencari folder (auth) dan (authenticated)
      */}
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(authenticated)" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}