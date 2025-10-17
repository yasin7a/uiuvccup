'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, isAdmin, isTeamOwner, logout, loading } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Debug logging
  console.log('🧭 Navbar: Render state', {
    loading,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    isAdmin,
    isTeamOwner,
    timestamp: new Date().toISOString()
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg mx-4 lg:mx-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/assets/uiuvccuplogo.png"
                alt="UIU VC Cup Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-black">
                UIU VC Cup
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                HOME
              </Link>
              <Link href="/teams" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                TEAMS
              </Link>
              
              {/* Admin-only links */}
              {isAdmin && (
                <>
                  <Link href="/auction" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                    AUCTION
                  </Link>
                  <Link href="/dashboard/team" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                    MANAGE TEAMS
                  </Link>
                </>
              )}

              {/* Team Owner Dashboard */}
              {isTeamOwner && (
                <Link href="/team-dashboard" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                  MY TEAM
                </Link>
              )}

              <Link href="/about" className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium">
                ABOUT
              </Link>

              {/* Authentication */}
              {loading ? (
                <div className="bg-gray-100 px-6 py-2 rounded-full">
                  <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                </div>
              ) : !currentUser ? (
                <Link 
                  href="/login" 
                  className="bg-[#D0620D] px-6 py-2 rounded-full text-white font-medium hover:bg-[#B8540B] transition-all duration-300"
                >
                  LOGIN
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">
                      {isAdmin ? 'Admin' : isTeamOwner ? 'Team Owner' : 'User'}
                    </div>
                    <div className="text-xs">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-all duration-300"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-700 hover:text-[#D0620D] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  HOME
                </Link>
                <Link 
                  href="/teams" 
                  className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  TEAMS
                </Link>
                
                {/* Admin-only links */}
                {isAdmin && (
                  <>
                    <Link 
                      href="/auction" 
                      className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      AUCTION
                    </Link>
                    <Link 
                      href="/dashboard/team" 
                      className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      MANAGE TEAMS
                    </Link>
                  </>
                )}

                {/* Team Owner Dashboard */}
                {isTeamOwner && (
                  <Link 
                    href="/team-dashboard" 
                    className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    MY TEAM
                  </Link>
                )}

                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-[#D0620D] transition-colors font-medium px-3 py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ABOUT
                </Link>

                {/* Mobile Authentication */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  {loading ? (
                    <div className="px-3">
                      <div className="animate-pulse bg-gray-200 h-12 rounded-full"></div>
                    </div>
                  ) : !currentUser ? (
                    <Link 
                      href="/login" 
                      className="block bg-[#D0620D] text-white text-center px-6 py-3 rounded-full font-medium hover:bg-[#B8540B] transition-all duration-300 mx-3"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      LOGIN
                    </Link>
                  ) : (
                    <div className="px-3">
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="font-medium">
                          {isAdmin ? 'Admin' : isTeamOwner ? 'Team Owner' : 'User'}
                        </div>
                        <div className="text-xs">{currentUser.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowMobileMenu(false);
                        }}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-full font-medium hover:bg-gray-200 transition-all duration-300"
                      >
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}