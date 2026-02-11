"use client";

import React, { useState, useEffect } from 'react';
import { getDestinations, getTripCategories, createDestination, updateDestination, deleteDestination } from '@/lib/api';
import type { Destination, TripCategory } from '@/types/admin';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Modal from '@/components/ui/Modal';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Form State
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [destRes, catRes] = await Promise.all([
        getDestinations(),
        getTripCategories()
      ]);

      if (destRes.success) {
        setDestinations(destRes.data || []);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Place Name', accessor: 'placeName' as keyof Destination },
    { header: 'City', accessor: 'city' as keyof Destination },
    { 
      header: 'Category', 
      accessor: (item: Destination) => item.tripCategoryName || 'Unknown'
    },
    {
      header: 'Image',
      accessor: (item: Destination) => (
        item.imageUrl ? (
          <img src={item.imageUrl} alt={item.placeName} className="h-10 w-16 object-cover rounded" />
        ) : 'No Image'
      )
    },
    {
      header: 'Actions',
      accessor: (item: Destination) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id, item.placeName)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingDestination) {
      alert('Please select an image');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('placeName', placeName);
    formData.append('city', city);
    formData.append('tripCategoryId', categoryId);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = editingDestination
      ? await updateDestination(editingDestination.id, formData)
      : await createDestination(formData);
    
    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } else {
      alert(result.error || `Failed to ${editingDestination ? 'update' : 'create'} destination`);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setPlaceName(destination.placeName);
    setCity(destination.city);
    setCategoryId(destination.tripCategoryId);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteDestination(id);
    if (result.success) {
      fetchData();
    } else {
      alert(result.error || 'Failed to delete destination');
    }
  };

  const resetForm = () => {
    setPlaceName('');
    setCity('');
    setCategoryId('');
    setImageFile(null);
    setEditingDestination(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Destinations</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create Destination
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      ) : (
        <DashboardTable data={destinations} columns={columns} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingDestination ? "Edit Destination" : "Create Destination"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Place Name</label>
            <input
              type="text"
              required
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="e.g. Amber Fort"
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
              placeholder="e.g. Jaipur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trip Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image {editingDestination && '(leave empty to keep current)'}
            </label>
            <input
              type="file"
              required={!editingDestination}
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            {editingDestination && editingDestination.imageUrl && (
              <div className="mt-2">
                <img src={editingDestination.imageUrl} alt="Current" className="h-20 w-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              disabled={isSubmitting}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? (editingDestination ? 'Updating...' : 'Creating...') : (editingDestination ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
