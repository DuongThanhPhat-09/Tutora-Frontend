import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, BookOpen, Filter, ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';
import { getParentBookings, type BookingResponseDTO } from '../../services/booking.service';
import styles from './styles.module.css';
import { Spin } from 'antd';
import { toast } from 'react-toastify';

// ===== TYPES =====

// ===== MOCK DATA REMOVED =====

// ===== HELPERS =====
const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_tutor', label: 'Chờ gia sư' },
  { key: 'accepted', label: 'Chờ đặt cọc' },
  { key: 'deposit_paid', label: 'Đã cọc (50%)' },
  { key: 'pending_remaining_payment', label: 'TT còn lại' },
  { key: 'active', label: 'Đang học' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_tutor: { label: 'Chờ gia sư', className: 'statusPending' },
  accepted: { label: 'Chờ đặt cọc', className: 'statusWarning' },
  deposit_paid: { label: 'Đã cọc (50%)', className: 'statusActive' },
  pending_remaining_payment: { label: 'TT còn lại', className: 'statusWarning' },
  active: { label: 'Đang học', className: 'statusActive' },
  completed: { label: 'Hoàn thành', className: 'statusCompleted' },
  cancelled: { label: 'Đã hủy', className: 'statusCancelled' },
  payment_timeout: { label: 'Hết hạn TT', className: 'statusCancelled' },
};

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPackage = (pkg: string) => {
  const map: Record<string, string> = {
    '4_sessions': '4 buổi',
    '8_sessions': '8 buổi',
    '12_sessions': '12 buổi',
  };
  return map[pkg] || pkg;
};

// ===== COMPONENT =====
const ParentBooking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 5;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getParentBookings({
        status: activeTab === 'all' ? undefined : activeTab,
        page: currentPage,
        pageSize: pageSize,
      });
      setBookings(res.content.items || []);
      setTotalItems(res.content.totalCount || 0);
    } catch {
      antMessage.error('Không thể tải danh sách đặt lịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = bookings;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>Quản lý các lịch đặt gia sư của bạn</p>
        </div>
        <button className={styles.newBookingBtn} type="button">
          <Plus size={18} />
          <span>Đặt gia sư mới</span>
        </button>
      </header>

      {/* Stats Strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.statIconBlue}>
            <BookOpen size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalItems}</span>
            <span className={styles.statLabel}>Tổng bookings</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.statIconGreen}>
            <Calendar size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{bookings.filter((b) => b.status === 'active').length}</span>
            <span className={styles.statLabel}>Đang học</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon + ' ' + styles.statIconAmber}>
            <Clock size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {bookings.filter((b) => b.status === 'pending_tutor' || b.status === 'pending_payment').length}
            </span>
            <span className={styles.statLabel}>Đang chờ</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        <Filter size={16} className={styles.filterIcon} />
        <div className={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(tab.key)}
              type="button"
            >
              {tab.label}
              {tab.key !== 'all' && activeTab === tab.key && (
                <span className={styles.tabCount}>
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <main className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" tip="Đang tải danh sách đặt lịch..." />
          </div>
        ) : paginated.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BookOpen size={48} />
            </div>
            <h3 className={styles.emptyTitle}>Chưa có booking nào</h3>
            <p className={styles.emptyText}>Hãy tìm gia sư phù hợp và đặt lịch học cho con bạn.</p>
            <button className={styles.emptyBtn} type="button">
              <Plus size={18} />
              <span>Đặt gia sư ngay</span>
            </button>
          </div>
        ) : (
          <>
            <div className={styles.bookingsList}>
              {paginated.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status] || {
                  label: booking.status,
                  className: 'statusPending',
                };
                return (
                  <div
                    key={booking.bookingId}
                    className={styles.bookingCard}
                    onClick={() => navigate(`/parent/booking/${booking.bookingId}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/parent/booking/${booking.bookingId}`)}
                  >
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardHeaderLeft}>
                        <div className={styles.tutorAvatar}>
                          {booking.tutor?.avatarUrl ? (
                            <img src={booking.tutor.avatarUrl} alt={booking.tutor?.fullName} />
                          ) : (
                            <span>{booking.tutor?.fullName?.charAt(0) || 'G'}</span>
                          )}
                        </div>
                        <div className={styles.cardTitleGroup}>
                          <h3 className={styles.cardTitle}>{booking.subject?.subjectName || 'N/A'}</h3>
                          <p className={styles.cardSubtitle}>
                            với {booking.tutor?.fullName || 'Gia sư'} • cho {booking.student?.fullName || 'Học sinh'}
                          </p>
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[statusCfg.className]}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <div className={styles.metaItem}>
                          <BookOpen size={14} />
                          <span>{formatPackage(booking.packageType)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>
                            {booking.schedule
                              .map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
                              .join(', ')}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <User size={14} />
                          <span>
                            {booking.student?.fullName || 'N/A'} ({booking.student?.gradeLevel || ''})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.priceGroup}>
                        {booking.discountApplied > 0 && (
                          <span className={styles.priceOriginal}>{formatPrice(booking.price)}</span>
                        )}
                        <span className={styles.priceFinal}>{formatPrice(booking.finalPrice)}</span>
                      </div>
                      <div className={styles.cardActions}>
                        {(booking.status === 'accepted' || booking.status === 'pending_payment') && (
                          <button
                            className={styles.actionBtnPrimary}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/parent/booking/${booking.bookingId}/payment`);
                            }}
                            type="button"
                          >
                            Thanh toán cọc
                          </button>
                        )}
                        {(booking.status === 'pending_remaining_payment' || booking.status === 'deposit_paid') && (
                          <button
                            className={styles.actionBtnPrimary}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/parent/booking/${booking.bookingId}/payment`);
                            }}
                            type="button"
                          >
                            Thanh toán nốt
                          </button>
                        )}
                        <span className={styles.cardDate}>{formatDate(booking.createdAt)}</span>
                        <button
                          className={styles.viewBtn}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/parent/booking/${booking.bookingId}`);
                          }}
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.pageInfo}>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ParentBooking;
