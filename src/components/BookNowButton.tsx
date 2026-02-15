"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookNowButtonProps {
  packageId: string;
  packageName: string;
  onSuccess?: () => void;
}

export default function BookNowButton({ 
  packageId, 
  packageName,
  onSuccess 
}: BookNowButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBookNow = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the auth token from localStorage or your auth context
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Redirect to login if not authenticated
        alert('Please login to book a package');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: packageId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show success message and redirect
        const bookingData = await data;
        const amount = bookingData.booking?.totalAmount || 'TBD';
        alert(`✅ Booking created successfully!\n\nPackage: ${packageName}\nAmount: ₹${amount}\n\nOur team will contact you shortly.`);
        
        // Call optional success callback
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to bookings page
        router.push('/my-bookings');
      } else {
        // Handle error response
        setError(data.error || 'Failed to create booking');
        alert(`❌ ${data.error || 'Failed to create booking'}`);
      }
    } catch (error: any) {
      console.error('Booking request failed:', error);
      setError('Failed to create booking. Please try again.');
      alert('❌ Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBookNow}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Booking...
          </span>
        ) : (
          '🎫 Book Now'
        )}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
