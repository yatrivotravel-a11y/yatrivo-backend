"use client";

import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardStats() {
  const { categories, destinations, packages, users, isLoading } = useDashboardData();

  const stats = [
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
      name: "Total Users", 
      value: isLoading ? "..." : users.length.toString(), 
      icon: "👥",
      color: "orange" 
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
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </div>
      ))}
    </div>
  );
}
