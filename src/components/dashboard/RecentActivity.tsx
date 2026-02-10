export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "created a new account",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "updated profile information",
      time: "4 hours ago",
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "logged in",
      time: "6 hours ago",
    },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user}
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
    </div>
  );
}
