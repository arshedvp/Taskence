import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';

// Helper function to get user initials for the mobile avatar
const getInitials = (name = '') => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return `${names[0][0]}`.toUpperCase();
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  
  const mobileMenuTriggerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const userName = session?.user?.name || session?.user?.username;

  // Effect to handle closing mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !mobileMenuTriggerRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="relative bg-white border-b border-gray-200 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Taskence Home">
            <Image src="/taskence-logo.svg" alt="Taskence" width={180} height={40} priority />
          </Link>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-5">
            {session ? (
              <>
                <p className="text-sm text-gray-600">
                  Hello, <span className="font-medium text-gray-900">{userName}</span>
                </p>
                <div className="h-5 w-px bg-gray-200" aria-hidden="true"></div>
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              ref={mobileMenuTriggerRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div ref={mobileMenuRef} className="md:hidden">
        <div
          className={`
            absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden
          `}
        >
          <div className="p-4 space-y-4">
            {session ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
                    {getInitials(userName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}