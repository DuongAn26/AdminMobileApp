import { useRouter } from 'expo-router';
import { CircleDot, LifeBuoy, RefreshCw, Trash2, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../services/supabase';
import { deleteTicket, getTickets } from '../../services/ticketService';

// ─── Cấu hình filter trạng thái ────────────────────────────────
const STATUS_FILTERS = [
    { key: 'all',         label: 'Tất cả',      bg: '#e7e8ee', text: '#424751' },
    { key: 'open',        label: 'Đang chờ',    bg: '#ffdad6', text: '#93000a' },
    { key: 'in_progress', label: 'Đang xử lý',  bg: '#c8dbfe', text: '#1d4ed8' },
    { key: 'closed',      label: 'Đã đóng',     bg: '#dcfce7', text: '#166534' },
];

const STATUS_CARD_STYLE = {
    open:        { border: '#ba1a1a', badge: '#ffdad6', badgeText: '#93000a', dot: '#ba1a1a', label: 'Đang chờ' },
    in_progress: { border: null,      badge: '#c8dbfe', badgeText: '#1d4ed8', dot: '#4d5f7d', label: 'Đang xử lý' },
    closed:      { border: null,      badge: '#dcfce7', badgeText: '#166534', dot: '#15803d', label: 'Đã đóng' },
};

export default function TicketsScreen() {
    const [allTickets, setAllTickets] = useState([]);
    const [displayed, setDisplayed]   = useState([]);
    const [filter, setFilter]         = useState('all');
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const [deletingId, setDeletingId] = useState(null);

    const fetchTickets = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await getTickets();
            setAllTickets(data);
        } catch(e) {
            console.log('[Tickets] fetch error:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Lọc theo trạng thái
    useEffect(() => {
        if (filter === 'all') setDisplayed(allTickets);
        else setDisplayed(allTickets.filter(t => t.status === filter));
    }, [filter, allTickets]);

    useEffect(() => { fetchTickets(); }, []);

    // Realtime: subscribe to new replies and update ticket counts in list
    useEffect(() => {
        const channel = supabase.channel('public:ticket_replies').on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'TICKET_REPLIES' },
            (payload) => {
                const newReply = payload.new;
                if (!newReply) return;
                setAllTickets(prev => {
                    const idx = prev.findIndex(t => Number(t.id) === Number(newReply.ticket_id));
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    const ticket = { ...copy[idx] };
                    ticket.replies = ticket.replies ? [...ticket.replies, newReply] : [newReply];
                    copy[idx] = ticket;
                    return copy;
                });
            }
        ).subscribe();

        return () => { try { channel.unsubscribe(); } catch (e) { /* ignore */ } };
    }, []);

    const handleDelete = (item) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa vé #TK-${item.id}? Hành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive', onPress: async () => {
                        setDeletingId(item.id);
                        try {
                            await deleteTicket(item.id);
                            fetchTickets(true);
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể xóa vé. Vui lòng thử lại.');
                        } finally {
                            setDeletingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const style = STATUS_CARD_STYLE[item.status] || STATUS_CARD_STYLE.in_progress;
        return (
            <TouchableOpacity
                style={[styles.card, style.border && { borderLeftWidth: 4, borderLeftColor: style.border }]}
                onPress={() => router.push(`/tickets/${item.id}`)}
                activeOpacity={0.75}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.ticketId}>#TK-{item.id}</Text>
                    <View style={[styles.badge, { backgroundColor: style.badge }]}>
                        <CircleDot size={10} color={style.dot} strokeWidth={2.5} />
                        <Text style={[styles.badgeText, { color: style.badgeText }]}>{style.label}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                    <Text style={styles.ticketDesc} numberOfLines={1}>{item.message}</Text>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.userRow}>
                        <View style={styles.avatar}>
                            <User size={12} color="#225ea7" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.userEmail} numberOfLines={1}>{item.userEmail}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.replyCount}>
                            {item.replies?.length > 0
                                ? `${item.replies.length} phản hồi`
                                : (item.status === 'open' ? 'Chưa có phản hồi' : '')}
                        </Text>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); handleDelete(item); }} style={styles.deleteBtn} activeOpacity={0.7} disabled={deletingId === item.id}>
                            {deletingId === item.id ? <ActivityIndicator size={14} color="#2d2d35" /> : <Trash2 size={14} color="#2d2d35" strokeWidth={2} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Đếm theo từng trạng thái
    const counts = {
        all:         allTickets.length,
        open:        allTickets.filter(t => t.status === 'open').length,
        in_progress: allTickets.filter(t => t.status === 'in_progress').length,
        closed:      allTickets.filter(t => t.status === 'closed').length,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Vé hỗ trợ</Text>
                    <Text style={styles.subtitle}>{counts.open} đang mở • {counts.all} tổng</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => fetchTickets(true)}
                    activeOpacity={0.7}
                >
                    <RefreshCw size={18} color="#225ea7" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            {/* KPI */}
            <View style={styles.metricsContainer}>
                <View style={[styles.metricBox, styles.metricBorderError]}>
                    <Text style={styles.metricLabel}>Đang mở</Text>
                    <Text style={[styles.metricValue, { color: '#b91c1c' }]}>{counts.open}</Text>
                </View>
                <View style={[styles.metricBox, styles.metricBorderPrimary]}>
                    <Text style={styles.metricLabel}>Xử lý</Text>
                    <Text style={styles.metricValue}>{counts.in_progress}</Text>
                </View>
                <View style={[styles.metricBox, styles.metricBorderSuccess]}>
                    <Text style={styles.metricLabel}>Đã đóng</Text>
                    <Text style={[styles.metricValue, { color: '#15803d' }]}>{counts.closed}</Text>
                </View>
            </View>

            {/* Filter Chips theo trạng thái */}
            <View style={styles.filterRow}>
                {STATUS_FILTERS.map(f => {
                    const isActive = filter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.chip,
                                isActive && { backgroundColor: f.bg, borderColor: f.text + '40' },
                            ]}
                            onPress={() => setFilter(f.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.chipText, isActive && { color: f.text, fontWeight: '700' }]}>
                                {f.label}
                                {f.key !== 'all' && counts[f.key] > 0 ? ` (${counts[f.key]})` : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Danh sách */}
            <View style={styles.sectionHeader}>
                <LifeBuoy size={16} color="#225ea7" strokeWidth={2} />
                <Text style={styles.sectionTitle}>
                    {STATUS_FILTERS.find(f => f.key === filter)?.label || 'Tất cả'}
                </Text>
                <Text style={styles.sectionCount}>{displayed.length} vé</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#225ea7" style={{ marginTop: 32 }} />
            ) : displayed.length === 0 ? (
                <View style={styles.emptyState}>
                    <LifeBuoy size={48} color="#c2c6d3" strokeWidth={1.5} />
                    <Text style={styles.emptyText}>Không có vé nào</Text>
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchTickets(true)} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    title: { fontSize: 24, fontWeight: '900', color: '#191c20' },
    subtitle: { fontSize: 12, color: '#727782', marginTop: 2 },
    refreshBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(34,94,167,0.08)',
        justifyContent: 'center', alignItems: 'center',
    },
    // KPI
    metricsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
    metricBox: {
        flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderBottomWidth: 3,
    },
    metricBorderError:   { borderBottomColor: '#b91c1c' },
    metricBorderPrimary: { borderBottomColor: '#225ea7' },
    metricBorderSuccess: { borderBottomColor: '#15803d' },
    metricLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#727782', marginBottom: 6, letterSpacing: 0.5 },
    metricValue: { fontSize: 26, fontWeight: '900', color: '#225ea7' },
    // Filters
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12, flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'rgba(34,94,167,0.25)', backgroundColor: 'transparent',
    },
    chipText: { fontSize: 12, fontWeight: '600', color: '#424751' },
    // Section
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#191c20', flex: 1 },
    sectionCount: { fontSize: 12, color: '#727782' },
    // Cards
    list: { paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
    card: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    ticketId: {
        fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#424751', backgroundColor: '#e7e8ee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
    },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardBody: { marginBottom: 10 },
    ticketSubject: { fontSize: 15, fontWeight: 'bold', color: '#191c20', marginBottom: 3 },
    ticketDesc: { fontSize: 13, color: '#424751' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    avatar: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#d5e3ff',
        justifyContent: 'center', alignItems: 'center',
    },
    userEmail: { fontSize: 12, fontWeight: '600', color: '#424751' },
    replyCount: { fontSize: 11, color: '#727782', fontStyle: 'italic' },
    deleteBtn: {
        width: 34, height: 34, borderRadius: 8,
        backgroundColor: '#ffffff',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    // Empty
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 60 },
    emptyText: { fontSize: 16, color: '#727782' },
});
