export default function DashboardStats() {
  const stats = [
    { name: "Total Users", value: "1,234", change: "+12.5%", trend: "up" },
    { name: "Active Users", value: "892", change: "+8.2%", trend: "up" },
    { name: "Revenue", value: "$45,678", change: "+15.3%", trend: "up" },
    { name: "Growth", value: "23.5%", change: "-2.1%", trend: "down" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        >
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stat.name}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <span
              className={`text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
