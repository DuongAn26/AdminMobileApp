import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../services/supabase';
import { getTicketById, updateTicketStatus } from '../../services/ticketService';

// ─── Cấu hình trạng thái ────────────────────────────────────────
const STATUS_OPTIONS = [
    { key: 'open',        label: 'Đang chờ',   bg: '#ffdad6', text: '#93000a'  },
    { key: 'in_progress', label: 'Đang xử lý', bg: '#c8dbfe', text: '#1d4ed8'  },
    { key: 'closed',      label: 'Đã đóng',    bg: '#dcfce7', text: '#166534'  },
];

const getStatusStyle = (status) =>
    STATUS_OPTIONS.find(s => s.key === status) || STATUS_OPTIONS[0];

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [ticket, setTicket]         = useState(null);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [updatingStatus, setUpdatingStatus]     = useState(false);
    const scrollRef = useRef(null);

    const fetchTicket = async () => {
        try {
            const data = await getTicketById(id);
            if (data) setTicket({ ...data });
        } catch (e) {
            console.log('[TicketDetail] fetch error:', e.message);
        }
    };

    useEffect(() => { fetchTicket(); }, [id]);

    // Realtime subscription for replies to this ticket
    useEffect(() => {
        if (!id) return;
        const channel = supabase.channel(`ticket_replies_${id}`).on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'TICKET_REPLIES', filter: `ticket_id=eq.${id}` },
            (payload) => {
                const newReply = payload.new;
                if (!newReply) return;
                setTicket(prev => {
                    if (!prev) return prev;
                    return { ...prev, replies: prev.replies ? [...prev.replies, newReply] : [newReply] };
                });
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
            }
        ).subscribe();

        return () => { try { channel.unsubscribe(); } catch (e) { /* ignore */ } };
    }, [id]);

    // Reply via app disabled: support tickets handled via email. Replies are still displayed for records.

    const handleChangeStatus = async (newStatus) => {
        setShowStatusPicker(false);
        if (newStatus === ticket.status) return;
        setUpdatingStatus(true);
        try {
            await updateTicketStatus(id, newStatus);
            setTicket(prev => ({ ...prev, status: newStatus }));
        } catch (e) {
            console.log('[TicketDetail] status update error:', e.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (!ticket) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#225ea7" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const sc = getStatusStyle(ticket.status);
    const avatarInitial = ticket.userEmail?.[0]?.toUpperCase() || 'U';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#424751" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết Vé</Text>
                {/* Nút đổi trạng thái */}
                <TouchableOpacity
                    style={[styles.statusChip, { backgroundColor: sc.bg }]}
                    onPress={() => setShowStatusPicker(true)}
                    activeOpacity={0.8}
                    disabled={updatingStatus}
                >
                    {updatingStatus ? (
                        <ActivityIndicator size="small" color={sc.text} />
                    ) : (
                        <>
                            <Text style={[styles.statusChipText, { color: sc.text }]}>{sc.label}</Text>
                            <ChevronDown size={14} color={sc.text} strokeWidth={2.5} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
                <View style={styles.rowBetween}>
                    <Text style={styles.ticketId}>#TK-{ticket.id}</Text>
                </View>
                <Text style={styles.subject}>{ticket.subject}</Text>
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{avatarInitial}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{ticket.userEmail}</Text>
                        <Text style={styles.userRole}>Người dùng</Text>
                    </View>
                </View>
            </View>

            {/* Ticket content (read-only). Support handled via email. */}
            <View style={{ padding: 16 }}>
                    <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                        <Text style={{ fontSize: 13, color: '#727782', marginBottom: 8 }}>Nội dung báo cáo</Text>
                        <Text style={{ fontSize: 15, color: '#191c20', lineHeight: 20 }}>{ticket.message}</Text>
                        <View style={{ height: 1, backgroundColor: '#f0f1f5', marginVertical: 12 }} />
                        <Text style={{ fontSize: 12, color: '#424751' }}>Người gửi: {ticket.userEmail || '—'}</Text>
                    </View>
            </View>

            {/* Reply via app disabled — handle support via email. */}

            {/* Modal chọn trạng thái */}
            <Modal
                visible={showStatusPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatusPicker(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowStatusPicker(false)}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Đổi trạng thái vé</Text>
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[
                                    styles.modalOption,
                                    ticket.status === opt.key && styles.modalOptionActive,
                                ]}
                                onPress={() => handleChangeStatus(opt.key)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.optionBadge, { backgroundColor: opt.bg }]}>
                                    <Text style={[styles.optionBadgeText, { color: opt.text }]}>{opt.label}</Text>
                                </View>
                                {ticket.status === opt.key && (
                                    <Check size={16} color="#225ea7" strokeWidth={2.5} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9ff' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: '#727782' },
    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderBottomWidth: 1, borderBottomColor: '#e1e2e9',
        marginTop: Platform.OS === 'android' ? 30 : 0,
        gap: 8,
    },
    backBtn: { marginRight: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#191c20', flex: 1 },
    statusChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    statusChipText: { fontSize: 12, fontWeight: '700' },
    // Ticket Info
    ticketInfo: {
        padding: 16, backgroundColor: '#ffffff',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    ticketId: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 11, fontWeight: 'bold',
        backgroundColor: '#d5e3ff', color: '#225ea7',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    },
    replyCount: { fontSize: 11, color: '#727782', fontStyle: 'italic' },
    subject: { fontSize: 17, fontWeight: '900', color: '#191c20', marginBottom: 14 },
    userCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f3f3fa', padding: 10, borderRadius: 12,
    },
    avatar: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#225ea7',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    userName: { fontSize: 13, fontWeight: 'bold', color: '#191c20' },
    userRole: { fontSize: 10, color: '#424751', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    // Messages
    messagesContainer: { flex: 1 },
    messagesContent: { padding: 16, gap: 12 },
    msgLeft: { alignItems: 'flex-start', maxWidth: '85%' },
    msgBubbleLeft: { backgroundColor: '#f3f3fa', padding: 12, borderRadius: 16, borderTopLeftRadius: 4 },
    msgTextLeft: { fontSize: 14, color: '#191c20', lineHeight: 20 },
    msgRight: { alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '85%' },
    msgBubbleRight: { backgroundColor: '#225ea7', padding: 12, borderRadius: 16, borderTopRightRadius: 4 },
    msgTextRight: { fontSize: 14, color: '#ffffff', lineHeight: 20 },
    msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    // Input
    inputArea: {
        flexDirection: 'row', padding: 12, paddingBottom: 16,
        backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e1e2e9',
        alignItems: 'flex-end', gap: 10,
    },
    input: {
        flex: 1, backgroundColor: '#f3f3fa', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
        fontSize: 14, color: '#191c20',
    },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#225ea7', justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: '#a0aec0' },
    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    modalCard: {
        backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 340,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
    },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#191c20', marginBottom: 18, textAlign: 'center' },
    modalOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 14, borderRadius: 12, marginBottom: 10,
        backgroundColor: '#f9f9ff', borderWidth: 1.5, borderColor: 'transparent',
    },
    modalOptionActive: { borderColor: '#225ea7' },
    optionBadge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    optionBadgeText: { fontSize: 13, fontWeight: '700' },
});
