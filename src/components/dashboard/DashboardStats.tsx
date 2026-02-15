"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useState, useEffect } from "react";
import { getAdminBookings, type BookingStats } from "@/lib/api";

export default function DashboardStats() {
  const { categories, destinations, packages, users, isLoading } = useDashboardData();
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        setLoadingBookings(true);
        const response = await getAdminBookings();
        if (response.success && response.data) {
          setBookingStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch booking stats:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookingStats();
  }, []);

  const stats: Array<{
    name: string;
    value: string;
    icon: string;
    color: string;
    subtitle?: string;
  }> = [
    { 
      name: "Trip Categories", 
      value: isLoading ? "..." : categories.length.toString(), 
      icon: "🗂️",
      color: "blue" 
    },
    { 
      name: "Destinations", 
      value: isLoading ? "..." : destinations.length.toString(), 
      icon: "📍",
      color: "green" 
    },
    { 
      name: "Tour Packages", 
      value: isLoading ? "..." : packages.length.toString(), 
      icon: "🎫",
      color: "purple" 
    },
    { 
      name: "Total Bookings", 
      value: loadingBookings ? "..." : (bookingStats?.total || 0).toString(), 
      icon: "📅",
      color: "pink",
      subtitle: loadingBookings ? "" : `${bookingStats?.confirmed || 0} confirmed`
    },
    { 
      name: "Total Users", 
      value: isLoading ? "..." : users.length.toString(), 
      icon: "👥",
      color: "orange" 
    },
    { 
      name: "Revenue", 
      value: loadingBookings ? "..." : `₹${((bookingStats?.totalRevenue || 0) / 1000).toFixed(0)}K`, 
      icon: "💰",
      color: "emerald",
      subtitle: loadingBookings ? "" : `${bookingStats?.completed || 0} completed`
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600 dark:text-blue-400";
      case "green":
        return "text-green-600 dark:text-green-400";
      case "purple":
        return "text-purple-600 dark:text-purple-400";
      case "orange":
        return "text-orange-600 dark:text-orange-400";
      case "pink":
        return "text-pink-600 dark:text-pink-400";
      case "emerald":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.name}
            </div>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div className="mt-2">
            <div className={`text-3xl font-bold ${getColorClasses(stat.color)}`}>
              {stat.value}
            </div>
            {stat.subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
