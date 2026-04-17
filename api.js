import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Cấu hình URL theo nền tảng:
// - Android Emulator: 10.0.2.2 (alias tới localhost của máy host)
// - Web (Expo w): localhost
// - Thiết bị thật (Android/iOS): IP LAN của máy tính (192.168.0.109)
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5028/api';           // Emulator
        // return 'http://192.168.0.109:5028/api';   // Android thiết bị thật
    }
    if (Platform.OS === 'ios') {
        return 'http://192.168.0.109:5028/api';       // iPhone thiết bị thật 
    }
    return 'http://localhost:5028/api';               // Web
};
const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {
        // SecureStore không khả dụng (web) — bỏ qua
    }
    return config;
});

export default api;
