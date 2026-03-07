import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Popconfirm, Spin, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/vi';
import styles from '../../styles/pages/tutor-portal-schedule.module.css';
import { AddAvailabilityModal, EditAvailabilityModal } from './components';
import { getAvailability, deleteAvailability, DAY_OF_WEEK_MAP } from '../../services/availability.service';
import type { AvailabilitySlot } from '../../services/availability.service';
import { getUserIdFromToken } from '../../services/auth.service';
import { getTutorCalendar } from '../../services/lesson.service';
import type { CalendarDay, CalendarLesson } from '../../services/lesson.service';

// Mở rộng dayjs với các plugin
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.locale('vi');

// Biểu tượng
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 3V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M11 5L7 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 5L11 9L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Interface cục bộ để hiển thị (ánh xạ từ phản hồi API)
// MERGED: Dùng startMinutes + durationMinutes từ develop để hỗ trợ slot giữa giờ (7:30, 8:15...)
interface LocalAvailabilitySlot {
    id: number;
    dayOfWeek: number;  // 1-7 cho tuần ISO (Thứ Hai=1, Chủ Nhật=7)
    startHour: number;
    startMinutes: number; // Tổng số phút từ 00:00 (VD: 7:30 = 450)
    durationMinutes: number; // Thời lượng theo phút
    apiId: number;  // Original API availabilityid
    startTime: string;
    endTime: string;
    apiDayOfWeek: number;  // dayofweek gốc từ API (0-6, Chủ Nhật=0)
}

// Interface dữ liệu modal chỉnh sửa
interface EditAvailabilityData {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// Hằng số
const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => i); // 0:00 đến 23:00
const DEFAULT_ROW_HEIGHT = 70; // px mặc định cho mỗi hàng giờ
const MIN_ROW_HEIGHT = 30;
const MAX_ROW_HEIGHT = 150;
const ZOOM_STEP = 20;

// Zoom icons
const ZoomInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);
const ZoomOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

// Hàm trợ giúp: Chuyển đổi API dayofweek (0-6) sang ISO week day (1-7)
// API: 0=Chủ Nhật, 1=Thứ Hai, 2=Thứ Ba, 3=Thứ Tư, 4=Thứ Năm, 5=Thứ Sáu, 6=Thứ Bảy
// ISO: 1=Thứ Hai, 2=Thứ Ba, 3=Thứ Tư, 4=Thứ Năm, 5=Thứ Sáu, 6=Thứ Bảy, 7=Chủ Nhật
const apiDayToIsoDay = (apiDay: number): number => {
    if (apiDay === 0) return 7;  // Chủ Nhật -> ISO 7
    return apiDay;  // Thứ Hai=1, Thứ Ba=2, v.v. (giống như API)
};

// Hàm trợ giúp: Phân tích chuỗi thời gian thành giờ
const parseTimeToHour = (timeStr: string): number => {
    const [hours] = timeStr.split(':').map(Number);
    return hours;
};

// Hàm trợ giúp: Phân tích chuỗi thời gian thành tổng số phút từ 00:00
const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
};

// Hàm trợ giúp: Tính thời lượng theo phút
const calculateDurationMinutes = (startTime: string, endTime: string): number => {
    return parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
};

const TutorPortalSchedule: React.FC = () => {
    // FROM MILESTONE_3: 2 tabs - settings (lịch rảnh) + lessons (lịch dạy)
    const [activeTab, setActiveTab] = useState<'settings' | 'lessons'>('lessons');
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [availability, setAvailability] = useState<LocalAvailabilitySlot[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isAddAvailabilityModalOpen, setIsAddAvailabilityModalOpen] = useState(false);
    const [isEditAvailabilityModalOpen, setIsEditAvailabilityModalOpen] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState<EditAvailabilityData | null>(null);
    const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);

    // FROM MILESTONE_3: State cho lessons tab
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);

    // Flatten calendar data into lessons array for the lessons tab grid
    const lessons: CalendarLesson[] = useMemo(() => {
        return calendarData.flatMap(day => day.lessons || []);
    }, [calendarData]);

    // Zoom state
    const [rowHeight, setRowHeight] = useState(DEFAULT_ROW_HEIGHT);
    const pxPerMinute = rowHeight / 60;

    const handleZoomIn = () => setRowHeight(prev => Math.min(prev + ZOOM_STEP, MAX_ROW_HEIGHT));
    const handleZoomOut = () => setRowHeight(prev => Math.max(prev - ZOOM_STEP, MIN_ROW_HEIGHT));
    const handleZoomReset = () => setRowHeight(DEFAULT_ROW_HEIGHT);

    // Lấy các ngày hiển thị dựa trên viewMode
    const displayDates = useMemo(() => {
        if (viewMode === 'day') {
            return [currentDate];
        }
        // week mode (default)
        const startOfWeek = currentDate.startOf('isoWeek');
        return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    }, [currentDate, viewMode]);

    // Lấy dữ liệu cho month view
    const monthCalendarData = useMemo(() => {
        if (viewMode !== 'month') return [];
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDay = startOfMonth.startOf('isoWeek');
        const endDay = endOfMonth.endOf('isoWeek');
        const days: Dayjs[] = [];
        let day = startDay;
        while (day.isBefore(endDay) || day.isSame(endDay, 'day')) {
            days.push(day);
            day = day.add(1, 'day');
        }
        return days;
    }, [currentDate, viewMode]);

    // Định dạng tiêu đề ngày/tuần/tháng
    const dateRangeText = useMemo(() => {
        if (viewMode === 'day') {
            return currentDate.format('DD MMMM, YYYY');
        }
        if (viewMode === 'month') {
            return currentDate.format('MMMM YYYY');
        }
        // week
        const start = displayDates[0];
        const end = displayDates[6];
        if (start.month() === end.month()) {
            return `${start.format('DD')} - ${end.format('DD MMM, YYYY')}`;
        }
        return `${start.format('DD MMM')} - ${end.format('DD MMM, YYYY')}`;
    }, [currentDate, displayDates, viewMode]);

    // Lấy lịch rảnh từ API
    // MERGED: Dùng minutes precision từ develop
    const fetchAvailability = useCallback(async () => {
        const userId = getUserIdFromToken();

        if (!userId) {
            return;
        }

        setIsLoadingAvailability(true);
        try {
            const response = await getAvailability(userId);

            // Ánh xạ phản hồi API sang định dạng cục bộ (dùng phút cho chính xác)
            const mappedAvailability: LocalAvailabilitySlot[] = (response.content || []).map((slot: AvailabilitySlot, index: number) => ({
                id: index + 1,
                dayOfWeek: apiDayToIsoDay(slot.dayofweek),
                startHour: parseTimeToHour(slot.starttime),
                startMinutes: parseTimeToMinutes(slot.starttime),
                durationMinutes: calculateDurationMinutes(slot.starttime, slot.endtime),
                apiId: slot.availabilityid,
                startTime: slot.starttime,
                endTime: slot.endtime,
                apiDayOfWeek: slot.dayofweek,
            }));

            setAvailability(mappedAvailability);
        } catch (error: unknown) {
            // Không hiển thị thông báo lỗi nếu 404 (chưa có lịch rảnh)
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status !== 404) {
                toast.error('Không thể tải lịch rảnh. Vui lòng thử lại.');
            }
        } finally {
            setIsLoadingAvailability(false);
        }
    }, []);

    // FETCH CALENDAR FOR LESSONS TAB
    const fetchCalendar = useCallback(async () => {
        setIsLoadingLessons(true);
        try {
            // Debug: log logged-in user info
            const userId = getUserIdFromToken();
            const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
            const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');
            console.log('📅 [DEBUG] fetchCalendar called with:', { userId, startDate, endDate });

            const response = await getTutorCalendar(startDate, endDate);
            console.log('📅 [DEBUG] /tutorlesson/calendar response:', JSON.stringify(response, null, 2));
            console.log('📅 [DEBUG] content length:', (response.content || []).length);

            setCalendarData(response.content || []);
        } catch (error: any) {
            console.error('❌ fetchCalendar error:', error);
            console.error('❌ Error details:', {
                status: error?.response?.status,
                data: error?.response?.data,
                message: error?.message,
            });
            toast.error('Không thể tải lịch dạy. Vui lòng thử lại.');
        } finally {
            setIsLoadingLessons(false);
        }
    }, []);

    // Tải lịch rảnh khi khởi tạo component
    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Fetch calendar when switching to lessons tab
    useEffect(() => {
        if (activeTab === 'lessons') {
            fetchCalendar();
        }
    }, [activeTab, fetchCalendar]);

    // Xử lý xóa lịch rảnh với Popconfirm
    const handleDeleteAvailability = async (slot: LocalAvailabilitySlot) => {
        setDeletingSlotId(slot.apiId);
        try {
            await deleteAvailability(slot.apiId);
            toast.success('Đã xóa lịch rảnh thành công!');
            fetchAvailability();
        } catch {
            toast.error('Không thể xóa lịch rảnh. Vui lòng thử lại.');
        } finally {
            setDeletingSlotId(null);
        }
    };

    // Xử lý chỉnh sửa lịch rảnh
    const handleEditAvailability = (slot: LocalAvailabilitySlot) => {
        setEditingAvailability({
            id: slot.apiId,
            dayOfWeek: slot.apiDayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
        });
        setIsEditAvailabilityModalOpen(true);
    };

    const handleCloseEditAvailabilityModal = () => {
        setIsEditAvailabilityModalOpen(false);
        setEditingAvailability(null);
    };

    // Xử lý điều hướng theo viewMode
    const navUnit = viewMode === 'day' ? 'day' : viewMode === 'month' ? 'month' : 'week';

    const handlePrev = () => {
        setCurrentDate(currentDate.subtract(1, navUnit));
    };

    const handleNext = () => {
        setCurrentDate(currentDate.add(1, navUnit));
    };

    const handleToday = () => {
        setCurrentDate(dayjs());
    };

    // Helper: check if a day has availability slots
    const getDayAvailability = (date: Dayjs): LocalAvailabilitySlot[] => {
        const isoDay = date.isoWeekday(); // 1=Mon, 7=Sun
        return availability.filter(a => a.dayOfWeek === isoDay);
    };

    // Helper: check if a day has lessons
    const getDayLessons = (date: Dayjs): CalendarLesson[] => {
        return lessons.filter((l: CalendarLesson) => dayjs(l.scheduledStart).isSame(date, 'day'));
    };

    const handleAddAvailabilityClick = () => {
        setIsAddAvailabilityModalOpen(true);
    };

    const handleCloseAddAvailabilityModal = () => {
        setIsAddAvailabilityModalOpen(false);
    };

    // FROM DEVELOP: Tìm slot rảnh bắt đầu trong giờ cụ thể
    const getAvailabilityStartingAtHour = (date: Dayjs, hour: number): LocalAvailabilitySlot | null => {
        const isoDay = date.isoWeekday();
        return availability.find(a =>
            a.dayOfWeek === isoDay &&
            a.startHour === hour
        ) || null;
    };

    // Kiểm tra một ngày có phải hôm nay không
    const isToday = (date: Dayjs) => {
        return date.isSame(dayjs(), 'day');
    };

    // Kiểm tra tuần hiện tại có phải tuần này không
    const isCurrentPeriod = useMemo(() => {
        const today = dayjs();
        if (viewMode === 'day') return currentDate.isSame(today, 'day');
        if (viewMode === 'month') return currentDate.isSame(today, 'month');
        const startOfCurrentWeek = today.startOf('isoWeek');
        const startOfDisplayWeek = currentDate.startOf('isoWeek');
        return startOfCurrentWeek.isSame(startOfDisplayWeek, 'day');
    }, [currentDate, viewMode]);

    return (
        <div className={styles.schedulePage}>
            {/* === MOBILE GOOGLE-CALENDAR HEADER (hidden on desktop via CSS) === */}
            <div className={styles.mobileGcalHeader}>
                <button className={styles.mobileMonthBtn} onClick={handlePrev}>
                    <ChevronLeftIcon />
                </button>
                <span className={styles.mobileMonthLabel}>{`Tháng ${currentDate.format('M')}`}</span>
                <button className={styles.mobileMonthBtn} onClick={handleNext}>
                    <ChevronRightIcon />
                </button>
                <button
                    className={`${styles.mobileTodayBtn} ${isCurrentPeriod ? styles.disabled : ''}`}
                    onClick={handleToday}
                    disabled={isCurrentPeriod}
                >
                    Hôm nay
                </button>
                <div className={styles.mobileTabSwitch}>
                    <button
                        className={`${styles.mobileTabBtn} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙
                    </button>
                    <button
                        className={`${styles.mobileTabBtn} ${activeTab === 'lessons' ? styles.active : ''}`}
                        onClick={() => setActiveTab('lessons')}
                    >
                        📅
                    </button>
                </div>
            </div>

            {/* Nội dung chính */}
            <div className={styles.mainContainer}>
                {/* Phần đầu trang (hidden on mobile via CSS) */}
                <div className={styles.headerSection}>
                    <div className={styles.headerTop}>
                        <h1 className={styles.pageTitle}>Lịch dạy</h1>
                        <div className={styles.headerActions}>
                            <button className={styles.addBtn} onClick={handleAddAvailabilityClick}>
                                <PlusIcon />
                                <span>Thêm lịch rảnh</span>
                            </button>
                        </div>
                    </div>

                    {/* Các tab - FROM MILESTONE_3 */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Cài đặt lịch
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'lessons' ? styles.active : ''}`}
                            onClick={() => setActiveTab('lessons')}
                        >
                            Lịch dạy
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'settings' ? (
                    /* Tab Cài đặt lịch (Availability) - MERGED: dùng minutes precision từ develop */
                    <div className={styles.calendarContainer}>
                        {/* Điều khiển lịch */}
                        <div className={styles.calendarControls}>
                            {/* Chuyển đổi chế độ xem */}
                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'day' ? styles.active : ''}`}
                                    onClick={() => setViewMode('day')}
                                >
                                    Ngày
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'week' ? styles.active : ''}`}
                                    onClick={() => setViewMode('week')}
                                >
                                    Tuần
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'month' ? styles.active : ''}`}
                                    onClick={() => setViewMode('month')}
                                >
                                    Tháng
                                </button>
                            </div>

                            {/* Điều hướng ngày */}
                            <div className={styles.dateNav}>
                                <button className={styles.navBtn} onClick={handlePrev}>
                                    <ChevronLeftIcon />
                                </button>
                                <span className={styles.dateRange}>{dateRangeText}</span>
                                <button className={styles.navBtn} onClick={handleNext}>
                                    <ChevronRightIcon />
                                </button>
                                <button
                                    className={`${styles.nowBtn} ${isCurrentPeriod ? styles.active : ''}`}
                                    onClick={handleToday}
                                    disabled={isCurrentPeriod}
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </div>

                        {/* Chú giải + Zoom */}
                        <div className={styles.legend}>
                            <div className={styles.legendItem}>
                                <div className={styles.legendDot} />
                                <span>Rảnh</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div className={styles.timezone} style={{ marginRight: '12px' }}>
                                    UTC+7 • Giờ Việt Nam
                                </div>
                                {viewMode !== 'month' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f5f5f5', borderRadius: '6px', padding: '2px' }}>
                                        <button onClick={handleZoomOut} disabled={rowHeight <= MIN_ROW_HEIGHT} style={{ background: 'none', border: 'none', cursor: rowHeight <= MIN_ROW_HEIGHT ? 'not-allowed' : 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: rowHeight <= MIN_ROW_HEIGHT ? 0.3 : 1, color: '#555' }} title="Thu nhỏ"><ZoomOutIcon /></button>
                                        <button onClick={handleZoomReset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: '11px', fontWeight: 600, color: '#555', borderRadius: '4px' }} title="Mặc định">{Math.round((rowHeight / DEFAULT_ROW_HEIGHT) * 100)}%</button>
                                        <button onClick={handleZoomIn} disabled={rowHeight >= MAX_ROW_HEIGHT} style={{ background: 'none', border: 'none', cursor: rowHeight >= MAX_ROW_HEIGHT ? 'not-allowed' : 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: rowHeight >= MAX_ROW_HEIGHT ? 0.3 : 1, color: '#555' }} title="Phóng to"><ZoomInIcon /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trạng thái đang tải */}
                        {isLoadingAvailability && (
                            <div className={styles.loadingOverlay}>
                                <Spin size="large" />
                            </div>
                        )}

                        {/* Trạng thái trống - Hiển thị khi không có lịch rảnh và không đang tải */}
                        {!isLoadingAvailability && availability.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📅</div>
                                <h3 className={styles.emptyTitle}>Chưa có lịch rảnh</h3>
                                <p className={styles.emptyDescription}>
                                    Thêm lịch rảnh để học viên có thể đặt lịch học với bạn
                                </p>
                                <button
                                    className={styles.emptyBtn}
                                    onClick={handleAddAvailabilityClick}
                                >
                                    <PlusIcon />
                                    <span>Thêm lịch rảnh đầu tiên</span>
                                </button>
                            </div>
                        ) : viewMode === 'month' ? (
                            /* Month view - Availability */
                            <div className={styles.monthGrid}>
                                <div className={styles.monthHeader}>
                                    {DAYS_OF_WEEK.map(d => <div key={d} className={styles.monthHeaderCell}>{d}</div>)}
                                </div>
                                <div className={styles.monthBody}>
                                    {monthCalendarData.map((date, i) => {
                                        const daySlots = getDayAvailability(date);
                                        const isCurrentMonth = date.month() === currentDate.month();
                                        return (
                                            <div
                                                key={i}
                                                className={`${styles.monthCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday(date) ? styles.todayCell : ''}`}
                                                onClick={() => { setCurrentDate(date); setViewMode('day'); }}
                                            >
                                                <span className={styles.monthCellDay}>{date.format('D')}</span>
                                                {daySlots.length > 0 && (
                                                    <div className={styles.monthCellDots}>
                                                        {daySlots.slice(0, 3).map((s, j) => (
                                                            <div key={j} className={styles.monthDotAvail} title={`${s.startTime} - ${s.endTime}`} />
                                                        ))}
                                                        {daySlots.length > 3 && <span className={styles.monthMore}>+{daySlots.length - 3}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Day / Week view - Availability grid */
                            <div className={styles.calendarGrid} style={viewMode === 'day' ? { '--col-count': '1' } as React.CSSProperties : undefined}>
                                {/* Hàng tiêu đề */}
                                <div className={styles.calendarHeader} style={viewMode === 'day' ? { gridTemplateColumns: '70px 1fr' } : undefined}>
                                    <div className={styles.timeColumn} />
                                    {displayDates.map((date, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.dayColumn} ${isToday(date) ? styles.today : ''}`}
                                        >
                                            <span className={styles.dayName}>{viewMode === 'day' ? date.format('dddd') : DAYS_OF_WEEK[index]}</span>
                                            <span className={styles.dayNumber}>{date.format('DD')}</span>
                                            <span className={styles.monthName}>{date.format('MMM')}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Các hàng thời gian */}
                                <div className={styles.calendarBody}>
                                    {TIME_SLOTS.map((hour, index) => (
                                        <div
                                            key={hour}
                                            className={styles.timeRow}
                                            style={{
                                                minHeight: `${rowHeight}px`,
                                                zIndex: TIME_SLOTS.length - index,
                                                position: 'relative',
                                                ...(viewMode === 'day' ? { gridTemplateColumns: '70px 1fr' } : {})
                                            }}
                                        >
                                            <div className={styles.timeLabel}>
                                                {hour.toString().padStart(2, '0')}:00
                                            </div>
                                            {displayDates.map((date, dayIndex) => {
                                                const slot = getAvailabilityStartingAtHour(date, hour);
                                                const minuteOffset = slot ? (slot.startMinutes - hour * 60) : 0;
                                                const topOffsetPx = minuteOffset * pxPerMinute;
                                                const heightPx = slot ? slot.durationMinutes * pxPerMinute : 0;

                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`${styles.timeCell} ${isToday(date) ? styles.todayColumn : ''}`}
                                                    >
                                                        {slot && (
                                                            <div
                                                                className={styles.availableBlock}
                                                                style={{
                                                                    top: `${topOffsetPx + 3}px`,
                                                                    height: `${heightPx - 6}px`,
                                                                }}
                                                            >
                                                                <div className={styles.availableContent}>
                                                                    <span className={styles.availableLabel}>Rảnh</span>
                                                                    <span className={styles.availableTime}>
                                                                        {slot.startTime} - {slot.endTime}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.slotActions}>
                                                                    <Tooltip title="Chỉnh sửa">
                                                                        <button
                                                                            className={styles.editSlotBtn}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditAvailability(slot);
                                                                            }}
                                                                        >
                                                                            <EditOutlined />
                                                                        </button>
                                                                    </Tooltip>
                                                                    <Popconfirm
                                                                        title="Xóa lịch rảnh"
                                                                        description={`Bạn có chắc muốn xóa lịch rảnh ${DAY_OF_WEEK_MAP[slot.apiDayOfWeek]} ${slot.startTime} - ${slot.endTime}?`}
                                                                        onConfirm={() => handleDeleteAvailability(slot)}
                                                                        okText="Xóa"
                                                                        cancelText="Hủy"
                                                                        okButtonProps={{
                                                                            danger: true,
                                                                            loading: deletingSlotId === slot.apiId
                                                                        }}
                                                                        placement="left"
                                                                    >
                                                                        <Tooltip title="Xóa">
                                                                            <button
                                                                                className={styles.deleteSlotBtn}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <DeleteOutlined />
                                                                            </button>
                                                                        </Tooltip>
                                                                    </Popconfirm>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* FROM MILESTONE_3: Tab Lịch dạy (Lessons) */
                    <div className={styles.calendarContainer}>
                        {/* Calendar controls */}
                        <div className={styles.calendarControls}>
                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'day' ? styles.active : ''}`}
                                    onClick={() => setViewMode('day')}
                                >
                                    Ngày
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'week' ? styles.active : ''}`}
                                    onClick={() => setViewMode('week')}
                                >
                                    Tuần
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'month' ? styles.active : ''}`}
                                    onClick={() => setViewMode('month')}
                                >
                                    Tháng
                                </button>
                            </div>

                            <div className={styles.dateNav}>
                                <button className={styles.navBtn} onClick={handlePrev}>
                                    <ChevronLeftIcon />
                                </button>
                                <span className={styles.dateRange}>{dateRangeText}</span>
                                <button className={styles.navBtn} onClick={handleNext}>
                                    <ChevronRightIcon />
                                </button>
                                <button
                                    className={`${styles.nowBtn} ${isCurrentPeriod ? styles.active : ''}`}
                                    onClick={handleToday}
                                    disabled={isCurrentPeriod}
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </div>

                        {/* Legend + Zoom */}
                        <div className={styles.legend}>
                            <div className={styles.legendItem}>
                                <div className={styles.legendDot} style={{ backgroundColor: '#3d4a3e' }} />
                                <span>Buổi học</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div className={styles.timezone} style={{ marginRight: '12px' }}>
                                    UTC+7 • Giờ Việt Nam
                                </div>
                                {viewMode !== 'month' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f5f5f5', borderRadius: '6px', padding: '2px' }}>
                                        <button onClick={handleZoomOut} disabled={rowHeight <= MIN_ROW_HEIGHT} style={{ background: 'none', border: 'none', cursor: rowHeight <= MIN_ROW_HEIGHT ? 'not-allowed' : 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: rowHeight <= MIN_ROW_HEIGHT ? 0.3 : 1, color: '#555' }} title="Thu nhỏ"><ZoomOutIcon /></button>
                                        <button onClick={handleZoomReset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: '11px', fontWeight: 600, color: '#555', borderRadius: '4px' }} title="Mặc định">{Math.round((rowHeight / DEFAULT_ROW_HEIGHT) * 100)}%</button>
                                        <button onClick={handleZoomIn} disabled={rowHeight >= MAX_ROW_HEIGHT} style={{ background: 'none', border: 'none', cursor: rowHeight >= MAX_ROW_HEIGHT ? 'not-allowed' : 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: rowHeight >= MAX_ROW_HEIGHT ? 0.3 : 1, color: '#555' }} title="Phóng to"><ZoomInIcon /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isLoadingLessons ? (
                            <div className={styles.loadingOverlay}>
                                <Spin size="large" />
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📚</div>
                                <h3 className={styles.emptyTitle}>Chưa có lịch dạy</h3>
                                <p className={styles.emptyDescription}>
                                    Các buổi học đã được đặt sẽ hiển thị tại đây
                                </p>
                            </div>
                        ) : viewMode === 'month' ? (
                            /* Month view - Lessons */
                            <div className={styles.monthGrid}>
                                <div className={styles.monthHeader}>
                                    {DAYS_OF_WEEK.map(d => <div key={d} className={styles.monthHeaderCell}>{d}</div>)}
                                </div>
                                <div className={styles.monthBody}>
                                    {monthCalendarData.map((date, i) => {
                                        const dayLessons = getDayLessons(date);
                                        const isCurrentMonth = date.month() === currentDate.month();
                                        return (
                                            <div
                                                key={i}
                                                className={`${styles.monthCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday(date) ? styles.todayCell : ''}`}
                                                onClick={() => { setCurrentDate(date); setViewMode('day'); }}
                                            >
                                                <span className={styles.monthCellDay}>{date.format('D')}</span>
                                                {dayLessons.length > 0 && (
                                                    <div className={styles.monthCellDots}>
                                                        {dayLessons.slice(0, 3).map((l, j) => (
                                                            <div key={j} className={styles.monthDotLesson} title={`${l.subjectName || ''} ${dayjs(l.scheduledStart).format('HH:mm')}`} />
                                                        ))}
                                                        {dayLessons.length > 3 && <span className={styles.monthMore}>+{dayLessons.length - 3}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Day / Week view - Lessons grid */
                            <div className={styles.calendarGrid} style={viewMode === 'day' ? { '--col-count': '1' } as React.CSSProperties : undefined}>
                                {/* Header row */}
                                <div className={styles.calendarHeader} style={viewMode === 'day' ? { gridTemplateColumns: '70px 1fr' } : undefined}>
                                    <div className={styles.timeColumn} />
                                    {displayDates.map((date, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.dayColumn} ${isToday(date) ? styles.today : ''}`}
                                        >
                                            <span className={styles.dayName}>{viewMode === 'day' ? date.format('dddd') : DAYS_OF_WEEK[index]}</span>
                                            <span className={styles.dayNumber}>{date.format('DD')}</span>
                                            <span className={styles.monthName}>{date.format('MMM')}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Time rows */}
                                <div className={styles.calendarBody}>
                                    {TIME_SLOTS.map((hour, index) => (
                                        <div
                                            key={hour}
                                            className={styles.timeRow}
                                            style={{
                                                minHeight: `${rowHeight}px`,
                                                zIndex: TIME_SLOTS.length - index,
                                                position: 'relative',
                                                ...(viewMode === 'day' ? { gridTemplateColumns: '70px 1fr' } : {})
                                            }}
                                        >
                                            <div className={styles.timeLabel}>
                                                {hour.toString().padStart(2, '0')}:00
                                            </div>
                                            {displayDates.map((date, dayIndex) => {
                                                const lessonsInSlot = lessons.filter(lesson => {
                                                    const lessonDate = dayjs(lesson.scheduledStart);
                                                    return lessonDate.isSame(date, 'day') && lessonDate.hour() === hour;
                                                });

                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={`${styles.timeCell} ${isToday(date) ? styles.todayColumn : ''}`}
                                                    >
                                                        {lessonsInSlot.map(lesson => {
                                                            const start = dayjs(lesson.scheduledStart);
                                                            const end = dayjs(lesson.scheduledEnd);
                                                            const duration = end.diff(start, 'hour', true);
                                                            const heightPx = duration * rowHeight - 6;

                                                            return (
                                                                <div
                                                                    key={lesson.lessonId}
                                                                    className={styles.lessonBlock}
                                                                    style={{ height: `${heightPx}px` }}
                                                                >
                                                                    <div className={styles.lessonContent}>
                                                                        <span className={styles.lessonLabel}>
                                                                            {lesson.subjectName || 'N/A'}
                                                                        </span>
                                                                        <span className={styles.lessonTime}>
                                                                            {start.format('HH:mm')} - {end.format('HH:mm')}
                                                                        </span>
                                                                        <span className={styles.lessonStudent}>
                                                                            {lesson.studentName || 'Unknown'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FAB — Mobile only (hidden on desktop via CSS) */}
            <button className={styles.fab} onClick={handleAddAvailabilityClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Modal thêm lịch rảnh */}
            <AddAvailabilityModal
                isOpen={isAddAvailabilityModalOpen}
                onClose={handleCloseAddAvailabilityModal}
                onSuccess={fetchAvailability}
            />

            {/* Modal chỉnh sửa lịch rảnh */}
            <EditAvailabilityModal
                isOpen={isEditAvailabilityModalOpen}
                onClose={handleCloseEditAvailabilityModal}
                onSuccess={fetchAvailability}
                availabilityData={editingAvailability}
            />
        </div>
    );
};

export default TutorPortalSchedule;
