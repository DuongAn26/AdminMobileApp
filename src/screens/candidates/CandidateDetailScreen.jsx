import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Ban,
    Briefcase,
    Calendar,
    CheckCircle2,
    Download, Eye,
    FileText,
    Link2,
    Mail,
    MapPin,
    Navigation,
    Phone,
    Trash,
    User
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getCandidateById, getCandidates, toggleCandidateStatus } from '../../services/candidateService';

const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'experience', label: 'Kinh nghiệm' },
    { id: 'education', label: 'Học vấn' },
    { id: 'projects', label: 'Dự án' },
    { id: 'certificates', label: 'Chứng chỉ' },
    { id: 'applications', label: 'Ứng tuyển' },
    { id: 'resumes', label: 'CV/Resume' },
];

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams();
    const router  = useRouter();
    
    const [candidate, setCandidate] = useState(null);
    const [isActive, setIsActive]   = useState(true);
    const [toggling, setToggling]   = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCandidateById(id);
            setCandidate(data);
        } catch (e) {
            console.log('[CandidateDetail] fetch error:', e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchIsActive = async () => {
        try {
            const list = await getCandidates();
            const match = list.find(c => c.id.toString() === id.toString());
            if (match !== undefined) setIsActive(match.isActive !== false);
        } catch (e) {
            console.log('[CandidateDetail] fetch active error:', e.message);
        }
    };

    useEffect(() => {
        fetchDetail();
        fetchIsActive();
    }, [id]);

    const handleToggleStatus = async () => {
        const label = isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
        Alert.alert(
            'Xác nhận',
            `Bạn có chắc chắn muốn ${label.toLowerCase()} ứng viên này?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Hiện tại';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#225ea7" />
                    <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !candidate) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingWrap}>
                    <Text style={styles.errorText}>❌ {error || 'Không thể tải hồ sơ'}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail}>
                        <Text style={styles.retryBtnText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const initials = candidate.fullname?.split(' ').slice(-1)[0]?.[0]?.toUpperCase() || '?';

    // Helper render các tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                        <View style={styles.card}>
                            <InfoRow icon={Mail} value={candidate.email} />
                            <InfoRow icon={Phone} value={candidate.phone} />
                            <InfoRow icon={Calendar} value={candidate.dob ? formatDate(candidate.dob) : null} label="Ngày sinh" />
                            <InfoRow icon={User} value={candidate.gender} label="Giới tính" />
                            <InfoRow icon={MapPin} value={candidate.city} label="Thành phố" />
                            <InfoRow icon={Navigation} value={candidate.address} label="Địa chỉ" />
                            <InfoRow icon={Link2} value={candidate.personalLink} isLink />
                        </View>

                        {candidate.about_me && (
                            <>
                                <Text style={styles.sectionTitle}>Giới thiệu (About Me)</Text>
                                <View style={styles.card}>
                                    <Text style={styles.bodyText}>{candidate.about_me}</Text>
                                </View>
                            </>
                        )}

                        <Text style={styles.sectionTitle}>Thống kê hoạt động</Text>
                        <View style={styles.statsGrid}>
                            <StatBox value={candidate.stats?.totalApplications || 0} label="Đã ứng tuyển" />
                            <StatBox value={candidate.stats?.totalSavedJobs || 0} label="Việc đã lưu" />
                            <StatBox value={candidate.stats?.totalResumes || 0} label="CV đã tải lên" />
                            <StatBox value={formatDate(candidate.stats?.createdAt)} label="Ngày tham gia" />
                        </View>
                    </View>
                );
            case 'experience':
                return (
                    <View style={styles.section}>
                        {candidate.experiences?.length > 0 ? candidate.experiences.map((exp, i) => (
                            <View key={i} style={styles.card}>
                                <Text style={styles.cardTitle}>{exp.jobTitle}</Text>
                                <Text style={styles.cardSubtitle}>{exp.companyName}</Text>
                                <Text style={styles.dateText}>{formatDate(exp.startDate)} - {exp.isCurrent ? 'Hiện tại' : formatDate(exp.endDate)}</Text>
                                {exp.description && <Text style={styles.bodyText}>{exp.description}</Text>}
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có thông tin kinh nghiệm.</Text>}
                    </View>
                );
            case 'education':
                return (
                    <View style={styles.section}>
                        {candidate.educations?.length > 0 ? candidate.educations.map((edu, i) => (
                            <View key={i} style={styles.card}>
                                <Text style={styles.cardTitle}>{edu.major}</Text>
                                <Text style={styles.cardSubtitle}>{edu.schoolName}</Text>
                                <Text style={styles.dateText}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                                {edu.details && <Text style={styles.bodyText}>{edu.details}</Text>}
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có thông tin học vấn.</Text>}
                    </View>
                );
            case 'projects':
                return (
                    <View style={styles.section}>
                        {candidate.projects?.length > 0 ? candidate.projects.map((proj, i) => (
                            <View key={i} style={styles.card}>
                                <Text style={styles.cardTitle}>{proj.projectName}</Text>
                                <Text style={styles.cardSubtitle}>Vai trò: {proj.role}</Text>
                                <Text style={styles.techText}>Công nghệ: {proj.technologies}</Text>
                                {proj.description && <Text style={styles.bodyText}>{proj.description}</Text>}
                                {proj.projectUrl && (
                                    <TouchableOpacity style={styles.linkBtn}>
                                        <Link2 size={14} color="#225ea7" />
                                        <Text style={styles.linkBtnText}>Xem dự án</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có dự án nào.</Text>}
                    </View>
                );
            case 'certificates':
                return (
                    <View style={styles.section}>
                        {candidate.certificates?.length > 0 ? candidate.certificates.map((cert, i) => (
                            <View key={i} style={styles.card}>
                                <Text style={styles.cardTitle}>{cert.certificateName}</Text>
                                <Text style={styles.cardSubtitle}>Cấp bởi: {cert.provider}</Text>
                                <Text style={styles.dateText}>Ngày cấp: {formatDate(cert.issueDate)}</Text>
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có chứng chỉ nào.</Text>}
                    </View>
                );
            case 'applications':
                return (
                    <View style={styles.section}>
                        {candidate.applications?.length > 0 ? candidate.applications.map((app, i) => (
                            <View key={i} style={styles.card}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>{app.jobTitle}</Text>
                                        <Text style={styles.cardSubtitle}>{app.companyName}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, styles[`status_${app.status}`]]}>
                                        <Text style={[styles.statusBadgeText, styles[`statusText_${app.status}`]]}>
                                            {app.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.dateText}>Ngày nộp: {formatDate(app.applyDate)}</Text>
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có lịch sử ứng tuyển.</Text>}
                    </View>
                );
            case 'resumes':
                return (
                    <View style={styles.section}>
                        {candidate.resumes?.length > 0 ? candidate.resumes.map((cv, i) => (
                            <View key={i} style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
                                <FileText size={30} color="#225ea7" style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle}>{cv.title}</Text>
                                    <Text style={styles.dateText}>Đã tải lên: {formatDate(cv.uploadDate)}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={styles.actionIconBtn}><Eye size={18} color="#424751" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.actionIconBtn}><Download size={18} color="#225ea7" /></TouchableOpacity>
                                </View>
                            </View>
                        )) : <Text style={styles.emptyText}>Chưa có CV nào được tải lên.</Text>}
                    </View>
                );
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ ứng viên</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} stickyHeaderIndices={[2]}>
                
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>{candidate.fullname}</Text>
                    <Text style={styles.headline}>{candidate.headline || 'Ứng viên'}</Text>
                    
                    {/* Tags: YOE & Status */}
                    <View style={styles.badgeRow}>
                        <View style={styles.infoBadge}>
                            <Briefcase size={12} color="#fff" />
                            <Text style={styles.infoBadgeText}>{candidate.yearsOfExperience || 0} năm K/N</Text>
                        </View>
                        {candidate.openToWork && (
                            <View style={[styles.infoBadge, { backgroundColor: '#15803d' }]}>
                                <CheckCircle2 size={12} color="#fff" />
                                <Text style={styles.infoBadgeText}>Open to work</Text>
                            </View>
                        )}
                        {!isActive && (
                            <View style={[styles.infoBadge, { backgroundColor: '#b91c1c' }]}>
                                <Ban size={12} color="#fff" />
                                <Text style={styles.infoBadgeText}>Banned</Text>
                            </View>
                        )}
                    </View>

                    {/* Skills Tags */}
                    {candidate.skills?.length > 0 && (
                        <View style={styles.skillsWrapper}>
                            {candidate.skills.slice(0, 5).map((skill, index) => (
                                <View key={index} style={styles.skillTag}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                            {candidate.skills.length > 5 && <Text style={{color: '#fff', fontSize: 12}}>+{candidate.skills.length - 5}</Text>}
                        </View>
                    )}
                </View>

                {/* Tabs Header (Sticky) */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        {TABS.map(tab => (
                            <TouchableOpacity 
                                key={tab.id} 
                                style={[styles.tabItem, activeTab === tab.id && styles.tabActive]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tab Content */}
                <View style={styles.contentSection}>
                    {renderTabContent()}
                </View>
            </ScrollView>

            {/* Sticky Footer Actions for Admin */}
            <View style={styles.footer}>
                
                
                <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7}>
                    <Trash size={16} color="#b91c1c" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toggleBtn, isActive ? styles.toggleBtnBlock : styles.toggleBtnUnblock]}
                    onPress={handleToggleStatus} disabled={toggling} activeOpacity={0.85}
                >
                    {toggling ? <ActivityIndicator size="small" color="#ffffff" /> : (
                        <>
                            {isActive ? <Ban size={16} color="#ffffff" /> : <CheckCircle2 size={16} color="#ffffff" />}
                            <Text style={styles.toggleBtnText}>{isActive ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN'}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Sub-components
const InfoRow = ({ icon: Icon, value, label, isLink }) => {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <Icon size={16} color="#727782" strokeWidth={2} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                {label && <Text style={styles.infoLabel}>{label}</Text>}
                <Text style={[styles.infoValue, isLink && { color: '#225ea7', textDecorationLine: 'underline' }]}>
                    {value}
                </Text>
            </View>
        </View>
    );
};

const StatBox = ({ value, label }) => (
    <View style={styles.statBox}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f5f8' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: '#727782' },
    errorText: { color: '#dc2626', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#225ea7', borderRadius: 6, marginTop: 12 },
    retryBtnText: { color: '#fff', fontWeight: '600' },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#225ea7', marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    
    /* Hero Section */
    heroSection: {
        backgroundColor: '#225ea7', alignItems: 'center', paddingVertical: 24,
    },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    avatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
    headline: { fontSize: 14, color: '#e0e7ff', marginBottom: 12 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    infoBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    infoBadgeText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
    skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 20 },
    skillTag: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    skillText: { fontSize: 11, color: '#fff' },

    /* Tabs */
    tabContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e1e2e9' },
    tabScroll: { paddingHorizontal: 12 },
    tabItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#225ea7' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#727782' },
    tabTextActive: { color: '#225ea7' },

    /* Content */
    contentSection: { padding: 16 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#191c20', marginBottom: 12, marginLeft: 4 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    emptyText: { color: '#9ca3af', fontStyle: 'italic', fontSize: 13, textAlign: 'center', padding: 20 },
    
    /* Typography inside cards */
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#191c20', marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: '#225ea7', fontWeight: '600', marginBottom: 4 },
    dateText: { fontSize: 12, color: '#727782', marginBottom: 8 },
    techText: { fontSize: 12, fontStyle: 'italic', color: '#4d5f7d', marginBottom: 8 },
    bodyText: { fontSize: 13, color: '#424751', lineHeight: 20 },
    
    /* Info Row */
    infoRow: { flexDirection: 'row', marginBottom: 14 },
    infoLabel: { fontSize: 11, color: '#727782', textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#191c20', fontWeight: '500' },

    /* Stats Grid */
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statBox: {
        width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 12,
        alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
    },
    statValue: { fontSize: 20, fontWeight: '900', color: '#225ea7' },
    statLabel: { fontSize: 11, color: '#727782', marginTop: 4 },

    /* Application Status Badges */
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
    status_pending: { backgroundColor: '#fef08a' }, statusText_pending: { color: '#854d0e' },
    status_reviewing: { backgroundColor: '#dbeafe' }, statusText_reviewing: { color: '#1e40af' },
    status_accepted: { backgroundColor: '#dcfce7' }, statusText_accepted: { color: '#166534' },
    status_rejected: { backgroundColor: '#fee2e2' }, statusText_rejected: { color: '#991b1b' },

    /* Misc */
    linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    linkBtnText: { fontSize: 12, color: '#225ea7', fontWeight: '600' },
    actionIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },

    /* Footer Actions */
    footer: {
        flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#e1e2e9',
    },
    resetPassBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    deleteBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
    toggleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 12, height: 48,
    },
    toggleBtnBlock: { backgroundColor: '#dc2626' },
    toggleBtnUnblock: { backgroundColor: '#16a34a' },
    toggleBtnText: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
});