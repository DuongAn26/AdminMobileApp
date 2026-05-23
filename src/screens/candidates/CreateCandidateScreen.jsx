import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, User, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { createCandidate } from '../../services/candidateService';
const Field = ({ label, Icon: FieldIcon, ...props }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <FieldIcon size={18} color="#727782" strokeWidth={2} style={{ marginLeft: 14, marginRight: 8 }} />
                <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#9ca3af" 
                    multiline={true}
                    {...props} 
                />
            </View>
        </View>
    );
export default function CreateCandidateScreen() {
    const router = useRouter();
    
    // Chỉ giữ lại các state thiết yếu để tạo tài khoản
    const [fullname, setFullname] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSave = async () => {
        if (!fullname.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đủ họ tên, email và mật khẩu.');
            return;
        }
        setLoading(true);
        try {
            await createCandidate({
                Fullname: fullname.trim(),
                Email: email.trim(),
                Password: password,
            });
            Alert.alert('Thành công', 'Đã khởi tạo tài khoản ứng viên mới!');
            router.back();
        } catch (e) {
            Alert.alert('Lỗi', e.message || 'Có lỗi xảy ra trong quá trình tạo tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <ArrowLeft size={20} color="#424751" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TalentCore</Text>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.title}>Thêm mới{'\n'}<Text style={{ color: '#225ea7' }}>Ứng viên</Text></Text>
                <Text style={styles.subtitle}>Khởi tạo tài khoản cơ bản. Ứng viên sẽ tự cập nhật CV và kinh nghiệm sau khi đăng nhập.</Text>

                <View style={styles.form}>
                    <Field
                        label="HỌ VÀ TÊN"
                        Icon={User}
                        placeholder="Nguyễn Văn A"
                        value={fullname}
                        onChangeText={setFullname}
                    />
                    <Field
                        label="EMAIL"
                        Icon={Mail}
                        placeholder="user@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Field
                        label="MẬT KHẨU"
                        Icon={Lock}
                        placeholder="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                    <UserPlus size={22} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.submitBtnText}>{loading ? 'ĐANG TẠO...' : 'TẠO TÀI KHOẢN'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#e1e2e9',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#4177c2', marginLeft: 16 },
    body: { paddingHorizontal: 24, paddingTop: 16 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#191c20', lineHeight: 40 },
    subtitle: { fontSize: 14, color: '#424751', marginTop: 8, marginBottom: 24 },
    form: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, gap: 4 },
    inputGroup: { marginBottom: 16 },
    label: {
        fontSize: 11, fontWeight: 'bold', color: '#4d5f7d',
        marginBottom: 8, textTransform: 'uppercase',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f3f3fa', borderRadius: 12,
    },
    input: {
        flex: 1, paddingVertical: 13, paddingRight: 16,
        fontSize: 14, color: '#191c20',
    },
    footer: {
        position: 'absolute', bottom: 0, width: '100%', padding: 24,
        backgroundColor: '#f9f9ff',
        borderTopLeftRadius: 40, borderTopRightRadius: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
    },
    submitBtn: {
        backgroundColor: '#225ea7', borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    submitBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});