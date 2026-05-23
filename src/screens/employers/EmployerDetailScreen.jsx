import { useLocalSearchParams, useRouter } from 'expo-router';

import { AlertCircle, ArrowLeft, ArrowRight, Building2, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react-native';

import { useEffect, useState } from 'react';

import {
    Alert, Image,

    Platform,

    SafeAreaView,

    ScrollView,

    StyleSheet,

    Text,

    TouchableOpacity,

    View
} from 'react-native';

import { approveEmployer, blockEmployer, deleteEmployer, getEmployerById, rejectEmployer, suspendCompany, unblockEmployer, unsuspendCompany } from '../../services/employerService';

// Định nghĩa hàm formatDate
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateString;
  }
};
export default function EmployerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [report, setReport] = useState(null);
    
    // Thêm 2 state này để quản lý vòng đời loading và lỗi
    const [isLoading, setIsLoading] = useState(true); 
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchDetail = async () => { 
        if (!id) return;
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const data = await getEmployerById(id);
            setReport(data);
        } catch(e) {
            console.log("Lỗi fetch detail:", e.message);
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [id]);

    const handleApprove = async () => {
        try {
            await approveEmployer(id);
            Alert.alert('Thành công', 'Đã cấp phép nhà tuyển dụng.');
            router.back();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cấp phép nhà tuyển dụng.');
        }
    };

    const handleReject = () => {
        // If the company is currently pending, treat 'Từ chối' as delete
        if (report?.status === 'pending') {
            Alert.alert(
                'Xác nhận xóa',
                `Bạn có chắc muốn xóa nhà tuyển dụng "${report?.name || ''}"? Hành động này không thể hoàn tác.`,
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Xóa',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteEmployer(id);
                                Alert.alert('Thành công', 'Đã xóa nhà tuyển dụng.');
                                router.back();
                            } catch (e) {
                                Alert.alert('Lỗi', 'Không thể xóa nhà tuyển dụng.');
                            }
                        }
                    }
                ]
            );
            return;
        }
        Alert.alert(
            'Xác nhận từ chối',
            `Bạn có chắc muốn từ chối nhà tuyển dụng "${report?.name || ''}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Từ chối',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectEmployer(id);
                            Alert.alert('Thành công', 'Đã từ chối nhà tuyển dụng.');
                            router.back();
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể từ chối nhà tuyển dụng.');
                        }
                    }
                }
            ]
        );
    };

    const handleBlockAccount = async () => {
        Alert.alert(
            'Xác nhận chặn tài khoản',
            `Bạn có chắc muốn chặn tài khoản nhà tuyển dụng "${report?.name || ''}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                        { text: 'Chặn tài khoản', style: 'destructive', onPress: async () => {
                    try {
                        setIsLoading(true);
                        await blockEmployer(id);
                        Alert.alert('Thành công', 'Đã chặn tài khoản.');
                        await fetchDetail();
                    } catch (err) {
                        Alert.alert('Lỗi', err.message || 'Không thể chặn tài khoản');
                    } finally { setIsLoading(false); }
                }}
            ]
        );
    };

    const handleUnblockAccount = async () => {
        try {
            setIsLoading(true);
            await unblockEmployer(id);
            Alert.alert('Thành công', 'Đã bỏ chặn tài khoản.');
            await fetchDetail();
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể bỏ chặn tài khoản');
        } finally { setIsLoading(false); }
    };

    const handleSuspendPosts = async () => {
        Alert.alert(
            'Xác nhận chặn đăng bài',
            `Bạn có chắc muốn chặn đăng bài của nhà tuyển dụng "${report?.name || ''}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Chặn đăng bài', style: 'destructive', onPress: async () => {
                    try {
                        setIsLoading(true);
                        await suspendCompany(id);
                        Alert.alert('Thành công', 'Đã chặn đăng bài.');
                        await fetchDetail();
                    } catch (err) {
                        Alert.alert('Lỗi', err.message || 'Không thể chặn đăng bài');
                    } finally { setIsLoading(false); }
                }}
            ]
        );
    };

    const handleUnsuspendPosts = async () => {
        try {
            setIsLoading(true);
            await unsuspendCompany(id);
            Alert.alert('Thành công', 'Đã mở chặn đăng bài.');
            await fetchDetail();
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Không thể mở chặn đăng bài');
        } finally { setIsLoading(false); }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#225ea7', fontWeight: 'bold' }}>Đang tải dữ liệu...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (errorMsg || !report) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <AlertCircle size={40} color="#b91c1c" style={{ marginBottom: 10 }} />
                    <Text style={{ color: '#b91c1c', textAlign: 'center', fontWeight: 'bold' }}>
                        Không thể tải thông tin nhà tuyển dụng.
                    </Text>
                    <Text style={{ color: '#727782', textAlign: 'center', marginTop: 10 }}>
                        Chi tiết lỗi: {errorMsg || 'Không tìm thấy dữ liệu'}
                    </Text>
                    <TouchableOpacity 
                        style={{ marginTop: 20, padding: 10, backgroundColor: '#e1e2e9', borderRadius: 8 }} 
                        onPress={() => router.back()}
                    >
                        <Text>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#424751" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết Nhà tuyển dụng</Text>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.cardInfo}>
                    <View style={styles.detailHeader}>
                        {report.logo_url ? (
                            <Image source={{ uri: report.logo_url }} style={styles.companyLogo} />
                        ) : (
                            <View style={styles.companyIcon}>
                                <Building2 size={36} color="#ffffff" strokeWidth={2} />
                            </View>
                        )}
                        <Text style={styles.companyName}>{report.name}</Text>
                        <Text style={styles.companyId}>Company ID: {report.id}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Email */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email tài khoản</Text>
                        <Text style={styles.infoValue}>{report.email || 'N/A'}</Text>
                    </View>

                    {/* Thành phố */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Thành phố</Text>
                        <Text style={styles.infoValue}>{report.city || 'N/A'}</Text>
                    </View>

                    {/* Ngày tạo */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày tạo</Text>
                        <Text style={styles.infoValue}>{formatDate(report.created_at)}</Text>
                    </View>

                                    {/* Số bài đăng tuyển dụng */}
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Số bài đăng</Text>
                                        <Text style={styles.infoValue}>{typeof report.job_count === 'number' ? report.job_count : 0}</Text>
                                    </View>

                    <View style={styles.divider} />

                    {/* Trạng thái công ty (status) - ẩn nếu tài khoản người dùng đang bị chặn */}
                    { report?.is_active !== false && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Trạng thái </Text>
                            {/* Nếu company đã approved và user active thì hiển thị ACTIVE */}
                            { (report.status === 'approved' && report.is_active) ? (
                                <View style={[styles.badge, styles.badgeSuccess]}>
                                    <Text style={[styles.badgeText, styles.textSuccess]}>ACTIVE</Text>
                                </View>
                            ) : (
                                <View style={[styles.badge, report.status === 'approved' ? styles.badgeSuccess : styles.badgeWarning]}>
                                    <Text style={[styles.badgeText, report.status === 'approved' ? styles.textSuccess : styles.textWarning]}>
                                        {report.status ? report.status.toUpperCase() : 'PENDING'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Kết quả kiểm tra */}
                <View style={styles.validationCard}>
                    <Text style={styles.validationTitle}>Đánh giá hệ thống</Text>
                    <View style={styles.validationRow}>
                        <CheckCircle2 size={16} color="#15803d" strokeWidth={2.5} />
                        <Text style={styles.validationText}>Thông tin nhà tuyển dụng hoàn chỉnh</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                { report?.is_active === false ? (
                    <TouchableOpacity style={styles.approveBtn} onPress={handleUnblockAccount} activeOpacity={0.85}>
                        <ShieldCheck size={16} color="#ffffff" strokeWidth={2.5} />
                        <Text style={styles.approveBtnText}>BỎ CHẶN TÀI KHOẢN</Text>
                    </TouchableOpacity>
                ) : report?.status === 'suspend' ? (
                    <TouchableOpacity style={styles.approveBtn} onPress={handleUnsuspendPosts} activeOpacity={0.85}>
                        <ShieldCheck size={16} color="#ffffff" strokeWidth={2.5} />
                        <Text style={styles.approveBtnText}>MỞ CHẶN ĐĂNG BÀI</Text>
                    </TouchableOpacity>
                ) : report?.status === 'approved' && report?.is_active ? (
                    <>
                        <TouchableOpacity style={styles.rejectBtn} onPress={handleBlockAccount} activeOpacity={0.7}>
                            <XCircle size={16} color="#b91c1c" strokeWidth={2} />
                            <Text style={styles.rejectBtnText}>CHẶN TÀI KHOẢN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#f59e0b', borderColor: '#fbbf24' }]} onPress={handleSuspendPosts} activeOpacity={0.85}>
                            <ShieldCheck size={16} color="#ffffff" strokeWidth={2.5} />
                            <Text style={styles.approveBtnText}>CHẶN ĐĂNG BÀI</Text>
                            <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </>
                ) : (
                    // Nếu chưa approved → hiện Từ chối + Cấp phép
                    <>
                        <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} activeOpacity={0.7}>
                            <XCircle size={16} color="#b91c1c" strokeWidth={2} />
                            <Text style={styles.rejectBtnText}>TỪ CHỐI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} activeOpacity={0.85}>
                            <ShieldCheck size={16} color="#ffffff" strokeWidth={2.5} />
                            <Text style={styles.approveBtnText}>CẤP PHÉP NGAY</Text>
                            <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#e1e2e9',
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#191c20' },
    body: { padding: 16 },
    cardInfo: {
        backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    detailHeader: { alignItems: 'center', marginBottom: 24 },
    companyIcon: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#225ea7',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    companyLogo: {
        width: 80, height: 80, borderRadius: 40, marginBottom: 16,
        borderWidth: 1, borderColor: '#e1e2e9', backgroundColor: '#fff'
    },
    companyName: { fontSize: 22, fontWeight: '900', color: '#191c20', textAlign: 'center' },
    companyId: {
        fontSize: 12, color: '#727782',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4,
    },
    divider: { height: 1, backgroundColor: '#e1e2e9', width: '100%', marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
    infoLabel: { fontSize: 13, color: '#424751' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#191c20', maxWidth: '55%', textAlign: 'right' },
    
    /* Styles cho các loại Badge trạng thái */
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    badgeError: { backgroundColor: '#ffdad6' },
    badgeWarning: { backgroundColor: '#fef08a' },
    badgeSuccess: { backgroundColor: '#dcfce7' },
    
    badgeText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    textError: { color: '#93000a' },
    textWarning: { color: '#854d0e' },
    textSuccess: { color: '#166534' },

    validationCard: {
        backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginTop: 16,
        borderWidth: 1, borderColor: '#e1e2e9',
    },
    validationTitle: { fontSize: 14, fontWeight: 'bold', color: '#191c20', marginBottom: 14 },
    validationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    validationText: { fontSize: 13, color: '#424751' },
    footer: {
        flexDirection: 'row', gap: 10, padding: 16,
        backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e1e2e9',
    },
    rejectBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 14, borderRadius: 8,
        borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fee2e2',
        paddingHorizontal: 12,
    },
    rejectBtnText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 13, textAlign: 'center', flexShrink: 1 },
    approveBtn: {
        flex: 2, backgroundColor: '#225ea7', flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 8,
    },
    approveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});