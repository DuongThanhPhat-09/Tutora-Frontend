/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, User, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { getStudentLessonDetail, confirmStudentLesson } from '../../services/student-lesson.service';
import type { LessonDetailDto } from '../../services/lesson.service';
import { message as antMessage, Spin, Modal } from 'antd';
import CreateFeedbackModal from '../ParentLessons/components/CreateFeedbackModal';
import s from '../StudentPages.module.css';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    scheduled: { label: 'Đã lên lịch', cls: s.scheduled },
    checked_in: { label: 'Đang diễn ra', cls: s.active },
    checked_out: { label: 'Chờ báo cáo', cls: s.pending },
    pending_confirmation: { label: 'Chờ xác nhận', cls: s.pending },
    completed: { label: 'Hoàn thành', cls: s.completed },
    cancelled: { label: 'Đã hủy', cls: s.cancelled },
};

const formatDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatPrice = (amount: number | undefined) =>
    amount != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : 'N/A';

const StudentLessonDetail = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<LessonDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!lessonId) return;
        try {
            setLoading(true);
            const response = await getStudentLessonDetail(parseInt(lessonId));
            setLesson(response.content);
        } catch {
            antMessage.error('Không thể tải chi tiết buổi học');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleConfirm = async () => {
        if (!lessonId) return;
        try {
            setConfirming(true);
            await confirmStudentLesson(parseInt(lessonId));
            antMessage.success('Xác nhận buổi học thành công!');
            setShowConfirmModal(false);
            fetchDetail();
        } catch (error: any) {
            antMessage.error(error.response?.data?.message || 'Không thể xác nhận buổi học');
        } finally {
            setConfirming(false);
        }
    };

    const handleActionSuccess = () => {
        setShowConfirmModal(false);
        setShowFeedbackModal(false);
        fetchDetail();
    };

    if (loading) {
        return <div className={s.studentPage}><div className={s.loadingCenter}><Spin size="large" /></div></div>;
    }

    if (!lesson) {
        return <div className={s.studentPage}><div className={s.emptyState}>Không tìm thấy buổi học</div></div>;
    }

    const status = STATUS_MAP[lesson.status || ''] || { label: lesson.status || 'N/A', cls: '' };

    return (
        <div className={s.studentPage} style={{ maxWidth: '900px' }}>
            {/* Back */}
            <button className={s.backBtn} onClick={() => navigate('/student/lessons')}>
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            {/* Header Panel */}
            <div className={s.detailPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h1 className={s.detailTitle}>{(lesson as any).subjectName || 'Buổi học'}</h1>
                        <p className={s.detailSubtitle}>Lesson #{lesson.lessonId} • Booking #{lesson.bookingId}</p>
                    </div>
                    <span className={`${s.badge} ${status.cls}`} style={{ fontSize: '13px', padding: '5px 14px' }}>
                        {status.label}
                    </span>
                </div>

                <div className={s.detailGrid}>
                    <div className={s.detailItem}>
                        <Clock size={16} className={s.detailItemIcon} />
                        <div>
                            <div className={s.detailItemLabel}>Bắt đầu</div>
                            <div className={s.detailItemValue}>{formatDateTime(lesson.scheduledStart)}</div>
                        </div>
                    </div>
                    <div className={s.detailItem}>
                        <Clock size={16} className={s.detailItemIcon} />
                        <div>
                            <div className={s.detailItemLabel}>Kết thúc</div>
                            <div className={s.detailItemValue}>{formatDateTime(lesson.scheduledEnd)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Info Panel */}
            <div className={s.detailPanel}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A2130', marginBottom: '16px' }}>Chi tiết buổi học</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(lesson as any).tutorName && (
                        <div className={s.detailItem}>
                            <User size={16} className={s.detailItemIcon} />
                            <div>
                                <div className={s.detailItemLabel}>Gia sư</div>
                                <div className={s.detailItemValue}>{(lesson as any).tutorName}</div>
                            </div>
                        </div>
                    )}
                    {lesson.lessonContent && (
                        <div className={s.detailItem}>
                            <BookOpen size={16} className={s.detailItemIcon} />
                            <div>
                                <div className={s.detailItemLabel}>Nội dung</div>
                                <div className={s.detailItemValue}>{lesson.lessonContent}</div>
                            </div>
                        </div>
                    )}
                    {lesson.homework && (
                        <div className={s.detailItem}>
                            <AlertCircle size={16} style={{ color: '#F59E0B' }} />
                            <div>
                                <div className={s.detailItemLabel}>Bài tập về nhà</div>
                                <div className={s.detailItemValue}>{lesson.homework}</div>
                            </div>
                        </div>
                    )}
                    {lesson.meetingLink && (
                        <div className={s.detailItem}>
                            <MapPin size={16} className={s.detailItemIcon} />
                            <div>
                                <div className={s.detailItemLabel}>Link buổi học</div>
                                <a href={lesson.meetingLink} target="_blank" rel="noreferrer"
                                    style={{ fontSize: '14px', color: '#4FD1C5', fontWeight: 500 }}>
                                    Tham gia buổi học online →
                                </a>
                            </div>
                        </div>
                    )}
                    {lesson.lessonPrice != null && (
                        <div className={s.detailItem}>
                            <CheckCircle size={16} style={{ color: '#10B981' }} />
                            <div>
                                <div className={s.detailItemLabel}>Giá buổi học</div>
                                <div className={s.detailItemValue}>{formatPrice(lesson.lessonPrice)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Section */}
            {(lesson as any).report && (
                <div className={s.detailPanel}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1A2130', marginBottom: '16px' }}>Báo cáo gia sư</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#1A2130' }}>
                        {(lesson as any).report.contentCovered && (
                            <div><span style={{ color: '#8C8C8C' }}>Nội dung đã dạy:</span> {(lesson as any).report.contentCovered}</div>
                        )}
                        {(lesson as any).report.homeworkAssigned && (
                            <div><span style={{ color: '#8C8C8C' }}>Bài tập giao:</span> {(lesson as any).report.homeworkAssigned}</div>
                        )}
                        {(lesson as any).report.studentPerformanceRating != null && (
                            <div><span style={{ color: '#8C8C8C' }}>Đánh giá:</span> {(lesson as any).report.studentPerformanceRating}/5</div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirm & Feedback Action */}
            {(lesson.status === 'pending_confirmation' || lesson.status === 'completed') && (
                <div className={s.actionBar}>
                    <div>
                        <div className={s.actionBarText}>
                            {lesson.status === 'pending_confirmation' ? 'Xác nhận buổi học' : 'Đánh giá buổi học'}
                        </div>
                        <div className={s.actionBarSub}>
                            {lesson.status === 'pending_confirmation'
                                ? 'Xác nhận để hoàn tất thanh toán cho gia sư'
                                : 'Đánh giá để giúp gia sư cải thiện chất lượng giảng dạy'}
                        </div>
                    </div>
                    {lesson.status === 'pending_confirmation' ? (
                        <button className={s.actionBtn} onClick={() => setShowConfirmModal(true)}>
                            Xác nhận ngay
                        </button>
                    ) : (
                        <button className={s.actionBtn} onClick={() => setShowFeedbackModal(true)} style={{ background: '#3e2f28' }}>
                            Đánh giá buổi học
                        </button>
                    )}
                </div>
            )}

            {/* Confirm Modal */}
            <Modal
                title="Xác nhận buổi học"
                open={showConfirmModal}
                onOk={handleConfirm}
                onCancel={() => setShowConfirmModal(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                confirmLoading={confirming}
            >
                <p>Bạn có chắc chắn muốn xác nhận buổi học #{lesson.lessonId}?</p>
                <p>Tiền sẽ được chuyển cho gia sư sau khi xác nhận.</p>
            </Modal>

            <CreateFeedbackModal
                open={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSuccess={handleActionSuccess}
                lessonId={lesson.lessonId}
                bookingId={lesson.bookingId || 0}
                tutorId={(lesson as any).tutorId || (lesson as any).tutor?.tutorId}
                tutorName={(lesson as any).tutorName || (lesson as any).tutor?.fullName}
                subjectName={(lesson as any).subjectName || (lesson as any).subject?.subjectName}
            />
        </div>
    );
};

export default StudentLessonDetail;
