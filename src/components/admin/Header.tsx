import React from 'react';

export default function AdminHeader() {
  return (
    <header className="flex justify-between items-center px-gutter h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
      {/* Search bar */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs text-on-surface"
            placeholder="Tìm kiếm hội viên, văn bản, tin tức..."
            type="text"
          />
        </div>
      </div>

      {/* Admin Info & Actions */}
      <div className="flex items-center gap-6 ml-6">
        <div className="flex items-center gap-4 text-primary">
          <button className="material-symbols-outlined cursor-pointer hover:opacity-80 relative" title="Notifications">
            notifications
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
          <button className="material-symbols-outlined cursor-pointer hover:opacity-80" title="Help">
            help
          </button>
        </div>
        
        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-6 cursor-pointer hover:opacity-90">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary">Admin HOBA</p>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Ban quản trị</p>
          </div>
          <img
            alt="Admin Profile"
            className="w-9 h-9 rounded-full object-cover border border-outline-variant/30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmhRtGLhXdzBE5MHX5p2EPZts9-Fc_KY-IrXXVXjrGesQPoipFfMhTCqf1SOmxvv2XsrFZ8s7CGR3o_wQa4fG96gyJRiqljtgZwc-zdN5rETSD2rvv5p5xPF2pgKvassUzVgIKjolZZy61VbufRziSaWnGWhg_tNC2WjS3IA5jKmU6op-FtNUKvk4NZqrQGthqWQU6v9YdW4_BhS8koF3DVEA8ek01q8hOvswYUdOtgjoKJsaGAvlXTAfvYnGX1MzC4l4zEU83z64"
          />
        </div>
      </div>
    </header>
  );
}
