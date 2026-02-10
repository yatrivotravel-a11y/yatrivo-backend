"use client";

import React, { useState } from 'react';
import { useDashboard, Package } from '@/context/DashboardContext';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Modal from '@/components/ui/Modal';

export default function PackagesPage() {
  const { packages, categories, addPackage } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Simple single image for now
  const [overview, setOverview] = useState('');
  const [tourHighlight, setTourHighlight] = useState('');

  const columns = [
    { header: 'Package Name', accessor: 'name' as keyof Package },
    { header: 'City', accessor: 'city' as keyof Package },
    { header: 'Price', accessor: (item: Package) => `$${item.price}` },
    { 
      header: 'Category', 
      accessor: (item: Package) => {
        const cat = categories.find(c => c.id === item.categoryId);
        return cat ? cat.name : 'Unknown';
      }
    },
     { 
      header: 'Image', 
      accessor: (item: Package) => (
        item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="h-10 w-16 object-cover rounded" /> : 'No Image'
      )
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPackage: Package = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      placeName,
      city,
      price: Number(price),
      categoryId,
      images: [imageUrl], // Storing as array
      overview,
      tourHighlight,
    };
    addPackage(newPackage);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPlaceName('');
    setCity('');
    setPrice('');
    setCategoryId('');
    setImageUrl('');
    setOverview('');
    setTourHighlight('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Packages</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create Package
        </button>
      </div>

      <DashboardTable data={packages} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Tour Package">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Package Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="e.g. Golden Triangle Tour"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Place Name</label>
                <input
                type="text"
                required
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                placeholder="e.g. Various"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                placeholder="e.g. Delhi"
                />
            </div>
          </div>
          
           <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                placeholder="e.g. 500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {cat.name}
                    </option>
                ))}
                </select>
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overview</label>
            <textarea
              required
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="Trip overview..."
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tour Highlights</label>
            <textarea
              required
              rows={3}
              value={tourHighlight}
              onChange={(e) => setTourHighlight(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="Key highlights..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
