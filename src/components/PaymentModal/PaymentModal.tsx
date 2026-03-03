import { useState, useEffect, useRef } from 'react';
import { X, Wallet, CreditCard, ExternalLink, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import styles from './PaymentModal.module.css';
import { getPaymentInfo, getPaymentStatus, payWithWallet, type PaymentInfoDTO } from '../../services/payment.service';
import { toast } from 'react-toastify';

interface PaymentModalProps {
    bookingId: number;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentModal = ({ bookingId, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) => {
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfoDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [waitingForPayOS, setWaitingForPayOS] = useState(false);
    const payosWindowRef = useRef<Window | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchPaymentInfo();
            setWaitingForPayOS(false);
        }
    }, [isOpen, bookingId]);

    const fetchPaymentInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const info = await getPaymentInfo(bookingId);
            setPaymentInfo(info);
        } catch (err: any) {
            console.warn('Failed to fetch payment info:', err?.response?.status, err?.response?.data);
            const errorCode = err.response?.data?.errorCode;

            if (errorCode === 'BOOKING_EXPIRED') {
                setError('BOOKING_EXPIRED');
            } else if (errorCode === 'BOOKING_ALREADY_PAID') {
                setError('BOOKING_ALREADY_PAID');
                setTimeout(() => {
                    onPaymentSuccess();
                    onClose();
                }, 2000);
            } else {
                setError(err.response?.data?.message || 'Không thể tải thông tin thanh toán. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Listen for localStorage changes from PaymentCallback page (in new tab)
    useEffect(() => {
        if (!waitingForPayOS) return;

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'payos_payment_result' && event.newValue) {
                try {
                    const result = JSON.parse(event.newValue);
                    if (result.isPaid) {
                        setWaitingForPayOS(false);
                        localStorage.removeItem('payos_payment_result');
                        toast.success('Thanh toán thành công! Đang cập nhật...');
                        setTimeout(() => {
                            onPaymentSuccess();
                            onClose();
                        }, 1500);
                    } else if (result.cancel) {
                        setWaitingForPayOS(false);
                        localStorage.removeItem('payos_payment_result');
                        toast.info('Thanh toán đã bị hủy.');
                    }
                } catch (e) {
                    console.error('[PaymentModal] Failed to parse payment result:', e);
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [waitingForPayOS, onPaymentSuccess, onClose]);

    // Poll every 5s as backup
    useEffect(() => {
        if (!waitingForPayOS) return;

        const interval = setInterval(async () => {
            try {
                const statusData = await getPaymentStatus(bookingId);
                const isPhaseComplete = paymentInfo?.paymentPhase === 'deposit'
                    ? statusData.isDepositPaid
                    : statusData.isRemainingPaid || statusData.isPaid;

                if (isPhaseComplete || statusData.status === 'PAID') {
                    clearInterval(interval);
                    setWaitingForPayOS(false);
                    localStorage.removeItem('payos_payment_result');
                    toast.success('Thanh toán thành công! Đang cập nhật...');
                    setTimeout(() => {
                        onPaymentSuccess();
                        onClose();
                    }, 1500);
                }
            } catch (err) {
                console.error('[PaymentModal] Status poll failed:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [waitingForPayOS, bookingId, paymentInfo?.paymentPhase]);

    // Check if new tab was closed by user
    useEffect(() => {
        if (!waitingForPayOS) return;

        const interval = setInterval(() => {
            if (payosWindowRef.current && payosWindowRef.current.closed) {
                const stored = localStorage.getItem('payos_payment_result');
                if (stored) {
                    const result = JSON.parse(stored);
                    if (result.isPaid) {
                        setWaitingForPayOS(false);
                        localStorage.removeItem('payos_payment_result');
                        toast.success('Thanh toán thành công!');
                        setTimeout(() => { onPaymentSuccess(); onClose(); }, 1500);
                        return;
                    }
                }
                setWaitingForPayOS(false);
                payosWindowRef.current = null;
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [waitingForPayOS]);

    const handleWalletPayment = async () => {
        if (!paymentInfo?.canPayWithWallet) return;

        try {
            setPaying(true);
            await payWithWallet(bookingId);
            toast.success(
                paymentInfo.paymentPhase === 'deposit'
                    ? 'Đặt cọc thành công!'
                    : 'Thanh toán phần còn lại thành công!'
            );
            onPaymentSuccess();
            onClose();
        } catch (err: any) {
            console.error('Wallet payment failed:', err);
            toast.error(err.response?.data?.message || 'Thanh toán thất bại.');
        } finally {
            setPaying(false);
        }
    };

    const handleOpenPayOS = () => {
        if (!paymentInfo?.checkoutUrl) return;
        localStorage.removeItem('payos_payment_result');
        const w = window.open(paymentInfo.checkoutUrl, '_blank');
        payosWindowRef.current = w;
        setWaitingForPayOS(true);
    };

    if (!isOpen) return null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const getPhaseTitle = () => {
        if (!paymentInfo) return 'Hoàn tất thanh toán';
        return paymentInfo.paymentPhase === 'remaining'
            ? '💰 Thanh toán phần còn lại'
            : '🔒 Thanh toán đặt cọc (50%)';
    };

    // ====== WAITING FOR PAYOS (new tab opened) ======
    if (waitingForPayOS) {
        return (
            <div className={styles.fullscreenOverlay}>
                <div className={styles.waitingContent}>
                    <div className={styles.waitingIcon}>
                        <Loader2 size={48} className={styles.spinner} />
                    </div>
                    <h2 className={styles.waitingTitle}>Đang chờ thanh toán...</h2>
                    <p className={styles.waitingDesc}>
                        Vui lòng hoàn tất thanh toán trong tab vừa mở.<br />
                        Trang này sẽ tự động cập nhật khi thanh toán thành công.
                    </p>
                    {paymentInfo?.checkoutUrl && (
                        <a
                            href={paymentInfo.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.reopenLink}
                        >
                            <ExternalLink size={14} />
                            Mở lại trang thanh toán
                        </a>
                    )}
                    <button
                        onClick={() => setWaitingForPayOS(false)}
                        className={styles.cancelWaitingBtn}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // ====== NORMAL PAYMENT MODAL ======
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{getPhaseTitle()}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    {loading ? (
                        <div className={styles.loaderContainer}>
                            <Loader2 className={styles.spinner} />
                            <p>Đang tải thông tin thanh toán...</p>
                        </div>
                    ) : error === 'BOOKING_EXPIRED' ? (
                        <div className={styles.errorContainer}>
                            <AlertTriangle className={styles.errorIcon} size={48} />
                            <h3>Yêu cầu thanh toán đã hết hạn</h3>
                            <p>Booking này đã quá hạn thanh toán và đã bị hủy tự động.</p>
                            <button onClick={onClose} className={styles.retryBtn}>Đóng</button>
                        </div>
                    ) : error === 'BOOKING_ALREADY_PAID' ? (
                        <div className={styles.successContainer}>
                            <CheckCircle2 className={styles.successIcon} size={48} />
                            <h3>Đã thanh toán thành công!</h3>
                            <p>Booking này đã được thanh toán trước đó.</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <AlertTriangle className={styles.errorIcon} />
                            <p>{error}</p>
                            <button onClick={fetchPaymentInfo} className={styles.retryBtn}>Thử lại</button>
                        </div>
                    ) : paymentInfo ? (
                        <>
                            <div className={styles.summaryBox}>
                                <div className={styles.summaryRow}>
                                    <span>Mã đơn hàng:</span>
                                    <strong>#{bookingId}</strong>
                                </div>
                                {/* 2-stage breakdown */}
                                {paymentInfo.totalAmount != null && paymentInfo.totalAmount > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Tổng giá trị booking:</span>
                                        <span>{formatCurrency(paymentInfo.totalAmount)}</span>
                                    </div>
                                )}
                                {paymentInfo.paymentPhase === 'remaining' && paymentInfo.depositAmount != null && (
                                    <div className={styles.summaryRow}>
                                        <span>Đã đặt cọc (50%):</span>
                                        <span style={{ color: '#16a34a' }}>- {formatCurrency(paymentInfo.depositAmount)}</span>
                                    </div>
                                )}
                                <div className={styles.summaryRow}>
                                    <span>
                                        {paymentInfo.paymentPhase === 'remaining'
                                            ? 'Số tiền còn lại cần thanh toán:'
                                            : 'Số tiền đặt cọc (50%):'}
                                    </span>
                                    <strong className={styles.amount}>{formatCurrency(paymentInfo.amount)}</strong>
                                </div>
                                {paymentInfo.expiredAt && (
                                    <div className={styles.deadlineRow}>
                                        <Clock size={14} />
                                        <span>Hết hạn: {new Date(paymentInfo.expiredAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.sectionTitle}>Chọn phương thức thanh toán</div>

                            <div className={styles.paymentOptions}>
                                {/* Option 1: Wallet */}
                                <div className={`${styles.optionCard} ${!paymentInfo.canPayWithWallet ? styles.disabled : ''}`}>
                                    <div className={styles.optionHeader}>
                                        <div className={styles.optionIconWrap}>
                                            <Wallet size={24} />
                                        </div>
                                        <div className={styles.optionInfo}>
                                            <div className={styles.optionName}>Thanh toán bằng ví</div>
                                            <div className={styles.walletBalance}>Số dư: {formatCurrency(paymentInfo.walletBalance)}</div>
                                        </div>
                                    </div>
                                    {!paymentInfo.canPayWithWallet ? (
                                        <div className={styles.insufficientText}>Số dư không đủ</div>
                                    ) : (
                                        <div className={styles.payAction}>
                                            <button
                                                className={styles.payBtn}
                                                onClick={handleWalletPayment}
                                                disabled={paying}
                                            >
                                                {paying ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Option 2: PayOS — opens new tab */}
                                <div className={styles.optionCard} onClick={handleOpenPayOS}>
                                    <div className={styles.optionHeader}>
                                        <div className={styles.optionIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div className={styles.optionInfo}>
                                            <div className={styles.optionName}>Chuyển khoản ngân hàng (PayOS)</div>
                                            <div className={styles.payosSub}>Hỗ trợ tất cả ngân hàng, QR Code</div>
                                        </div>
                                    </div>
                                    <div className={styles.payAction}>
                                        <button className={styles.payBtn} style={{ background: '#2563eb' }}>
                                            <ExternalLink size={14} />
                                            Mở trang thanh toán
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className={styles.footer}>
                    <div className={styles.secureInfo}>
                        <CheckCircle2 size={14} />
                        <span>Thanh toán an toàn &amp; bảo mật bởi TUTORA</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
