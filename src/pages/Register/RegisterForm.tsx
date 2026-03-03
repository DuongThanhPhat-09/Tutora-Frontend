/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InputGroup from "../../components/InputGroup";
import {
    simpleRegister,
    saveUserToStorage,
    checkEmailExists,
} from "../../services/auth.service";

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();

    // --- FORM STATES ---
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "Student",
        terms: false,
    });

    // --- UI STATES ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ========================================================================
    // FORM HANDLERS
    // ========================================================================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ========================================================================
    // SUBMIT: SIMPLE REGISTER (Không qua Supabase)
    // ========================================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullname || !formData.email || !formData.password || !formData.phone || !formData.confirmPassword) {
            toast.warning("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp!");
            return;
        }
        if (!formData.terms) {
            toast.warning("Bạn phải đồng ý điều khoản dịch vụ.");
            return;
        }
        if (formData.password.length < 6) {
            toast.warning("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        // Validate phone number
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 9 || phoneDigits.length > 11) {
            toast.warning("Số điện thoại không hợp lệ!");
            return;
        }

        try {
            setIsSubmitting(true);

            // Check if email already exists
            const existingUser = await checkEmailExists(formData.email);
            if (existingUser && existingUser.content) {
                toast.error("Email đã tồn tại. Vui lòng đăng nhập.");
                setIsSubmitting(false);
                setTimeout(() => navigate("/login", { state: { email: formData.email } }), 2000);
                return;
            }

            // Call simple register API directly (no Supabase)
            const response = await simpleRegister({
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                fullName: formData.fullname,
                role: formData.role,
            });

            console.log("✅ Register response:", response);

            // Extract token from response
            const token = response.content?.token || response.token;
            if (!token) {
                throw new Error("Không nhận được token từ server.");
            }

            // Get user profile to save to storage
            const userProfile = await checkEmailExists(formData.email);
            const fullUserData = {
                ...userProfile?.content,
                accessToken: token,
            };

            saveUserToStorage(fullUserData);
            window.dispatchEvent(new Event("auth-change"));
            toast.success(`Chào mừng ${formData.fullname} đến với TUTORA!`);
            setTimeout(() => navigate("/"), 1500);

        } catch (error: any) {
            console.error("Register error:", error);
            const errorMsg = error.response?.data?.message
                || error.response?.data?.content
                || error.message
                || "Đăng ký thất bại. Vui lòng thử lại.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="register-form relative">
            {/* --- MAIN FORM --- */}
            <div className="register-form__header animate-fade-in-up">
                <h2 className="register-form__title">Bắt đầu hành trình</h2>
                <p className="register-form__subtitle">Tạo tài khoản TUTORA LMS.</p>
            </div>

            <div className="register-form__body">
                <form onSubmit={handleSubmit} className="register-form__form">
                    <div className="space-y-3">
                        <div className="animate-fade-in-up delay-75">
                            <InputGroup id="fullname" name="fullname" type="text" label="Họ và Tên" placeholder="Nguyễn Văn A" icon="person" value={formData.fullname} onChange={handleChange} />
                        </div>
                        <div className="animate-fade-in-up delay-100">
                            <InputGroup id="email" name="email" type="email" label="Email" placeholder="student@example.com" icon="mail" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="animate-fade-in-up delay-150">
                            <InputGroup id="phone" name="phone" type="tel" label="Số Điện Thoại" placeholder="090..." icon="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <InputGroup id="password" name="password" type="password" label="Mật Khẩu" placeholder="••••••••" icon="lock" value={formData.password} onChange={handleChange} showPasswordToggle={true} />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <InputGroup id="confirmPassword" name="confirmPassword" type="password" label="Nhập lại Mật Khẩu" placeholder="••••••••" icon="lock" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle={true} />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="animate-fade-in-up delay-175">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tôi là <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <label className="flex-1 cursor-pointer">
                                <input type="radio" name="role" value="Student" checked={formData.role === "Student"} onChange={handleChange} className="peer hidden" />
                                <div className="border-2 border-gray-300 rounded-lg p-3 text-center transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-blue-400">
                                    <div className="text-2xl mb-1">🎓</div>
                                    <div className="text-sm font-medium text-gray-700 peer-checked:text-blue-600">Học sinh</div>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input type="radio" name="role" value="Parent" checked={formData.role === "Parent"} onChange={handleChange} className="peer hidden" />
                                <div className="border-2 border-gray-300 rounded-lg p-3 text-center transition-all peer-checked:border-green-600 peer-checked:bg-green-50 hover:border-green-400">
                                    <div className="text-2xl mb-1">👨‍👩‍👧</div>
                                    <div className="text-sm font-medium text-gray-700 peer-checked:text-green-600">Phụ huynh</div>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input type="radio" name="role" value="Tutor" checked={formData.role === "Tutor"} onChange={handleChange} className="peer hidden" />
                                <div className="border-2 border-gray-300 rounded-lg p-3 text-center transition-all peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-purple-400">
                                    <div className="text-2xl mb-1">👨‍🏫</div>
                                    <div className="text-sm font-medium text-gray-700 peer-checked:text-purple-600">Gia sư</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="register-form__terms animate-fade-in-up delay-300 mt-3">
                        <div className="register-form__checkbox-wrapper">
                            <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} className="register-form__checkbox" />
                        </div>
                        <label htmlFor="terms" className="register-form__terms-label text-xs">
                            Đồng ý với <a href="#" className="register-form__terms-link">Điều khoản</a> & <a href="#" className="register-form__terms-link">Chính sách</a>.
                        </label>
                    </div>

                    <div className="register-form__submit animate-fade-in-up delay-300 mt-5">
                        <button
                            type="submit"
                            className="register-form__button"
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
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            )}
                            {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
                        </button>
                    </div>

                    <div className="register-form__login animate-fade-in-up delay-300 mt-3">
                        <p>Đã có tài khoản? <Link to="/login" className="register-form__login-link">Đăng nhập</Link></p>
                    </div>
                </form>
            </div>
            <div className="register-form__accent"></div>
        </div>
    );
};

export default RegisterForm;
