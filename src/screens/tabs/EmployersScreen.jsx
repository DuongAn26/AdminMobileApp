import { useRouter } from 'expo-router';
import {
    BadgeCheck,
    Building2,
    CheckCircle,
    ChevronRight,
    Clock,
    Mail,
    MapPin,
    PlusCircle,
    ShieldBan,
    Trash2,
    XCircle
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { approveEmployer, deleteEmployer, getEmployers } from '../../services/employerService';

const STATUS_META = {
    approved: { bg: '#dcfce7', text: '#15803d', Icon: BadgeCheck },
    pending:  { bg: '#fef9c3', text: '#854d0e', Icon: Clock },
    rejected: { bg: '#fee2e2', text: '#b91c1c', Icon: XCircle },
    blocking: { bg: '#fee2e2', text: '#b91c1c', Icon: ShieldBan },
    suspend:  { bg: '#fff7ed', text: '#92400e', Icon: ShieldBan },
};

const FILTERS = [
    { key: 'all',      label: 'Tất cả' },
    { key: 'pending',  label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đang hoạt động' },
    { key: 'blocking', label: 'Bị chặn (Tài khoản)' },
    { key: 'suspend',  label: 'Chặn đăng bài' },
];
const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

export default function EmployersScreen() {
    const [allCompanies, setAllCompanies] = useState([]);
    const [displayed, setDisplayed]       = useState([]);
    const [filter, setFilter]             = useState('all');
    const [searchText, setSearchText]     = useState('');
    const [loading, setLoading]           = useState(true);
    const [refreshing, setRefreshing]     = useState(false);
    const [deletingId, setDeletingId]     = useState(null);
    const router = useRouter();

    const fetchCompanies = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await getEmployers();
            setAllCompanies(data);
        } catch (e) {
            console.log('[Employers] fetch error:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let list = allCompanies.slice();
        // Apply filter
        if (filter !== 'all') {
            if (filter === 'blocking') {
                list = list.filter(c => c.userStatus === 'blocking');
            } else {
                list = list.filter(c => c.status === filter);
            }
        }
        // Apply search by id or name
        if (searchText && searchText.trim().length > 0) {
            const q = searchText.trim().toLowerCase();
            list = list.filter(c => (c.name || '').toLowerCase().includes(q) || String(c.id).includes(q));
        }
        setDisplayed(list);
    }, [filter, allCompanies, searchText]);

    useEffect(() => { fetchCompanies(); }, []);

    const handleApprove = async (id) => {
        try {
            await approveEmployer(id);
            fetchCompanies();
        } catch (e) { console.log(e.message); }
    };

    const handleReject = async (id, itemName) => {
        Alert.alert(
            'Xác nhận',
            `Bạn có chắc muốn xóa nhà tuyển dụng "${itemName || ''}"? Hành động này sẽ xóa bản ghi và không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(id);
                        try {
                            await deleteEmployer(id);
                            fetchCompanies();
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể xóa nhà tuyển dụng.');
                        } finally { setDeletingId(null); }
                    }
                }
            ]
        );
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa nhà tuyển dụng "${item.name}"?\nHành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(item.id);
                        try {
                            await deleteEmployer(item.id);
                            fetchCompanies();
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể xóa nhà tuyển dụng. Vui lòng thử lại.');
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const sm = STATUS_META[item.status] || STATUS_META.pending;
        const StatusIcon = sm.Icon;
        const isDeleting = deletingId === item.id;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/employers/${item.id}`)}
                activeOpacity={0.75}
            >
                <View style={styles.cardTop}>
                    <View style={styles.iconWrapper}>
                        <Building2 size={24} color="#225ea7" strokeWidth={2} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.companyName, !item.is_active && styles.inactiveText]} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.metaRow}>
                            <MapPin size={12} color="#727782" strokeWidth={2} />
                            <Text style={styles.metaText}>{item.city || 'Chưa cập nhật'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Mail size={12} color="#727782" strokeWidth={2} />
                            <Text style={[styles.metaText, !item.is_active && styles.inactiveText]} numberOfLines={1}>{item.userEmail || '—'}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRight}>
                        {item.is_active === false ? (
                            // If the linked user is blocked, leave the status area blank
                            <View style={[styles.badge, { backgroundColor: 'transparent' }]} />
                        ) : (
                            <View style={[styles.badge, { backgroundColor: sm.bg }]}>
                                <StatusIcon size={11} color={sm.text} strokeWidth={2.5} />
                                <Text style={[styles.badgeText, { color: sm.text }]}>{item.status}</Text>
                            </View>
                        )}
                        <View style={styles.cardRightActions}>
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
                            <ChevronRight size={16} color="#c2c6d3" strokeWidth={2} style={{ marginTop: 4 }} />
                        </View>
                    </View>
                </View>

                {item.status === 'pending' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.btnApprove}
                            onPress={(e) => { e.stopPropagation?.(); handleApprove(item.id); }}
                            activeOpacity={0.7}
                        >
                            <CheckCircle size={15} color="#15803d" strokeWidth={2.5} />
                            <Text style={styles.btnApproveText}>Duyệt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.btnReject}
                            onPress={(e) => { e.stopPropagation?.(); handleReject(item.id, item.name); }}
                            activeOpacity={0.7}
                        >
                            <XCircle size={15} color="#b91c1c" strokeWidth={2.5} />
                            <Text style={styles.btnRejectText}>Từ chối</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Nếu user liên kết đang inactive thì hiển thị note đỏ nghiêng */}
                {!item.is_active && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.blockedNote}>Tài khoản bị chặn</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const counts = {
        all:      allCompanies.length,
        pending:  allCompanies.filter(c => c.status === 'pending').length,
        approved: allCompanies.filter(c => c.status === 'approved').length,
        blocking: allCompanies.filter(c => c.userStatus === 'blocking').length,
        suspend:  allCompanies.filter(c => c.status === 'suspend').length,
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nhà tuyển dụng</Text>
                <Text style={styles.subtitle}>{counts.pending} đang chờ duyệt • {counts.all} tổng</Text>
            </View>

            {/* KPI */}
            <View style={styles.kpiRow}>
                <View style={[styles.kpiBox, { borderBottomColor: '#225ea7' }]}>
                    <Text style={styles.kpiVal}>{counts.all}</Text>
                    <Text style={styles.kpiLabel}>Tổng cộng</Text>
                </View>
                <View style={[styles.kpiBox, { borderBottomColor: '#15803d' }]}>
                    <Text style={[styles.kpiVal, { color: '#15803d' }]}>{counts.approved}</Text>
                    <Text style={styles.kpiLabel}>Đang hoạt động</Text>
                </View>
                <View style={[styles.kpiBox, { borderBottomColor: '#854d0e' }]}>
                    <Text style={[styles.kpiVal, { color: '#854d0e' }]}>{counts.pending}</Text>
                    <Text style={styles.kpiLabel}>Chờ duyệt</Text>
                </View>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <TextInput
                    placeholder="Tìm theo ID hoặc tên"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
                />
            </View>

            {/* Filter Chips */}
            <View style={styles.filterScroll}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.chip, filter === f.key && styles.chipActive]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#225ea7" style={{ marginTop: 40 }} />
            ) : displayed.length === 0 ? (
                <View style={styles.emptyState}>
                    <Building2 size={48} color="#c2c6d3" strokeWidth={1.5} />
                    <Text style={styles.emptyText}>Không có nhà tuyển dụng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchCompanies(true)} />
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/employers/create')} activeOpacity={0.85}>
                <PlusCircle size={26} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    header: { padding: 16, marginTop: Platform.OS === 'android' ? 30 : 0 },
    title: { fontSize: 26, fontWeight: '900', color: '#191c20' },
    subtitle: { fontSize: 13, color: '#424751', marginTop: 4 },
    kpiRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 },
    kpiBox: {
        flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12,
        borderBottomWidth: 3, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    kpiVal: { fontSize: 22, fontWeight: '900', color: '#225ea7' },
    kpiLabel: { fontSize: 10, color: '#727782', marginTop: 2, textAlign: 'center' },
    filterScroll: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12, flexWrap: 'wrap' },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(34,94,167,0.3)' },
    chipActive: { backgroundColor: '#225ea7', borderColor: '#225ea7' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#225ea7' },
    chipTextActive: { color: '#fff' },
    list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
    cardRight: { alignItems: 'flex-end' },
    cardRightActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    iconWrapper: {
        width: 46, height: 46, borderRadius: 12, backgroundColor: '#eef2fc',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    cardInfo: { flex: 1 },
    companyName: { fontSize: 15, fontWeight: 'bold', color: '#191c20', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
    metaText: { fontSize: 12, color: '#727782' },
    inactiveText: { color: '#9ca3af' },
    blockedNote: { color: '#b91c1c', fontStyle: 'italic', marginTop: 6, fontSize: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    deleteBtn: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#ffffff',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#e5e7eb',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
    },
    deleteBtnDisabled: { backgroundColor: '#f3f4f6' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f5' },
    btnApprove: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
    btnApproveText: { fontSize: 13, fontWeight: '700', color: '#15803d' },
    btnReject: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
    btnRejectText: { fontSize: 13, fontWeight: '700', color: '#b91c1c' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { fontSize: 16, color: '#727782' },
    fab: {
        position: 'absolute', bottom: 100, right: 16, width: 56, height: 56,
        borderRadius: 28, backgroundColor: '#225ea7', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#225ea7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
});
