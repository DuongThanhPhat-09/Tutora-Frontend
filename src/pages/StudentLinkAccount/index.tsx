/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { linkWithCode, studentSelfLink } from '../../services/student.service';

const CODE_LENGTH = 6;

type LinkMode = 'student-code' | 'parent-code';

const StudentLinkAccount = () => {
  const [chars, setChars] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<LinkMode>('student-code');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...chars];
    next[index] = char;
    setChars(next);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...chars];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setChars(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleModeSwitch = (newMode: LinkMode) => {
    setMode(newMode);
    setChars(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const code = chars.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleSubmit = async () => {
    if (!isComplete) return;
    setLoading(true);
    try {
      if (mode === 'student-code') {
        await linkWithCode(code);
      } else {
        await studentSelfLink(code);
      }
      setSuccess(true);
      message.success('Liên kết tài khoản thành công!');
    } catch (err: any) {
      const errorCode = err?.response?.data?.message || '';
      if (mode === 'student-code') {
        if (errorCode.includes('LINK_CODE_NOT_FOUND')) {
          message.error('Mã liên kết không hợp lệ');
        } else if (errorCode.includes('LINK_CODE_EXPIRED')) {
          message.error('Mã liên kết đã hết hạn. Yêu cầu phụ huynh tạo mã mới.');
        } else if (errorCode.includes('STUDENT_ALREADY_LINKED')) {
          message.error('Học sinh này đã được liên kết với một tài khoản khác');
        } else {
          message.error('Liên kết thất bại. Vui lòng thử lại.');
        }
      } else {
        if (errorCode.includes('PARENT_CODE_NOT_FOUND')) {
          message.error('Mã mời không hợp lệ');
        } else if (errorCode.includes('PARENT_CODE_EXPIRED')) {
          message.error('Mã mời đã hết hạn. Yêu cầu phụ huynh tạo mã mới.');
        } else if (errorCode.includes('STUDENT_ALREADY_HAS_PARENT')) {
          message.error('Bạn đã được liên kết với một phụ huynh.');
        } else if (errorCode.includes('STUDENT_NOT_FOUND')) {
          message.error('Không tìm thấy hồ sơ học sinh. Vui lòng đăng ký trước.');
        } else {
          message.error('Liên kết thất bại. Vui lòng thử lại.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={successIconWrap}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#dcfce7" />
              <path d="M12 20l6 6 10-12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={successTitle}>Liên kết thành công!</h2>
          <p style={successDesc}>Tài khoản của bạn đã được liên kết với hồ sơ học sinh. Bạn có thể xem lịch học và thông tin từ trang dashboard.</p>
          <button style={primaryBtn} onClick={() => navigate('/student-portal/dashboard')} type="button">
            Về trang Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Icon */}
        <div style={iconWrap}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#1a2238" />
            <path d="M10 16a6 6 0 1112 0" stroke="#f2f0e4" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 10v6M16 22v.5" stroke="#f2f0e4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={headingStyle}>Liên kết tài khoản</h1>
        <p style={subheadingStyle}>
          Nhập mã 6 ký tự để liên kết tài khoản học sinh của bạn với phụ huynh.
        </p>

        {/* Mode tabs */}
        <div style={tabRow}>
          <button
            style={mode === 'student-code' ? tabActive : tabInactive}
            onClick={() => handleModeSwitch('student-code')}
            type="button"
          >
            Mã học sinh
          </button>
          <button
            style={mode === 'parent-code' ? { ...tabActive, borderColor: '#3b82f6', color: '#3b82f6' } : tabInactive}
            onClick={() => handleModeSwitch('parent-code')}
            type="button"
          >
            Mã mời phụ huynh
          </button>
        </div>

        <p style={modeDesc}>
          {mode === 'student-code'
            ? 'Nhập mã liên kết mà phụ huynh tạo từ hồ sơ học sinh.'
            : 'Nhập mã mời mà phụ huynh tạo từ trang quản lý.'}
        </p>

        {/* OTP inputs */}
        <div style={otpRow}>
          {chars.map((char, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              style={{
                ...otpInput,
                ...(char ? otpInputFilled : {}),
                ...(mode === 'parent-code' && char ? { borderColor: '#3b82f6' } : {}),
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          style={{
            ...primaryBtn,
            ...(mode === 'parent-code' ? { background: '#3b82f6' } : {}),
            ...((!isComplete || loading) ? disabledBtn : {}),
          }}
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          type="button"
        >
          {loading ? 'Đang xác nhận...' : 'Xác nhận liên kết'}
        </button>

        <p style={helpText}>
          {mode === 'student-code'
            ? <>Chưa có mã? Nhờ phụ huynh vào trang quản lý học sinh, chọn <strong>Mã liên kết</strong> ở menu của hồ sơ bạn.</>
            : <>Chưa có mã mời? Nhờ phụ huynh vào trang quản lý, nhấn nút <strong>Invite Code</strong> để tạo mã.</>
          }
        </p>
      </div>
    </div>
  );
};

// ── Styles ──
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#f8f9fc', padding: 24,
  fontFamily: "'IBM Plex Sans', sans-serif",
};
const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  padding: '40px 36px',
  width: '100%', maxWidth: 440,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 0,
};
const iconWrap: React.CSSProperties = { marginBottom: 20 };
const headingStyle: React.CSSProperties = {
  fontSize: 24, fontWeight: 700, color: '#1a2238',
  margin: '0 0 8px', textAlign: 'center',
  fontFamily: "'Bricolage Grotesque', 'IBM Plex Sans', sans-serif",
};
const subheadingStyle: React.CSSProperties = {
  fontSize: 14, color: '#737373', lineHeight: 1.6,
  textAlign: 'center', margin: '0 0 20px',
};
const tabRow: React.CSSProperties = {
  display: 'flex', gap: 0, marginBottom: 16,
  border: '1px solid #e5e5e5', borderRadius: 10,
  overflow: 'hidden', width: '100%',
};
const tabActive: React.CSSProperties = {
  flex: 1, padding: '10px 0',
  border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: 600,
  background: '#1a2238', color: '#fff',
  borderColor: '#1a2238',
};
const tabInactive: React.CSSProperties = {
  flex: 1, padding: '10px 0',
  border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: 500,
  background: '#fff', color: '#737373',
};
const modeDesc: React.CSSProperties = {
  fontSize: 12, color: '#9ca3af', textAlign: 'center',
  margin: '0 0 20px', lineHeight: 1.5,
};
const otpRow: React.CSSProperties = {
  display: 'flex', gap: 10, marginBottom: 28,
};
const otpInput: React.CSSProperties = {
  width: 50, height: 58,
  border: '2px solid #e5e5e5', borderRadius: 12,
  textAlign: 'center', fontSize: 22, fontWeight: 700,
  color: '#1a2238', background: '#fafafa',
  outline: 'none', cursor: 'text',
  fontFamily: "'IBM Plex Mono', monospace",
  transition: 'border-color 0.15s',
};
const otpInputFilled: React.CSSProperties = {
  borderColor: '#1a2238', background: '#fff',
};
const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '13px 0',
  background: '#1a2238', color: '#fff',
  border: 'none', borderRadius: 12,
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  marginBottom: 20,
};
const disabledBtn: React.CSSProperties = { opacity: 0.45, cursor: 'not-allowed' };
const helpText: React.CSSProperties = {
  fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.7, margin: 0,
};
const successIconWrap: React.CSSProperties = { marginBottom: 20 };
const successTitle: React.CSSProperties = {
  fontSize: 22, fontWeight: 700, color: '#1a2238',
  margin: '0 0 10px', textAlign: 'center',
};
const successDesc: React.CSSProperties = {
  fontSize: 14, color: '#737373', textAlign: 'center',
  lineHeight: 1.6, margin: '0 0 28px',
};

export default StudentLinkAccount;
