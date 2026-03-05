import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Star icon component for ratings
const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z" fill="#D4B483" />
    </svg>
);

// Trusted Universities Banner
const TrustedBanner = () => {
    const investors = [
        { name: "Dream-lab.ai", highlight: true },
        { name: "FPT University", highlight: false },
    ];

    return (
        <div className="trusted-banner">
            <div className="trusted-content">
                <div className="trusted-scroll">
                    <span className="trusted-label">ĐƯỢC ĐẦU TƯ BỞI:</span>
                    {investors.map((inv, index) => (
                        <span
                            key={index}
                            className={`university-name ${inv.highlight ? 'highlight' : ''}`}
                        >
                            {inv.name}
                        </span>
                    ))}
                    <span className="trusted-label">·</span>
                    <span className="trusted-label">ĐƯỢC ĐẦU TƯ BỞI:</span>
                    {investors.map((inv, index) => (
                        <span
                            key={`dup-${index}`}
                            className={`university-name ${inv.highlight ? 'highlight' : ''}`}
                        >
                            {inv.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Hero Section
const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section className="hero-section">
            <div className="hero-container">
                {/* Left Content */}
                <div className="hero-left">
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        <span className="badge-text">Gia sư được xác minh hồ sơ & đánh giá sau mỗi buổi học</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-line">Tìm gia sư</span>
                        <span className="title-line">
                            <em className="title-accent">phù hợp.</em>
                        </span>
                        <span className="title-line">Theo dõi tiến bộ</span>
                        <span className="title-line">từng buổi.</span>
                    </h1>

                    <p className="hero-description">
                        Tutora giúp phụ huynh tìm gia sư đã được xác minh, đặt lịch học online, và nhận báo cáo tiến độ sau mỗi buổi — tất cả trên một nền tảng duy nhất.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/tutor-search')}>TÌM GIA SƯ</button>
                        <button className="btn-secondary" onClick={() => navigate('/register')}>ĐĂNG KÝ DẠY KÈM</button>
                    </div>
                </div>

                {/* Right Content */}
                <div className="hero-right">
                    <div className="hero-image-wrapper">
                        <img
                            src="/students-studying.png"
                            alt="Students studying together"
                            className="hero-image"
                        />
                        <div className="hero-image-gradient"></div>
                        <div className="hero-lms-badge">
                            <span className="lms-title">TUTORA — Theo dõi học tập.</span>
                            <span className="lms-subtitle">Báo cáo tiến độ tự động sau mỗi buổi học.</span>
                        </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="rating-badge">
                        <span className="rating-number">4.9/5</span>
                        <span className="rating-label">Đánh giá trung bình</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Statistics Section
const StatisticsSection = () => {
    const stats = [
        {
            value: "01",
            label: "Xác minh hồ sơ",
            sublabel: "CMND, bằng cấp & phỏng vấn trước khi dạy",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
            )
        },
        {
            value: "02",
            label: "Giữ tiền an toàn",
            sublabel: "Tiền chỉ chuyển sau khi buổi học hoàn tất",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
            )
        },
        {
            value: "03",
            label: "Báo cáo tự động",
            sublabel: "Phụ huynh nhận báo cáo ngay sau buổi học",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            value: "04",
            label: "Đổi gia sư dễ dàng",
            sublabel: "Không hài lòng? Đổi mà không mất lịch sử học",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4"></path>
                    <path d="M3 11V9a4 4 0 014-4h14"></path>
                    <path d="M7 23l-4-4 4-4"></path>
                    <path d="M21 13v2a4 4 0 01-4 4H3"></path>
                </svg>
            )
        },
    ];

    return (
        <section className="statistics-section">
            <div className="statistics-glow-bg"></div>
            <div className="statistics-container">
                {/* Left Content */}
                <div className="statistics-left">
                    <div className="security-badge">
                        <span className="security-icon">🛡️</span>
                        <span>An tâm tuyệt đối</span>
                    </div>
                    <h2 className="statistics-title">
                        TUTORA BẢO VỆ<br />
                        CẢ PHỤ HUYNH <span className="title-gold">LẪN GIA SƯ.</span>
                    </h2>
                    <p className="statistics-description">
                        "Cơ chế giữ tiền trung gian, xác minh gia sư, và báo cáo buổi học tự động — được thiết kế để bảo vệ quyền lợi của bạn từ ngày đầu."
                    </p>
                </div>

                {/* Right Content - Stats Grid */}
                <div className="statistics-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <span className="stat-value">{stat.value}</span>
                            <div className="stat-icon-wrapper">
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-sublabel">{stat.sublabel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Features Section (Tutor Benefits)
const FeaturesSection = () => {
    const benefits = [
        "Tự đặt giá, tự chọn lịch — bạn quyết định dạy bao nhiêu giờ/tuần.",
        "Thanh toán bảo đảm qua Escrow — không lo bị quỵt tiền sau buổi dạy.",
        "Công cụ quản lý sẵn sàng — lịch dạy, báo cáo tự động gửi phụ huynh.",
    ];

    return (
        <section className="features-section">
            {/* Left: Cards */}
            <div className="features-cards">
                <div className="feature-column">
                    <div className="feature-card-image">
                        <img src="/collaboration-1.png" alt="Tham gia đội ngũ gia sư" />
                    </div>
                    <div className="feature-card green">
                        <h3 className="feature-card-title">Tham gia đội ngũ gia sư.</h3>
                        <p className="feature-card-description">
                            Nền tảng hỗ trợ đầy đủ để bạn tập trung hoàn toàn vào giảng dạy.
                        </p>
                    </div>
                </div>

                <div className="feature-column offset">
                    <div className="feature-card gold">
                        <h3 className="feature-card-title">Hiệu quả rõ rệt.</h3>
                        <p className="feature-card-description">
                            Giúp học sinh tiến bộ thực sự, và phụ huynh sẽ giới thiệu bạn cho người khác.
                        </p>
                    </div>
                    <div className="feature-card-image">
                        <img src="/collaboration-2.png" alt="Hiệu quả rõ rệt" />
                    </div>
                </div>
            </div>

            {/* Right: Content */}
            <div className="features-content">
                <h2 className="features-title">
                    HÀNG TRĂM<br />
                    PHỤ HUYNH<br />
                    <span className="title-green">ĐANG TÌM.</span><br />
                    HỌ CHỈ THIẾU BẠN.
                </h2>

                <p className="features-description">
                    Hàng trăm phụ huynh đang đăng ký tìm gia sư mỗi tháng. Đăng ký ngay để bắt đầu nhận học sinh và có thu nhập ổn định theo lịch của bạn.
                </p>

                <ul className="benefits-list">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="benefit-item">
                            <span className="benefit-dot">
                                <span className="benefit-dot-inner"></span>
                            </span>
                            <span className="benefit-text">{benefit}</span>
                        </li>
                    ))}
                </ul>

                <button className="btn-apply" onClick={() => window.location.href = '/register'}>ĐĂNG KÝ DẠY KÈM</button>
            </div>
        </section>
    );
};

// Testimonials Section
const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "Chủ yếu là sinh viên giỏi tại các trường đại học lớn và giáo viên có kinh nghiệm. Mỗi gia sư đều được xác minh hồ sơ — CMND, bằng cấp và phỏng vấn — trước khi nhận học sinh.",
            name: "Gia sư trên Tutora là ai?",
            role: "Về gia sư",
            initial: "G",
        },
        {
            quote: "Giá do gia sư tự đặt. Phụ huynh chỉ trả thêm 5% phí dịch vụ cho Tutora. Không có phí ẩn, không thu trước khi buổi học diễn ra.",
            name: "Chi phí học trên Tutora thế nào?",
            role: "Về chi phí",
            initial: "C",
        },
        {
            quote: "Bạn có thể đổi gia sư bất cứ lúc nào. Lịch sử học tập của con được lưu lại đầy đủ, gia sư mới tiếp tục ngay mà không cần bắt đầu lại từ đầu.",
            name: "Nếu không hài lòng với gia sư?",
            role: "Về hỗ trợ",
            initial: "N",
        },
    ];

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                {/* Header */}
                <div className="testimonials-header">
                    <div className="testimonials-title-group">
                        <span className="testimonials-label">Câu hỏi thường gặp</span>
                        <h2 className="testimonials-title">
                            PHỤ HUYNH<br />THƯỜNG HỎI GÌ?
                        </h2>
                    </div>
                    <p className="testimonials-description">
                        "Những câu hỏi phổ biến nhất từ phụ huynh khi lần đầu tìm hiểu về Tutora."
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} />
                                ))}
                            </div>
                            <p className="testimonial-quote">{testimonial.quote}</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">
                                    <span>{testimonial.initial}</span>
                                </div>
                                <div className="author-info">
                                    <span className="author-name">{testimonial.name}</span>
                                    <span className="author-role">{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Main HomePage Component
const HomePage = () => {
    return (
        <div className="homepage">
            <Header />
            <main className="main-content">
                <TrustedBanner />
                <HeroSection />
                <StatisticsSection />
                <FeaturesSection />
                <TestimonialsSection />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
