import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { FinancialMetrics, WithdrawalRequest } from '../../types/admin.types';
import { formatCurrency, formatCompactNumber, formatDateTime } from '../../utils/formatters';
import {
    mockGetFinancialMetrics,
    mockGetWithdrawalRequests,
    mockApproveWithdrawal,
    mockRejectWithdrawal,
} from './mockData';
import ApproveWithdrawalModal from './components/ApproveWithdrawalModal';
import RejectWithdrawalModal from './components/RejectWithdrawalModal';
import TransactionLedger from './components/TransactionLedger';
import '../../styles/pages/admin-dashboard.css';
import '../../styles/pages/admin-financial.css';

const AdminFinancialsPage = () => {
    // State
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'withdrawals' | 'ledger' | 'commission'>('withdrawals');

    // Modal state
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            const [metricsData, withdrawalsData] = await Promise.all([
                mockGetFinancialMetrics(),
                mockGetWithdrawalRequests(),
            ]);

            setMetrics(metricsData);
            setWithdrawalRequests(withdrawalsData);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            toast.error('Không thể tải dữ liệu tài chính');
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleApproveClick = (withdrawal: WithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (withdrawal: WithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setIsRejectModalOpen(true);
    };

    const handleApproveWithdrawal = async (withdrawalId: string) => {
        await mockApproveWithdrawal(withdrawalId);
        // Refresh data
        await fetchFinancialData();
    };

    const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
        await mockRejectWithdrawal(withdrawalId, reason);
        // Refresh data
        await fetchFinancialData();
    };

    return (
        <>
            {/* MAIN CONTENT */}

            {/* MAIN CONTENT */}
            <main className="admin-main">
                {/* FLOATING HEADER */}
                <header className="admin-header-container">
                    <div className="admin-header-glass">
                        <div className="flex flex-col gap-1">
                            <p className="admin-subtitle" style={{ color: 'var(--color-navy-60)', marginTop: 0 }}>Tổng quan</p>
                            <h1 className="admin-greeting-title" style={{ fontSize: '32px' }}>Tổng quan Tài chính</h1>
                        </div>

                        <div className="admin-header-actions">
                            <button className="admin-action-btn admin-action-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
                                <span>Th10 2023</span>
                            </button>
                            <button className="admin-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-navy)', color: 'white' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
                                <span>Xuất báo cáo</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE AREA */}
                <div className="admin-content">
                    <div className="admin-content-inner">

                        {/* KPI CARDS */}
                        <section className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {/* Card 1: Revenue */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon admin-stat-icon-green">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <span className="admin-stat-badge bg-TUTORA-green-5 text-TUTORA-green">
                                        +{metrics?.revenuegrowth || 0}%
                                    </span>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-label">Doanh thu nền tảng (30 ngày)</p>
                                    <p className="admin-stat-value text-TUTORA-green" style={{ marginTop: '4px' }}>
                                        {loading ? '...' : formatCompactNumber(metrics?.monthlyrevenue || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Escrow */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon admin-stat-icon-primary" style={{ backgroundColor: 'rgba(27, 34, 56, 0.1)', color: 'var(--color-navy)' }}>
                                        <span className="material-symbols-outlined">lock_clock</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-label">Tiền đang giữ</p>
                                    <p className="admin-stat-value" style={{ marginTop: '4px' }}>
                                        {loading ? '...' : formatCompactNumber(metrics?.escrowbalance || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Total Refunds */}
                            <div className="admin-stat-card">
                                <div className="admin-stat-header">
                                    <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                                        <span className="material-symbols-outlined">undo</span>
                                    </div>
                                </div>
                                <div className="admin-stat-content">
                                    <p className="admin-stat-label">Tổng hoàn tiền (30 ngày)</p>
                                    <p className="admin-stat-value" style={{ marginTop: '4px' }}>
                                        {loading ? '...' : formatCompactNumber(metrics?.totalrefunds || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Withdrawal Requests */}
                            <div className="admin-stat-card" style={{ borderColor: 'rgba(212, 180, 131, 0.4)' }}>
                                <div className="withdrawal-card-decoration"></div>
                                <div className="admin-stat-header" style={{ position: 'relative', zIndex: 10 }}>
                                    <div className="admin-stat-icon bg-TUTORA-gold-20 text-amber-700">
                                        <span className="material-symbols-outlined">priority_high</span>
                                    </div>
                                    <span className="admin-stat-badge bg-amber-50 text-amber-700">
                                        {metrics?.pendingwithdrawals || 0} chờ xử lý
                                    </span>
                                </div>
                                <div className="admin-stat-content" style={{ position: 'relative', zIndex: 10 }}>
                                    <p className="admin-stat-label">Yêu cầu rút tiền</p>
                                    <p className="admin-stat-value" style={{ color: 'var(--color-gold)', marginTop: '4px' }}>
                                        {loading ? '...' : formatCompactNumber(metrics?.pendingwithdrawalamount || 0)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* MAIN TABLE SECTION */}
                        <section className="admin-financial-table-section">
                            {/* Tabs */}
                            <div className="admin-tabs-container">
                                <button
                                    className={`admin-tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('withdrawals')}
                                >
                                    <span className="admin-tab-text">Yêu cầu rút tiền</span>
                                </button>
                                <button
                                    className={`admin-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('ledger')}
                                >
                                    <span className="admin-tab-text">Sổ cái giao dịch</span>
                                </button>
                                <button
                                    className={`admin-tab-btn ${activeTab === 'commission' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('commission')}
                                >
                                    <span className="admin-tab-text">Cài đặt hoa hồng</span>
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'withdrawals' && (
                                <div className="admin-table-wrapper" style={{ padding: '16px' }}>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                            <p>Đang tải yêu cầu rút tiền...</p>
                                        </div>
                                    ) : withdrawalRequests.filter((w) => w.status === 'pending').length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }}>
                                                check_circle
                                            </span>
                                            <p>Không có yêu cầu rút tiền nào đang chờ xử lý</p>
                                        </div>
                                    ) : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th className="admin-table-th">Mã yêu cầu</th>
                                                    <th className="admin-table-th">Thông tin gia sư</th>
                                                    <th className="admin-table-th">Thông tin ngân hàng</th>
                                                    <th className="admin-table-th">Số tiền</th>
                                                    <th className="admin-table-th">Ngày yêu cầu</th>
                                                    <th className="admin-table-th admin-table-th-right">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {withdrawalRequests
                                                    .filter((w) => w.status === 'pending')
                                                    .map((withdrawal) => (
                                                        <tr key={withdrawal.withdrawalid} className="admin-table-row">
                                                            <td className="admin-table-td">
                                                                <span className="admin-status-badge bg-slate-50 text-slate-800 font-mono">
                                                                    #{withdrawal.withdrawalid}
                                                                </span>
                                                            </td>
                                                            <td className="admin-table-td">
                                                                <div className="admin-table-user">
                                                                    <div
                                                                        className="admin-user-thumbnail"
                                                                        style={{ backgroundImage: `url('${withdrawal.tutoravatar}')` }}
                                                                    ></div>
                                                                    <div className="admin-user-details">
                                                                        <p className="admin-user-name-text">{withdrawal.tutorname}</p>
                                                                        <p className="admin-user-subtitle">{withdrawal.tutorsubject}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="admin-table-td">
                                                                <div className="bank-details">
                                                                    <span className="material-symbols-outlined" style={{ color: 'var(--color-navy)' }}>
                                                                        account_balance
                                                                    </span>
                                                                    <div className="bank-info">
                                                                        <span className="bank-name">{withdrawal.bankname}</span>
                                                                        <span className="bank-account">{withdrawal.bankaccountmasked}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="admin-table-td">
                                                                <span className="amount-text">{formatCurrency(withdrawal.amount)}</span>
                                                            </td>
                                                            <td className="admin-table-td">
                                                                <span className="text-slate-600 font-medium text-sm">
                                                                    {formatDateTime(withdrawal.requestedat)}
                                                                </span>
                                                            </td>
                                                            <td className="admin-table-td admin-table-td-right">
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                                    <button className="btn-reject" onClick={() => handleRejectClick(withdrawal)}>
                                                                        Từ chối
                                                                    </button>
                                                                    <button className="btn-process" onClick={() => handleApproveClick(withdrawal)}>
                                                                        <span className="material-symbols-outlined">check</span>
                                                                        Xử lý thanh toán
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ledger' && <TransactionLedger />}

                            {activeTab === 'commission' && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }}>
                                        settings
                                    </span>
                                    <p>Cài đặt hoa hồng sẽ được triển khai trong Phase 3</p>
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </main>

            {/* Modals */}
            <ApproveWithdrawalModal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    setSelectedWithdrawal(null);
                }}
                withdrawal={selectedWithdrawal}
                onApprove={handleApproveWithdrawal}
            />

            <RejectWithdrawalModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setSelectedWithdrawal(null);
                }}
                withdrawal={selectedWithdrawal}
                onReject={handleRejectWithdrawal}
            />
        </>
    );
};

export default AdminFinancialsPage;
