"use client";

import React, { useState, useEffect } from 'react';
import { getTripCategories, createTripCategory, updateTripCategory, deleteTripCategory } from '@/lib/api';
import type { TripCategory } from '@/types/admin';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Modal from '@/components/ui/Modal';

export default function TripCategoryPage() {
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TripCategory | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTripCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof TripCategory },
    { 
      header: 'Image', 
      accessor: (item: TripCategory) => (
        item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-10 w-16 object-cover rounded" />
        ) : 'No Image'
      )
    },
    {
      header: 'Actions',
      accessor: (item: TripCategory) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id, item.name)}
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
    if (!imageFile && !editingCategory) {
      alert('Please select an image');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = editingCategory
      ? await updateTripCategory(editingCategory.id, formData)
      : await createTripCategory(formData);
    
    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } else {
      alert(result.error || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (category: TripCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteTripCategory(id);
    if (result.success) {
      fetchCategories();
    } else {
      alert(result.error || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setName('');
    setImageFile(null);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">Trip Categories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Organize destinations by travel type</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Category
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading categories...</p>
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
        <DashboardTable data={categories} columns={columns} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingCategory ? "Edit Trip Category" : "Create Trip Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
              placeholder="e.g. Adventure"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image {editingCategory && '(leave empty to keep current)'}
            </label>
            <input
              type="file"
              required={!editingCategory}
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            {editingCategory && editingCategory.imageUrl && (
              <div className="mt-2">
                <img src={editingCategory.imageUrl} alt="Current" className="h-20 w-32 object-cover rounded" />
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
              {isSubmitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
