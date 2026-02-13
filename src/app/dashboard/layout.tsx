import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <DashboardNav />
          <main className="flex-1 p-4 lg:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
