import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, MapPin, Phone, Link2, User,
    Info, Briefcase, GraduationCap, CheckCircle2, Ban
} from 'lucide-react-native';
import { getCandidates, getCandidateById, toggleCandidateStatus } from '../../services/candidateService';

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams();
    const router  = useRouter();
    const [candidate, setCandidate] = useState(null);
    const [isActive, setIsActive]   = useState(true);
    const [toggling, setToggling]   = useState(false);

    const fetchDetail = async () => {
        try {
            const data = await getCandidateById(id);
            setCandidate(data);
        } catch (e) {
            console.log('[CandidateDetail] fetch error:', e.message);
        }
    };

    const fetchIsActive = async () => {
        try {
            const list = await getCandidates();
            const match = list.find(c => c.id.toString() === id.toString());
            if (match !== undefined) setIsActive(match.isActive !== false);
        } catch (_) {}
    };

    useEffect(() => {
        fetchDetail();
        fetchIsActive();
    }, [id]);

    const handleToggleStatus = async () => {
        const label = isActive ? 'bị chặn' : 'sẵn sàng';
        Alert.alert(
            'Xác nhận',
            `Chuyển ứng viên sang trạng thái "${label}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    style: isActive ? 'destructive' : 'default',
                    onPress: async () => {
                        setToggling(true);
                        try {
                            await toggleCandidateStatus(id);
                            setIsActive(prev => !prev);
                        } catch (e) {
                            Alert.alert('Lỗi', e.message);
                        } finally {
                            setToggling(false);
                        }
                    },
                },
            ]
        );
    };

    if (!candidate) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#225ea7" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const initials = candidate.fullname?.split(' ').slice(-1)[0]?.[0]?.toUpperCase() || '?';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ ứng viên</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>{candidate.fullname}</Text>
                    <Text style={styles.bio}>
                        {candidate.city || 'Chưa cập nhật vị trí'} • Ứng viên
                    </Text>
                    <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusBlocked]}>
                        {isActive
                            ? <CheckCircle2 size={14} color="#15803d" strokeWidth={2.5} />
                            : <Ban size={14} color="#b91c1c" strokeWidth={2.5} />
                        }
                        <Text style={[styles.statusBadgeText, { color: isActive ? '#15803d' : '#b91c1c' }]}>
                            {isActive ? 'Sẵn sàng' : 'Bị chặn'}
                        </Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoSection}>
                    {candidate.city && (
                        <View style={styles.infoRow}>
                            <MapPin size={18} color="#727782" strokeWidth={2} />
                            <Text style={styles.infoText}>{candidate.city}</Text>
                        </View>
                    )}
                    {candidate.phone && (
                        <View style={styles.infoRow}>
                            <Phone size={18} color="#727782" strokeWidth={2} />
                            <Text style={styles.infoText}>{candidate.phone}</Text>
                        </View>
                    )}
                    {candidate.personalLink && (
                        <View style={styles.infoRow}>
                            <Link2 size={18} color="#727782" strokeWidth={2} />
                            <Text style={styles.infoText}>{candidate.personalLink}</Text>
                        </View>
                    )}
                    {candidate.gender && (
                        <View style={styles.infoRow}>
                            <User size={18} color="#727782" strokeWidth={2} />
                            <Text style={styles.infoText}>{candidate.gender}</Text>
                        </View>
                    )}
                    {candidate.aboutMe && (
                        <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                            <Info size={18} color="#727782" strokeWidth={2} />
                            <Text style={[styles.infoText, { flex: 1 }]}>{candidate.aboutMe}</Text>
                        </View>
                    )}
                </View>

                {/* Toggle Button */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, isActive ? styles.toggleBtnBlock : styles.toggleBtnUnblock]}
                        onPress={handleToggleStatus}
                        disabled={toggling}
                        activeOpacity={0.85}
                    >
                        {toggling ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                {isActive
                                    ? <Ban size={20} color="#ffffff" strokeWidth={2.5} />
                                    : <CheckCircle2 size={20} color="#ffffff" strokeWidth={2.5} />
                                }
                                <Text style={styles.toggleBtnText}>
                                    {isActive ? 'Chặn ứng viên này' : 'Mở khóa ứng viên'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Kinh Nghiệm */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Briefcase size={18} color="#225ea7" strokeWidth={2} />
                        <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
                    </View>
                    {candidate.experiences?.length > 0 ? (
                        candidate.experiences.map((exp, i) => (
                            <View key={i} style={styles.expCard}>
                                <Text style={styles.expJob}>{exp.jobTitle}</Text>
                                <Text style={styles.expCompany}>{exp.companyName}</Text>
                                {exp.description ? <Text style={styles.expDesc}>{exp.description}</Text> : null}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có kinh nghiệm nào.</Text>
                    )}
                </View>

                {/* Học Vấn */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <GraduationCap size={18} color="#225ea7" strokeWidth={2} />
                        <Text style={styles.sectionTitle}>Học vấn</Text>
                    </View>
                    {candidate.educations?.length > 0 ? (
                        candidate.educations.map((edu, i) => (
                            <View key={i} style={styles.expCard}>
                                <Text style={styles.expJob}>{edu.major}</Text>
                                <Text style={styles.expCompany}>{edu.schoolName}</Text>
                                {edu.details ? <Text style={styles.expDesc}>{edu.details}</Text> : null}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có thông tin học vấn.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { marginTop: 4, color: '#727782' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#225ea7', marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    heroSection: {
        backgroundColor: '#225ea7', alignItems: 'center',
        paddingTop: 16, paddingBottom: 32,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    },
    avatarCircle: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatarInitial: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    bio: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    },
    statusActive: { backgroundColor: '#dcfce7' },
    statusBlocked: { backgroundColor: '#fee2e2' },
    statusBadgeText: { fontSize: 13, fontWeight: '700' },
    infoSection: {
        backgroundColor: '#fff', margin: 16, marginTop: -16,
        borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    infoText: { fontSize: 14, color: '#191c20' },
    actionSection: { paddingHorizontal: 16, marginBottom: 8 },
    toggleBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 14, borderRadius: 14,
        shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
    },
    toggleBtnBlock: { backgroundColor: '#dc2626', shadowColor: '#dc2626' },
    toggleBtnUnblock: { backgroundColor: '#16a34a', shadowColor: '#16a34a' },
    toggleBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#191c20' },
    expCard: {
        backgroundColor: '#fff', padding: 16, borderRadius: 12,
        marginBottom: 10, borderWidth: 1, borderColor: '#e1e2e9',
    },
    expJob: { fontSize: 15, fontWeight: 'bold', color: '#225ea7' },
    expCompany: { fontSize: 13, color: '#424751', marginTop: 3, fontWeight: '500' },
    expDesc: { fontSize: 12, color: '#727782', marginTop: 6 },
    emptyText: { color: '#9ca3af', fontStyle: 'italic', fontSize: 13 },
});
