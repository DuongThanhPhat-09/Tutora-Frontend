import { useState, useEffect, useCallback, useRef } from "react";
import { searchTutors } from "../../services/tutorSearch.service";
import type {
    TutorSearchResultResponse,
    TutorSearchParams,
} from "../../services/tutorSearch.service";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CustomDropdown from "../../components/CustomDropdown/CustomDropdown";
import "../../styles/pages/tutor-search.css";

// SVG Icons
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.625 17.5C13.9773 17.5 17.5 13.9773 17.5 9.625C17.5 5.27269 13.9773 1.75 9.625 1.75C5.27269 1.75 1.75 5.27269 1.75 9.625C1.75 13.9773 5.27269 17.5 9.625 17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.25 19.25L15.3125 15.3125" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CategoryIcon = () => (
    <svg width="13" height="13" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.08333 2.125H2.125V7.08333H7.08333V2.125Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.875 2.125H9.91667V7.08333H14.875V2.125Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.875 9.91667H9.91667V14.875H14.875V9.91667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.08333 9.91667H2.125V14.875H7.08333V9.91667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VerifiedIcon = () => (
    <svg width="7" height="7" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 2.625L3.5625 6.5625L1.5 4.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UniversityIcon = () => (
    <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 1L1 3.5L6.5 6L12 3.5L6.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg width="6" height="4.5" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4L4 7L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ArrowIcon = () => (
    <svg width="9" height="4" viewBox="0 0 12 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 2H11M11 2L9 0.5M11 2L9 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FilterIcon = () => (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.8333 1.16667H1.16667L5.83333 6.69083V10.5L8.16667 11.6667V6.69083L12.8333 1.16667Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================
// Categories data
// ============================================
const categories = [
    { id: "all", name: "Tất cả", icon: <CategoryIcon /> },
    { id: "Math", name: "Toán", icon: <CategoryIcon /> },
    { id: "Physics", name: "Vật Lý", icon: <CategoryIcon /> },
    { id: "Chemistry", name: "Hóa Học", icon: <CategoryIcon /> },
    { id: "English", name: "Tiếng Anh", icon: <CategoryIcon /> },
];

// Trending tags
const trendingTags = ["Toán", "Vật Lý", "Hóa Học", "Tiếng Anh"];

// ============================================
// Filter options (khớp với backend TutorSearchParameters)
// ============================================
// Grade level options grouped by school level, values match DB (Grade_1, Grade_2, ...)
const gradeLevelGroups = [
    {
        label: "Tiểu học",
        options: [
            { value: "Grade_1", label: "Lớp 1" },
            { value: "Grade_2", label: "Lớp 2" },
            { value: "Grade_3", label: "Lớp 3" },
            { value: "Grade_4", label: "Lớp 4" },
            { value: "Grade_5", label: "Lớp 5" },
        ],
    },
    {
        label: "THCS",
        options: [
            { value: "Grade_6", label: "Lớp 6" },
            { value: "Grade_7", label: "Lớp 7" },
            { value: "Grade_8", label: "Lớp 8" },
            { value: "Grade_9", label: "Lớp 9" },
        ],
    },
    {
        label: "THPT",
        options: [
            { value: "Grade_10", label: "Lớp 10" },
            { value: "Grade_11", label: "Lớp 11" },
            { value: "Grade_12", label: "Lớp 12" },
        ],
    },
    {
        label: "Đại học",
        options: [
            { value: "University", label: "Đại học" },
        ],
    },

    // Split international certificates into separate optgroups for clarity
    {
        label: "IELTS",
        options: [
            { value: "IELTS_5.0", label: "IELTS 5.0+" },
            { value: "IELTS_6.0", label: "IELTS 6.0+" },
            { value: "IELTS_7.0", label: "IELTS 7.0+" },
            { value: "IELTS_8.0", label: "IELTS 8.0+" },
            { value: "IELTS_9.0", label: "IELTS 9.0" },
        ],
    },
    {
        label: "TOEIC",
        options: [
            { value: "TOEIC_500", label: "TOEIC 500+" },
            { value: "TOEIC_600", label: "TOEIC 600+" },
            { value: "TOEIC_700", label: "TOEIC 700+" },
            { value: "TOEIC_800", label: "TOEIC 800+" },
            { value: "TOEIC_900", label: "TOEIC 900+" },
        ],
    },
    {
        label: "SAT",
        options: [
            { value: "SAT_1200", label: "SAT 1200+" },
            { value: "SAT_1300", label: "SAT 1300+" },
            { value: "SAT_1400", label: "SAT 1400+" },
            { value: "SAT_1500", label: "SAT 1500+" },
        ],
    },
];

const budgetRangeOptions = [
    { value: "all", label: "MỌI GIÁ" },
    { value: "under_50", label: "Dưới 50.000đ/h" },
    { value: "50_100", label: "50.000đ - 100.000đ/h" },
    { value: "100_200", label: "100.000đ - 200.000đ/h" },
    { value: "200_500", label: "200.000đ - 500.000đ/h" },
    { value: "over_500", label: "Trên 500.000đ/h" },
];

const teachingModeOptions = [
    { value: "", label: "Tất cả" },
    { value: "online", label: "ONLINE" },
    { value: "offline", label: "OFFLINE" },
    { value: "hybrid", label: "HYBRID" },
];

const sortByOptions = [
    { value: "rating_desc", label: "ĐÁNH GIÁ CAO NHẤT" },
    { value: "price_asc", label: "GIÁ THẤP NHẤT" },
    { value: "price_desc", label: "GIÁ CAO NHẤT" },
    { value: "experience_desc", label: "KINH NGHIỆM" },
    { value: "reviews_desc", label: "ĐÁNH GIÁ NHIỀU NHẤT" },
    { value: "newest", label: "MỚI NHẤT" },
    { value: "popularity", label: "PHỔ BIẾN NHẤT" },
];

// ============================================
// Tutor types
// ============================================
type TutorType = "intensive" | "guided" | "basic" | "elite";

interface Tutor {
    id: string;
    name: string;
    avatar: string;
    type: TutorType;
    credential: string;
    rating: number;
    university: string;
    subjects: string[];
    experience: string;
    result: string;
    resultType: "success" | "primary" | "muted" | "warning";
    highlights: string[];
    price: number;
}

// ============================================
// Helper: Map backend response → UI Tutor type
// ============================================
const mapSubscriptionToType = (sub: string | null | undefined): TutorType => {
    const map: Record<string, TutorType> = {
        intensive: "intensive",
        guided: "guided",
        basic: "basic",
        free: "basic",
        elite: "elite",
    };
    return map[(sub || "").toLowerCase()] || "basic";
};

const getResultType = (type: TutorType): "success" | "primary" | "muted" | "warning" => {
    const map: Record<TutorType, "success" | "primary" | "muted" | "warning"> = {
        intensive: "success",
        guided: "primary",
        basic: "muted",
        elite: "warning",
    };
    return map[type];
};

const mapApiTutorToUi = (apiTutor: TutorSearchResultResponse): Tutor => {
    const type = mapSubscriptionToType(apiTutor.subscriptionType);

    // Build subjects array from backend subjects + tags
    const subjects: string[] = [];
    if (apiTutor.subjects) {
        apiTutor.subjects.forEach((s) => {
            if (s.tags && s.tags.length > 0) {
                subjects.push(...s.tags);
            } else if (s.subjectName) {
                subjects.push(s.subjectName);
            }
        });
    }

    return {
        id: apiTutor.tutorId,
        name: apiTutor.fullName || "Gia sư",
        avatar: apiTutor.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg",
        type,
        credential: apiTutor.degreeLevel || "",
        rating: apiTutor.averageRating || 0,
        university: apiTutor.education || "",
        subjects: subjects.length > 0 ? subjects : ["Chưa cập nhật"],
        experience: apiTutor.yearsOfExperience ? `${apiTutor.yearsOfExperience} Năm` : "N/A",
        result: apiTutor.successRate || apiTutor.specialty || "—",
        resultType: getResultType(type),
        highlights: apiTutor.highlights || [],
        price: apiTutor.hourlyRate ? Math.round(Number(apiTutor.hourlyRate) * 1.05) : 0,
    };
};

// Type labels
const typeLabels: Record<TutorType, string> = {
    intensive: "INTENSIVE TUTOR",
    guided: "GUIDED TUTOR",
    basic: "BASIC TUTOR",
    elite: "ELITE TUTOR",
};

// Stats labels based on type
const statsLabels: Record<TutorType, { experience: string; result: string }> = {
    intensive: { experience: "THÂM NIÊN", result: "KẾT QUẢ" },
    guided: { experience: "THÂM NIÊN", result: "HÀI LÒNG" },
    basic: { experience: "THÂM NIÊN", result: "CHỨNG CHỈ" },
    elite: { experience: "THÂM NIÊN", result: "CHUYÊN MÔN" },
};

// ============================================
// Search filters state type
// ============================================
interface SearchFilters {
    searchTerm: string;
    category: string;
    gradeLevel: string;
    budgetRange: string;
    teachingMode: string;
    sortBy: string;
    pageNumber: number;
    pageSize: number;
}

const defaultFilters: SearchFilters = {
    searchTerm: "",
    category: "all",
    gradeLevel: "",
    budgetRange: "all",
    teachingMode: "",
    sortBy: "rating_desc",
    pageNumber: 1,
    pageSize: 10,
};

// ============================================
// Search Hero Section
// ============================================
interface SearchHeroProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    onSearch: () => void;
    onTrendingClick: (tag: string) => void;
}

const SearchHero = ({ searchTerm, onSearchTermChange, onSearch, onTrendingClick }: SearchHeroProps) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    return (
        <section className="search-hero">
            <div className="search-hero-gradient"></div>
            <div className="search-hero-content">
                <div className="search-hero-text">
                    <h1 className="search-hero-title">
                        Hôm nay bạn muốn<br />
                        <span className="highlight">khai phá tri thức</span> gì?
                    </h1>
                    <p className="search-hero-subtitle">
                        Kể cho TUTORA nghe về mục tiêu học tập của bạn, chúng tôi sẽ tìm người đồng<br />
                        hành phù hợp nhất.
                    </p>
                </div>
                <div className="search-container">
                    <div className="search-bar">
                        <div className="search-icon">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm gia sư toán, IELTS, luyện thi đại học..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-search" onClick={onSearch}>Tìm kiếm</button>
                    </div>
                    <div className="trending-container">
                        <span className="trending-label">Trending:</span>
                        {trendingTags.map((tag, index) => (
                            <button
                                key={index}
                                className={`trending-tag ${index === 0 ? '' : 'muted'}`}
                                onClick={() => onTrendingClick(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// ============================================
// Category Tabs Section
// ============================================
interface CategoryTabsProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => (
    <section className="category-section">
        <div className="category-tabs">
            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.id)}
                >
                    <span className="category-tab-icon">{category.icon}</span>
                    <span className="category-tab-text">{category.name}</span>
                </button>
            ))}
        </div>
    </section>
);

// ============================================
// Filter Bar Section
// ============================================
interface FilterBarProps {
    gradeLevel: string;
    budgetRange: string;
    teachingMode: string;
    sortBy: string;
    onGradeLevelChange: (value: string) => void;
    onBudgetRangeChange: (value: string) => void;
    onTeachingModeChange: (value: string) => void;
    onSortByChange: (value: string) => void;
    onResetFilters: () => void;
}

const FilterBar = ({
    gradeLevel,
    budgetRange,
    teachingMode,
    sortBy,
    onGradeLevelChange,
    onBudgetRangeChange,
    onTeachingModeChange,
    onSortByChange,
    onResetFilters,
}: FilterBarProps) => {
    const hasActiveFilters = gradeLevel !== "" || budgetRange !== "all" || teachingMode !== "" || sortBy !== "rating_desc";

    return (
        <section className="filter-section">
            <div className="filter-container">
                <div className="filter-groups">
                    <div className="filter-group">
                        <span className="filter-label">Cấp học</span>
                        <CustomDropdown
                            variant="filter"
                            value={gradeLevel}
                            onChange={onGradeLevelChange}
                            optionGroups={gradeLevelGroups}
                            placeholder={{ value: "", label: "Tất cả" }}
                        />
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <span className="filter-label">Ngân sách</span>
                        <CustomDropdown
                            variant="filter"
                            value={budgetRange}
                            onChange={onBudgetRangeChange}
                            options={budgetRangeOptions}
                        />
                    </div>
                    <div className="filter-divider"></div>
                    <div className="filter-group">
                        <span className="filter-label">Hình thức</span>
                        <CustomDropdown
                            variant="filter"
                            value={teachingMode}
                            onChange={onTeachingModeChange}
                            options={teachingModeOptions}
                        />
                    </div>
                </div>
                <div className="filter-actions">
                    <div className="sort-group">
                        <span className="sort-label">Sort by</span>
                        <CustomDropdown
                            variant="sort"
                            value={sortBy}
                            onChange={onSortByChange}
                            options={sortByOptions}
                        />
                    </div>
                    <button className="btn-filter" onClick={onResetFilters} title={hasActiveFilters ? "Xóa bộ lọc" : "Bộ lọc"}>
                        <span className="btn-filter-icon"><FilterIcon /></span>
                        <span className="btn-filter-text">{hasActiveFilters ? "Xóa lọc" : "Filters"}</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

// ============================================
// Tutor Card Component
// ============================================
interface TutorCardProps {
    tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/tutor-detail/${tutor.id}`);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click from firing
        navigate(`/tutor-detail/${tutor.id}`);
    };

    return (
        <div className="tutor-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="tutor-card-body">
                {/* Header Row */}
                <div className="tutor-card-header">
                    <div className="tutor-profile">
                        <div className="tutor-avatar-container">
                            <img src={tutor.avatar} alt={tutor.name} className="tutor-avatar" />
                            <div className="tutor-verified-badge">
                                <VerifiedIcon />
                            </div>
                        </div>
                        <div className="tutor-info">
                            <h3 className="tutor-name">{tutor.name}</h3>
                            <div className="tutor-badges">
                                <span className={`tutor-type-badge ${tutor.type}`}>
                                    {typeLabels[tutor.type]}
                                </span>
                                <span className="tutor-credential">{tutor.credential}</span>
                            </div>
                        </div>
                    </div>
                    <div className="tutor-rating">
                        <span className="rating-star">★</span>
                        <span className="rating-value">{tutor.rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* University Row */}
                <div className="tutor-university-row">
                    <span className="university-icon"><UniversityIcon /></span>
                    <span className="university-name">{tutor.university}</span>
                    <div className="class-type-badge">
                        <span className="class-type-label">Loại lớp:</span>
                        <span className={`class-type-value ${tutor.type}`}>
                            {tutor.type.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Subject Tags */}
                <div className="tutor-subjects">
                    {tutor.subjects.map((subject, index) => (
                        <span key={index} className="subject-tag">{subject}</span>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="tutor-stats">
                    <div className="stat-item">
                        <span className="stat-label">{statsLabels[tutor.type].experience}</span>
                        <span className="stat-value">{tutor.experience}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{statsLabels[tutor.type].result}</span>
                        <span className={`stat-value ${tutor.resultType}`}>{tutor.result}</span>
                    </div>
                </div>

                {/* Highlights */}
                <div className="tutor-highlights">
                    {tutor.highlights.map((highlight, index) => (
                        <div key={index} className="highlight-item">
                            <span className="highlight-icon"><CheckIcon /></span>
                            <span className="highlight-text">{highlight}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card Footer */}
            <div className="tutor-card-footer">
                <div className="tutor-pricing">
                    <span className="pricing-label">HỌC PHÍ CHUẨN</span>
                    <div className="pricing-value">
                        <span className="price-amount">{tutor.price.toLocaleString('vi-VN')}đ</span>
                        <span className="price-unit">/h</span>
                    </div>
                </div>
                <div className="tutor-actions">
                    <button className="btn-details" onClick={handleButtonClick}>Chi tiết</button>
                    <button className="btn-start-plan" onClick={handleButtonClick}>
                        <span className="btn-start-plan-text">BẮT ĐẦU KẾ HOẠCH</span>
                        <span className="btn-start-plan-icon"><ArrowIcon /></span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Results Section (Dumb Component — chỉ hiển thị)
// ============================================
interface ResultsSectionProps {
    tutors: Tutor[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    hasNext: boolean;
    onLoadMore: () => void;
}

const ResultsSection = ({ tutors, loading, error, totalCount, hasNext, onLoadMore }: ResultsSectionProps) => {
    // Split tutors into rows of 3
    const rows: Tutor[][] = [];
    for (let i = 0; i < tutors.length; i += 3) {
        rows.push(tutors.slice(i, i + 3));
    }

    if (loading && tutors.length === 0) {
        return (
            <section className="results-section">
                <div className="results-header">
                    <div className="results-header-left">
                        <span className="results-label">TUTORA Selection</span>
                        <h2 className="results-title">Đang tải...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="results-section">
                <div className="results-header">
                    <div className="results-header-left">
                        <span className="results-label">TUTORA Selection</span>
                        <h2 className="results-title" style={{ color: '#ef4444' }}>{error}</h2>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="results-section">
            <div className="results-header">
                <div className="results-header-left">
                    <span className="results-label">TUTORA Selection</span>
                    <h2 className="results-title">Chuyên gia đang online</h2>
                </div>
                <span className="results-count">{totalCount} Kết quả tìm thấy</span>
            </div>
            <div className="tutor-grid">
                {rows.map((row, rowIndex) => (
                    <div className="tutor-row" key={rowIndex}>
                        {row.map((tutor, index) => (
                            <TutorCard key={`${tutor.id}-${index}`} tutor={tutor} />
                        ))}
                    </div>
                ))}
            </div>
            {tutors.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                    <p style={{ fontSize: '16px' }}>Không tìm thấy gia sư phù hợp. Hãy thử thay đổi bộ lọc.</p>
                </div>
            )}
            {hasNext && (
                <div className="load-more-container">
                    <button className="btn-load-more" onClick={onLoadMore} disabled={loading}>
                        {loading ? "Đang tải..." : "Khám phá thêm"}
                    </button>
                </div>
            )}
        </section>
    );
};

// ============================================
// Main TutorSearchPage Component
// ============================================
const TutorSearchPage = () => {
    // Centralized search state
    const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
    const [inputSearchTerm, setInputSearchTerm] = useState(""); // controlled input, separate from committed filter

    // Results state
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    // Track if we are loading more (append) vs new search (replace)
    const isLoadMore = useRef(false);

    // Build API params from filters
    const buildApiParams = useCallback((f: SearchFilters): TutorSearchParams => {
        const params: TutorSearchParams = {
            pageNumber: f.pageNumber,
            pageSize: f.pageSize,
            sortBy: f.sortBy,
        };

        if (f.searchTerm.trim()) {
            params.searchTerm = f.searchTerm.trim();
        }
        if (f.category && f.category !== "all") {
            params.category = f.category;
        }
        if (f.gradeLevel && f.gradeLevel !== "") {
            params.gradeLevel = f.gradeLevel;
            console.log("🎓 GradeLevel filter applied:", f.gradeLevel);
        }
        if (f.budgetRange && f.budgetRange !== "all") {
            params.budgetRange = f.budgetRange;
        }
        if (f.teachingMode) {
            params.teachingMode = f.teachingMode;
        }

        return params;
    }, []);

    // Fetch tutors whenever filters change
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                setLoading(true);
                setError(null);
                const apiParams = buildApiParams(filters);
                console.log("📡 API call with params:", apiParams);
                const response = await searchTutors(apiParams);
                const mapped = response.content.items.map(mapApiTutorToUi);

                if (isLoadMore.current) {
                    // Append new results for "Load More"
                    setTutors((prev) => [...prev, ...mapped]);
                    isLoadMore.current = false;
                } else {
                    // Replace results for new search / filter change
                    setTutors(mapped);
                }

                setTotalCount(response.content.totalCount);
                setHasNext(response.content.hasNext);
            } catch (err) {
                console.error("Failed to fetch tutors:", err);
                setError("Không thể tải danh sách gia sư. Vui lòng thử lại.");
                if (!isLoadMore.current) {
                    setTutors([]);
                    setTotalCount(0);
                }
                isLoadMore.current = false;
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [filters, buildApiParams]);

    // ---- Handler: update a single filter and reset to page 1 ----
    const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            pageNumber: 1, // reset to page 1 on any filter change
        }));
    }, []);

    // ---- Search handlers ----
    const handleSearchSubmit = useCallback(() => {
        updateFilter("searchTerm", inputSearchTerm);
    }, [inputSearchTerm, updateFilter]);

    const handleTrendingClick = useCallback((tag: string) => {
        setInputSearchTerm(tag);
        updateFilter("searchTerm", tag);
    }, [updateFilter]);

    // ---- Category handler ----
    const handleCategoryChange = useCallback((category: string) => {
        updateFilter("category", category);
    }, [updateFilter]);

    // ---- Filter handlers ----
    const handleGradeLevelChange = useCallback((value: string) => {
        updateFilter("gradeLevel", value);
    }, [updateFilter]);

    const handleBudgetRangeChange = useCallback((value: string) => {
        updateFilter("budgetRange", value);
    }, [updateFilter]);

    const handleTeachingModeChange = useCallback((value: string) => {
        updateFilter("teachingMode", value);
    }, [updateFilter]);

    const handleSortByChange = useCallback((value: string) => {
        updateFilter("sortBy", value);
    }, [updateFilter]);

    const handleResetFilters = useCallback(() => {
        setInputSearchTerm("");
        setFilters({ ...defaultFilters });
    }, []);

    // ---- Load More handler ----
    const handleLoadMore = useCallback(() => {
        isLoadMore.current = true;
        setFilters((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber + 1,
        }));
    }, []);

    return (
        <div className="tutor-search-page">
            <Header />
            <main>
                <SearchHero
                    searchTerm={inputSearchTerm}
                    onSearchTermChange={setInputSearchTerm}
                    onSearch={handleSearchSubmit}
                    onTrendingClick={handleTrendingClick}
                />
                <CategoryTabs
                    activeCategory={filters.category}
                    onCategoryChange={handleCategoryChange}
                />
                <FilterBar
                    gradeLevel={filters.gradeLevel}
                    budgetRange={filters.budgetRange}
                    teachingMode={filters.teachingMode}
                    sortBy={filters.sortBy}
                    onGradeLevelChange={handleGradeLevelChange}
                    onBudgetRangeChange={handleBudgetRangeChange}
                    onTeachingModeChange={handleTeachingModeChange}
                    onSortByChange={handleSortByChange}
                    onResetFilters={handleResetFilters}
                />
                <ResultsSection
                    tutors={tutors}
                    loading={loading}
                    error={error}
                    totalCount={totalCount}
                    hasNext={hasNext}
                    onLoadMore={handleLoadMore}
                />
            </main>
            <Footer />
        </div>
    );
};

export default TutorSearchPage;
