import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getPaymentInfo,
    payWithWallet,
    getBookingById,
    getPaymentStatus,
    type PaymentInfoResponse,
    type BookingResponseDTO
} from '../../../services/booking.service';
import styles from './styles.module.css';
import {
    CreditCard,
    Wallet,
    ShieldCheck,
    AlertCircle,
    ChevronLeft,
    Clock,
    MapPin,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';
import { Spin, QRCode, Button, Radio } from 'antd';
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<BookingResponseDTO | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'payos' | 'wallet'>('payos');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const bookingId = Number(id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bookingRes, paymentRes] = await Promise.all([
                    getBookingById(bookingId),
                    getPaymentInfo(bookingId)
                ]);
                if (!bookingRes?.content || !paymentRes?.content) {
                    throw new Error('Dữ liệu không hợp lệ');
                }
                setBooking(bookingRes.content);
                setPaymentInfo(paymentRes.content);

                // If already paid, show success
                if (bookingRes.content.paymentStatus === 'paid') {
                    setPaymentSuccess(true);
                }
            } catch (error) {
                toast.error('Không thể tải thông tin thanh toán.');
                navigate('/parent/booking');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) fetchData();
    }, [bookingId, navigate]);

    // Polling payment status for PayOS
    useEffect(() => {
        let interval: any;
        if (paymentMethod === 'payos' && !paymentSuccess && !loading) {
            interval = setInterval(async () => {
                try {
                    const res = await getPaymentStatus(bookingId);
                    if ((res?.content as any)?.paymentStatus === 'paid') {
                        setPaymentSuccess(true);
                        toast.success('Thanh toán thành công!');
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [bookingId, paymentMethod, paymentSuccess, loading]);

    const handleWalletPay = async () => {
        if (!paymentInfo || paymentInfo.walletBalance < paymentInfo.amount) {
            toast.error('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
            return;
        }

        try {
            setIsPaying(true);
            await payWithWallet(bookingId);
            setPaymentSuccess(true);
            toast.success('Thanh toán bằng ví thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
        } finally {
            setIsPaying(false);
        }
    };

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    if (loading) {
        return (
            <div className={styles.loadingOverlay}>
                <Spin size="large" tip="Đang chuẩn bị thông tin thanh toán..." />
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                        <CheckCircle2 size={64} color="#059669" />
                    </div>
                    <h1>Thanh toán hoàn tất!</h1>
                    <p>Cảm ơn bạn đã tin tưởng TUTORA. Buổi học của bạn đã được lên lịch.</p>
                    <div className={styles.successActions}>
                        <Button type="primary" size="large" onClick={() => navigate(`/parent/booking/${bookingId}`)}>
                            Xem chi tiết lịch học
                        </Button>
                        <Button size="large" onClick={() => navigate('/parent/booking')}>
                            Quản lý lớp học
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.topNav}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    <ChevronLeft size={20} /> Quay lại
                </button>
                <h1>Thanh toán khóa học</h1>
            </div>

            <div className={styles.layout}>
                {/* Left Column: Summary */}
                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Tóm tắt đơn hàng</h2>
                        <div className={styles.tutorBrief}>
                            <img src={booking?.tutor?.avatarUrl} alt="" className={styles.avatar} />
                            <div>
                                <h3>{booking?.tutor?.fullName || 'N/A'}</h3>
                                <p><GraduationCap size={14} /> Gia sư {booking?.subject?.subjectName || 'N/A'}</p>
                            </div>
                        </div>

                        <div className={styles.bookingDetails}>
                            <div className={styles.detailItem}>
                                <Clock size={16} />
                                <span>Gói {booking?.sessionCount} buổi học</span>
                            </div>
                            <div className={styles.detailItem}>
                                <MapPin size={16} />
                                <span>Học {booking?.packageType === 'online' ? 'Trực tuyến' : 'Trực tiếp'}</span>
                            </div>
                        </div>

                        <div className={styles.priceBreakdown}>
                            <div className={styles.priceRow}>
                                <span>Học phí:</span>
                                <span>{formatPrice(booking?.price || 0)}</span>
                            </div>
                            {booking?.discountApplied && booking.discountApplied > 0 ? (
                                <div className={styles.priceRow}>
                                    <span>Giảm giá:</span>
                                    <span className={styles.discount}>-{formatPrice(booking.discountApplied)}</span>
                                </div>
                            ) : null}
                            <div className={`${styles.priceRow} ${styles.totalRow}`}>
                                <span>Tổng cộng:</span>
                                <span className={styles.totalPrice}>{formatPrice(paymentInfo?.amount || 0)}</span>
                            </div>
                        </div>

                        <div className={styles.securityNote}>
                            <ShieldCheck size={16} />
                            <p>TUTORA đảm bảo thanh toán an toàn. Tiền chỉ được chuyển cho gia sư sau khi buổi học hoàn thành.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Methods */}
                <main className={styles.main}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Chọn phương thức thanh toán</h2>

                        <Radio.Group
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            value={paymentMethod}
                            className={styles.methodGroup}
                        >
                            <label className={`${styles.methodItem} ${paymentMethod === 'payos' ? styles.methodActive : ''}`}>
                                <Radio value="payos" />
                                <div className={styles.methodContent}>
                                    <div className={styles.methodIcon}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className={styles.methodInfo}>
                                        <h3>Quét mã QR Ngân hàng (PayOS)</h3>
                                        <p>Hỗ trợ tất cả ứng dụng Mobile Banking</p>
                                    </div>
                                </div>
                            </label>

                            <label className={`${styles.methodItem} ${paymentMethod === 'wallet' ? styles.methodActive : ''}`}>
                                <Radio value="wallet" />
                                <div className={styles.methodContent}>
                                    <div className={styles.methodIcon}>
                                        <Wallet size={24} />
                                    </div>
                                    <div className={styles.methodInfo}>
                                        <h3>Số dư ví TUTORA</h3>
                                        <p>Số dư hiện tại: <strong>{formatPrice(paymentInfo?.walletBalance || 0)}</strong></p>
                                    </div>
                                </div>
                            </label>
                        </Radio.Group>

                        <div className={styles.paymentActionArea}>
                            {paymentMethod === 'payos' ? (
                                <div className={styles.payosArea}>
                                    <div className={styles.qrContainer}>
                                        <QRCode value={paymentInfo?.checkoutUrl || ''} size={200} />
                                        <p className={styles.qrHint}>Mở ứng dụng Ngân hàng để quét mã</p>
                                    </div>
                                    <div className={styles.transferInfo}>
                                        <div className={styles.infoRow}>
                                            <span>Chủ tài khoản:</span>
                                            <strong>{paymentInfo?.accountName}</strong>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span>Số tài khoản:</span>
                                            <strong>{paymentInfo?.accountNumber}</strong>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span>Ngân hàng:</span>
                                            <strong>MB Bank</strong>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span>Số tiền:</span>
                                            <strong className={styles.amount}>{formatPrice(paymentInfo?.amount || 0)}</strong>
                                        </div>
                                    </div>
                                    <div className={styles.waitingStatus}>
                                        <Spin size="small" />
                                        <span>Đang chờ bạn thực hiện thanh toán... Hệ thống sẽ tự động cập nhật.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.walletArea}>
                                    {paymentInfo && paymentInfo.walletBalance < paymentInfo.amount ? (
                                        <div className={styles.insufficientFunds}>
                                            <AlertCircle size={20} />
                                            <p>Số dư không đủ để thanh toán. Vui lòng chọn phương thức khác hoặc nạp thêm tiền.</p>
                                        </div>
                                    ) : (
                                        <p className={styles.walletHint}>
                                            Hệ thống sẽ khấu trừ trực tiếp <strong>{formatPrice(paymentInfo?.amount || 0)}</strong> từ ví của bạn.
                                        </p>
                                    )}
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        disabled={!paymentInfo || paymentInfo.walletBalance < paymentInfo.amount || isPaying}
                                        loading={isPaying}
                                        onClick={handleWalletPay}
                                        className={styles.payBtn}
                                    >
                                        Xác nhận thanh toán bằng ví
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PaymentPage;
