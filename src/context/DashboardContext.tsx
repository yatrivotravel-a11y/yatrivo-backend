"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// --- Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  joinedDate: string;
}

export interface TripCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  categoryId: string; // Links to TripCategory
}

export interface Package {
  id: string;
  name: string;
  city: string;
  price: number;
  categoryId: string;
  placeName: string;
  images: string[];
  overview: string;
  tourHighlight: string;
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  bookingDate: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
}

interface DashboardContextType {
  users: User[];
  categories: TripCategory[];
  destinations: Destination[];
  packages: Package[];
  bookings: Booking[];
  
  // Actions
  addUser: (user: User) => void;
  addCategory: (category: TripCategory) => void;
  addDestination: (destination: Destination) => void;
  addPackage: (pkg: Package) => void;
  addBooking: (booking: Booking) => void;
  completeBooking: (bookingId: string) => void;
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const storedUsers = localStorage.getItem("dashboard_users");
      const storedCategories = localStorage.getItem("dashboard_categories");
      const storedDestinations = localStorage.getItem("dashboard_destinations");
      const storedPackages = localStorage.getItem("dashboard_packages");
      const storedBookings = localStorage.getItem("dashboard_bookings");

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      else {
        // Dummy Data for immediate feedback
        setUsers([
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', joinedDate: '2023-01-15' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', joinedDate: '2023-02-20' },
        ]);
      }

      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedDestinations) setDestinations(JSON.parse(storedDestinations));
      if (storedPackages) setPackages(JSON.parse(storedPackages));
      if (storedBookings) setBookings(JSON.parse(storedBookings));
       else {
         // Dummy Booking
         setBookings([
             { id: 'b1', userId: '1', packageId: 'p1', bookingDate: '2023-10-25', status: 'pending', totalAmount: 1200 }
         ]);
       }
    };
    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dashboard_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("dashboard_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("dashboard_destinations", JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem("dashboard_packages", JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem("dashboard_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Actions
  const addUser = (user: User) => setUsers([...users, user]);
  const addCategory = (category: TripCategory) => setCategories([...categories, category]);
  const addDestination = (destination: Destination) => setDestinations([...destinations, destination]);
  const addPackage = (pkg: Package) => setPackages([...packages, pkg]);
  const addBooking = (booking: Booking) => setBookings([...bookings, booking]);
  
  const completeBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <DashboardContext.Provider value={{
      users,
      categories,
      destinations,
      packages,
      bookings,
      addUser,
      addCategory,
      addDestination,
      addPackage,
      addBooking,
      completeBooking,
      isSidebarOpen,
      toggleSidebar
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
