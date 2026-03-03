import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Popconfirm } from 'antd';
import '../styles/layouts/tutor-portal-layout.css';
import { getUnreadCount } from '../services/notification.service';
import { signalRService } from '../services/signalr.service';
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';
import { getUserInfoFromToken, clearUserFromStorage } from '../services/auth.service';
import { toast } from 'react-toastify';

// Logo Icon (TUTORA symbol)
const LogoIcon = () => (
    <svg className="tutor-portal-logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
        <path d="M14 2L2 8V20L14 26L26 20V8L14 2ZM14 4.5L22.5 9V19L14 23.5L5.5 19V9L14 4.5Z" />
        <path d="M14 8L8 11V17L14 20L20 17V11L14 8Z" />
    </svg>
);


// Notification Bell Icon
const NotificationIcon = () => (
    <svg className="tutor-portal-notification-icon" viewBox="0 0 18 20" fill="currentColor">
        <path d="M9 0C5.68629 0 3 2.68629 3 6V11L1 14V15H17V14L15 11V6C15 2.68629 12.3137 0 9 0Z" />
        <path d="M9 20C10.6569 20 12 18.6569 12 17H6C6 18.6569 7.34315 20 9 20Z" />
    </svg>
);

// Icons as SVG components for cleaner code - Updated to 17.5px to match Figma
const DashboardIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M2 4C2 2.89543 2.89543 2 4 2H7C7.55228 2 8 2.44772 8 3V7C8 7.55228 7.55228 8 7 8H4C2.89543 8 2 7.10457 2 6V4Z" />
        <path d="M2 12C2 10.8954 2.89543 10 4 10H7C7.55228 10 8 10.4477 8 11V15C8 15.5523 7.55228 16 7 16H4C2.89543 16 2 15.1046 2 14V12Z" />
        <path d="M10 3C10 2.44772 10.4477 2 11 2H14C15.1046 2 16 2.89543 16 4V6C16 7.10457 15.1046 8 14 8H11C10.4477 8 10 7.55228 10 7V3Z" />
        <path d="M10 11C10 10.4477 10.4477 10 11 10H14C15.1046 10 16 10.8954 16 12V14C16 15.1046 15.1046 16 14 16H11C10.4477 16 10 15.5523 10 15V11Z" />
    </svg>
);

const ProfileIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M9 8C10.6569 8 12 6.65685 12 5C12 3.34315 10.6569 2 9 2C7.34315 2 6 3.34315 6 5C6 6.65685 7.34315 8 9 8Z" />
        <path d="M2 16C2 12.6863 5.13401 10 9 10C12.866 10 16 12.6863 16 16H2Z" />
    </svg>
);

const ScheduleIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M5 1C4.44772 1 4 1.44772 4 2V3H3C1.89543 3 1 3.89543 1 5V15C1 16.1046 1.89543 17 3 17H15C16.1046 17 17 16.1046 17 15V5C17 3.89543 16.1046 3 15 3H14V2C14 1.44772 13.5523 1 13 1C12.4477 1 12 1.44772 12 2V3H6V2C6 1.44772 5.55228 1 5 1ZM3 7H15V15H3V7Z" />
    </svg>
);

const ClassIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M9 2L1 6L9 10L17 6L9 2Z" />
        <path d="M1 12L9 16L17 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);

const SessionsIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="7" />
        <path d="M9 5V9L12 11" strokeLinecap="round" />
    </svg>
);

const FinanceIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M2 4C2 2.89543 2.89543 2 4 2H14C15.1046 2 16 2.89543 16 4V14C16 15.1046 15.1046 16 14 16H4C2.89543 16 2 15.1046 2 14V4Z" />
        <path d="M9 5V13M6 8H12M6 10H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="2.5" />
        <path d="M9 1V3M9 15V17M1 9H3M15 9H17M3.05 3.05L4.46 4.46M13.54 13.54L14.95 14.95M3.05 14.95L4.46 13.54M13.54 4.46L14.95 3.05" strokeLinecap="round" />
    </svg>
);

const MessagesIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 4L9 9L17 4M1 14V4C1 2.89543 1.89543 2 3 2H15C16.1046 2 17 2.89543 17 4V14C17 15.1046 16.1046 16 15 16H3C1.89543 16 1 15.1046 1 14Z" strokeLinecap="round" />
    </svg>
);

// Hamburger Menu Icon for mobile
const MenuIcon = () => (
    <svg className="tutor-portal-menu-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5H17M3 10H17M3 15H17" strokeLinecap="round" />
    </svg>
);

// Close Icon for mobile sidebar
const CloseIcon = () => (
    <svg className="tutor-portal-close-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
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

const BookingIcon = () => (
    <svg className="tutor-portal-nav-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 3V1M7 3V1M3 13V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V13C15 14.1046 14.1046 15 13 15H5C3.89543 15 3 14.1046 3 13Z" strokeLinecap="round" />
        <path d="M7 8L9 10L12 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 8H15" strokeLinecap="round" />
    </svg>
);

// Navigation items matching Figma design
const navItems = [
    { path: '/tutor-portal/dashboard', label: 'Tổng quan', icon: DashboardIcon },
    { path: '/tutor-portal/profile', label: 'Hồ sơ công khai', icon: ProfileIcon },
    { path: '/tutor-portal/messages', label: 'Tin nhắn', icon: MessagesIcon },
    { path: '/tutor-portal/bookings', label: 'Yêu cầu đặt lịch', icon: BookingIcon },
    { path: '/tutor-portal/schedule', label: 'Lịch dạy', icon: ScheduleIcon },
    { path: '/tutor-portal/classes', label: 'Quản lý lớp', icon: ClassIcon },
    { path: '/tutor-portal/sessions', label: 'Buổi học', icon: SessionsIcon },
    { path: '/tutor-portal/finance', label: 'Tài chính', icon: FinanceIcon },
    { path: '/tutor-portal/settings', label: 'Cài đặt', icon: SettingsIcon },
];

const TutorPortalLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: 'User',
        initials: 'U',
        role: 'TUTOR',
        avatar: 'https://ui-avatars.com/api/?name=User&background=3d4a3e&color=f2f0e4&size=128'
    });

    const isActive = (path: string) => {
        if (path === '/tutor-portal/finance') {
            return location.pathname.startsWith('/tutor-portal/finance');
        }
        return location.pathname === path;
    };

    // Helper function to generate avatar from name
    const generateAvatarFromName = (name: string) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3d4a3e&color=f2f0e4&size=128`;
    };

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

        console.log('🔍 TutorPortalLayout - Loading user data from token:', user);

        if (user) {
            const displayName = user.fullname ||
                (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                user.email?.split('@')[0] ||
                'User';
            const avatarUrl = generateAvatarFromName(displayName);
            const initials = getInitials(displayName);

            console.log('✅ TutorPortalLayout - Setting user data:', { displayName, initials, role: user.role, avatarUrl });

            setUserData({
                name: displayName,
                initials: initials,
                role: user.role || 'TUTOR',
                avatar: avatarUrl
            });
        } else {
            console.warn('⚠️ TutorPortalLayout - No user data found in localStorage');
        }
    }, []);

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
        <div className="tutor-portal-layout">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="tutor-portal-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`tutor-portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo Section */}
                <div className="tutor-portal-sidebar-logo">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                        <LogoIcon />
                        <span className="tutor-portal-logo-text">TUTORA</span>
                    </Link>
                    {/* Mobile Close Button */}
                    <button
                        className="tutor-portal-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="tutor-portal-sidebar-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.path}
                            className={`tutor-portal-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            title={item.label}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                        >
                            <item.icon />
                            <span className="tutor-portal-nav-text">{item.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="tutor-portal-main">
                {/* Header */}
                <header className="tutor-portal-header">
                    <div className="tutor-portal-header-container">
                        {/* Mobile Menu Button */}
                        <button
                            className="tutor-portal-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <MenuIcon />
                        </button>

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* Right: User Info + Notifications + Avatar */}
                        <div className="tutor-portal-header-right">
                            {/* Notification Button */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="tutor-portal-notification-btn"
                                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                                >
                                    <NotificationIcon />
                                    {notificationCount > 0 && (
                                        <div className="tutor-portal-notification-badge">
                                            <span className="tutor-portal-notification-count">{notificationCount}</span>
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
                            <div className="tutor-portal-header-user">
                                <div className="tutor-portal-header-user-info">
                                    <span className="tutor-portal-header-user-name">{userData.name}</span>
                                    <span className="tutor-portal-header-user-role">{userData.role}</span>
                                </div>
                                <img
                                    className="tutor-portal-header-avatar"
                                    src={userData.avatar}
                                    alt="User avatar"
                                />
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
                                    className="tutor-portal-logout-btn"
                                    title="Đăng xuất"
                                >
                                    <LogoutIcon />
                                </button>
                            </Popconfirm>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TutorPortalLayout;
