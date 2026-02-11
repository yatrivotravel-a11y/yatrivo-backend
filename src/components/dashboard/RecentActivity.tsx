"use client";

import { useDashboardData } from "@/hooks/useDashboardData";

export default function RecentActivity() {
  const { categories, destinations, packages, isLoading } = useDashboardData();

  // Create activity feed from recent data
  const getRecentActivities = () => {
    const activities: Array<{
      id: string;
      type: string;
      name: string;
      action: string;
      time: string;
      icon: string;
    }> = [];

    // Add recent categories (max 2)
    categories.slice(0, 2).forEach((cat) => {
      activities.push({
        id: cat.id,
        type: "category",
        name: cat.name,
        action: "added new trip category",
        time: formatTimeAgo(cat.createdAt),
        icon: "🗂️",
      });
    });

    // Add recent destinations (max 3)
    destinations.slice(0, 3).forEach((dest) => {
      activities.push({
        id: dest.id,
        type: "destination",
        name: dest.placeName,
        action: `added destination in ${dest.city}`,
        time: formatTimeAgo(dest.createdAt),
        icon: "📍",
      });
    });

    // Add recent packages (max 2)
    packages.slice(0, 2).forEach((pkg) => {
      activities.push({
        id: pkg.id,
        type: "package",
        name: pkg.placeName,
        action: `created tour package for ${pkg.city}`,
        time: formatTimeAgo(pkg.createdAt),
        icon: "🎫",
      });
    });

    // Sort by most recent and limit to 5
    return activities
      .sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      })
      .slice(0, 5);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === "just now") return 0;
    const match = timeStr.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1]);
    if (timeStr.includes("minute")) return num * 60;
    if (timeStr.includes("hour")) return num * 3600;
    if (timeStr.includes("day")) return num * 86400;
    if (timeStr.includes("week")) return num * 604800;
    return 0;
  };

  const activities = isLoading ? [] : getRecentActivities();

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.action}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
