'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  total_price: number;
  status: string;
  description: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userStr || !token) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);

        const [profileRes, spentRes, historyRes] = await Promise.all([
          api.get(`/user/${user.email}`),
          api.get('/user/total-spent', { params: { user_id: user.id } }),
          api.get('/user/history', { params: { user_id: user.id } })
        ]);

        if (profileRes.data.success) setProfile(profileRes.data.payload);
        if (spentRes.data.success) setTotalSpent(spentRes.data.payload.total_spent);
        if (historyRes.data.success) setHistory(historyRes.data.payload);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed (Token Expired');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
          {profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div><span className="font-bold">Name:</span> {profile.name}</div>
              <div><span className="font-bold">Username:</span> {profile.username}</div>
              <div><span className="font-bold">Email:</span> {profile.email}</div>
              <div><span className="font-bold">Phone Number:</span> {profile.phone || '-'}</div>
              <div><span className="font-bold">Balance:</span> Rp {Number(profile.balance || 0).toLocaleString('id-ID')}</div>
            </div>
          ) : (
            <p>Personal Information not found.</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Total Spending</h2>
          <p className="text-3xl font-bold text-black">
            Rp {Number(totalSpent || 0).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Transaction History</h2>
          {history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{tx.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.item_name || `Item ID: ${tx.item_id}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {Number(tx.total_price).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transaction history yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
