"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  packageName: string;
  packageCity: string;
  packageImages: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
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
        router.push('/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't made any bookings yet.
          </p>
          <button
            onClick={() => router.push('/packages')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
          >
            Explore Packages
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {booking.packageImages.length > 0 && (
                <img
                  src={booking.packageImages[0]}
                  alt={booking.packageName}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {booking.packageName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  📍 {booking.packageCity}
                </p>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  📅 {formatDate(booking.bookingDate)}
                </p>

                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  ₹{booking.totalAmount.toLocaleString()}
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    👤 {booking.customerName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📧 {booking.customerEmail}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📱 {booking.customerMobile}
                  </p>
                </div>

                {booking.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⏳ Awaiting confirmation. Our team will contact you shortly.
                    </p>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      ✅ Your booking is confirmed! Get ready for your trip.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
