import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';
import { getUnreadCount } from '../../services/notification.service';
import { signalRService } from '../../services/signalr.service';
import NotificationDropdown from '../../components/NotificationDropdown/NotificationDropdown';
import { getUserInfoFromToken, clearUserFromStorage } from '../../services/auth.service';
import { toast } from 'react-toastify';
import { getNextLesson } from '../../services/lesson.service';
import type { LessonResponse } from '../../services/lesson.service';
import { StudentProvider, useStudentContext } from '../../contexts/StudentContext';

// Logo Icon (TUTORA symbol) - same as TutorPortalLayout
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
    <path d="M14 2L2 8V20L14 26L26 20V8L14 2ZM14 4.5L22.5 9V19L14 23.5L5.5 19V9L14 4.5Z" />
    <path d="M14 8L8 11V17L14 20L20 17V11L14 8Z" />
  </svg>
);

// Notification Bell Icon
const NotificationIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor">
    <path d="M9 0C5.68629 0 3 2.68629 3 6V11L1 14V15H17V14L15 11V6C15 2.68629 12.3137 0 9 0Z" />
    <path d="M9 20C10.6569 20 12 18.6569 12 17H6C6 18.6569 7.34315 20 9 20Z" />
  </svg>
);

// Clock Icon for next lesson
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="5.5" />
    <path d="M7 4V7L9 8.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Dropdown Arrow
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4.5L6 7.5L9 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Nav Icons
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M2 4C2 2.89543 2.89543 2 4 2H7C7.55228 2 8 2.44772 8 3V7C8 7.55228 7.55228 8 7 8H4C2.89543 8 2 7.10457 2 6V4Z" />
    <path d="M2 12C2 10.8954 2.89543 10 4 10H7C7.55228 10 8 10.4477 8 11V15C8 15.5523 7.55228 16 7 16H4C2.89543 16 2 15.1046 2 14V12Z" />
    <path d="M10 3C10 2.44772 10.4477 2 11 2H14C15.1046 2 16 2.89543 16 4V6C16 7.10457 15.1046 8 14 8H11C10.4477 8 10 7.55228 10 7V3Z" />
    <path d="M10 11C10 10.4477 10.4477 10 11 10H14C15.1046 10 16 10.8954 16 12V14C16 15.1046 15.1046 16 14 16H11C10.4477 16 10 15.5523 10 15V11Z" />
  </svg>
);

const ChildrenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M9 8C10.6569 8 12 6.65685 12 5C12 3.34315 10.6569 2 9 2C7.34315 2 6 3.34315 6 5C6 6.65685 7.34315 8 9 8Z" />
    <path d="M2 16C2 12.6863 5.13401 10 9 10C12.866 10 16 12.6863 16 16H2Z" />
  </svg>
);

const MessagesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 4L9 9L17 4M1 14V4C1 2.89543 1.89543 2 3 2H15C16.1046 2 17 2.89543 17 4V14C17 15.1046 16.1046 16 15 16H3C1.89543 16 1 15.1046 1 14Z" strokeLinecap="round" />
  </svg>
);

const FinanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M2 4C2 2.89543 2.89543 2 4 2H14C15.1046 2 16 2.89543 16 4V14C16 15.1046 15.1046 16 14 16H4C2.89543 16 2 15.1046 2 14V4Z" />
    <path d="M9 5V13M6 8H12M6 10H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 3V1M7 3V1M3 13V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V13C15 14.1046 14.1046 15 13 15H5C3.89543 15 3 14.1046 3 13Z" strokeLinecap="round" />
    <path d="M7 8L9 10L12 7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H15" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="2.5" />
    <path d="M9 1V3M9 15V17M1 9H3M15 9H17M3.05 3.05L4.46 4.46M13.54 13.54L14.95 14.95M3.05 14.95L4.46 13.54M13.54 4.46L14.95 3.05" strokeLinecap="round" />
  </svg>
);

// Hamburger Menu Icon for mobile
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 5H17M3 10H17M3 15H17" strokeLinecap="round" />
  </svg>
);

// Close Icon for mobile sidebar
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 5L15 15M15 5L5 15" strokeLinecap="round" />
  </svg>
);

// Logout Icon
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 16H3C2.44772 16 2 15.5523 2 15V3C2 2.44772 2.44772 2 3 2H6" strokeLinecap="round" />
    <path d="M12 12L16 9L12 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 9H7" strokeLinecap="round" />
  </svg>
);

// Navigation items matching Figma design
// Lessons Icon
const LessonsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4C2 2.89543 2.89543 2 4 2H14C15.1046 2 16 2.89543 16 4V14C16 15.1046 15.1046 16 14 16H4C2.89543 16 2 15.1046 2 14V4Z" strokeLinecap="round" />
    <path d="M6 6H12M6 9H12M6 12H9" strokeLinecap="round" />
  </svg>
);

// Dispute Icon
const DisputeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 6V9M9 12H9.01M3 14V4C3 2.89543 3.89543 2 5 2H13C14.1046 2 15 2.89543 15 4V14C15 15.1046 14.1046 16 13 16H5C3.89543 16 3 15.1046 3 14Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navItems = [
  { path: '/parent/dashboard', label: 'Tổng quan', icon: DashboardIcon },
  { path: '/parent/student', label: 'Con em', icon: ChildrenIcon },
  { path: '/parent/lessons', label: 'Buổi học', icon: LessonsIcon },
  { path: '/parent/messages', label: 'Tin nhắn', icon: MessagesIcon },
  { path: '/parent/wallet', label: 'Tài chính', icon: FinanceIcon },
  { path: '/parent/booking', label: 'Đặt lịch', icon: BookingIcon },
  { path: '/parent/disputes', label: 'Khiếu nại', icon: DisputeIcon },
  { path: '/parent/settings', label: 'Cài đặt', icon: SettingsIcon },
];

interface ParentLayoutProps {
  children?: React.ReactNode;
}

const ParentLayoutInner: React.FC<ParentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [parentData, setParentData] = useState({
    name: 'User',
    initials: 'U',
    role: 'PARENT',
  });
  const [nextLesson, setNextLesson] = useState<LessonResponse | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const { students, selectedStudent, selectStudent } = useStudentContext();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Load user data from auth service
  useEffect(() => {
    const user = getUserInfoFromToken();

    console.log('🔍 ParentLayout - Loading user data from token:', user);

    if (user) {
      const displayName = user.fullname ||
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
        user.email?.split('@')[0] ||
        'User';
      const initials = getInitials(displayName);

      console.log('✅ ParentLayout - Setting parent data:', { displayName, initials, role: user.role });

      setParentData({
        name: displayName,
        initials: initials,
        role: user.role || 'PARENT',
      });

      // Load next lesson
      loadNextLesson();
    } else {
      console.warn('⚠️ ParentLayout - No user data found in localStorage');
    }
  }, []);

  const loadNextLesson = async () => {
    try {
      const lesson = await getNextLesson();
      if (lesson) {
        setNextLesson(lesson);
      }
    } catch (error) {
      console.error('❌ ParentLayout - Error loading next lesson:', error);
    }
  };

  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle scroll lock when sidebar open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Fetch unread notification count on mount
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const count = await getUnreadCount();
        setNotificationCount(count);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
        // Keep count at 0 on error
      }
    };

    fetchNotificationCount();

    // Setup SignalR listener for real-time notification updates
    const handleNotificationCountUpdate = (count: number) => {
      console.log('📬 Notification count updated via SignalR:', count);
      setNotificationCount(count);
    };

    signalRService.onNotificationCountUpdated(handleNotificationCountUpdate);

    // Cleanup
    return () => {
      signalRService.offNotificationCountUpdated();
    };
  }, []);

  const handleRefreshNotificationCount = async () => {
    try {
      const count = await getUnreadCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Failed to refresh notification count:', error);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Left) — must be before main for CSS sibling selector */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo Section */}
        <div className={styles.sidebarLogo}>
          <Link to="/" className={styles.logoLink}>
            <LogoIcon />
            <span className={styles.logoText}>TUTORA</span>
          </Link>
          {/* Mobile Close Button */}
          <button
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
              title={item.label}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon />
              <span className={styles.navText}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content (Right) */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContainer}>
            {/* Mobile Menu Button */}
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>

            {/* Left: Student Selector + Next Lesson */}
            <div className={styles.headerLeft}>
              {/* Student Selector */}
              <div className={styles.studentSelectorWrap} ref={studentDropdownRef}>
                <button
                  className={styles.studentSelector}
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                >
                  <div className={styles.studentAvatar}>
                    <span>{selectedStudent ? getInitials(selectedStudent.fullName) : '?'}</span>
                  </div>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{selectedStudent?.fullName || 'Chọn học sinh'}</span>
                    <span className={styles.studentGrade}>{selectedStudent?.gradeLevel || ''}{selectedStudent?.school ? ` • ${selectedStudent.school}` : ''}</span>
                  </div>
                  <div className={`${styles.dropdownArrow} ${showStudentDropdown ? styles.dropdownArrowOpen : ''}`}>
                    <ChevronDown />
                  </div>
                </button>

                {/* Student Dropdown */}
                {showStudentDropdown && students.length > 0 && (
                  <div className={styles.studentDropdown}>
                    {students.map(student => (
                      <div
                        key={student.studentId}
                        className={`${styles.studentDropdownItem} ${selectedStudent?.studentId === student.studentId ? styles.studentDropdownItemActive : ''}`}
                        onClick={() => {
                          selectStudent(student);
                          setShowStudentDropdown(false);
                        }}
                      >
                        <div className={styles.studentDropdownAvatar}>
                          <span>{getInitials(student.fullName)}</span>
                        </div>
                        <div className={styles.studentDropdownInfo}>
                          <span className={styles.studentDropdownName}>{student.fullName}</span>
                          <span className={styles.studentDropdownGrade}>
                            {student.gradeLevel}{student.school ? ` • ${student.school}` : ''}
                          </span>
                        </div>
                        {selectedStudent?.studentId === student.studentId && (
                          <span className={styles.studentDropdownCheck}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Lesson Indicator */}
              {nextLesson && (
                <div className={styles.nextLesson}>
                  <ClockIcon />
                  <span>
                    Tiếp: {new Date(nextLesson.scheduledStart).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit'
                    })} {new Date(nextLesson.scheduledStart).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right: Notifications + User */}
            <div className={styles.headerRight}>
              {/* Notification Button */}
              <div style={{ position: 'relative' }}>
                <button
                  className={styles.notificationBtn}
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  <div className={styles.notificationIconWrap}>
                    <NotificationIcon />
                  </div>
                  {notificationCount > 0 && (
                    <div className={styles.notificationBadge}>
                      <span>{notificationCount}</span>
                    </div>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={showNotificationDropdown}
                  onClose={() => setShowNotificationDropdown(false)}
                  onCountUpdate={handleRefreshNotificationCount}
                />
              </div>

              {/* User Info */}
              <div className={styles.headerUser}>
                <div className={styles.headerUserInfo}>
                  <span className={styles.headerUserName}>{parentData.name}</span>
                  <span className={styles.headerUserRole}>{parentData.role}</span>
                </div>
                <div className={styles.headerAvatar}>
                  <span>{parentData.initials}</span>
                </div>
              </div>

              {/* Logout Button */}
              <Popconfirm
                title="Đăng xuất"
                description="Bạn có chắc muốn đăng xuất không?"
                onConfirm={() => {
                  clearUserFromStorage();
                  toast.success('Đăng xuất thành công!');
                  navigate('/login');
                }}
                okText="Đăng xuất"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <button
                  className={styles.logoutBtn}
                  title="Đăng xuất"
                >
                  <LogoutIcon />
                </button>
              </Popconfirm>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.contentArea}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => (
  <StudentProvider>
    <ParentLayoutInner>{children}</ParentLayoutInner>
  </StudentProvider>
);

export default ParentLayout;
