"use client";

import React, { useState, useEffect } from 'react';
import { getTourPackages, getTripCategories, getDestinations, createTourPackage, updateTourPackage, deleteTourPackage } from '@/lib/api';
import type { TourPackage, TripCategory, Destination } from '@/types/admin';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Modal from '@/components/ui/Modal';

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);

  // Form State
  const [placeName, setPlaceName] = useState('');
  const [city, setCity] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [overview, setOverview] = useState('');
  const [tourHighlights, setTourHighlights] = useState<string[]>(['']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [packagesRes, catRes, destRes] = await Promise.all([
        getTourPackages(),
        getTripCategories(),
        getDestinations()
      ]);

      if (packagesRes.success) {
        setPackages(packagesRes.data || []);
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (destRes.success) {
        setDestinations(destRes.data || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Package Name', accessor: 'placeName' as keyof TourPackage },
    { header: 'City', accessor: 'city' as keyof TourPackage },
    { header: 'Price Range', accessor: 'priceRange' as keyof TourPackage },
    { 
      header: 'Category', 
      accessor: (item: TourPackage) => item.tripCategoryName || 'Unknown'
    },
    { 
      header: 'Image', 
      accessor: (item: TourPackage) => (
        item.imageUrls?.[0] ? <img src={item.imageUrls[0]} alt={item.placeName} className="h-12 w-20 object-cover rounded-lg shadow-md" /> : 'No Image'
      )
    },
    {
      header: 'Actions',
      accessor: (item: TourPackage) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id, item.placeName)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage && imageFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('placeName', placeName);
    formData.append('city', city);
    formData.append('priceRange', priceRange);
    formData.append('tripCategoryId', categoryId);
    formData.append('overview', overview);
    
    // Filter out empty highlights and append as JSON
    const validHighlights = tourHighlights.filter(h => h.trim() !== '');
    formData.append('tourHighlights', JSON.stringify(validHighlights));
    
    // Append each image with indexed names
    imageFiles.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

    const result = editingPackage 
      ? await updateTourPackage(editingPackage.id, formData)
      : await createTourPackage(formData);
    
    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      fetchData(); // Refresh the list
    } else {
      alert(result.error || `Failed to ${editingPackage ? 'update' : 'create'} tour package`);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setPlaceName(pkg.placeName);
    setCity(pkg.city);
    setPriceRange(pkg.priceRange);
    setCategoryId(pkg.tripCategoryId);
    setOverview(pkg.overview || '');
    setTourHighlights(pkg.tourHighlights || ['']);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteTourPackage(id);
    if (result.success) {
      fetchData(); // Refresh the list
    } else {
      alert(result.error || 'Failed to delete tour package');
    }
  };

  const resetForm = () => {
    setPlaceName('');
    setCity('');
    setPriceRange('');
    setCategoryId('');
    setImageFiles([]);
    setOverview('');
    setTourHighlights(['']);
    setEditingPackage(null);
  };

  const addHighlightField = () => {
    setTourHighlights([...tourHighlights, '']);
  };

  const removeHighlightField = (index: number) => {
    const newHighlights = tourHighlights.filter((_, i) => i !== index);
    setTourHighlights(newHighlights.length === 0 ? [''] : newHighlights);
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...tourHighlights];
    newHighlights[index] = value;
    setTourHighlights(newHighlights);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">Tour Packages</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage travel packages</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Package
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading packages...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-800 dark:text-red-200 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-lg">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <DashboardTable data={packages} columns={columns} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingPackage ? "Edit Tour Package" : "Create Tour Package"}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Place Name</label>
            <select
              required
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
            >
              <option value="">Select Place Name</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.placeName}>
                  {dest.placeName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              >
                <option value="">Select City</option>
                {Array.from(new Set(destinations.map(d => d.city))).sort().map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</label>
              <input
                type="text"
                required
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                placeholder="e.g. $500-$1000"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Images (Multiple) {editingPackage && '(Upload new to replace existing)'}
            </label>
            {editingPackage && editingPackage.imageUrls && editingPackage.imageUrls.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 w-full">Current images:</p>
                {editingPackage.imageUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Current ${idx + 1}`} className="h-16 w-24 object-cover rounded border" />
                ))}
              </div>
            )}
            <input
              type="file"
              required={!editingPackage}
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{imageFiles.length} file(s) selected</p>
            )}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tour Highlights</label>
            {tourHighlights.map((highlight, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                  placeholder={`Highlight ${index + 1}`}
                />
                {tourHighlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHighlightField(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHighlightField}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              + Add Highlight
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              {isSubmitting ? (editingPackage ? 'Updating...' : 'Creating...') : (editingPackage ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
