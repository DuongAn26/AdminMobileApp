import { useRouter } from 'expo-router';
import {
    CheckCircle2,
    ChevronRight,
    Edit3,
    Lock,
    LogOut,
    Mail,
    Save,
    Shield,
    X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { changeUserPassword, getCurrentUserRecord, updateUserProfile } from '../../services/userService';

export default function ProfileScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ fullname: '', email: '', phone: '', role: '', joinDate: '' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const u = await getCurrentUserRecord();
                // Map fields expected by UI
                setProfile({
                    fullname: u.fullname || (u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : ''),
                    email: u.email,
                    phone: u.phone || '',
                    role: u.role || 'Người dùng',
                    joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '',
                    id: u.id,
                });
                setDraft(prev => ({ ...prev, fullname: u.fullname || '', email: u.email, phone: u.phone || '' }));
            } catch (e) {
                console.log('[Profile] load error:', e.message);
            } finally { setLoading(false); }
        };
        load();
    }, []);

    // ─── Bắt đầu chỉnh sửa ───────────────────────────────────────
    const handleEdit = () => {
        setDraft({ ...profile });
        setEditing(true);
        setSaved(false);
    };

    // ─── Huỷ chỉnh sửa ───────────────────────────────────────────
    const handleCancel = () => {
        setEditing(false);
    };

    // ─── Lưu thay đổi ────────────────────────────────────────────
    const handleSave = async () => {
        if (!draft.fullname.trim()) {
            Alert.alert('Lỗi', 'Họ tên không được để trống.');
            return;
        }
        if (!draft.phone.trim()) {
            Alert.alert('Lỗi', 'Số điện thoại không được để trống.');
            return;
        }
        setSaving(true);
        try {
            const updated = await updateUserProfile({ id: profile.id, fullname: draft.fullname, phone: draft.phone });
            setProfile(prev => ({ ...prev, fullname: updated.fullname || draft.fullname, phone: updated.phone || draft.phone }));
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            Alert.alert('Lỗi', e.message || 'Không thể lưu thông tin');
        } finally { setSaving(false); }
    };

    // ─── Đăng xuất ───────────────────────────────────────────────
    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => router.replace('/'),
                },
            ]
        );
    };

    // ─── Render field (view / edit mode) ─────────────────────────
    const Field = ({ icon: Icon, label, value, field, editable = true, keyboardType = 'default' }) => (
        <View style={styles.fieldRow}>
            <View style={styles.fieldIconWrap}>
                <Icon size={18} color="#225ea7" strokeWidth={2} />
            </View>
            <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {editing && editable ? (
                    <TextInput
                        style={styles.fieldInput}
                        value={draft[field]}
                        onChangeText={v => setDraft(prev => ({ ...prev, [field]: v }))}
                        keyboardType={keyboardType}
                        placeholderTextColor="#b0b5c0"
                        autoCapitalize="none"
                    />
                ) : (
                    <Text style={styles.fieldValue}>{value}</Text>
                )}
            </View>
        </View>
    );

    if (loading || !profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#225ea7" />
                    <Text style={{ marginTop: 12, color: '#727782' }}>Đang tải thông tin...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header ──────────────────────────────── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Tài khoản Admin</Text>
                        <Text style={styles.headerSub}>Thông tin và cài đặt tài khoản</Text>
                    </View>

                    {/* ── Avatar Card ─────────────────────────── */}
                    <View style={styles.avatarCard}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarLetter}>
                                    {profile.fullname.split(' ').pop()?.[0]?.toUpperCase() || 'A'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.avatarName}>{profile.fullname}</Text>
                        <View style={styles.roleBadge}>
                            <Shield size={12} color="#225ea7" strokeWidth={2.5} />
                            <Text style={styles.roleText}>{profile.role}</Text>
                        </View>
                        
                    </View>

                    {/* ── Saved Notice ────────────────────────── */}
                    {saved && (
                        <View style={styles.savedBanner}>
                            <CheckCircle2 size={16} color="#15803d" strokeWidth={2.5} />
                            <Text style={styles.savedText}>Đã lưu thay đổi thành công!</Text>
                        </View>
                    )}

                    {/* ── Profile Section ─────────────────────── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                            {!editing ? (
                                <TouchableOpacity style={styles.editBtn} onPress={handleEdit} activeOpacity={0.8}>
                                    <Edit3 size={14} color="#225ea7" strokeWidth={2.5} />
                                    <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <View style={styles.card}>
                            
                            <Field
                                icon={Mail}
                                label="Email"
                                value={profile.email}
                                field="email"
                                editable={false}
                                keyboardType="email-address"
                            />
                            <View style={styles.divider} />
                            
                            <View style={styles.divider} />
                            <Field
                                icon={Shield}
                                label="Vai trò"
                                value={profile.role}
                                field="role"
                                editable={false}
                            />
                        </View>

                        {/* ── Edit Actions ─────────────────────── */}
                        {editing && (
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={handleCancel}
                                    activeOpacity={0.8}
                                >
                                    <X size={16} color="#727782" strokeWidth={2.5} />
                                    <Text style={styles.cancelBtnText}>Huỷ bỏ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                    onPress={handleSave}
                                    activeOpacity={0.85}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Save size={16} color="#fff" strokeWidth={2.5} />
                                            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* ── Security Section ────────────────────── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bảo mật</Text>
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => setShowChangePwd(true)}>
                                <View style={styles.menuIconWrap}>
                                    <Lock size={18} color="#225ea7" strokeWidth={2} />
                                </View>
                                <Text style={styles.menuText}>Đổi mật khẩu</Text>
                                <ChevronRight size={18} color="#b0b5c0" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                        {/* Change Password Modal */}
                        <Modal visible={showChangePwd} transparent animationType="fade" onRequestClose={() => setShowChangePwd(false)}>
                            <Pressable style={styles.modalOverlay} onPress={() => setShowChangePwd(false)}>
                                <View style={styles.modalCardSmall}>
                                    <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                                    <TextInput value={oldPwd} onChangeText={setOldPwd} placeholder="Mật khẩu hiện tại" placeholderTextColor="#9ca3af" secureTextEntry style={[styles.pwdInput, { marginBottom: 10 }]} />
                                    <TextInput value={newPwd} onChangeText={setNewPwd} placeholder="Mật khẩu mới" placeholderTextColor="#9ca3af" secureTextEntry style={[styles.pwdInput, { marginBottom: 10 }]} />
                                    <TextInput value={confirmPwd} onChangeText={setConfirmPwd} placeholder="Xác nhận mật khẩu mới" placeholderTextColor="#9ca3af" secureTextEntry style={[styles.pwdInput, { marginBottom: 6 }]} />
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                        <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setShowChangePwd(false)}>
                                            <Text style={styles.cancelBtnText}>Huỷ</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.saveBtn, { flex: 2 }]} onPress={async () => {
                                            if (!oldPwd || !newPwd) { Alert.alert('Lỗi', 'Vui lòng điền đầy đủ'); return; }
                                            if (newPwd !== confirmPwd) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return; }
                                            setChangingPwd(true);
                                            try {
                                                await changeUserPassword(oldPwd, newPwd);
                                                Alert.alert('Thành công', 'Đã đổi mật khẩu');
                                                setShowChangePwd(false);
                                                setOldPwd(''); setNewPwd(''); setConfirmPwd('');
                                            } catch (e) {
                                                Alert.alert('Lỗi', e.message || 'Không thể đổi mật khẩu');
                                            } finally { setChangingPwd(false); }
                                        }}>
                                            {changingPwd ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Đổi mật khẩu</Text>}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Pressable>
                        </Modal>

                    {/* ── Logout Button ────────────────────────── */}
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                        <LogOut size={20} color="#dc2626" strokeWidth={2.5} />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>ITViecAdmin v1.0.0</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    scroll: { paddingBottom: 120 },

    // Header
    header: {
        padding: 16,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#225ea7' },
    headerSub: { fontSize: 14, color: '#424751', marginTop: 4 },

    // Avatar Card
    avatarCard: {
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
        paddingVertical: 28,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 4,
    },
    avatarRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 3, borderColor: 'rgba(34,94,167,0.25)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 2,
    },
    avatarCircle: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: '#225ea7',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarLetter: { color: '#ffffff', fontSize: 32, fontWeight: '900' },
    avatarName: { fontSize: 20, fontWeight: '800', color: '#191c20', marginBottom: 8 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(34,94,167,0.1)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
        marginBottom: 8,
    },
    roleText: { fontSize: 12, fontWeight: '700', color: '#225ea7' },
    joinDate: { fontSize: 12, color: '#727782' },

    // Saved banner
    savedBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#dcfce7', marginHorizontal: 16, marginBottom: 12,
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    modalCardSmall: {
        backgroundColor: '#fff', padding: 18, borderRadius: 12, width: '100%', maxWidth: 360,
    },
    pwdInput: { backgroundColor: '#f3f3fa', padding: 10, borderRadius: 8, marginBottom: 8 },
    savedText: { fontSize: 13, fontWeight: '600', color: '#15803d' },

    // Sections
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#191c20' },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1.5, borderColor: '#225ea7',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    editBtnText: { fontSize: 12, fontWeight: '700', color: '#225ea7' },

    // Card
    card: {
        backgroundColor: '#ffffff', borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        overflow: 'hidden',
    },
    divider: { height: 1, backgroundColor: '#f0f1f5', marginLeft: 52 },

    // Field
    fieldRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    fieldIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(34,94,167,0.08)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    fieldContent: { flex: 1 },
    fieldLabel: { fontSize: 11, color: '#727782', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
    fieldValue: { fontSize: 15, fontWeight: '600', color: '#191c20' },
    fieldInput: {
        fontSize: 15, fontWeight: '600', color: '#191c20',
        borderBottomWidth: 1.5, borderBottomColor: '#225ea7',
        paddingVertical: 2, paddingHorizontal: 0,
    },

    // Edit actions
    editActions: {
        flexDirection: 'row', gap: 10, marginTop: 12,
    },
    cancelBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        borderWidth: 1.5, borderColor: '#d1d5db',
        paddingVertical: 13, borderRadius: 14,
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#727782' },
    saveBtn: {
        flex: 2, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        backgroundColor: '#225ea7', paddingVertical: 13, borderRadius: 14,
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },

    // Menu Row
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    menuIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(34,94,167,0.08)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#191c20' },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginHorizontal: 16, marginTop: 8,
        paddingVertical: 16, borderRadius: 16,
        borderWidth: 2, borderColor: '#dc2626',
        backgroundColor: '#fff5f5',
    },
    logoutText: { fontSize: 15, fontWeight: '800', color: '#dc2626' },
    versionText: { textAlign: 'center', fontSize: 11, color: '#b0b5c0', marginTop: 20 },
});
