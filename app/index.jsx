import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Network, AtSign, Lock, LogIn } from 'lucide-react-native';
import { login } from '../services/authService';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { role, token } = await login(email, password);
            if (role !== 'admin') {
                setError('Chỉ admin mới được truy cập ITViecAdmin.');
                setLoading(false);
                return;
            }
            try { await SecureStore.setItemAsync('token', token); } catch (_) { }
            router.replace('/(tabs)/employers');
        } catch (err) {
            setError(err.message || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
                {/* Background blobs */}
                <View style={styles.blobTop} />
                <View style={styles.blobBottom} />

                <View style={styles.canvas}>
                    {/* Brand */}
                    <View style={styles.brandContainer}>
                        <View style={styles.iconContainer}>
                            <Network size={38} color="#ffffff" strokeWidth={2} />
                        </View>
                        <Text style={styles.title}>HỢP TÁC NỀN TẢNG</Text>
                        <Text style={styles.subtitle}>ITViecAdmin — Quản trị</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text style={styles.label}>TÊN ĐĂNG NHẬP HOẶC EMAIL</Text>
                        <View style={styles.inputWrapper}>
                            <AtSign size={18} color="#727782" strokeWidth={2} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="admin@itviec.vn"
                                placeholderTextColor="#72778270"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.labelRow}>
                            <Text style={styles.label}>MẬT KHẨU</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotPswd}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Lock size={18} color="#727782" strokeWidth={2} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#72778270"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LogIn size={18} color="#ffffff" strokeWidth={2.5} />
                            <Text style={styles.submitBtnText}>
                                {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footerText}>Giao diện vận hành by DPA © 2026</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    blobTop: {
        position: 'absolute', top: -60, left: -60,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(34,94,167,0.06)',
    },
    blobBottom: {
        position: 'absolute', bottom: -60, right: -60,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: 'rgba(77,95,125,0.06)',
    },
    canvas: { width: '100%', maxWidth: 400, alignSelf: 'center' },
    brandContainer: { alignItems: 'center', marginBottom: 40 },
    iconContainer: {
        padding: 18, backgroundColor: '#225ea7',
        borderRadius: 24, marginBottom: 18,
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    title: { fontSize: 26, fontWeight: '900', color: '#191c20', letterSpacing: -0.5 },
    subtitle: { color: '#424751', fontWeight: '500', marginTop: 6, fontSize: 13 },
    formContainer: {
        backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
        shadowColor: '#191c20', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
        borderWidth: 1, borderColor: 'rgba(194,198,211,0.2)',
        marginBottom: 24,
    },
    errorText: {
        color: '#ba1a1a', marginBottom: 16, textAlign: 'center',
        fontSize: 12, fontWeight: '600',
        backgroundColor: '#fff0f0', padding: 10, borderRadius: 8,
    },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: {
        fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textTransform: 'uppercase', letterSpacing: 1.5, color: '#4d5f7d',
        marginBottom: 8, marginTop: 16,
    },
    forgotPswd: {
        fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textTransform: 'uppercase', letterSpacing: 1.2, color: '#225ea7', marginTop: 16,
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f3f3fa', borderRadius: 10,
    },
    inputIcon: { paddingLeft: 14, paddingRight: 6 },
    input: { flex: 1, paddingVertical: 14, paddingRight: 16, color: '#191c20', fontSize: 14 },
    submitBtn: {
        backgroundColor: '#225ea7', borderRadius: 12, paddingVertical: 15,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginTop: 24,
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
    footerText: {
        textAlign: 'center', fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#9ca3af', letterSpacing: 1,
    },
});
