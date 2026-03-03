import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getUserIdFromToken, changePassword } from '../../services/auth.service';
import { getUserProfile, updateUserProfile } from '../../services/user.service';

interface UserProfileData {
  userid: string;
  email: string;
  fullname: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  gender?: string;
  avatarurl?: string;
  role?: string;
  createdat?: string;
}

interface EditForm {
  fullname: string;
  birthdate: string;
  address: string;
  gender: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const StudentAccount = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    fullname: '',
    birthdate: '',
    address: '',
    gender: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getUserProfile(userId);
        const data = res.content || res;
        setProfile(data);
        setForm({
          fullname: data.fullname || '',
          birthdate: data.birthdate || '',
          address: data.address || '',
          gender: data.gender || '',
        });
      } catch {
        message.error('Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    if (!form.fullname.trim()) {
      message.warning('Họ tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(profile.userid, {
        fullname: form.fullname,
        birthdate: form.birthdate || '',
        address: form.address || '',
        gender: form.gender || '',
        avatarurl: profile.avatarurl,
      });
      setProfile(prev => prev ? { ...prev, ...form } : null);
      setEditing(false);
      message.success('Cập nhật thông tin thành công!');
    } catch {
      message.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        fullname: profile.fullname || '',
        birthdate: profile.birthdate || '',
        address: profile.address || '',
        gender: profile.gender || '',
      });
    }
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      message.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error('Mật khẩu mới không khớp');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      message.warning('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      message.success('Đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch {
      message.error('Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '—';
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  };

  const genderDisplay = (g: string | undefined) => {
    if (g === 'Male') return 'Nam';
    if (g === 'Female') return 'Nữ';
    if (g === 'Other') return 'Khác';
    return '—';
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', color: '#737373', padding: 48 }}>Đang tải...</div>
      </div>
    );
  }

  const displayName = profile?.fullname || 'Student';
  const initials = displayName ? getInitials(displayName) : 'ST';

  return (
    <div style={pageStyle}>
      {/* Page Header */}
      <div style={pageHeader}>
        <h1 style={pageTitle}>Tài khoản của tôi</h1>
        <p style={pageSubtitle}>Quản lý thông tin cá nhân và cài đặt tài khoản</p>
      </div>

      {/* Profile Header Card */}
      <div style={profileCard}>
        <div style={avatarCircle}>
          {profile?.avatarurl ? (
            <img src={profile.avatarurl} alt={displayName} style={avatarImg} />
          ) : (
            <span style={avatarInitials}>{initials}</span>
          )}
        </div>
        <div style={profileMeta}>
          <h2 style={profileName}>{displayName}</h2>
          <span style={roleBadge}>STUDENT</span>
          {profile?.createdat && (
            <p style={memberSince}>
              Thành viên từ {new Date(profile.createdat).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        {!editing && (
          <button style={editBtn} onClick={() => setEditing(true)} type="button">
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Personal Info Section */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <h3 style={sectionTitle}>Thông tin cá nhân</h3>
        </div>

        <div style={fieldGrid}>
          <div style={fieldGroup}>
            <label style={fieldLabel}>Họ và tên</label>
            {editing ? (
              <input
                style={fieldInput}
                value={form.fullname}
                onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                maxLength={100}
                placeholder="Nhập họ và tên"
              />
            ) : (
              <p style={fieldValue}>{profile?.fullname || '—'}</p>
            )}
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Email</label>
            <p style={{ ...fieldValue, color: '#525252' }}>{profile?.email || '—'}</p>
            <span style={readOnlyHint}>Không thể thay đổi</span>
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Số điện thoại</label>
            <p style={{ ...fieldValue, color: profile?.phone ? '#1a2238' : '#9ca3af' }}>
              {profile?.phone || 'Chưa cập nhật'}
            </p>
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Ngày sinh</label>
            {editing ? (
              <input
                style={fieldInput}
                type="date"
                value={form.birthdate}
                onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))}
              />
            ) : (
              <p style={fieldValue}>{formatDate(profile?.birthdate)}</p>
            )}
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Giới tính</label>
            {editing ? (
              <select
                style={fieldInput}
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            ) : (
              <p style={fieldValue}>{genderDisplay(profile?.gender)}</p>
            )}
          </div>

          <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
            <label style={fieldLabel}>Địa chỉ</label>
            {editing ? (
              <input
                style={fieldInput}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                maxLength={255}
                placeholder="Nhập địa chỉ"
              />
            ) : (
              <p style={fieldValue}>{profile?.address || '—'}</p>
            )}
          </div>
        </div>

        {editing && (
          <div style={actionRow}>
            <button style={cancelBtn} onClick={handleCancel} type="button">Hủy</button>
            <button
              style={{ ...saveBtn, ...(saving ? disabledStyle : {}) }}
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...(showPasswordSection ? { marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f5f5f5' } : {}) }}>
          <h3 style={sectionTitle}>Bảo mật</h3>
          <button
            style={toggleBtn}
            onClick={() => {
              setShowPasswordSection(v => !v);
              setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }}
            type="button"
          >
            {showPasswordSection ? 'Đóng' : 'Đổi mật khẩu'}
          </button>
        </div>

        {showPasswordSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Row 1: current + new password */}
            <div style={fieldGrid}>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Mật khẩu hiện tại</label>
                <input
                  style={fieldInput}
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu hiện tại"
                  autoComplete="current-password"
                />
              </div>
              <div style={fieldGroup}>
                <label style={fieldLabel}>Mật khẩu mới</label>
                <input
                  style={fieldInput}
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Ít nhất 8 ký tự"
                  autoComplete="new-password"
                />
              </div>
            </div>
            {/* Row 2: confirm password full-width */}
            <div style={fieldGroup}>
              <label style={fieldLabel}>Xác nhận mật khẩu mới</label>
              <input
                style={{ ...fieldInput, maxWidth: 'calc(50% - 16px)' }}
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
              <button
                style={{ ...saveBtn, ...(changingPassword ? disabledStyle : {}) }}
                onClick={handleChangePassword}
                disabled={changingPassword}
                type="button"
              >
                {changingPassword ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Academic Info Note */}
      <div style={noteCard}>
        <div style={noteIconWrap}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#6366f1" strokeWidth="1.5" />
            <path d="M8 7v4M8 5v-.5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p style={noteText}>
          Thông tin học tập (trường học, lớp, mục tiêu học tập) được quản lý bởi phụ huynh.
          Nếu cần cập nhật, hãy nhờ phụ huynh chỉnh sửa trong trang quản lý học sinh.
        </p>
      </div>
    </div>
  );
};

// ── Styles ──
const pageStyle: React.CSSProperties = {
  padding: '32px 32px 48px',
  maxWidth: 820,
  margin: '0 auto',
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const pageHeader: React.CSSProperties = {
  marginBottom: 28,
};

const pageTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#1a2238',
  margin: '0 0 4px',
  fontFamily: "'Bricolage Grotesque', 'IBM Plex Sans', sans-serif",
};

const pageSubtitle: React.CSSProperties = {
  fontSize: 14,
  color: '#737373',
  margin: 0,
};

const profileCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #f0f0f0',
  padding: '28px 32px',
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  marginBottom: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const avatarCircle: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  background: '#1a2238',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const avatarImg: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const avatarInitials: React.CSSProperties = {
  color: '#f2f0e4',
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: 1,
};

const profileMeta: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const profileName: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1a2238',
  margin: 0,
};

const roleBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 600,
  color: '#6366f1',
  background: '#eef2ff',
  padding: '2px 8px',
  borderRadius: 4,
  letterSpacing: 0.5,
  width: 'fit-content',
};

const memberSince: React.CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  margin: 0,
};

const editBtn: React.CSSProperties = {
  padding: '8px 20px',
  background: '#1a2238',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
};

const sectionCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #f0f0f0',
  padding: '24px 32px',
  marginBottom: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const sectionHeader: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: '1px solid #f5f5f5',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1a2238',
  margin: 0,
};

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px 32px',
};

const fieldGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#737373',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const fieldValue: React.CSSProperties = {
  fontSize: 15,
  color: '#1a2238',
  margin: 0,
  fontWeight: 500,
};

const fieldInput: React.CSSProperties = {
  fontSize: 14,
  color: '#1a2238',
  border: '1.5px solid #e5e5e5',
  borderRadius: 8,
  padding: '9px 12px',
  outline: 'none',
  background: '#fafafa',
  fontFamily: "'IBM Plex Sans', sans-serif",
  width: '100%',
  boxSizing: 'border-box' as const,
};

const readOnlyHint: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  fontStyle: 'italic',
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 24,
  paddingTop: 20,
  borderTop: '1px solid #f5f5f5',
  gridColumn: '1 / -1',
};

const cancelBtn: React.CSSProperties = {
  padding: '9px 20px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  borderRadius: 8,
  fontSize: 13,
  color: '#737373',
  fontWeight: 500,
  cursor: 'pointer',
};

const saveBtn: React.CSSProperties = {
  padding: '9px 24px',
  background: '#1a2238',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const disabledStyle: React.CSSProperties = {
  opacity: 0.6,
  cursor: 'not-allowed',
};

const toggleBtn: React.CSSProperties = {
  padding: '7px 16px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  borderRadius: 8,
  fontSize: 13,
  color: '#525252',
  fontWeight: 500,
  cursor: 'pointer',
};

const noteCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  background: '#f5f3ff',
  border: '1px solid #e0e7ff',
  borderRadius: 12,
  padding: '16px 20px',
};

const noteIconWrap: React.CSSProperties = {
  flexShrink: 0,
  marginTop: 1,
};

const noteText: React.CSSProperties = {
  fontSize: 13,
  color: '#4c4c7f',
  margin: 0,
  lineHeight: 1.6,
};

export default StudentAccount;
