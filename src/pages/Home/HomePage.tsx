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
    const universities = [
        { name: "Oxford University", highlight: false },
        { name: "Stanford GSB", highlight: true },
        { name: "MIT Academy", highlight: false },
        { name: "Harvard University", highlight: false, italic: true },
        { name: "NUS Singapore", highlight: false },
    ];

    return (
        <div className="trusted-banner">
            <div className="trusted-content">
                <div className="trusted-scroll">
                    <span className="trusted-label">TRUSTED BY STUDENTS AT:</span>
                    {universities.map((uni, index) => (
                        <span
                            key={index}
                            className={`university-name ${uni.highlight ? 'highlight' : ''} ${uni.italic ? 'italic' : ''}`}
                        >
                            {uni.name}
                        </span>
                    ))}
                    {/* Duplicate for seamless scroll */}
                    <span className="trusted-label">TRUSTED BY STUDENTS AT:</span>
                    {universities.map((uni, index) => (
                        <span
                            key={`dup-${index}`}
                            className={`university-name ${uni.highlight ? 'highlight' : ''} ${uni.italic ? 'italic' : ''}`}
                        >
                            {uni.name}
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
                        <span className="badge-text">Top 5% Verified Tutors Worldwide</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-line">Kiến tạo</span>
                        <span className="title-line">
                            <em className="title-accent">di sản</em>
                            <span className="title-regular"> học</span>
                        </span>
                        <span className="title-line">thuật cho chính</span>
                        <span className="title-line">bạn.</span>
                    </h1>

                    <p className="hero-description">
                        Vượt xa việc dạy kèm truyền thống. Chúng tôi kết nối bạn với những bộ óc xuất sắc nhất để xây dựng một lộ trình tương lai vững chắc.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/tutor-search')}>TÌM GIA SƯ ELITE</button>
                        <button className="btn-secondary" onClick={() => navigate('/register')}>TRỞ THÀNH GIA SƯ</button>
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
                            <span className="lms-title">TUTORA LMS ENGINE.</span>
                            <span className="lms-subtitle">Theo dõi tiến độ học thuật thời gian thực.</span>
                        </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="rating-badge">
                        <span className="rating-number">4.9/5</span>
                        <span className="rating-label">Average Rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Statistics Section
const StatisticsSection = () => {
    const stats = [
        { value: "500+", label: "Gia sư Elite", sublabel: "Tuyển chọn Top 5%" },
        { value: "98%", label: "Ivy Target", sublabel: "Tỉ lệ đạt mục tiêu" },
        { value: "12K+", label: "Giờ giảng", sublabel: "Mỗi tháng tại TUTORA" },
        { value: "24/7", label: "LMS Support", sublabel: "Báo cáo thông minh" },
    ];

    return (
        <section className="statistics-section">
            <div className="statistics-gradient"></div>
            <div className="statistics-container">
                {/* Left Content */}
                <div className="statistics-left">
                    <h2 className="statistics-title">
                        SỰ TIN TƯỞNG<br />
                        ĐẾN TỪ <span className="title-gold">KẾT QUẢ.</span>
                    </h2>
                    <p className="statistics-description">
                        "Chúng tôi không chỉ hứa hẹn, chúng tôi minh bạch hóa mọi bước tiến của học viên thông qua dữ liệu học thuật chính xác."
                    </p>
                </div>

                {/* Right Content - Stats Grid */}
                <div className="statistics-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-sublabel">{stat.sublabel}</span>
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
        "Mức thù lao xứng tầm với trình độ chuyên gia.",
        "Cổng quản lý LMS tự động hóa mọi báo cáo.",
        "Lịch trình linh hoạt theo phong cách làm việc Elite.",
    ];

    return (
        <section className="features-section">
            {/* Left: Cards */}
            <div className="features-cards">
                <div className="feature-column">
                    <div className="feature-card-image">
                        <img src="/collaboration-1.png" alt="Join the Elite" />
                    </div>
                    <div className="feature-card green">
                        <h3 className="feature-card-title">Join the Elite.</h3>
                        <p className="feature-card-description">
                            Hệ thống hỗ trợ gia sư chuyên nghiệp nhất để bạn tập trung hoàn toàn vào học thuật.
                        </p>
                    </div>
                </div>

                <div className="feature-column offset">
                    <div className="feature-card gold">
                        <h3 className="feature-card-title">High Impact.</h3>
                        <p className="feature-card-description">
                            Xây dựng tầm ảnh hưởng và uy tín trong cộng đồng tinh hoa.
                        </p>
                    </div>
                    <div className="feature-card-image">
                        <img src="/collaboration-2.png" alt="High Impact" />
                    </div>
                </div>
            </div>

            {/* Right: Content */}
            <div className="features-content">
                <h2 className="features-title">
                    TRUYỀN LỬA<br />
                    <span className="title-green">TRI THỨC.</span><br />
                    NHẬN XỨNG<br />
                    ĐÁNG.
                </h2>

                <p className="features-description">
                    TUTORA tìm kiếm những chuyên gia có tâm và có tầm. Chúng tôi mang đến cho bạn nền tảng công nghệ mạnh mẽ và cộng đồng học viên tiềm năng nhất.
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

                <button className="btn-apply" onClick={() => window.location.href = '/register'}>NỘP HỒ SƠ GIA SƯ ELITE</button>
            </div>
        </section>
    );
};

// Testimonials Section
const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "Quy trình kiểm định gia sư của TUTORA cực kỳ chuyên nghiệp. Con tôi không chỉ học giỏi hơn mà còn tự tin hơn trong việc tư duy logic.",
            name: "Trần Minh Anh",
            role: "Parent of IB Student",
            initial: "T",
        },
        {
            quote: "LMS của TUTORA giúp tôi tiết kiệm 70% thời gian quản lý hồ sơ học viên. Tôi có thể tập trung hoàn toàn vào việc giảng dạy đỉnh cao.",
            name: "David Nguyen",
            role: "Elite Tutor (CS)",
            initial: "D",
        },
        {
            quote: "TUTORA không chỉ là gia sư, họ là người cố vấn lộ trình. Nhờ sự hướng dẫn sát sao, tôi đã chinh phục được ước mơ du học.",
            name: "Lê Hoàng Nam",
            role: "Undergrad @ Stanford",
            initial: "L",
        },
    ];

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                {/* Header */}
                <div className="testimonials-header">
                    <div className="testimonials-title-group">
                        <span className="testimonials-label">Wall of Trust</span>
                        <h2 className="testimonials-title">
                            CHIA SẺ TỪ<br />NGƯỜI TRONG CUỘC.
                        </h2>
                    </div>
                    <p className="testimonials-description">
                        "Lắng nghe những trải nghiệm thực tế từ các học viên và gia sư đã đồng hành cùng TUTORA."
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
                            <p className="testimonial-quote">"{testimonial.quote}"</p>
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
