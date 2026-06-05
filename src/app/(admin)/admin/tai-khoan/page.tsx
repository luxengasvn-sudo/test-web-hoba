'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  role: 'super_admin' | 'editor';
  status: 'Active' | 'Inactive';
  created_at: string;
}

// Helper to hash password using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AccountManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add user form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'editor'>('editor');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Reset password state
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, display_name, role, status, created_at')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setUsers(data as AdminUser[]);
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
      }
    } else {
      const localUsers = localStorage.getItem('hoba_admin_users');
      if (localUsers) {
        try {
          const parsed = JSON.parse(localUsers);
          // Omit password hash for state list safety
          const list = parsed.map((u: any) => ({
            id: u.id,
            username: u.username,
            display_name: u.display_name,
            role: u.role,
            status: u.status,
            created_at: u.created_at
          }));
          setUsers(list);
        } catch (e) {}
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (username.trim().length < 3) {
      setFormError('Tên tài khoản phải chứa ít nhất 3 ký tự.');
      return;
    }
    if (displayName.trim().length < 2) {
      setFormError('Tên hiển thị phải chứa ít nhất 2 ký tự.');
      return;
    }
    if (password.length < 6) {
      setFormError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setFormSubmitting(true);
    try {
      const cleanUsername = username.trim().toLowerCase();
      const pwHash = await hashPassword(password);
      const newId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

      if (supabase) {
        // 1. Check if user already exists
        const { data: exists } = await supabase
          .from('admin_users')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (exists) {
          setFormError('Tên tài khoản đã được sử dụng.');
          setFormSubmitting(false);
          return;
        }

        // 2. Insert user
        const { error } = await supabase
          .from('admin_users')
          .insert({
            username: cleanUsername,
            password_hash: pwHash,
            display_name: displayName.trim(),
            role,
            status: 'Active'
          });

        if (error) throw error;
      } else {
        // LocalStorage Flow
        const localUsers = localStorage.getItem('hoba_admin_users');
        const parsedList = localUsers ? JSON.parse(localUsers) : [];

        if (parsedList.some((u: any) => u.username.toLowerCase() === cleanUsername)) {
          setFormError('Tên tài khoản đã được sử dụng.');
          setFormSubmitting(false);
          return;
        }

        const newUser = {
          id: newId,
          username: cleanUsername,
          password_hash: pwHash,
          display_name: displayName.trim(),
          role,
          status: 'Active',
          created_at: new Date().toISOString()
        };

        parsedList.push(newUser);
        localStorage.setItem('hoba_admin_users', JSON.stringify(parsedList));
      }

      // Reset form
      setUsername('');
      setDisplayName('');
      setPassword('');
      setRole('editor');
      setShowAddForm(false);
      loadUsers();
      alert('Tạo tài khoản quản trị mới thành công!');
    } catch (err) {
      setFormError('Không thể tạo tài khoản: ' + (err as Error).message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
    const sessionStr = localStorage.getItem('hoba_admin_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        // Find username of user to be modified
        const userToModify = users.find(u => u.id === userId);
        if (userToModify && userToModify.username === session.username) {
          alert('Bạn không thể tự khóa tài khoản của chính mình!');
          return;
        }
      } catch (e) {}
    }

    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const confirmMsg = `Bạn có chắc chắn muốn ${nextStatus === 'Active' ? 'kích hoạt lại' : 'khóa'} tài khoản này?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (supabase) {
        const { error } = await supabase
          .from('admin_users')
          .update({ status: nextStatus })
          .eq('id', userId);
        if (error) throw error;
      } else {
        const localUsers = localStorage.getItem('hoba_admin_users');
        if (localUsers) {
          const parsed = JSON.parse(localUsers);
          const updated = parsed.map((u: any) => 
            u.id === userId ? { ...u, status: nextStatus } : u
          );
          localStorage.setItem('hoba_admin_users', JSON.stringify(updated));
        }
      }
      loadUsers();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err as Error).message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }

    setResetSubmitting(true);
    try {
      const pwHash = await hashPassword(newPassword);

      if (supabase) {
        const { error } = await supabase
          .from('admin_users')
          .update({ password_hash: pwHash })
          .eq('id', resettingUserId);
        if (error) throw error;
      } else {
        const localUsers = localStorage.getItem('hoba_admin_users');
        if (localUsers) {
          const parsed = JSON.parse(localUsers);
          const updated = parsed.map((u: any) => 
            u.id === resettingUserId ? { ...u, password_hash: pwHash } : u
          );
          localStorage.setItem('hoba_admin_users', JSON.stringify(updated));
        }
      }

      setNewPassword('');
      setResettingUserId(null);
      alert('Đã thay đổi mật khẩu thành công!');
    } catch (err) {
      setResetError('Lỗi đặt lại mật khẩu: ' + (err as Error).message);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-[#1c1c1a]">
      {/* Header */}
      <div className="border-b border-outline-variant/30 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-lg md:text-xl font-black text-[#00346f]">Quản lý Tài khoản Admin</h2>
          <p className="text-on-surface-variant mt-1 text-[11px]">Tạo tài khoản quản trị phụ, thay đổi quyền hạn và khóa/mở khóa tài khoản.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#00346f] hover:bg-[#00346f]/90 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Thêm tài khoản
          </button>
        )}
      </div>

      {/* Add User Form overlay/card */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm max-w-xl animate-fade-in space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">person_add</span> Thêm tài khoản quản trị mới
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormError('');
              }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-400">error</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên tài khoản (Username)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 border border-outline-variant rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  placeholder="VD: nguyenvanb"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tên hiển thị (Display Name)</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 border border-outline-variant rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  placeholder="VD: Nguyễn Văn B"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Mật khẩu ban đầu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 border border-outline-variant rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Quyền hạn (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="h-10 border border-outline-variant rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary font-semibold text-primary"
                >
                  <option value="editor">Biên tập viên (Editor)</option>
                  <option value="super_admin">Quản trị tối cao (Super Admin)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError('');
                }}
                className="px-4 py-2 border border-outline-variant/60 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-6 py-2 bg-[#bb0013] hover:bg-[#93000d] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1 active:scale-95"
              >
                {formSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Reset Modal */}
      {resettingUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-xl max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined">lock_reset</span> Đặt lại mật khẩu tài khoản
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-2 rounded text-[11px]">
                  {resetError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 border border-outline-variant rounded-lg px-3 bg-surface text-xs outline-none focus:border-primary"
                  placeholder="Tối thiểu 6 ký tự"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResettingUserId(null);
                    setNewPassword('');
                    setResetError('');
                  }}
                  className="px-4 py-2 border border-outline-variant/60 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-6 py-2 bg-[#00346f] hover:bg-[#00346f]/90 text-white font-bold rounded-lg cursor-pointer active:scale-95"
                >
                  {resetSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Accounts List */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-slate-50/50">
          <h3 className="font-bold text-primary text-xs">Danh sách tài khoản nội bộ</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#00346f] border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải thông tin tài khoản...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            Không có tài khoản quản trị nào được tìm thấy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-slate-50/30 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-3">Tên tài khoản</th>
                  <th className="px-6 py-3">Tên hiển thị</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ngày tạo</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-[11px]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{user.username}</td>
                    <td className="px-6 py-4 text-on-surface font-medium">{user.display_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'super_admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${
                        user.status === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {user.status === 'Active' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setResettingUserId(user.id)}
                          className="px-2 py-1 text-[#00346f] hover:bg-blue-50 border border-blue-200/60 rounded flex items-center gap-0.5 font-bold transition-all active:scale-95 cursor-pointer"
                          title="Đặt lại mật khẩu"
                        >
                          <span className="material-symbols-outlined text-[13px]">lock_reset</span>
                          Đổi mật khẩu
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`px-2 py-1 border rounded flex items-center gap-0.5 font-bold transition-all active:scale-95 cursor-pointer ${
                            user.status === 'Active' 
                              ? 'text-[#bb0013] border-red-200/60 hover:bg-red-50' 
                              : 'text-green-600 border-green-200/60 hover:bg-green-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {user.status === 'Active' ? 'block' : 'check_circle'}
                          </span>
                          {user.status === 'Active' ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
