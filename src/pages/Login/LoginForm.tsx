/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Login/LoginForm.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InputGroup from "../../components/InputGroup";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";
import { supabase } from "../../lib/supabase";
import {
  checkEmailExists,
  simpleLogin,
  loginWithOAuth,
  saveUserToStorage,
} from "../../services/auth.service";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Ref để track manual login (tránh double call API)
  const isManualLoginRef = React.useRef(false);

  // State loading cho manual login (inline trên button)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State hiển thị Overlay (chỉ dùng cho OAuth callback)
  const [showOverlay, setShowOverlay] = useState(false);

  // State nội dung chữ hiển thị trên Overlay
  const [overlayText, setOverlayText] = useState("Đang xử lý...");

  // --- LOGIC AUTHENTICATION (CHỈ CHO OAUTH) ---
  useEffect(() => {
    // 1. Kiểm tra URL ngay lập tức để bật màn che TRƯỚC KHI giao diện kịp render
    if (window.location.hash && window.location.hash.includes("access_token")) {
      setOverlayText("Đang xác thực bảo mật...");
      setShowOverlay(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const userEmail = session.user.email;
          const accessToken = session.access_token;

          if (userEmail && accessToken) {
            // Chỉ xử lý OAuth flow, bỏ qua nếu đang manual login
            if (!isManualLoginRef.current) {
              await handleAuthFlow(userEmail, accessToken);
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuthFlow = async (email: string, token: string) => {
    try {
      setShowOverlay(true);
      setOverlayText("Đang kiểm tra thông tin tài khoản...");
      console.log("🔍 Checking email:", email);

      const userCheck = await checkEmailExists(email);

      if (userCheck && userCheck.content) {
        setOverlayText("Đang đăng nhập vào hệ thống...");

        const loginResponse = await loginWithOAuth(token, email);

        const fullUserData = {
          ...userCheck.content,
          accessToken: loginResponse.accessToken,
        };

        saveUserToStorage(fullUserData);
        window.dispatchEvent(new Event("auth-change"));
        toast.success(`Chào mừng ${userCheck.content.fullname} quay lại!`);
        navigate("/");
      } else {
        throw new Error("USER_NOT_FOUND");
      }
    } catch (error: any) {
      console.error("❌ OAuth Login Error:", error);

      const isUserNotFound =
        error.message === "USER_NOT_FOUND" ||
        (error.response && error.response.status === 404);

      if (isUserNotFound) {
        console.log("⚠️ USER_NOT_FOUND - Redirecting to register");
        setOverlayText(
          "Tài khoản chưa tồn tại. Đang chuyển sang trang Đăng ký..."
        );
        toast.info("Vui lòng hoàn tất đăng ký để tiếp tục.");

        setTimeout(() => {
          navigate("/register", { state: { email: email } });
        }, 1500);
      } else {
        console.log("❌ Other error - Signing out");
        await supabase.auth.signOut();
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        setShowOverlay(false);
      }
    }
  };

  // --- CÁC HÀM XỬ LÝ FORM ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning("Vui lòng nhập đầy đủ email/SĐT và mật khẩu!");
      return;
    }

    try {
      setIsSubmitting(true);
      isManualLoginRef.current = true;

      // Gọi SimpleAuth login trực tiếp tới backend
      const response = await simpleLogin(formData.email.trim(), formData.password);

      console.log("✅ SimpleLogin response:", response);

      // Extract token
      const token = response.content?.token || response.token;
      if (!token) {
        throw new Error("Không nhận được token từ server.");
      }

      // Lưu user data (lấy profile đầy đủ từ backend)
      let fullUserData: any = { accessToken: token };

      const input = formData.email.trim();
      if (input.includes("@")) {
        const userProfile = await checkEmailExists(input);
        if (userProfile?.content) {
          fullUserData = { ...userProfile.content, accessToken: token };
        }
      } else {
        // Nếu login bằng phone, decode token để lấy info
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);

          const emailClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
          const userEmail = payload[emailClaim] || payload.email;

          if (userEmail) {
            const userProfile = await checkEmailExists(userEmail);
            if (userProfile?.content) {
              fullUserData = { ...userProfile.content, accessToken: token };
            }
          }
        } catch (decodeError) {
          console.warn("Could not decode token to get email:", decodeError);
        }
      }

      saveUserToStorage(fullUserData);
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Chào mừng bạn quay lại!");
      setTimeout(() => navigate("/"), 1000);

    } catch (error: any) {
      console.error("Login Error:", error);
      isManualLoginRef.current = false;

      const errorMsg = error.response?.data?.message
        || error.response?.data?.content
        || error.message
        || "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/login",
          queryParams: {
            access_type: "offline",
            prompt: "consent select_account",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.log(error);
      toast.error("Không thể kết nối với Google.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form relative">
      {/* OAuth callback overlay — chỉ hiển thị khi redirect từ Google về */}
      {showOverlay &&
        createPortal(
          <div
            className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-300"
            style={{ zIndex: 99999, backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(8px)" }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "40px 48px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                maxWidth: "360px",
              }}
            >
              {/* Spinner */}
              <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>

              {/* Text trạng thái */}
              <p className="text-gray-700 text-base font-medium text-center" style={{ margin: 0 }}>
                {overlayText}
              </p>
            </div>
          </div>,
          document.body
        )}

      {/* --- NỘI DUNG FORM CHÍNH --- */}
      <div className="login-form__header animate-fade-in-up">
        <h1 className="login-form__title">Chào mừng trở lại</h1>
        <p className="login-form__subtitle">
          Tiếp tục hành trình học thuật của bạn cùng TUTORA.
        </p>
      </div>

      <div className="login-form__body">
        <form onSubmit={handleSubmit} className="login-form__form">
          <div className="animate-fade-in-up delay-100">
            <InputGroup
              id="email"
              name="email"
              type="text"
              label="Email hoặc SĐT"
              placeholder="name@example.com"
              icon="mail"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="animate-fade-in-up delay-200">
            <InputGroup
              id="password"
              name="password"
              type="password"
              label="Mật khẩu"
              placeholder="••••••••"
              icon="lock"
              value={formData.password}
              onChange={handleChange}
              showPasswordToggle={true}
              disabled={isSubmitting}
            />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          <div className="login-form__submit animate-fade-in-up delay-300">
            <button
              type="submit"
              className="login-form__button"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          <div className="login-form__divider animate-fade-in-up delay-300">
            <div className="login-form__divider-line"></div>
            <span className="login-form__divider-text">Hoặc</span>
            <div className="login-form__divider-line"></div>
          </div>

          <div className="login-form__social animate-fade-in-up delay-300">
            <button
              type="button"
              className="login-form__social-btn"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.71 16.69 5.84 14.04H2.17V16.9C3.98 20.48 7.69 23 12 23Z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.04C5.62 13.38 5.49 12.68 5.49 11.95C5.49 11.22 5.62 10.52 5.84 9.86V6.99H2.17C1.4 8.49 1 10.17 1 12C1 13.83 1.4 15.51 2.17 17.01L5.84 14.04Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69 1 3.98 3.52 2.17 7.1L5.84 9.97C6.71 7.31 9.13 5.38 12 5.38Z"
                  fill="#EA4335"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>
          </div>

          <div className="login-form__register animate-fade-in-up delay-300">
            <p>
              Chưa có tài khoản?{" "}
              <a href="/register" className="login-form__register-link">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </form>
      </div>
      <div className="login-form__accent"></div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default LoginForm;
