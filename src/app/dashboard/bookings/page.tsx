"use client";

import React from 'react';
import { useDashboard, Booking } from '@/context/DashboardContext';
import DashboardTable from '@/components/dashboard/DashboardTable';

export default function BookingsPage() {
  const { bookings, users, packages, completeBooking } = useDashboard();

  // Filter for active bookings (not completed or cancelled)
  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

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
                item.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
        )
    },
  ];

  const actions = (item: Booking) => (
    <button
      onClick={() => completeBooking(item.id)}
      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
      title="Mark as Complete"
    >
      Complete
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Current Bookings</h1>
      <DashboardTable data={activeBookings} columns={columns} actions={actions} />
    </div>
  );
}
