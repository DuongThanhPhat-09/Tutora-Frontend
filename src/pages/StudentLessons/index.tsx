/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { Spin } from 'antd';
import { getStudentLessons } from '../../services/student-lesson.service';
import s from '../StudentPages.module.css';

const TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'scheduled', label: 'Lên lịch' },
    { key: 'pending_confirmation', label: 'Chờ xác nhận' },
    { key: 'completed', label: 'Hoàn thành' },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    scheduled: { label: 'Đã lên lịch', cls: s.scheduled },
    pending_confirmation: { label: 'Chờ xác nhận', cls: s.pending },
    completed: { label: 'Hoàn thành', cls: s.completed },
    cancelled: { label: 'Đã hủy', cls: s.cancelled },
};

const StudentLessons = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchLessons(activeTab, page);
    }, [activeTab, page]);

    const fetchLessons = async (tab: string, currentPage: number) => {
        try {
            setLoading(true);
            const res = await getStudentLessons({
                page: currentPage,
                pageSize,
                status: tab || undefined
            });
            setLessons(res.content?.items || []);
            setTotalCount(res.content?.totalCount || 0);
        } catch {
            setLessons([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return (
        <div className={s.page}>
            {/* Top Bar */}
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1 className={s.pageTitle}>Buổi học</h1>
                    <p className={s.pageSubtitle}>Theo dõi và quản lý buổi học của bạn</p>
                </div>
            </div>

            {/* Main Content */}
            <div className={s.mainContent}>
                <div className={s.contentPanel}>
                    {/* Tabs */}
                    <div className={s.tabBar}>
                        <div className={s.tabGroup}>
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    className={`${s.tab} ${activeTab === t.key ? s.active : ''}`}
                                    onClick={() => { setActiveTab(t.key); setPage(1); }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className={s.loadingCenter}><Spin size="large" /></div>
                    ) : lessons.length === 0 ? (
                        <div className={s.emptyState}>
                            <div className={s.emptyStateIcon}>📖</div>
                            <div className={s.emptyStateText}>Chưa có buổi học nào</div>
                            <div className={s.emptyStateSub}>Buổi học sẽ xuất hiện khi booking được xác nhận</div>
                        </div>
                    ) : (
                        <>
                            <div className={s.cardList}>
                                {lessons.map((lesson: any, idx: number) => {
                                    const st = STATUS_MAP[lesson.status] || { label: lesson.status, cls: '' };
                                    const startTime = lesson.scheduledStartTime || lesson.scheduledStart;
                                    const iconColor = lesson.status === 'pending_confirmation'
                                        ? { bg: 'rgba(245,158,11,0.08)', fg: '#d97706' }
                                        : lesson.status === 'completed'
                                            ? { bg: 'rgba(16,185,129,0.08)', fg: '#059669' }
                                            : { bg: 'rgba(99,102,241,0.08)', fg: '#6366F1' };

                                    return (
                                        <div
                                            key={lesson.lessonId || idx}
                                            className={s.card}
                                            onClick={() => navigate(`/student/lessons/${lesson.lessonId}`)}
                                        >
                                            <div
                                                className={s.cardIcon}
                                                style={{ background: iconColor.bg, color: iconColor.fg }}
                                            >
                                                <GraduationCap size={20} />
                                            </div>
                                            <div className={s.cardBody}>
                                                <div className={s.cardTitle}>
                                                    {lesson.subjectName || `Buổi học #${lesson.lessonId}`}
                                                </div>
                                                <div className={s.cardMeta}>
                                                    <Clock size={12} />
                                                    {startTime ? dayjs(startTime).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                                    <span>•</span>
                                                    {lesson.tutorName || 'Gia sư'}
                                                </div>
                                            </div>
                                            <div className={s.cardRight}>
                                                <span className={`${s.badge} ${st.cls}`}>{st.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className={s.pagination}>
                                    <button className={s.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className={s.paginationInfo}>{page}/{totalPages}</span>
                                    <button className={s.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLessons;
