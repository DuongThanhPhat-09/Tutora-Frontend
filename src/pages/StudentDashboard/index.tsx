/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import {
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getStudentPendingLessons, getStudentCalendar, getStudentBookings, getStudentLessons } from '../../services/student-lesson.service';
import { getUserInfoFromToken } from '../../services/auth.service';
import styles from './styles.module.css';

const StudentDashboard = () => {
  const [lessons, setLessons] = useState<any[]>([]);         // all lessons
  const [pendingLessons, setPendingLessons] = useState<any[]>([]); // pending only
  const [bookings, setBookings] = useState<any[]>([]);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(dayjs());

  const userInfo = getUserInfoFromToken();
  const userName = userInfo?.fullname || userInfo?.email?.split('@')[0] || 'bạn';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [calendarMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allLessonsRes, pendingLessonsRes, bookingsRes] = await Promise.allSettled([
        getStudentLessons({ page: 1, pageSize: 50 }),
        getStudentPendingLessons(),
        getStudentBookings({ page: 1, pageSize: 10 }),
      ]);

      if (allLessonsRes.status === 'fulfilled') {
        const data = allLessonsRes.value.content;
        const items = Array.isArray(data) ? data : (data as any)?.items || [];
        setLessons(items);
      }
      if (pendingLessonsRes.status === 'fulfilled') {
        setPendingLessons(Array.isArray(pendingLessonsRes.value.content) ? pendingLessonsRes.value.content : []);
      }
      if (bookingsRes.status === 'fulfilled') {
        const b = bookingsRes.value.content;
        const allBookings = Array.isArray(b) ? b : (b as any)?.items || [];
        const activeBookings = allBookings.filter((bk: any) =>
          !['cancelled', 'rejected', 'expired'].includes(bk.status?.toLowerCase())
        );
        setBookings(activeBookings);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const start = calendarMonth.startOf('month').format('YYYY-MM-DD');
      const end = calendarMonth.endOf('month').format('YYYY-MM-DD');
      const res = await getStudentCalendar(start, end);
      setCalendarDays(Array.isArray(res.content) ? res.content : []);
    } catch {
      // silently fail
    }
  };

  // Derived stats
  const totalBookings = bookings.length;
  const totalLessons = lessons.length;
  // Đếm cả lessons pending + bookings cần hành động (chờ thanh toán, đã cọc)
  const pendingCount = pendingLessons.length + bookings.filter((bk: any) =>
    ['pending_payment', 'deposit_paid', 'pending_confirmation'].includes(bk.status?.toLowerCase())
  ).length;
  const completedCount = lessons.filter((l: any) => l.status === 'completed').length;

  // Today's lessons
  const today = dayjs().format('YYYY-MM-DD');
  const todayLessons = lessons.filter((l: any) => {
    const d = l.scheduledStartTime || l.scheduledStart;
    return d && dayjs(d).format('YYYY-MM-DD') === today;
  });

  // Calendar helpers
  const calendarLessonDates = new Set(
    calendarDays
      .filter((d: any) => d.hasLesson || (d.lessons && d.lessons.length > 0))
      .map((d: any) => d.date)
  );

  const renderCalendar = () => {
    const startOfMonth = calendarMonth.startOf('month');
    const daysInMonth = calendarMonth.daysInMonth();
    const startDow = startOfMonth.day(); // 0=Sun
    const todayStr = dayjs().format('YYYY-MM-DD');

    const cells = [];
    // Empty cells before month starts
    for (let i = 0; i < startDow; i++) {
      cells.push(<div key={`e-${i}`} className={styles.calendarDay}></div>);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = calendarMonth.date(d).format('YYYY-MM-DD');
      const isToday = dateStr === todayStr;
      const hasLesson = calendarLessonDates.has(dateStr);
      const cls = [styles.calendarDay];
      if (isToday) cls.push(styles.today);
      if (hasLesson) cls.push(styles.hasLesson);

      cells.push(
        <div key={d} className={cls.join(' ')}>
          {d}
        </div>
      );
    }
    return cells;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.dashboardGrid}>
        {/* ===== LEFT: MAIN CONTENT ===== */}
        <div className={styles.mainContent}>
          {/* Greeting */}
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>
              Nâng cao <em>hiệu suất</em>,{' '}
              {userName}.
            </h1>
            <p className={styles.greetingSubtitle}>
              Chào mừng bạn quay lại hệ thống Tutora.
            </p>
          </div>

          {/* Metric Cards */}
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.bookings}`}>
                <BookOpen size={20} />
              </div>
              <div>
                <div className={styles.metricLabel}>Booking</div>
                <div className={styles.metricValue}>{totalBookings}</div>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.lessons}`}>
                <GraduationCap size={20} />
              </div>
              <div>
                <div className={styles.metricLabel}>Buổi học</div>
                <div className={styles.metricValue}>{totalLessons}</div>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.pending}`}>
                <Clock size={20} />
              </div>
              <div>
                <div className={styles.metricLabel}>Chờ xác nhận</div>
                <div className={styles.metricValue}>{pendingCount}</div>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.completed}`}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className={styles.metricLabel}>Hoàn thành</div>
                <div className={styles.metricValue}>{completedCount}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <Link to="/student-portal/booking" className={styles.quickActionBtn}>
              <div className={styles.quickActionIcon} style={{ background: 'rgba(79, 209, 197, 0.1)', color: '#4FD1C5' }}>
                <BookOpen size={18} />
              </div>
              Đặt lịch học
            </Link>
            <Link to="/student-portal/lessons" className={styles.quickActionBtn}>
              <div className={styles.quickActionIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                <GraduationCap size={18} />
              </div>
              Buổi học
            </Link>
            <Link to="/student-portal/calendar" className={styles.quickActionBtn}>
              <div className={styles.quickActionIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <CalendarDays size={18} />
              </div>
              Thời khóa biểu
            </Link>
          </div>

          {/* Pending Lessons Section */}
          <div>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Buổi học gần đây</h3>
              <Link to="/student-portal/lessons" className={styles.sectionLink}>
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.pendingList}>
              {lessons.length === 0 ? (
                <div className={styles.emptyState}>Chưa có buổi học nào</div>
              ) : (
                lessons.slice(0, 5).map((lesson: any, idx: number) => {
                  const statusClass = lesson.status === 'pending_confirmation' ? styles.pending_confirmation :
                    lesson.status === 'completed' ? styles.completed : styles.scheduled;
                  const startTime = lesson.scheduledStartTime || lesson.scheduledStart;

                  return (
                    <Link
                      to={`/student-portal/lessons/${lesson.lessonId}`}
                      key={lesson.lessonId || idx}
                      className={styles.pendingItem}
                    >
                      <div className={`${styles.pendingItemIcon} ${statusClass}`}>
                        <GraduationCap size={18} />
                      </div>
                      <div className={styles.pendingItemBody}>
                        <div className={styles.pendingItemTitle}>
                          {lesson.subjectName || `Buổi học #${lesson.lessonId}`}
                        </div>
                        <div className={styles.pendingItemMeta}>
                          {lesson.tutorName || 'Gia sư'} • {startTime ? dayjs(startTime).format('DD/MM HH:mm') : 'N/A'}
                        </div>
                      </div>
                      {lesson.status === 'pending_confirmation' && (
                        <span className={`${styles.pendingBadge} ${styles.confirm}`}>
                          XÁC NHẬN
                        </span>
                      )}
                      {lesson.status === 'scheduled' && (
                        <span className={`${styles.pendingBadge} ${styles.urgent}`}>
                          SẮP TỚI
                        </span>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Bookings Section */}
          {bookings.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Booking của bạn</h3>
                <Link to="/student-portal/booking" className={styles.sectionLink}>
                  Tất cả booking <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.bookingCards}>
                {bookings.slice(0, 4).map((booking: any, idx: number) => {
                  const colors = ['#1A2130', '#7C3AED', '#DC2626', '#0891B2'];
                  const bgColors = ['rgba(26,33,48,0.08)', 'rgba(124,58,237,0.08)', 'rgba(220,38,38,0.08)', 'rgba(8,145,178,0.08)'];
                  const subjectName = booking.subject?.subjectName || `Booking #${booking.bookingId}`;
                  const tutorName = booking.tutor?.fullName || 'N/A';
                  const statusLabel = booking.status === 'confirmed' ? 'Đã xác nhận'
                    : booking.status === 'pending_payment' ? 'Chờ thanh toán'
                      : booking.status === 'deposit_paid' ? 'Đã cọc 50%'
                        : booking.status === 'completed' ? 'Hoàn thành'
                          : booking.status || '';

                  return (
                    <Link
                      to={`/student-portal/booking/${booking.bookingId}`}
                      key={booking.bookingId || idx}
                      className={styles.bookingCard}
                    >
                      <div className={styles.bookingCardHeader}>
                        <div
                          className={styles.bookingCardIcon}
                          style={{ background: bgColors[idx % 4], color: colors[idx % 4] }}
                        >
                          <BookOpen size={20} />
                        </div>
                        <div className={styles.bookingCardInfo}>
                          <div className={styles.bookingCardMastery}>{statusLabel}</div>
                          <div className={styles.bookingCardMasteryValue}>{booking.sessionCount || 0} buổi</div>
                        </div>
                      </div>
                      <div className={styles.bookingCardTitle}>
                        {subjectName}
                      </div>
                      <div className={styles.bookingCardTutor}>
                        Gia sư: {tutorName}
                      </div>
                      <div className={styles.bookingCardProgress}>
                        <div
                          className={styles.bookingCardProgressBar}
                          style={{ width: booking.paymentStatus === 'fully_paid' ? '100%' : booking.paymentStatus === 'deposit_paid' ? '50%' : '0%', background: colors[idx % 4] }}
                        />
                      </div>
                      <div className={styles.bookingCardFooter}>
                        <span>{Intl.NumberFormat('vi-VN').format(booking.finalPrice || 0)}đ</span>
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className={styles.rightSidebar}>
          {/* Mini Calendar */}
          <div className={styles.calendarWidget}>
            <div className={styles.calendarHeader}>
              <span className={styles.calendarMonthTitle}>
                {calendarMonth.format('MMMM YYYY')}
              </span>
              <div className={styles.calendarNav}>
                <button
                  className={styles.calendarNavBtn}
                  onClick={() => setCalendarMonth(calendarMonth.subtract(1, 'month'))}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className={styles.calendarNavBtn}
                  onClick={() => setCalendarMonth(calendarMonth.add(1, 'month'))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className={styles.calendarGrid}>
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                <div key={d} className={styles.calendarDayLabel}>{d}</div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className={styles.scheduleWidget}>
            <div className={styles.scheduleTitle}>Lịch hôm nay</div>
            <div className={styles.scheduleList}>
              {todayLessons.length === 0 ? (
                <div className={styles.emptyState}>
                  Không có buổi học nào hôm nay
                </div>
              ) : (
                todayLessons.map((lesson: any, idx: number) => {
                  const startTime = lesson.scheduledStartTime || lesson.scheduledStart;
                  const endTime = lesson.scheduledEndTime || lesson.scheduledEnd;
                  const isNow = startTime && endTime && dayjs().isAfter(dayjs(startTime)) && dayjs().isBefore(dayjs(endTime));

                  return (
                    <div
                      key={lesson.lessonId || idx}
                      className={`${styles.scheduleItem} ${isNow ? styles.active : ''}`}
                    >
                      <div className={styles.scheduleItemHeader}>
                        <span className={styles.scheduleItemName}>
                          {lesson.subjectName || `Buổi #${lesson.lessonId}`}
                        </span>
                        <span className={styles.scheduleItemTime}>
                          {isNow ? 'Đang diễn ra' : startTime ? dayjs(startTime).format('HH:mm') : ''}
                        </span>
                      </div>
                      <div className={styles.scheduleItemTutor}>
                        {lesson.tutorName || 'Gia sư'}
                      </div>
                      <div className={styles.scheduleItemTimeRange}>
                        <Clock size={12} />
                        {startTime ? dayjs(startTime).format('HH:mm') : ''} - {endTime ? dayjs(endTime).format('HH:mm') : ''}
                      </div>
                      {isNow && lesson.meetingLink && (
                        <a
                          href={lesson.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.joinBtn}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Tham gia buổi học
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
