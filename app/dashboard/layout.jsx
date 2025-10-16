'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardLayout({ children }) {
  const { logout, currentUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0D13' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/uiuvccuplogo.png"
                alt="UIU VC Cup Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-black">
                UIU VC Cup - Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">
                Welcome, {currentUser?.email}
              </span>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#D0620D] font-medium transition-colors"
              >
                Back to Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#D0620D] px-4 py-2 rounded-lg text-white font-medium hover:bg-[#B8540B] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/dashboard/team"
              className="py-4 px-2 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-[#D0620D]"
            >
              Team Management
            </Link>
            <Link
              href="/dashboard/player"
              className="py-4 px-2 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-[#D0620D]"
            >
              Player Management
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </div>
    </div>
  );
}
