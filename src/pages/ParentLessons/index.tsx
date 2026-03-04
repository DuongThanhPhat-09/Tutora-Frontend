import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, AlertTriangle, CheckCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPendingLessons, type PendingLessonDto } from '../../services/parent-lesson.service';
import { Spin, Tag } from 'antd';
import { toast } from 'react-toastify';
import CountdownTimer from './components/CountdownTimer';

// ===== HELPERS =====
const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_confirmation', label: 'Chờ xác nhận' },
  { key: 'completed', label: 'Đã hoàn thành' },
  { key: 'disputed', label: 'Đang khiếu nại' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Đã lên lịch', color: '#1890ff' },
  checked_in: { label: 'Đang diễn ra', color: '#52c41a' },
  checked_out: { label: 'Chờ báo cáo', color: '#faad14' },
  pending_confirmation: { label: 'Chờ xác nhận', color: '#722ed1' },
  completed: { label: 'Hoàn thành', color: '#52c41a' },
  disputed: { label: 'Khiếu nại', color: '#ff4d4f' },
  cancelled: { label: 'Đã hủy', color: '#999' },
  no_show: { label: 'Vắng mặt', color: '#ff4d4f' },
};

// ===== COMPONENT =====
const ParentLessons = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [lessons, setLessons] = useState<PendingLessonDto[]>([]);
  const [allLessons, setAllLessons] = useState<PendingLessonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await getPendingLessons();
      const data = Array.isArray(response.content) ? response.content : ((response.content) as any)?.items || [];
      setAllLessons(data);
    } catch (error) {
      toast.error('Không thể tải danh sách buổi học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Filter by tab
  useEffect(() => {
    if (activeTab === 'all') {
      setLessons(allLessons);
    } else {
      setLessons(allLessons.filter(l => l.status === activeTab));
    }
    setCurrentPage(1);
  }, [activeTab, allLessons]);

  const totalPages = Math.max(1, Math.ceil(lessons.length / pageSize));
  const paginated = lessons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const stats = {
    total: allLessons.length,
    pending: allLessons.filter(l => l.status === 'pending_confirmation').length,
    completed: allLessons.filter(l => l.status === 'completed').length,
    disputed: allLessons.filter(l => l.status === 'disputed').length,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', minHeight: '100%' }}>
      {/* Coming Soon Overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 10, padding: '20px',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          padding: '48px 56px', borderRadius: '24px', background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(62,47,40,0.08)',
          boxShadow: '0 20px 60px rgba(26,34,56,0.12), 0 8px 20px rgba(26,34,56,0.06)',
          textAlign: 'center', maxWidth: '460px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a2238 0%, #3d4a3e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
          }}>🚀</div>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '24px',
            fontWeight: 700, color: '#1a2238', margin: 0, lineHeight: 1.3,
          }}>Chức năng đang được phát triển</h2>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '14px',
            fontWeight: 500, color: 'rgba(62,47,40,0.6)', margin: 0, lineHeight: 1.6,
          }}>
            Tính năng quản lý buổi học đang được hoàn thiện và sẽ sớm được cập nhật.
            Cảm ơn bạn đã kiên nhẫn chờ đợi!
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '9999px', backgroundColor: '#f2f0e4',
            border: '1px solid rgba(62,47,40,0.1)', fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px',
            textTransform: 'uppercase', color: '#1a2238',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3d4a3e',
            }}></span>
            Đang phát triển
          </div>
        </div>
      </div>

      {/* Blurred original content */}
      <div style={{ filter: 'blur(6px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
        {/* Header */}
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a2238', marginBottom: '4px' }}>
            Buổi học của tôi
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Theo dõi và quản lý các buổi học</p>
        </header>

        {/* Stats Strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px',
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(26,34,56,0.06)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#1890ff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2238' }}>{stats.total}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Tổng buổi học</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(26,34,56,0.06)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f9f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#722ed1" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2238' }}>{stats.pending}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Chờ xác nhận</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(26,34,56,0.06)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#52c41a" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2238' }}>{stats.completed}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Hoàn thành</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(26,34,56,0.06)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#ff4d4f" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2238' }}>{stats.disputed}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Khiếu nại</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fff', borderRadius: '12px', padding: '8px 12px',
          marginBottom: '20px', border: '1px solid rgba(26,34,56,0.06)',
        }}>
          <Filter size={16} color="#999" />
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 400,
                  background: activeTab === tab.key ? '#1a2238' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#666',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            Không có buổi học nào
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginated.map((lesson) => {
              const status = STATUS_CONFIG[lesson.status || ''] || { label: lesson.status || 'N/A', color: '#999' };
              const startTime = new Date(lesson.scheduledStart);
              const endTime = new Date(lesson.scheduledEnd);

              return (
                <div
                  key={lesson.lessonId}
                  onClick={() => navigate(`/parent-portal/lessons/${lesson.lessonId}`)}
                  style={{
                    background: '#fff', borderRadius: '12px', padding: '16px 20px',
                    border: '1px solid rgba(26,34,56,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Date block */}
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '10px',
                      background: '#f2f0e4', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a2238', lineHeight: 1 }}>
                        {startTime.getDate()}
                      </span>
                      <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                        {startTime.toLocaleDateString('vi-VN', { month: 'short' })}
                      </span>
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a2238', marginBottom: '4px' }}>
                        {lesson.subjectName || 'Buổi học'}
                        {lesson.tutorName && <span style={{ fontWeight: 400, color: '#666' }}> - {lesson.tutorName}</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {startTime.toLocaleDateString('vi-VN', { weekday: 'long' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {lesson.confirmDeadline && lesson.status === 'pending_confirmation' && (
                      <CountdownTimer deadline={lesson.confirmDeadline} />
                    )}
                    <Tag color={status.color} style={{ margin: 0, borderRadius: '6px' }}>
                      {status.label}
                    </Tag>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
            marginTop: '24px',
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px', borderRadius: '8px', border: '1px solid #e8e8e8',
                background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', color: '#666' }}>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px', borderRadius: '8px', border: '1px solid #e8e8e8',
                background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div> {/* end blurredContent */}
    </div>
  );
};

export default ParentLessons;
