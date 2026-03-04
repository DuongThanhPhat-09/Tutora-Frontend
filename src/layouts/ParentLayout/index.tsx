import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import styles from './styles.module.css';
import { useEffect } from 'react';
import NotificationDropdown from '../../components/NotificationDropdown/NotificationDropdown';
import { clearUserFromStorage, getUserInfoFromToken } from '../../services/auth.service';
import { StudentProvider, useStudentContext } from '../../contexts/StudentContext';
import { toast } from 'react-toastify';

// Shared icons & hooks
import {
  LogoIcon, NotificationIcon, ClockIcon,
  DashboardIcon, ChildrenIcon, MessagesIcon, BookingIcon,
  MenuIcon, CloseIcon, LogoutIcon, LessonsIcon, CalendarIcon,
} from '../shared/icons';
import {
  useUserData, useNotifications, useSidebarState, useNextLesson,
} from '../shared/useLayoutData';

// Parent-specific navigation items
const parentNavItems = [
  { path: '/parent-portal/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/parent-portal/student', label: 'Children', icon: ChildrenIcon },
  { path: '/parent-portal/lessons', label: 'Buổi học', icon: LessonsIcon },
  { path: '/parent-portal/calendar', label: 'Thời khóa biểu', icon: CalendarIcon },
  { path: '/parent-portal/messages', label: 'Messages', icon: MessagesIcon },
  { path: '/parent-portal/booking', label: 'Booking', icon: BookingIcon },
];

interface ParentLayoutProps {
  children?: React.ReactNode;
}

const ParentLayoutInner: React.FC<ParentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const userData = useUserData();
  const { sidebarOpen, setSidebarOpen } = useSidebarState();
  const {
    notificationCount, showNotificationDropdown,
    setShowNotificationDropdown, handleRefreshNotificationCount,
  } = useNotifications();
  const { nextLesson, loadNextLesson } = useNextLesson();



  // Student context from StudentProvider
  useStudentContext();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Load next lesson on mount
  useEffect(() => {
    const user = getUserInfoFromToken();
    if (user) {
      loadNextLesson();
    }
  }, [loadNextLesson]);



  return (
    <div className={styles.layout}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Left) */}
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
          {parentNavItems.map((item) => (
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

            {/* Left */}
            <div className={styles.headerLeft}>
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
                  <span className={styles.headerUserName}>{userData.name}</span>
                  <span className={styles.headerUserRole}>{userData.role}</span>
                </div>
                <div className={styles.headerAvatar}>
                  <span>{userData.initials}</span>
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
