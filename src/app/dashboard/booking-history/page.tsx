"use client";

import React, { useEffect, useState } from 'react';
import DashboardTable from '@/components/dashboard/DashboardTable';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile: string;
  packageId: string;
  packageName: string;
  packageCity: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter for history (completed or cancelled)
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const columns = [
    { 
      header: 'Customer', 
      accessor: (item: Booking) => item.customerName || item.userName || 'Unknown'
    },
    { 
      header: 'Package', 
      accessor: (item: Booking) => item.packageName || 'Unknown Package'
    },
    {
      header: 'City',
      accessor: (item: Booking) => item.packageCity || '-',
    },
    {
      header: 'Booking Date',
      accessor: (item: Booking) =>
        new Date(item.bookingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    { header: 'Amount', accessor: (item: Booking) => `₹${item.totalAmount?.toLocaleString() || 0}` },
    { 
        header: 'Status', 
        accessor: (item: Booking) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === 'completed'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
        )
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Booking History</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking History</h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <DashboardTable data={historyBookings} columns={columns} />

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {historyBookings.length} history booking(s) out of {bookings.length} total
      </div>
    </div>
  );
}
