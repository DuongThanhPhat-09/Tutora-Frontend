/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Register/RegisterForm.tsx — Dùng SimpleAuth API (không qua Supabase)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InputGroup from "../../components/InputGroup";
import axios from "axios";
import { saveUserToStorage } from "../../services/auth.service";

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5166') + '/api';

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



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullname || !formData.email || !formData.password || !formData.confirmPassword) {
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

            // Call SimpleAuth register API directly (no Supabase, no OTP)
            const response = await axios.post(`${API_BASE_URL}/SimpleAuth/register`, {
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password,
                fullName: formData.fullname,
                role: formData.role,
            });

            const data = response.data;
            const token = data.content?.token;

            if (!token) {
                throw new Error("Không nhận được token từ server");
            }

            // Save user data with accessToken
            saveUserToStorage({ accessToken: token });
            window.dispatchEvent(new Event("auth-change"));
            toast.success(`Chào mừng ${formData.fullname} đến với TUTORA!`);
            setTimeout(() => navigate("/"), 1500);
        } catch (error: any) {
            console.error("Register Error:", error);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.content ||
                error.message ||
                "Đăng ký thất bại";
            toast.error(errorMessage);
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
                            <InputGroup id="fullname" name="fullname" type="text" label="Họ và Tên" placeholder="Nguyễn Văn A" icon="person" value={formData.fullname} onChange={handleChange} disabled={isSubmitting} />
                        </div>
                        <div className="animate-fade-in-up delay-100">
                            <InputGroup id="email" name="email" type="email" label="Email" placeholder="student@example.com" icon="mail" value={formData.email} onChange={handleChange} disabled={isSubmitting} />
                        </div>
                        <div className="animate-fade-in-up delay-150">
                            <InputGroup id="phone" name="phone" type="tel" label="Số Điện Thoại (tùy chọn)" placeholder="090..." icon="phone" value={formData.phone} onChange={handleChange} disabled={isSubmitting} />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <InputGroup id="password" name="password" type="password" label="Mật Khẩu" placeholder="••••••••" icon="lock" value={formData.password} onChange={handleChange} showPasswordToggle={true} disabled={isSubmitting} />
                        </div>
                        <div className="animate-fade-in-up delay-200">
                            <InputGroup id="confirmPassword" name="confirmPassword" type="password" label="Nhập lại Mật Khẩu" placeholder="••••••••" icon="lock" value={formData.confirmPassword} onChange={handleChange} showPasswordToggle={true} disabled={isSubmitting} />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="animate-fade-in-up delay-175">
                        <label className="register-form__role-label">
                            Tôi là <span className="register-form__role-required">*</span>
                        </label>
                        <div className="register-form__role-grid">
                            <label className="register-form__role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Student"
                                    checked={formData.role === "Student"}
                                    onChange={handleChange}
                                    className="register-form__role-input"
                                />
                                <div className={`register-form__role-card ${formData.role === "Student" ? "register-form__role-card--active register-form__role-card--student" : ""}`}>
                                    <div className={`register-form__role-icon ${formData.role === "Student" ? "register-form__role-icon--student" : ""}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
                                        </svg>
                                    </div>
                                    <span className="register-form__role-name">Học sinh</span>
                                </div>
                            </label>

                            <label className="register-form__role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Parent"
                                    checked={formData.role === "Parent"}
                                    onChange={handleChange}
                                    className="register-form__role-input"
                                />
                                <div className={`register-form__role-card ${formData.role === "Parent" ? "register-form__role-card--active register-form__role-card--parent" : ""}`}>
                                    <div className={`register-form__role-icon ${formData.role === "Parent" ? "register-form__role-icon--parent" : ""}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                            <path d="M16 3.13a4 4 0 010 7.75" />
                                            <path d="M21 21v-2a4 4 0 00-3-3.87" />
                                        </svg>
                                    </div>
                                    <span className="register-form__role-name">Phụ huynh</span>
                                </div>
                            </label>

                            <label className="register-form__role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Tutor"
                                    checked={formData.role === "Tutor"}
                                    onChange={handleChange}
                                    className="register-form__role-input"
                                />
                                <div className={`register-form__role-card ${formData.role === "Tutor" ? "register-form__role-card--active register-form__role-card--tutor" : ""}`}>
                                    <div className={`register-form__role-icon ${formData.role === "Tutor" ? "register-form__role-icon--tutor" : ""}`}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                            <line x1="9" y1="7" x2="17" y2="7" />
                                            <line x1="9" y1="11" x2="14" y2="11" />
                                        </svg>
                                    </div>
                                    <span className="register-form__role-name">Gia sư</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="register-form__terms animate-fade-in-up delay-300 mt-3">
                        <div className="register-form__checkbox-wrapper">
                            <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} className="register-form__checkbox" disabled={isSubmitting} />
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
