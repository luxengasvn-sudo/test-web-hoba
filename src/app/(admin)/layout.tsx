import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="ml-64 flex flex-col min-h-screen">
          {/* Top Header */}
          <AdminHeader />

          {/* Dynamic Canvas */}
          <main className="flex-grow p-gutter">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

