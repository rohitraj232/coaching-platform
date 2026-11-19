
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-[270px]">
        <AdminHeader />

        <main className="min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
