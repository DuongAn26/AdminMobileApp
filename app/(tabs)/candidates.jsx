import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Platform, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import {
    Users, MapPin, UserCheck, UserX, Plus, Trash2
} from 'lucide-react-native';
import { getCandidates, deleteCandidate } from '../../services/candidateService';
import { useRouter } from 'expo-router';

const STATUS_FILTERS = [
    { key: 'all',      label: 'Tất cả' },
    { key: 'active',   label: 'Đang hoạt động' },
    { key: 'inactive', label: 'Không hoạt động' },
];

export default function CandidatesScreen() {
    const [allCandidates, setAllCandidates] = useState([]);
    const [displayed, setDisplayed] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const router = useRouter();

    const fetchCandidates = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await getCandidates();
            setAllCandidates(data);
        } catch (e) {
            console.log('[Candidates] fetch error:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (filter === 'all') setDisplayed(allCandidates);
        else if (filter === 'active') setDisplayed(allCandidates.filter(c => c.isActive !== false));
        else setDisplayed(allCandidates.filter(c => c.isActive === false));
    }, [filter, allCandidates]);

    useEffect(() => { fetchCandidates(); }, []);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').slice(-1)[0]?.[0]?.toUpperCase() || '?';
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa ứng viên "${item.fullname}"?\nHành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(item.id);
                        try {
                            await deleteCandidate(item.id);
                            fetchCandidates();
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể xóa ứng viên. Vui lòng thử lại.');
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isDeleting = deletingId === item.id;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/candidates/${item.id}`)}
                activeOpacity={0.75}
            >
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{getInitials(item.fullname)}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.candidateName} numberOfLines={1}>{item.fullname}</Text>
                        <View style={[styles.statusBadge, item.isActive === false ? styles.statusInactive : styles.statusActive]}>
                            <Text style={[styles.statusBadgeText, item.isActive === false ? styles.statusTextInactive : styles.statusTextActive]}>
                                {item.isActive === false ? 'Ngừng HĐ' : 'Sẵn sàng'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <MapPin size={12} color="#727782" strokeWidth={2} />
                        <Text style={styles.metaText}>{item.city || 'Chưa cập nhật'}</Text>
                    </View>
                </View>
                {/* Nút xóa */}
                <TouchableOpacity
                    style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                    onPress={(e) => { e.stopPropagation?.(); handleDelete(item); }}
                    activeOpacity={0.7}
                    disabled={isDeleting}
                >
                    {isDeleting
                        ? <ActivityIndicator size={14} color="#2d2d35" />
                        : <Trash2 size={15} color="#2d2d35" strokeWidth={2} />
                    }
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const total  = allCandidates.length;
    const active = allCandidates.filter(c => c.isActive !== false).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Quản lý Ứng viên</Text>
                <Text style={styles.subtitle}>Báo cáo tổng quan hệ thống tuyển dụng</Text>
            </View>

            {/* KPI */}
            <View style={styles.kpiContainer}>
                <View style={styles.kpiBox}>
                    <View style={styles.rowBetween}>
                        <Users size={20} color="#225ea7" strokeWidth={2} />
                        <Text style={styles.kpiTag}>Tổng</Text>
                    </View>
                    <Text style={styles.kpiLabel}>Ứng viên</Text>
                    <Text style={styles.kpiValue}>{loading ? '...' : total}</Text>
                </View>
                <View style={[styles.kpiBox, { backgroundColor: '#4177c2' }]}>
                    <View style={styles.rowBetween}>
                        <UserCheck size={20} color="#ffffff" strokeWidth={2} />
                        <Text style={[styles.kpiTag, { color: '#ffffff' }]}>Đang HĐ</Text>
                    </View>
                    <Text style={[styles.kpiLabel, { color: 'rgba(255,255,255,0.75)' }]}>Sẵn sàng</Text>
                    <Text style={[styles.kpiValue, { color: '#ffffff' }]}>{loading ? '...' : active}</Text>
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {STATUS_FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Danh sách ứng viên</Text>
                <Text style={styles.sectionCount}>{displayed.length} người</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#225ea7" style={{ marginTop: 32 }} />
            ) : displayed.length === 0 ? (
                <View style={styles.emptyState}>
                    <UserX size={48} color="#c2c6d3" strokeWidth={1.5} />
                    <Text style={styles.emptyText}>Không có ứng viên</Text>
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchCandidates(true)} />
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/candidates/create')} activeOpacity={0.85}>
                <Plus size={24} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    header: { padding: 16, marginTop: Platform.OS === 'android' ? 30 : 0 },
    title: { fontSize: 28, fontWeight: '900', color: '#225ea7' },
    subtitle: { fontSize: 14, color: '#424751', marginTop: 4 },
    kpiContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
    kpiBox: {
        flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    kpiTag: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', color: '#4d5f7d' },
    kpiLabel: { fontSize: 10, textTransform: 'uppercase', color: '#424751', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    kpiValue: { fontSize: 28, fontWeight: '900', color: '#191c20', marginTop: 4 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12, flexWrap: 'wrap' },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'rgba(34,94,167,0.3)', backgroundColor: 'transparent',
    },
    filterChipActive: { backgroundColor: '#225ea7', borderColor: '#225ea7' },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#225ea7' },
    filterChipTextActive: { color: '#ffffff' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#191c20' },
    sectionCount: { fontSize: 13, color: '#727782' },
    list: { paddingHorizontal: 16, gap: 10, paddingBottom: 100 },
    card: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    avatarCircle: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#225ea7',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
    cardInfo: { flex: 1 },
    candidateName: { fontSize: 15, fontWeight: 'bold', color: '#191c20', flex: 1, marginRight: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
    metaText: { fontSize: 12, color: '#727782' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    statusActive: { backgroundColor: '#dcfce7' },
    statusInactive: { backgroundColor: '#fee2e2' },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    statusTextActive: { color: '#15803d' },
    statusTextInactive: { color: '#b91c1c' },
    deleteBtn: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: '#ffffff',
        justifyContent: 'center', alignItems: 'center', marginLeft: 10,
        borderWidth: 1, borderColor: '#e5e7eb',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
    },
    deleteBtnDisabled: { backgroundColor: '#f3f4f6' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { fontSize: 16, color: '#727782' },
    fab: {
        position: 'absolute', bottom: 100, right: 16, width: 56, height: 56,
        borderRadius: 28, backgroundColor: '#225ea7', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
});
