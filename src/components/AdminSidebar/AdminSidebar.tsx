import { useNavigate, useLocation, Link } from 'react-router-dom';
import { clearUserFromStorage } from '../../services/auth.service';
import '../../styles/layouts/admin-layout.css';

// Logo Icon (TUTORA symbol) - same as TutorPortal/ParentLayout
const LogoIcon = () => (
    <img src="/tutora-logo.png" alt="Tutora" width="36" height="36" />
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
                        className={`admin-nav-item ${isActive('/admin-portal/dashboard') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/dashboard')}
                        title="Bảng điều khiển"
                    >
                        <span className="material-symbols-outlined admin-nav-icon icon-filled">dashboard</span>
                        <span className="admin-nav-text">Bảng điều khiển</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin-portal/users') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/users')}
                        title="Quản lý người dùng"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">group</span>
                        <span className="admin-nav-text">Quản lý người dùng</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin-portal/vetting') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/vetting')}
                        title="Yêu cầu kiểm duyệt"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">description</span>
                        <span className="admin-nav-text">Yêu cầu kiểm duyệt</span>
                        <span className="admin-nav-badge">4</span>
                    </a>

                    {/* MVP Phase 1: Tạm ẩn tính năng quản lý khiếu nại */}
                    {/* <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin-portal/disputes') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/disputes')}
                        title="Khiếu nại"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">gavel</span>
                        <span className="admin-nav-text">Khiếu nại</span>
                        <span className="admin-nav-badge-alert">!</span>
                    </a> */}

                    <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin-portal/warnings') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/warnings')}
                        title="Cảnh báo"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">warning</span>
                        <span className="admin-nav-text">Cảnh báo</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin-portal/financials') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/financials')}
                        title="Tài chính"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">account_balance</span>
                        <span className="admin-nav-text">Tài chính</span>
                    </a>

                    <a
                        className={`admin-nav-item ${location.pathname.startsWith('/admin-portal/payout') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/payouts')}
                        title="Payout"
                    >
                        <span className="material-symbols-outlined admin-nav-icon">monitoring</span>
                        <span className="admin-nav-text">Payout</span>
                    </a>

                    <a
                        className={`admin-nav-item ${isActive('/admin-portal/settings') ? 'admin-nav-item-active' : ''}`}
                        onClick={() => navigate('/admin-portal/settings')}
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
