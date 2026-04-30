'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/items');
        if (response.data.success) {
          setItems(response.data.payload);
        }
      } catch (err: any) {
        setError('Failed to retrieve items.');
        if (err.response?.status === 401 || err.response?.status === 403) {
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Item List</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 truncate">{item.name}</h2>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-2">Price: <span className="font-bold text-blue-600">Rp {item.price.toLocaleString('id-ID')}</span></p>
                <p className="text-gray-600">Stock: <span className="font-semibold">{item.stock}</span></p>
              </div>
            </div>
          ))}
          {items.length === 0 && !error && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No items available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
