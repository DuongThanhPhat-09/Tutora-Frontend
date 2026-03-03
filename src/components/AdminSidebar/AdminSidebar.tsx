import { useNavigate, useLocation, Link } from 'react-router-dom';
import { clearUserFromStorage } from '../../services/auth.service';
import '../../styles/layouts/admin-layout.css';

// Logo Icon (TUTORA symbol) - same as TutorPortal/ParentLayout
const LogoIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
        <path d="M14 2L2 8V20L14 26L26 20V8L14 2ZM14 4.5L22.5 9V19L14 23.5L5.5 19V9L14 4.5Z" />
        <path d="M14 8L8 11V17L14 20L20 17V11L14 8Z" />
    </svg>
);

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="admin-sidebar">
            <div>
                {/* Logo */}
                <div className="admin-sidebar-header">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10.5px', textDecoration: 'none', color: 'inherit' }}>
                        <LogoIcon />
                        <h1 className="admin-logo">TUTORA</h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="admin-nav">
                    <a
                        className={`admin-nav-item ${isActive('/admin/dashboard') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/dashboard')}
                        title="Bảng điều khiển"
                    >
                        <span className="material-symbols-outlined admin-nav-icon icon-filled">dashboard</span>
                        <span className="admin-nav-text">Bảng điều khiển</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin/users') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/users')}
                        title="Quản lý người dùng"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">group</span>
                        <span className="admin-nav-text">Quản lý người dùng</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin/vetting') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/vetting')}
                        title="Yêu cầu kiểm duyệt"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">description</span>
                        <span className="admin-nav-text">Yêu cầu kiểm duyệt</span>
                        <span className="admin-nav-badge">4</span>
                    </a>

                    {/* MVP Phase 1: Tạm ẩn tính năng quản lý khiếu nại */}
                    {/* <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin/disputes') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/disputes')}
                        title="Khiếu nại"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">gavel</span>
                        <span className="admin-nav-text">Khiếu nại</span>
                        <span className="admin-nav-badge-alert">!</span>
                    </a> */}

                    <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin/warnings') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/warnings')}
                        title="Cảnh báo"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">warning</span>
                        <span className="admin-nav-text">Cảnh báo</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin/financials') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/financials')}
                        title="Tài chính"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">account_balance</span>
                        <span className="admin-nav-text">Tài chính</span>
                    </a>

                    <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin/payout') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/payouts')}
                        title="Payout"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">monitoring</span>
                        <span className="admin-nav-text">Payout</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin/settings') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin/settings')}
                        title="Cài đặt"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">settings</span>
                        <span className="admin-nav-text">Cài đặt</span>
                    </a>
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="admin-sidebar-footer">
                <button className="admin-signout-btn" onClick={() => { clearUserFromStorage(); navigate('/login'); }}>
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
