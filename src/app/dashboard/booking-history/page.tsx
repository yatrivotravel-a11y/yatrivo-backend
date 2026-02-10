"use client";

import React from 'react';
import { useDashboard, Booking } from '@/context/DashboardContext';
import DashboardTable from '@/components/dashboard/DashboardTable';

export default function BookingHistoryPage() {
  const { bookings, users, packages } = useDashboard();

  // Filter for history (completed or cancelled)
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const columns = [
    { 
      header: 'User', 
      accessor: (item: Booking) => {
        const user = users.find(u => u.id === item.userId);
        return user ? user.name : 'Unknown User';
      }
    },
    { 
      header: 'Package', 
      accessor: (item: Booking) => {
        const pkg = packages.find(p => p.id === item.packageId);
        return pkg ? pkg.name : 'Unknown Package';
      }
    },
    { header: 'Booking Date', accessor: 'bookingDate' as keyof Booking },
    { header: 'Amount', accessor: (item: Booking) => `$${item.totalAmount}` },
    { 
        header: 'Status', 
        accessor: (item: Booking) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
        )
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Booking History</h1>
      <DashboardTable data={historyBookings} columns={columns} />
    </div>
  );
}
