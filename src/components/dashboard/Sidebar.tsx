
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Users", href: "/dashboard/users", icon: "👥" },
  { name: "Trip Category", href: "/dashboard/trip-category", icon: "🗂️" },
  { name: "Destinations", href: "/dashboard/destinations", icon: "📍" },
  { name: "Packages", href: "/dashboard/packages", icon: "🎫" },
  { name: "Bookings", href: "/dashboard/bookings", icon: "📋" },
  { name: "Booking History", href: "/dashboard/booking-history", icon: "📚" },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center border-b border-gray-200/50 px-6 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <Link href="/dashboard" className="cursor-pointer group flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <span className="text-2xl">✈️</span>
              </div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                Yatrivo
              </h1>
            </Link>
            <button 
              className="ml-auto lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleSidebar}
            >
              <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-102"
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                >
                  <span className={`text-xl transition-transform group-hover:scale-110 ${
                    isActive ? "" : "grayscale-[30%]"
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Travel Dashboard</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Manage your travel business</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

