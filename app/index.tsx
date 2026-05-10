// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // File ini berfungsi sebagai "pintu masuk"
  // Kamu bisa arahkan ke folder (auth) secara otomatis
  return <Redirect href="/(auth)/login" />;
}