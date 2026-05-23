import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Link, Lock, Mail, MapPin, PlusCircle, ShieldCheck, UserCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { createEmployer } from '../../services/employerService';
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

export default function CreateEmployerScreen() {
    const router = useRouter();
    
    // Các state cơ bản
    const [name, setName]       = useState('');
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity]       = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    
    // Các state bổ sung cho đủ trường với Detail
    const [status, setStatus]   = useState('APPROVED'); // Mặc định cho phép cấp quyền luôn
    const [isActive, setIsActive] = useState(true);     // Mặc định tài khoản hoạt động

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đủ tên, email và mật khẩu');
            return;
        }
        setLoading(true);
        try {
            // Gọi service tạo employer - nó sẽ tự xử lý tạo User + Company
            await createEmployer({
                name,
                email,
                password,
                city: city || null,
                logoUrl: logoUrl || null,
                status: status || 'APPROVED',
                is_active: isActive
            });
            
            Alert.alert('Thành công', 'Đã thêm nhà tuyển dụng mới');
            router.back();
        } catch(e) {
            console.log('Lỗi thêm employer:', e.message);
            Alert.alert('Lỗi', e.message || 'Có lỗi xảy ra khi thêm nhà tuyển dụng');
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

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Thêm mới{'\n'}<Text style={{ color: '#225ea7' }}>Doanh nghiệp</Text></Text>
                <Text style={styles.subtitle}>Điền thông tin doanh nghiệp mới vào hệ thống quản trị.</Text>

                <View style={styles.form}>
                    <Field
                        label="TÊN DOANH NGHIỆP"
                        Icon={Building2}
                        placeholder="FPT Software"
                        value={name}
                        onChangeText={setName}
                    />
                    <Field
                        label="EMAIL ĐẠI DIỆN"
                        Icon={Mail}
                        placeholder="hr@fpt.com.vn"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Field
                        label="MẬT KHẨU"
                        Icon={Lock}
                        placeholder="Mật khẩu (Cho tài khoản User)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <Field
                        label="THÀNH PHỐ"
                        Icon={MapPin}
                        placeholder="Hà Nội"
                        value={city}
                        onChangeText={setCity}
                    />
                    <Field
                        label="LOGO URL (NẾU CÓ)"
                        Icon={Link}
                        placeholder="https://..."
                        value={logoUrl}
                        onChangeText={setLogoUrl}
                        autoCapitalize="none"
                    />

                    <View style={styles.divider} />

                    {/* Trạng thái xét duyệt (Status) */}
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <ShieldCheck size={16} color="#4d5f7d" style={{ marginRight: 6 }} />
                            <Text style={[styles.label, { marginBottom: 0 }]}>TRẠNG THÁI XÉT DUYỆT</Text>
                        </View>
                        <View style={styles.statusContainer}>
                            <TouchableOpacity 
                                style={[styles.statusBtn, status === 'APPROVED' && styles.statusApproved]} 
                                onPress={() => setStatus('APPROVED')}
                            >
                                <Text style={[styles.statusBtnText, status === 'APPROVED' && styles.statusTextActive]}>APPROVED</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.statusBtn, status === 'PENDING' && styles.statusPending]} 
                                onPress={() => setStatus('PENDING')}
                            >
                                <Text style={[styles.statusBtnText, status === 'PENDING' && styles.statusTextActive]}>PENDING</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Trạng thái tài khoản (is_active) */}
                    <View style={[styles.inputGroup, styles.switchRow]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <UserCheck size={16} color="#4d5f7d" style={{ marginRight: 6 }} />
                            <Text style={[styles.label, { marginBottom: 0 }]}>TÀI KHOẢN HOẠT ĐỘNG</Text>
                        </View>
                        <Switch 
                            value={isActive} 
                            onValueChange={setIsActive} 
                            trackColor={{ false: '#e1e2e9', true: '#225ea7' }}
                            thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                    <PlusCircle size={22} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.submitBtnText}>{loading ? 'ĐANG LƯU...' : 'LƯU HỒ SƠ DOANH NGHIỆP'}</Text>
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
    divider: { height: 1, backgroundColor: '#f0f0f5', marginVertical: 12 },
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
    
    /* Styles cho Status và Switch */
    statusContainer: { flexDirection: 'row', gap: 10 },
    statusBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 10,
        backgroundColor: '#f3f3fa', alignItems: 'center',
        borderWidth: 1, borderColor: 'transparent'
    },
    statusApproved: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
    statusPending: { backgroundColor: '#fef08a', borderColor: '#eab308' },
    statusBtnText: { fontSize: 13, fontWeight: 'bold', color: '#727782' },
    statusTextActive: { color: '#191c20' },
    switchRow: {
        flexDirection: 'row', justifyContent: 'space-between', 
        alignItems: 'center', backgroundColor: '#f3f3fa', 
        padding: 12, borderRadius: 12
    },

    footer: {
        position: 'absolute', bottom: 0, width: '100%', padding: 24,
        backgroundColor: '#f9f9ff',
        borderTopLeftRadius: 40, borderTopRightRadius: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
    },
    submitBtn: {
        backgroundColor: '#225ea7', borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    submitBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});