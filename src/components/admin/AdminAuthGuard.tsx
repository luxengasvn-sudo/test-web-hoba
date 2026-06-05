'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Helper to hash password using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AdminSession {
  username: string;
  role: 'super_admin' | 'editor';
  displayName: string;
}

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize and seed default user for offline mode
  useEffect(() => {
    setIsMounted(true);
    
    // 1. Check active session
    const savedSession = localStorage.getItem('hoba_admin_session');
    if (savedSession) {
      try {
        if (savedSession === 'true') {
          // Migrate legacy session to super_admin
          const defaultSession: AdminSession = {
            username: 'admin',
            role: 'super_admin',
            displayName: 'Quản trị tối cao'
          };
          localStorage.setItem('hoba_admin_session', JSON.stringify(defaultSession));
          setSession(defaultSession);
        } else {
          const parsed = JSON.parse(savedSession);
          if (parsed && typeof parsed === 'object' && parsed.role) {
            setSession(parsed);
          } else {
            // Migrate malformed or old objects
            const defaultSession: AdminSession = {
              username: 'admin',
              role: 'super_admin',
              displayName: 'Quản trị tối cao'
            };
            localStorage.setItem('hoba_admin_session', JSON.stringify(defaultSession));
            setSession(defaultSession);
          }
        }
      } catch (e) {
        localStorage.removeItem('hoba_admin_session');
      }
    }


    // 2. Seed default local users database for offline mode if not exists
    const localUsers = localStorage.getItem('hoba_admin_users');
    if (!localUsers) {
      const defaultUsers = [
        {
          id: 'default-admin-id',
          username: 'admin',
          // SHA-256 of 'adminhoba123'
          password_hash: 'b78284b74e17b7641aced38d8a66e2533df180cb0cbcbdf3b7a9c357c0aca594',
          display_name: 'Quản trị tối cao',
          role: 'super_admin',
          status: 'Active',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('hoba_admin_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const enteredHash = await hashPassword(passwordInput);
      const cleanUsername = usernameInput.trim().toLowerCase();

      if (supabase) {
        // Query credentials from Supabase admin_users table
        const { data: dbUser, error: dbError } = await supabase
          .from('admin_users')
          .select('username, password_hash, display_name, role, status')
          .eq('username', cleanUsername)
          .eq('status', 'Active')
          .single();

        if (dbError || !dbUser) {
          setError('Tên đăng nhập không tồn tại hoặc đã bị khóa.');
          setLoading(false);
          return;
        }

        if (dbUser.password_hash === enteredHash) {
          const newSession: AdminSession = {
            username: dbUser.username,
            role: dbUser.role as 'super_admin' | 'editor',
            displayName: dbUser.display_name
          };
          localStorage.setItem('hoba_admin_session', JSON.stringify(newSession));
          setSession(newSession);
        } else {
          setError('Mật khẩu không chính xác.');
        }
      } else {
        // Fallback: local users in localStorage
        const localUsers = localStorage.getItem('hoba_admin_users');
        const userList = localUsers ? JSON.parse(localUsers) : [];
        const matchedUser = userList.find(
          (u: any) => u.username.toLowerCase() === cleanUsername && u.status === 'Active'
        );

        if (!matchedUser) {
          setError('Tên đăng nhập không tồn tại hoặc đã bị khóa.');
          setLoading(false);
          return;
        }

        if (matchedUser.password_hash === enteredHash) {
          const newSession: AdminSession = {
            username: matchedUser.username,
            role: matchedUser.role,
            displayName: matchedUser.display_name
          };
          localStorage.setItem('hoba_admin_session', JSON.stringify(newSession));
          setSession(newSession);
        } else {
          setError('Mật khẩu không chính xác.');
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent SSR hydration issues
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, render the login interface
  if (!session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 font-sans text-xs">
        {/* Background gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#bb0013]/10 blur-[120px] pointer-events-none"></div>

        {/* Decorative vector shape */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Main card */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex w-16 h-16 bg-[#00346f]/20 border border-[#00346f]/40 rounded-2xl items-center justify-center text-[#3b82f6] shadow-inner mb-2">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight uppercase">
                Hệ thống Quản trị HOBA
              </h2>
              <p className="text-[11px] text-slate-400">
                Nhập tài khoản và mật khẩu của bạn để quản lý.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] px-4 py-3 rounded-lg flex items-center gap-2 animate-shake">
                  <span className="material-symbols-outlined text-base text-red-400">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên đăng nhập</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full h-11 bg-slate-950/40 border border-slate-800 rounded-lg pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full h-11 bg-slate-950/40 border border-slate-800 rounded-lg pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#bb0013] hover:bg-[#93000d] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-bold text-xs shadow-lg hover:shadow-red-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Đăng nhập hệ thống</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Route-Level Authorization Check for Editors
  const isEditor = session.role === 'editor';
  const restrictedEditorPaths = [
    '/admin/cau-hinh',
    '/admin/tai-khoan',
    '/admin/footer',
    '/admin/trang-dang-ky',
    '/admin/trang-chu',
    '/admin/trang-gioi-thieu',
    '/admin/trang-tuy-chinh',
    '/admin/hoi-vien-tieu-bieu',
    '/admin/ban-lanh-dao',
    '/admin/thu-vien'
  ];

  const isRestricted = restrictedEditorPaths.some(path => pathname.startsWith(path));

  if (isEditor && isRestricted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-4 text-xs">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-[#bb0013]">
          <span className="material-symbols-outlined text-4xl">block</span>
        </div>
        <h2 className="text-lg font-extrabold text-[#00346f] uppercase">Không Có Quyền Truy Cập</h2>
        <p className="text-on-surface-variant max-w-md leading-relaxed text-[11px]">
          Tài khoản của bạn có quyền hạn <strong>Biên tập viên (Editor)</strong>. Chuyên mục này chỉ dành riêng cho tài khoản <strong>Quản trị tối cao (Super Admin)</strong>. 
        </p>
        <button
          onClick={() => window.location.href = '/admin/'}
          className="mt-4 px-6 py-2.5 bg-primary hover:bg-[#00346f] text-white font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
