import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RevenueChart from './components/RevenueChart';
import UserGrowthChart from './components/UserGrowthChart';
import RecentActivitiesFeed from './components/RecentActivitiesFeed';
import {
    mockGetDashboardMetrics,
    mockGetRevenueChart,
    mockGetUserGrowthChart,
    mockGetRecentActivities,
} from './mockData';
import type {
    DashboardMetrics,
    RevenueChartData,
    UserGrowthData,
    RecentActivity,
} from '../../types/admin.types';
import { formatCurrency, formatCompactNumber, formatNumber } from '../../utils/formatters';

import '../../styles/pages/admin-dashboard.css';

const AdminDashboardPageEnhanced = () => {
    const navigate = useNavigate();

    // State management
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all data on mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [metricsData, revenueChartData, userGrowthChartData, activitiesData] = await Promise.all([
                mockGetDashboardMetrics(),
                mockGetRevenueChart(30),
                mockGetUserGrowthChart(6),
                mockGetRecentActivities(10),
            ]);

            setMetrics(metricsData);
            setRevenueData(revenueChartData);
            setUserGrowthData(userGrowthChartData);
            setActivities(activitiesData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* MAIN CONTENT */}
            <main className="admin-main">
                {/* FLOATING HEADER */}
                <header className="admin-header-container">
                    <div className="admin-header-glass">
                        {/* Search */}
                        <div className="admin-search-wrapper">
                            <span className="material-symbols-outlined admin-search-icon">search</span>
                            <input
                                className="admin-search-input"
                                placeholder="Tìm kiếm học viên, gia sư, ID..."
                                type="text"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="admin-header-actions">
                            <button className="admin-notification-btn">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="admin-notification-dot"></span>
                            </button>

                            <div className="admin-user-section">
                                <div className="admin-user-info">
                                    <p className="admin-user-name">Người quản trị</p>
                                    <p className="admin-user-role">Quản trị viên cấp cao</p>
                                </div>
                                <div
                                    className="admin-user-avatar"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-RgLEJMH5nbo-3tyQEnt7kaT8CyGOKT_-4vo8liFbcLUymnBOjDN3JlZ4DQ6YL4lvxytFsp0iIkLkXH7eVa2R3yYNWhb_SC1QA4lKYCSyY5emWbHIfFGZFfW_9R65CYBcbKwa82DV7zGTokos2f35OxJcNvRpDrB6kSMXB3EjC1dIaWasOfVzfQgmtMCEtNzx49MyGh5zObnmitst_kYueiU4bnr-I2wpMBYKHYY4JPQ_mZsUv6jY8AKsFnSYOefyynEYeV6Q8gw')",
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE AREA */}
                <div className="admin-content">
                    <div className="admin-content-inner">
                        {/* GREETING */}
                        <div className="admin-greeting">
                            <h2 className="admin-greeting-title">Chào buổi sáng, Quản trị viên</h2>
                            <p className="admin-greeting-text">Đây là những gì đang diễn ra tại TUTORA hôm nay.</p>
                        </div>

                        {/* STATS GRID - Enhanced with new metrics */}
                        <div className="admin-stats-grid">
                            {/* Card 1: Active Bookings */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Buổi học đang hoạt động</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">event</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : metrics?.activeBookings || 0}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">Hoạt động</span>
                                        <span className="admin-stat-meta">đang diễn ra</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Total GMV */}
                            <div className="admin-stat-card admin-stat-card-alert">
                                <div className="admin-stat-glow"></div>
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Tổng GMV</span>
                                    <div className="admin-stat-icon admin-stat-icon-gold">
                                        <span className="material-symbols-outlined">currency_exchange</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : formatCompactNumber(metrics?.totalgmv || 0)}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-meta" style={{ fontSize: '12px' }}>
                                            {loading ? '' : formatCurrency(metrics?.totalgmv || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Net Revenue */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Doanh thu ròng</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : formatCompactNumber(metrics?.netrevenue || 0)}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">
                                            +{metrics?.monthlygrowth || 0}%
                                        </span>
                                        <span className="admin-stat-meta">so với tháng trước</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Escrow Balance */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Số dư ký quỹ</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : formatCompactNumber(metrics?.escrowbalance || 0)}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-meta" style={{ fontSize: '12px' }}>
                                            {loading ? '' : formatCurrency(metrics?.escrowbalance || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 5: Pending Reviews */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Đang chờ duyệt</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">{loading ? '...' : metrics?.pendingreview || 0}</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-gold">
                                            Khẩn cấp: {metrics?.urgentreviews || 0}
                                        </span>
                                        <span className="admin-stat-meta">đơn</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 6: Active Disputes */}
                            <div className="admin-stat-card admin-stat-card-alert">
                                <div className="admin-stat-glow"></div>
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Khiếu nại đang hoạt động</span>
                                    <div className="admin-stat-icon admin-stat-icon-crimson">
                                        <span className="material-symbols-outlined">gavel</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">{loading ? '...' : metrics?.activedisputes || 0}</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-crimson">Cần xử lý</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 7: Total Users */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Tổng số người dùng</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : formatNumber(metrics?.totalusers || 0)}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">
                                            +{metrics?.usergrowth || 0}%
                                        </span>
                                        <span className="admin-stat-meta">so với 30 ngày qua</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 8: Monthly Revenue */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Doanh thu tháng này</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">
                                        {loading ? '...' : formatCompactNumber(metrics?.monthlyrevenue || 0)}
                                    </p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">
                                            +{metrics?.monthlygrowth || 0}%
                                        </span>
                                        <span className="admin-stat-meta">so với tháng trước</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHARTS SECTION */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                                gap: '24px',
                                marginTop: '32px',
                            }}
                        >
                            {/* Revenue Chart */}
                            <div
                                style={{
                                    background: '#ffffff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <RevenueChart data={revenueData} loading={loading} />
                            </div>

                            {/* User Growth Chart */}
                            <div
                                style={{
                                    background: '#ffffff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <UserGrowthChart data={userGrowthData} loading={loading} />
                            </div>
                        </div>

                        {/* RECENT ACTIVITIES + PRIORITY ACTIONS */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                                gap: '24px',
                                marginTop: '32px',
                            }}
                        >
                            {/* Recent Activities */}
                            <div
                                style={{
                                    background: '#ffffff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <RecentActivitiesFeed activities={activities} loading={loading} autoRefresh={true} />
                            </div>

                            {/* Quick Actions */}
                            <div
                                style={{
                                    background: '#ffffff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <h3
                                    style={{
                                        margin: '0 0 20px',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: 'var(--color-navy)',
                                    }}
                                >
                                    ⚡ Hành động nhanh
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button
                                        className="admin-action-btn admin-action-btn-outline"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
                                        onClick={() => navigate('/admin/vetting')}
                                    >
                                        <span className="material-symbols-outlined">verified_user</span>
                                        Xem xét gia sư chờ duyệt ({metrics?.pendingreview || 0})
                                    </button>
                                    <button
                                        className="admin-action-btn admin-action-btn-outline"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
                                        onClick={() => navigate('/admin/disputes')}
                                    >
                                        <span className="material-symbols-outlined">gavel</span>
                                        Giải quyết khiếu nại ({metrics?.activedisputes || 0})
                                    </button>
                                    <button
                                        className="admin-action-btn admin-action-btn-outline"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
                                        onClick={() => navigate('/admin/financials')}
                                    >
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                        Quản lý tài chính
                                    </button>
                                    <button
                                        className="admin-action-btn admin-action-btn-outline"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
                                        onClick={() => navigate('/admin/users')}
                                    >
                                        <span className="material-symbols-outlined">group</span>
                                        Quản lý người dùng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminDashboardPageEnhanced;
