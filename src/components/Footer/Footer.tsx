import "./Footer.css";

const Footer = () => {
    const footerLinks = {
        academic: [
            "Danh sách Gia sư",
            "Học thử đánh giá",
            "Gia sư Elite",
            "Lớp học nhóm",
        ],
        platform: [
            "LMS Dashboard",
            "Báo cáo tiến độ",
            "Lộ trình cá nhân",
            "Thư viện số",
        ],
        resources: [
            "Trở thành Gia sư",
            "Đối tác giáo dục",
            "Hỗ trợ 24/7",
            "Cộng đồng",
        ],
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">
                                <span>A</span>
                            </div>
                            <span className="footer-logo-text">TUTORA.</span>
                        </div>
                        <p className="footer-tagline">
                            "Elevating educational standards through verified elite expertise."
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="footer-links-column">
                        <h4 className="footer-links-title">HỌC THUẬT</h4>
                        <ul className="footer-links">
                            {footerLinks.academic.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4 className="footer-links-title">NỀN TẢNG</h4>
                        <ul className="footer-links">
                            {footerLinks.platform.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4 className="footer-links-title">TÀI NGUYÊN</h4>
                        <ul className="footer-links">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}><a href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <span className="copyright">© 2024 TUTORA ACADEMIC SYSTEM. ALL RIGHTS RESERVED.</span>
                    <div className="footer-legal">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
