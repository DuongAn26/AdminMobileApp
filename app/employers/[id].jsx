import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    Platform, ScrollView, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, CheckCircle2, XCircle, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react-native';
import { getEmployerById, approveEmployer, rejectEmployer } from '../../services/employerService';

export default function EmployerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getEmployerById(id);
                if (data) setReport(data);
            } catch(e) {
                console.log(e);
            }
        };
        fetchDetail();
    }, [id]);

    const handleApprove = async () => {
        try {
            await approveEmployer(id);
            Alert.alert('Thành công', 'Đã cấp phép cho nhà tuyển dụng.');
            router.back();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cấp phép.');
        }
    };

    const handleReject = () => {
        Alert.alert(
            'Xác nhận từ chối',
            `Từ chối nhà tuyển dụng "${report?.name || report?.companyName}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Từ chối',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectEmployer(id);
                            Alert.alert('Hoàn tất', 'Đã từ chối nhà tuyển dụng.');
                            router.back();
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể từ chối.');
                        }
                    },
                },
            ]
        );
    };

    if (!report) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ padding: 20, color: '#727782' }}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#424751" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin yêu cầu</Text>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.cardInfo}>
                    <View style={styles.detailHeader}>
                        <View style={styles.companyIcon}>
                            <Building2 size={36} color="#ffffff" strokeWidth={2} />
                        </View>
                        <Text style={styles.companyName}>{report.name || report.companyName}</Text>
                        <Text style={styles.companyId}>ID: {report.companyId}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Trạng thái tài khoản</Text>
                        <View style={styles.statusBadgeError}>
                            <Text style={styles.statusTextError}>{report.status}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Lý do Báo cáo</Text>
                        <Text style={styles.infoValue}>{report.reason || 'N/A'}</Text>
                    </View>
                </View>

                {/* Kết quả kiểm tra */}
                <View style={styles.validationCard}>
                    <Text style={styles.validationTitle}>Kết quả kiểm tra AI</Text>
                    <View style={styles.validationRow}>
                        <CheckCircle2 size={16} color="#15803d" strokeWidth={2.5} />
                        <Text style={styles.validationText}>Mã số thuế doanh nghiệp hợp lệ</Text>
                    </View>
                    <View style={styles.validationRow}>
                        <CheckCircle2 size={16} color="#15803d" strokeWidth={2.5} />
                        <Text style={styles.validationText}>Lịch sử thanh toán uy tín</Text>
                    </View>
                    <View style={styles.validationRow}>
                        <AlertCircle size={16} color="#854d0e" strokeWidth={2.5} />
                        <Text style={[styles.validationText, { color: '#854d0e' }]}>Chưa xác minh giấy phép kinh doanh</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} activeOpacity={0.7}>
                    <XCircle size={16} color="#b91c1c" strokeWidth={2} />
                    <Text style={styles.rejectBtnText}>TỪ CHỐI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} activeOpacity={0.85}>
                    <ShieldCheck size={16} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.approveBtnText}>CẤP PHÉP NGAY</Text>
                    <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
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
    companyName: { fontSize: 22, fontWeight: '900', color: '#191c20' },
    companyId: {
        fontSize: 12, color: '#727782',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4,
    },
    divider: { height: 1, backgroundColor: '#e1e2e9', width: '100%', marginBottom: 24 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 },
    infoLabel: { fontSize: 13, color: '#424751' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#191c20', maxWidth: '55%', textAlign: 'right' },
    statusBadgeError: { backgroundColor: '#ffdad6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    statusTextError: { color: '#93000a', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
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
    },
    rejectBtnText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 13 },
    approveBtn: {
        flex: 2, backgroundColor: '#225ea7', flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 8,
    },
    approveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
