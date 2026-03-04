import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Breadcrumb, Card, Tabs, Button } from 'antd';
import { toast } from 'react-toastify';
import { getPayoutOverview, getWithdrawalRequests } from '../../../services/adminPayout.service';
import type { PayoutOverview, WithdrawalRequestItem } from '../../../types/adminPayout.types';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, SecurityScanOutlined } from '@ant-design/icons';
import PayoutStatsCards from './components/PayoutStatsCards';
import WithdrawalRequestTable from './components/WithdrawalRequestTable';

const { Title, Text } = Typography;

const PayoutOverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<PayoutOverview | null>(null);
    const [requests, setRequests] = useState<WithdrawalRequestItem[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewRes, reqResponse] = await Promise.all([
                getPayoutOverview(),
                getWithdrawalRequests(currentPage, pageSize, activeTab === 'all' ? undefined : activeTab)
            ]);
            setOverview(overviewRes);
            setRequests(reqResponse.items);
            setTotal(reqResponse.total);
        } catch (error) {
            console.error('Failed to fetch payout data:', error);
            toast.error('Không thể tải dữ liệu thanh toán');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        setCurrentPage(1);
    };

    // Tabs khớp với WithdrawalStatus constants trong BE:
    // pending, approved, delayed, rejected, cancelled + pending_review
    const tabItems = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xử lý' },
        { key: 'pending_review', label: 'Chờ xét duyệt' },
        { key: 'delayed', label: 'Đang tạm giữ' },
        { key: 'approved', label: 'Đã phê duyệt' },
        { key: 'rejected', label: 'Đã từ chối' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Breadcrumb
                    items={[
                        { title: 'Quản trị' },
                        { title: 'Quản lý thanh toán' },
                    ]}
                    style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2}>Quản lý thanh toán</Title>
                        <Text type="secondary">Xét duyệt và xử lý các yêu cầu rút tiền từ gia sư</Text>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                            icon={<SearchOutlined />}
                            onClick={() => navigate('/admin-portal/payouts/history')}
                        >
                            Lịch sử rút tiền
                        </Button>
                        <Button
                            type="primary"
                            ghost
                            icon={<SecurityScanOutlined />}
                            onClick={() => navigate('/admin-portal/payout/fraud-logs')}
                            danger
                        >
                            Nhật ký an toàn (Fraud Logs)
                        </Button>
                    </div>
                </div>
            </div>

            <PayoutStatsCards overview={overview} loading={loading} />

            <Card variant="borderless" styles={{ body: { padding: '0 24px 24px' } }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                    style={{ marginBottom: '16px' }}
                />
                <WithdrawalRequestTable
                    data={requests}
                    loading={loading}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                />
            </Card>
        </div>
    );
};

export default PayoutOverviewPage;
