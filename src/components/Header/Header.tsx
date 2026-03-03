import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
// Import Supabase và kiểu dữ liệu User
import { supabase } from "../../lib/supabase";
import { clearUserFromStorage, getCurrentUser, getUserInfoFromToken } from "../../services/auth.service";
import { Popconfirm } from "antd";
import { LogOut, LayoutDashboard } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("User");
  const [userAvatar, setUserAvatar] = useState<string>("");

  // Determine portal path based on role
  const getPortalPath = () => {
    const userInfo = getUserInfoFromToken();
    if (!userInfo?.role) return "/login";

    switch (userInfo.role.toLowerCase()) {
      case 'admin': return "/admin/dashboard";
      case 'tutor': return "/tutor-portal";
      case 'parent': return "/parent/dashboard";
      case 'student': return "/student/dashboard";
      default: return "/";
    }
  };

  const portalPath = getPortalPath();

  // Ẩn user info trên trang đăng ký/đăng nhập (vì có thể có OAuth session chưa complete)
  const isAuthPage = location.pathname === "/register" || location.pathname === "/login";

  // Helper function to generate avatar from name
  const generateAvatarFromName = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=631b1b&color=fff&size=128`;
  };

  // Function to check login status from localStorage
  const checkLoginStatus = () => {
    const localUser = getCurrentUser();
    if (localUser && localUser.accessToken) {
      setIsLoggedIn(true);
      const userData = getUserInfoFromToken();
      const displayName = userData?.fullname ||
        (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : null) ||
        localUser.fullname ||
        "User";
      setUserDisplayName(displayName);
      setUserAvatar(generateAvatarFromName(displayName));
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 1. Kiểm tra localStorage trước (cho SimpleAuth login)
    const hasLocalUser = checkLoginStatus();

    // 2. Nếu không có local user, kiểm tra Supabase session (cho OAuth login)
    if (!hasLocalUser) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsLoggedIn(true);
          const userData = getUserInfoFromToken();
          const displayName = userData?.fullname ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            "User";
          setUserDisplayName(displayName);
          const avatarUrl = session.user.user_metadata?.avatar_url || generateAvatarFromName(displayName);
          setUserAvatar(avatarUrl);
        }
      });
    }

    // 3. Lắng nghe Supabase auth state changes (OAuth login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const userData = getUserInfoFromToken();
        const displayName = userData?.fullname ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          "User";
        setUserDisplayName(displayName);
        const avatarUrl = session.user.user_metadata?.avatar_url || generateAvatarFromName(displayName);
        setUserAvatar(avatarUrl);
      } else if (!getCurrentUser()) {
        setIsLoggedIn(false);
      }
    });

    // 4. Lắng nghe storage changes + custom auth event
    const handleAuthChange = () => {
      const localUser = getCurrentUser();
      if (localUser && localUser.accessToken) {
        checkLoginStatus();
      } else {
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    clearUserFromStorage();
    setIsLoggedIn(false);
    setIsMenuOpen(false);
  };
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-icon">
            <span className="logo-letter">A</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">TUTORA</span>
            <span className="logo-tagline">Academic Heritage</span>
          </div>
        </Link>
        <nav className="main-nav">
          <Link to="/tutor-search" className="nav-link">
            TÌM GIA SƯ
          </Link>
          <a href="/#learning-path" className="nav-link">
            LỘ TRÌNH HỌC
          </a>
          <a href="/#lms" className="nav-link">
            LMS ENGINE
          </a>
          <a href="/#about" className="nav-link">
            VỀ CHÚNG TÔI
          </a>
        </nav>

        {/* Auth Buttons - Xử lý điều kiện hiển thị */}
        <div className="auth-buttons">
          {isLoggedIn && !isAuthPage ? (
            // --- GIAO DIỆN TỐI GIẢN KHI ĐÃ ĐĂNG NHẬP ---
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {/* Nút Portal tương ứng theo Role - Icon version */}
              <Link
                to={portalPath}
                className="btn-portal-icon"
                style={{
                  color: "var(--color-navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                title="Go to Portal"
              >
                <LayoutDashboard size={20} />
              </Link>

              {/* Nút Đăng xuất - Icon version */}
              <Popconfirm
                title="Đăng xuất"
                description="Bạn có chắc chắn muốn đăng xuất?"
                onConfirm={confirmLogout}
                okText="Đồng ý"
                cancelText="Hủy"
                placement="bottomRight"
              >
                <button
                  className="btn-logout-icon"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                  title="Đăng xuất"
                >
                  <LogOut size={20} />
                </button>
              </Popconfirm>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                LOG IN
              </Link>
              <Link to="/register" className="btn-signup">
                SIGN UP
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link
              to="/tutor-search"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              TÌM GIA SƯ
            </Link>
            <a
              href="/#learning-path"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              LỘ TRÌNH HỌC
            </a>
            <a
              href="/#lms"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              LMS ENGINE
            </a>
            <a
              href="/#about"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              VỀ CHÚNG TÔI
            </a>
          </nav>

          {/* Mobile Auth Section */}
          <div className="mobile-auth">
            {isLoggedIn && !isAuthPage ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "2px solid #d4b483",
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>
                    {userDisplayName}
                  </span>
                </div>

                <Link
                  to={portalPath}
                  className="btn-signup"
                  style={{ width: "100%", textAlign: "center" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  TRANG CÁ NHÂN
                </Link>

                <Popconfirm
                  title="Đăng xuất"
                  description="Bạn có muốn đăng xuất không?"
                  onConfirm={confirmLogout}
                  okText="Có"
                  cancelText="Không"
                >
                  <button
                    className="btn-login"
                    style={{
                      width: "100%",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    LOG OUT
                  </button>
                </Popconfirm>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOG IN
                </Link>
                <Link
                  to="/register"
                  className="btn-signup"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
