import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import TutorSearchPage from './pages/TutorSearch/TutorSearchPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';
import { TutorDetailPage } from './pages/TutorDetail';
import { AdminDashboardPage } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/AdminUserManagement';
import { AdminVettingPage } from './pages/AdminVetting';
// import { AdminDisputesPage } from './pages/AdminDisputes';
// import AdminDisputeDetailPageExpanded from './pages/AdminDisputes/AdminDisputeDetailPageExpanded';
import { AdminFinancialsPage } from './pages/AdminFinancials';
import { AdminSettingsPage } from './pages/AdminSettings';
import AdminWarningsPage from './pages/AdminWarnings/AdminWarningsPage';
import AdminLayout from './layouts/AdminLayout';
import TutorPortalLayout from './layouts/TutorPortalLayout';
import {
  TutorPortalProfile,
  TutorPortalDashboard,
  TutorPortalSchedule,
  TutorPortalMessages,
  TutorPortalClasses,
  TutorPortalClassDetail,
  TutorPortalStudentProfile,
  TutorPortalBookings,
} from './pages/TutorPortal';
import NotFoundPage from './pages/Error/NotFoundPage';
import UnauthorizedPage from './pages/Error/UnauthorizedPage';
import ForbiddenPage from './pages/Error/ForbiddenPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParentLayout from './layouts/ParentLayout';
import StudentLayout from './layouts/StudentLayout';
import ParentDashboard from './pages/ParentDashboard';
import ParentBooking from './pages/ParentBooking';
import BookingDetail from './pages/ParentBooking/Details';
import ParentWallet from './pages/ParentWallet';
import ParentMessage from './pages/ParentMessage';
import PaymentPage from './pages/ParentBooking/Payment';
import StudentDashboard from './pages/StudentDashboard';
import StudentLinkAccount from './pages/StudentLinkAccount';
import StudentAccount from './pages/StudentAccount';
import ParentStudent from './pages/ParentStudent';
import PaymentCallback from './pages/PaymentCallback/PaymentCallback';
import ParentLessons from './pages/ParentLessons';
import ParentLessonDetail from './pages/ParentLessons/ParentLessonDetail';
import ParentCalendar from './pages/ParentLessons/ParentCalendar';
// import ParentDisputes from './pages/ParentDisputes';
import StudentBooking from './pages/StudentBooking';
import StudentLessons from './pages/StudentLessons';
import StudentLessonDetail from './pages/StudentLessons/StudentLessonDetail';
import StudentCalendar from './pages/StudentLessons/StudentCalendar';
import TutorFinanceDashboardPage from './pages/TutorFinance/TutorFinanceDashboard/TutorFinanceDashboardPage';
import TransactionHistoryPage from './pages/TutorFinance/TransactionHistory/TransactionHistoryPage';
import BankInfoManagementPage from './pages/TutorFinance/BankInfoManagement/BankInfoManagementPage';
import CreateWithdrawalPage from './pages/TutorFinance/CreateWithdrawal/CreateWithdrawalPage';
import WithdrawalListPage from './pages/TutorFinance/WithdrawalList/WithdrawalListPage';
import WithdrawalDetailPage from './pages/TutorFinance/WithdrawalList/WithdrawalDetailPage';
import PayoutOverviewPage from './pages/AdminPayout/PayoutOverview/PayoutOverviewPage';
import PayoutDetailPage from './pages/AdminPayout/PayoutDetail/PayoutDetailPage';
import SessionExpiredModal from './components/SessionExpiredModal';
import { getCurrentUser, isTokenExpired } from './services/auth.service';
import PendingReviewPage from './pages/AdminPayout/PendingReview/PendingReviewPage';
import AllPayoutRequestsPage from './pages/AdminPayout/AllRequests/AllPayoutRequestsPage';
import FraudLogsPage from './pages/AdminPayout/FraudLogs/FraudLogsPage';

// ---------------------

function App() {
  const location = useLocation();
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const checkTokenExpiry = useCallback(() => {
    const user = getCurrentUser();
    // Chỉ check khi user đã đăng nhập (có data trong localStorage)
    if (user?.accessToken && isTokenExpired()) {
      setShowSessionExpired(true);
    }
  }, []);

  // Check token expiry khi route thay đổi
  useEffect(() => {
    checkTokenExpiry();
  }, [location.pathname, checkTokenExpiry]);

  // Check token expiry định kỳ mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  return (
    <div>
      <SessionExpiredModal
        isOpen={showSessionExpired}
        onClose={() => setShowSessionExpired(false)}
      />
      <ToastContainer position="top-right" autoClose={5000} style={{ zIndex: 99999 }} />

      <Routes>
        {/* Public Routes */}
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tutor-search" element={<TutorSearchPage />} />
        <Route path="/tutor-detail" element={<TutorDetailPage />} />
        <Route path="/tutor-detail/:id" element={<TutorDetailPage />} />

        {/* Admin Layout - PROTECTED */}
        <Route
          path="/admin-portal"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin-portal/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="vetting" element={<AdminVettingPage />} />
          {/* <Route path="disputes" element={<AdminDisputesPage />} /> */}
          {/* <Route path="disputes/:disputeId" element={<AdminDisputeDetailPageExpanded />} /> */}
          <Route path="financials" element={<AdminFinancialsPage />} />
          <Route path="warnings" element={<AdminWarningsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="payouts" element={<PayoutOverviewPage />} />
          <Route path="payouts/history" element={<AllPayoutRequestsPage />} />
          <Route path="payouts/:id" element={<PayoutDetailPage />} />
          <Route path="payout/review" element={<PendingReviewPage />} />
          <Route path="payout/review/:id" element={<div className="p-6">Payout Request Detail Page (Coming Soon)</div>} />
          <Route path="payout/fraud-logs" element={<FraudLogsPage />} />
        </Route>

        {/* Tutor Portal - PROTECTED */}
        <Route path="/tutor-portal" element={
          <ProtectedRoute allowedRoles={["Tutor"]}>
            <TutorPortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/tutor-portal/dashboard" replace />} />
          <Route path="dashboard" element={<TutorPortalDashboard />} />
          <Route path="profile" element={<TutorPortalProfile />} />
          <Route path="schedule" element={<TutorPortalSchedule />} />
          <Route path="messages" element={<TutorPortalMessages />} />
          <Route path="classes" element={<TutorPortalClasses />} />
          <Route path="classes/:classId" element={<TutorPortalClassDetail />} />
          <Route path="students/:studentId" element={<TutorPortalStudentProfile />} />
          <Route path="bookings" element={<TutorPortalBookings />} />
          <Route path="finance" element={<TutorFinanceDashboardPage />} />
          <Route path="finance/transactions" element={<TransactionHistoryPage />} />
          <Route path="finance/bank-info" element={<BankInfoManagementPage />} />
          <Route path="finance/withdraw" element={<CreateWithdrawalPage />} />
          <Route path="finance/withdrawals" element={<WithdrawalListPage />} />
          <Route path="finance/withdrawals/:id" element={<WithdrawalDetailPage />} />
        </Route>

        {/* Parent Layout - PROTECTED */}
        <Route
          path="/parent-portal"
          element={
            <ProtectedRoute allowedRoles={["Parent"]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/parent-portal/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="booking" element={<ParentBooking />} />
          <Route path="booking/:id" element={<BookingDetail />} />
          <Route path="booking/:id/payment" element={<PaymentPage />} />
          <Route path="student" element={<ParentStudent />} />
          <Route path="wallet" element={<ParentWallet />} />
          <Route path="messages" element={<ParentMessage />} />
          <Route path="calendar" element={<ParentCalendar />} />
          <Route path="lessons" element={<ParentLessons />} />
          <Route path="lessons/:lessonId" element={<ParentLessonDetail />} />
          {/* <Route path="disputes" element={<ParentDisputes />} /> */}
        </Route>

        {/* Student Layout - PROTECTED */}
        <Route
          path="/student-portal"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student-portal/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="booking" element={<StudentBooking />} />
          <Route path="booking/:id" element={<BookingDetail />} />
          <Route path="booking/:id/payment" element={<PaymentPage />} />
          <Route path="lessons" element={<StudentLessons />} />
          <Route path="lessons/:lessonId" element={<StudentLessonDetail />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="messages" element={<ParentMessage />} />
          <Route path="link-account" element={<StudentLinkAccount />} />
          <Route path="account" element={<StudentAccount />} />
        </Route>

        {/* PayOS callback - loaded inside iframe after payment */}
        <Route path="/payment/success" element={<PaymentCallback />} />
        <Route path="/payment/cancel" element={<PaymentCallback />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Error Pages */}
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch-all Route - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
