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

export default function BookingsPage() {
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
          'Authorization': `Bearer ${token}`
        }
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

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh bookings
        fetchBookings();
        alert(`Booking status updated to ${newStatus}`);
      } else {
        alert(data.error || 'Failed to update booking');
      }
    } catch (error: any) {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  // Filter for active bookings (not completed or cancelled)
  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

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
      accessor: (item: Booking) => item.packageCity || '-'
    },
    { 
      header: 'Booking Date', 
      accessor: (item: Booking) => new Date(item.bookingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    { 
      header: 'Amount', 
      accessor: (item: Booking) => `₹${item.totalAmount?.toLocaleString() || 0}`
    },
    { 
      header: 'Contact', 
      accessor: (item: Booking) => (
        <div className="text-sm">
          <div>📧 {item.customerEmail || item.userEmail}</div>
          <div>📱 {item.customerMobile || item.userMobile}</div>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (item: Booking) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
          item.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
          item.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    },
  ];

  const actions = (item: Booking) => (
    <div className="flex gap-2">
      {item.status === 'pending' && (
        <button
          onClick={() => updateBookingStatus(item.id, 'confirmed')}
          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium"
          title="Confirm Booking"
        >
          Confirm
        </button>
      )}
      {item.status === 'confirmed' && (
        <button
          onClick={() => updateBookingStatus(item.id, 'completed')}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          title="Mark as Complete"
        >
          Complete
        </button>
      )}
      <button
        onClick={() => updateBookingStatus(item.id, 'cancelled')}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
        title="Cancel Booking"
      >
        Cancel
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Current Bookings</h1>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Current Bookings</h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {activeBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No active bookings found.</p>
        </div>
      ) : (
        <DashboardTable data={activeBookings} columns={columns} actions={actions} />
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {activeBookings.length} active booking(s) out of {bookings.length} total
      </div>
    </div>
  );
}
