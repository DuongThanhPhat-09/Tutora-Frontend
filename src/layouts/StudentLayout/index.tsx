import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import styles from './styles.module.css';

import NotificationDropdown from '../../components/NotificationDropdown/NotificationDropdown';
import { clearUserFromStorage } from '../../services/auth.service';
import { toast } from 'react-toastify';

// Shared icons & hooks
import {
    LogoIcon, NotificationIcon,
    DashboardIcon, MessagesIcon, BookingIcon,
    AccountIcon, MenuIcon, CloseIcon, LogoutIcon,
    LessonsIcon, CalendarIcon,
} from '../shared/icons';
import {
    useUserData, useNotifications, useSidebarState,
} from '../shared/useLayoutData';

// Student-specific navigation items
const studentNavItems = [
    { path: '/student-portal/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/student-portal/booking', label: 'Booking', icon: BookingIcon },
    { path: '/student-portal/lessons', label: 'Buổi học', icon: LessonsIcon },
    { path: '/student-portal/calendar', label: 'Thời khóa biểu', icon: CalendarIcon },
    { path: '/student-portal/messages', label: 'Messages', icon: MessagesIcon },
    { path: '/student-portal/account', label: 'Tài khoản', icon: AccountIcon },
];

interface StudentLayoutProps {
    children?: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const userData = useUserData();
    const { sidebarOpen, setSidebarOpen } = useSidebarState();
    const {
        notificationCount, showNotificationDropdown,
        setShowNotificationDropdown, handleRefreshNotificationCount,
    } = useNotifications();


    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className={styles.layout}>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className={styles.sidebarOverlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
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
                    {studentNavItems.map((item) => (
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

            {/* Main Content */}
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
                        </div>

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* Right: Notifications + User + Logout */}
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
                                    <span className={styles.headerUserRole}>STUDENT</span>
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

export default StudentLayout;
