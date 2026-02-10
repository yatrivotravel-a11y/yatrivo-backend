
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

const navigation = [
  { name: "Users", href: "/dashboard/users" },
  { name: "Trip Category", href: "/dashboard/trip-category" },
  { name: "Destinations", href: "/dashboard/destinations" },
  { name: "Packages", href: "/dashboard/packages" },
  { name: "Bookings", href: "/dashboard/bookings" },
  { name: "Booking History", href: "/dashboard/booking-history" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Yatrivo
            </h1>
            <button 
              className="ml-auto lg:hidden"
              onClick={toggleSidebar}
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

