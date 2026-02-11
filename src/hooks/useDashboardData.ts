import { useState, useEffect } from 'react';
import { getTripCategories, getDestinations, getTourPackages, getUsers } from '@/lib/api';
import type { TripCategory, Destination, TourPackage } from '@/types/admin';
import type { UserData } from '@/lib/api';

export interface DashboardData {
  categories: TripCategory[];
  destinations: Destination[];
  packages: TourPackage[];
  users: UserData[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    categories: [],
    destinations: [],
    packages: [],
    users: [],
    isLoading: true,
    error: null,
  });

  const fetchAllData = async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [categoriesRes, destinationsRes, packagesRes, usersRes] = await Promise.all([
        getTripCategories(),
        getDestinations(),
        getTourPackages(),
        getUsers(),
      ]);

      setData({
        categories: categoriesRes.success ? categoriesRes.data || [] : [],
        destinations: destinationsRes.success ? destinationsRes.data || [] : [],
        packages: packagesRes.success ? packagesRes.data || [] : [],
        users: usersRes.success ? usersRes.data || [] : [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshData = () => {
    fetchAllData();
  };

  return {
    ...data,
    refreshData,
  };
}
