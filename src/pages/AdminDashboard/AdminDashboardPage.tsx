import '../../styles/pages/admin-dashboard.css';

const AdminDashboardPage = () => {
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
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-RgLEJMH5nbo-3tyQEnt7kaT8CyGOKT_-4vo8liFbcLUymnBOjDN3JlZ4DQ6YL4lvxytFsp0iIkLkXH7eVa2R3yYNWhb_SC1QA4lKYCSyY5emWbHIfFGZFfW_9R65CYBcbKwa82DV7zGTokos2f35OxJcNvRpDrB6kSMXB3EjC1dIaWasOfVzfQgmtMCEtNzx49MyGh5zObnmitst_kYueiU4bnr-I2wpMBYKHYY4JPQ_mZsUv6jY8AKsFnSYOefyynEYeV6Q8gw')" }}
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

                        {/* STATS GRID */}
                        <div className="admin-stats-grid">
                            {/* Card 1 */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Tổng số người dùng</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">12,450</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">+12%</span>
                                        <span className="admin-stat-meta">so với 30 ngày qua</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Đang chờ duyệt</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">42</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-gold">Khẩn cấp: 5</span>
                                        <span className="admin-stat-meta">đơn</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="admin-stat-card admin-stat-card-alert">
                                <div className="admin-stat-glow"></div>
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Khiếu nại đang hoạt động</span>
                                    <div className="admin-stat-icon admin-stat-icon-crimson">
                                        <span className="material-symbols-outlined">gavel</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">8</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-crimson">Cần xử lý</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <span className="admin-stat-label">Doanh thu tháng này</span>
                                    <div className="admin-stat-icon admin-stat-icon-primary">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-value">$142.3k</p>
                                    <div className="admin-stat-footer">
                                        <span className="admin-stat-badge admin-stat-badge-green">+5.2%</span>
                                        <span className="admin-stat-meta">so với tháng trước</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PRIORITY ACTIONS TABLE */}
                        <div className="admin-table-container">
                            <div className="admin-table-header">
                                <h3 className="admin-table-title">Hành động ưu tiên cần thiết</h3>
                                <button className="admin-view-all-btn">
                                    Xem tất cả
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>

                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-table-th">ID</th>
                                            <th className="admin-table-th">Loại</th>
                                            <th className="admin-table-th">Người dùng / Chủ đề</th>
                                            <th className="admin-table-th">Ngày</th>
                                            <th className="admin-table-th">Trạng thái</th>
                                            <th className="admin-table-th admin-table-th-right">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Row 1 */}
                                        <tr className="admin-table-row">
                                            <td className="admin-table-td admin-table-id">#VR-2049</td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-type">
                                                    <span className="material-symbols-outlined admin-type-icon">school</span>
                                                    <span className="admin-type-text">Duyệt gia sư</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-user">
                                                    <div
                                                        className="admin-user-thumbnail"
                                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwdaLq0QwR3f-212AWuMogOewV64mByEfiW58arWuED5tdockBnq2MF3sIQ_d5qV3C8MHXh44bRN1lg19mUlXV9V-atTF3SMkTR0Qp6SVkVleuiNPZOT1T9YuwVLY4OT9Fm8IQeSDeDV50il_GgcmwCDbR1-td-AWvRFEealeYnkqJKMxKTIJb6M3nlbu5f7XV6WUD7MZbNaj-sq9aRQgIwCuT0gJHvmjhpXUMXS-1sfYR9v9KmjA16o5enro7c-N6jozVK7Re7U0')" }}
                                                    ></div>
                                                    <div className="admin-user-details">
                                                        <p className="admin-user-name-text">Sarah Jenkins</p>
                                                        <p className="admin-user-subtitle">Chuyên gia Giải tích II</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-table-td admin-table-date">24 Th10, 2023</td>
                                            <td className="admin-table-td">
                                                <span className="admin-status-badge admin-status-pending">Chờ xem xét</span>
                                            </td>
                                            <td className="admin-table-td admin-table-td-right">
                                                <button className="admin-action-btn admin-action-btn-outline">Xem xét</button>
                                            </td>
                                        </tr>

                                        {/* Row 2 */}
                                        <tr className="admin-table-row">
                                            <td className="admin-table-td admin-table-id">#DS-9921</td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-type">
                                                    <span className="material-symbols-outlined admin-type-icon admin-type-icon-alert">warning</span>
                                                    <span className="admin-type-text admin-type-text-alert">Khiếu nại buổi học</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-user">
                                                    <div
                                                        className="admin-user-thumbnail"
                                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBY8nu_1dNaKWgoseYcXyqsj0hmm6M0et8hStHdjTkDTdLrKFa5ou6jkProrchky9luWlafRnrr65Wu_kpcIp7eWvmtgB8hdF21vxqCs6C0gakhTMgRRwXhvFsIUOAlri0rcwRyY_K4A4Qig3MyavIoJG0OVXxrDbM4Lfe_W1oZBIyeeNsXA0w-u2hOGTYHId88bKH5QvwgRFAOfiAryo03mZJBWpxkS9_5LY61qc2jlulNKLOITlMwQzlwMl6xNAaHL50pcCrEhms')" }}
                                                    ></div>
                                                    <div className="admin-user-details">
                                                        <p className="admin-user-name-text">Mark Davis</p>
                                                        <p className="admin-user-subtitle">Ref: Buổi học #4402</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-table-td admin-table-date">23 Th10, 2023</td>
                                            <td className="admin-table-td">
                                                <span className="admin-status-badge admin-status-escalated">Đã leo thang</span>
                                            </td>
                                            <td className="admin-table-td admin-table-td-right">
                                                <button className="admin-action-btn admin-action-btn-crimson">Giải quyết</button>
                                            </td>
                                        </tr>

                                        {/* Row 3 */}
                                        <tr className="admin-table-row">
                                            <td className="admin-table-td admin-table-id">#VR-2048</td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-type">
                                                    <span className="material-symbols-outlined admin-type-icon">school</span>
                                                    <span className="admin-type-text">Duyệt gia sư</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-user">
                                                    <div
                                                        className="admin-user-thumbnail"
                                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2DRECcchBetpTF1-OjBxMCp6P_GOojpMy5X1Ewrn3OABnY6SJPwkUNA19SQWfcvA43tu_L8io6AQMLgAp26WGt2bdcuSMjAaDE_A9nh6xoxRHf9g1GgZuQT0z0f8l8fUIqNAUHhqO3IGJ3pp7z-XrgUoVP8sXckKrIgtM7m9GATCSzcWsVBEgrcNEpHixOUfRxfw_YU2nxkznaZ3rJ-21sJld5qhy-3Yuod1ejjvrwcxFWJW0-fjO5W0DaJuQl8FSNnUKyrcbiNM')" }}
                                                    ></div>
                                                    <div className="admin-user-details">
                                                        <p className="admin-user-name-text">Emily Chen</p>
                                                        <p className="admin-user-subtitle">Tiến sĩ Vật lý</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-table-td admin-table-date">23 Th10, 2023</td>
                                            <td className="admin-table-td">
                                                <span className="admin-status-badge admin-status-pending">Chờ xem xét</span>
                                            </td>
                                            <td className="admin-table-td admin-table-td-right">
                                                <button className="admin-action-btn admin-action-btn-outline">Xem xét</button>
                                            </td>
                                        </tr>

                                        {/* Row 4 */}
                                        <tr className="admin-table-row">
                                            <td className="admin-table-td admin-table-id">#FN-3320</td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-type">
                                                    <span className="material-symbols-outlined admin-type-icon">receipt_long</span>
                                                    <span className="admin-type-text">Yêu cầu thanh toán</span>
                                                </div>
                                            </td>
                                            <td className="admin-table-td">
                                                <div className="admin-table-user">
                                                    <div className="admin-user-thumbnail admin-user-thumbnail-initials">
                                                        JD
                                                    </div>
                                                    <div className="admin-user-details">
                                                        <p className="admin-user-name-text">John Doe</p>
                                                        <p className="admin-user-subtitle">ID: 88291</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-table-td admin-table-date">22 Th10, 2023</td>
                                            <td className="admin-table-td">
                                                <span className="admin-status-badge admin-status-processing">Đang xử lý</span>
                                            </td>
                                            <td className="admin-table-td admin-table-td-right">
                                                <button className="admin-action-btn admin-action-btn-outline">Chi tiết</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminDashboardPage;
