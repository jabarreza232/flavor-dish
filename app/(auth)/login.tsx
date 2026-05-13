import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { TokenManager } from '../../lib/auth/tokenManager';

export default function LoginScreen() {
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email dan password harus diisi');
            return;
        }

        setLoading(true);

        try {

            const apiUrl = Platform.OS === 'android'
                ? 'http://10.0.2.2:3000/tokens' // IP khusus Android Emulator ke localhost komputer
                : 'http://localhost:3000/tokens';

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server');
            }

            const data = await response.json();

            const token = data.tokens ? data.tokens : data;

            await TokenManager.saveToken(
                token[0].accessToken,
                token[0].refreshToken
            );

            Alert.alert('Success', 'Login berhasil!');
            router.replace('../(authenticated)/');
        } catch (error) {
            Alert.alert('Error', 'Login gagal, coba lagi');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.appName}>FlavorDash</Text>
                        <Text style={styles.appTagline}>Katalog Makanan Terbaik</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                editable={!loading}
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!loading}
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Masuk</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Belum punya akun? </Text>
                            <TouchableOpacity onPress={() => router.push('../(auth)/register')}>
                                <Text style={styles.registerLink}>Daftar di sini</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: '5%',
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FF6B35',
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 14,
        color: '#666666',
    },
    form: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A1A1A',
        backgroundColor: '#FAFAFA',
    },
    loginButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#666666',
    },
    registerLink: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
});