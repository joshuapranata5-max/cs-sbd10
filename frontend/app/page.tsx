import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Selamat Datang di SBD Shop
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tugas Praktikum Sistem Basis Data - Modul 6
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/items" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Lihat Daftar Items
          </Link>
          
          <div className="flex justify-between gap-4">
            <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none transition-colors">
              Login
            </Link>
            <Link href="/register" className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none transition-colors">
              Register
            </Link>
          </div>
        </div>
        
        <div className="pt-6 mt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Dibuat untuk keperluan praktikum mahasiswa. Terintegrasi dengan Express.js dan PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
}
