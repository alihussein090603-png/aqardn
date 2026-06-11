/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, Heart, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';

export default function MobileBottomNav(): React.ReactElement | null {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { wishlist, resetAllFilters, isWishlistModalOpen, setIsWishlistModalOpen } = useAppState();

  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll to hide action
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Guard against negative scroll values (like bounce on iOS)
      const safeScrollY = Math.max(0, currentScrollY);
      
      if (safeScrollY > lastScrollY && safeScrollY > 60) {
        // Scrolling Down: slide out
        setNavVisible(false);
      } else {
        // Scrolling Up: slide in
        setNavVisible(true);
      }
      
      setLastScrollY(safeScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Sync state cleanly when URL changes
  useEffect(() => {
    if (location.pathname === '/wishlist') {
      setLastClickedIndex(2);
    } else if (location.pathname === '/auth' || location.pathname.startsWith('/dashboard')) {
      setLastClickedIndex(3);
    } else if (location.pathname === '/communities' || location.pathname.startsWith('/community/')) {
      setLastClickedIndex(1);
    } else if (location.pathname === '/') {
      if (lastClickedIndex !== 0 && lastClickedIndex !== 1) {
        setLastClickedIndex(0);
      }
    }
  }, [location.pathname, lastClickedIndex]);

  // Hide on admin-dashboard to avoid administration panel collision
  if (location.pathname.startsWith('/admin-dashboard') || location.pathname === '/dashboard/admin') {
    return null;
  }

  // Determine active index purely dynamically
  let activeIndex = 0;
  if (isWishlistModalOpen) {
    activeIndex = 2;
  } else if (location.pathname === '/wishlist') {
    activeIndex = 2;
  } else if (location.pathname === '/auth' || location.pathname.startsWith('/dashboard')) {
    activeIndex = 3;
  } else if (location.pathname === '/communities' || location.pathname.startsWith('/community/')) {
    activeIndex = 1;
  } else if (location.pathname === '/' || location.pathname.startsWith('/property/')) {
    if (lastClickedIndex === 1) {
      activeIndex = 1;
    } else {
      activeIndex = 0;
    }
  }

  const handleNavClick = (index: number) => {
    setLastClickedIndex(index);
    if (index === 0) {
      navigate('/');
    } else if (index === 1) {
      navigate('/communities');
    } else if (index === 2) {
      setIsWishlistModalOpen(true);
    } else if (index === 3) {
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  };

  return (
    <div 
      id="nav-bar"
      className="fixed bottom-6 left-1/2 z-[9999] w-[95%] max-w-md h-16 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] rounded-full p-1.5 grid grid-cols-4 items-center border border-slate-100/85 outline-none select-none transition-transform duration-300 ease-in-out"
      style={{
        transform: navVisible ? 'translate(-50%, 0)' : 'translate(-50%, calc(100% + 40px))'
      }}
      dir="rtl"
    >
      {/* Dynamic Animated Sliding Background Indicator */}
      <div 
        id="nav-indicator" 
        className="absolute top-1.5 bottom-1.5 bg-emerald-800 rounded-full transition-all duration-300 ease-out z-0"
        style={{
          right: `calc(${activeIndex * 25}% + 6px)`,
          width: 'calc(25% - 12px)'
        }}
      />

      {/* Button 1: الرئيسية */}
      <button
        onClick={() => handleNavClick(0)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full w-full min-w-0 py-1 ${
          activeIndex === 0 ? 'text-white font-black' : 'text-slate-500 hover:text-emerald-800 font-bold'
        }`}
      >
        <Home className={`w-5 h-5 transition-transform ${activeIndex === 0 ? 'scale-110' : ''}`} />
        <span className="text-[10px] mt-0.5 font-sans leading-none">الرئيسية</span>
      </button>

      {/* Button 2: المجمعات السكنية */}
      <button
        onClick={() => handleNavClick(1)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full w-full min-w-0 py-1 ${
          activeIndex === 1 ? 'text-white font-black' : 'text-slate-500 hover:text-emerald-800 font-bold'
        }`}
      >
        <Building2 className={`w-5 h-5 transition-transform ${activeIndex === 1 ? 'scale-110' : ''}`} />
        <span className="text-[10px] mt-0.5 font-sans leading-none">المجمعات السكنية</span>
      </button>

      {/* Button 3: المفضلة */}
      <button
        onClick={() => handleNavClick(2)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full relative w-full min-w-0 py-1 ${
          activeIndex === 2 ? 'text-white font-black' : 'text-slate-500 hover:text-emerald-800 font-bold'
        }`}
      >
        <Heart className={`w-5 h-5 transition-transform ${activeIndex === 2 ? 'scale-110' : ''} ${activeIndex !== 2 && wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span className="text-[10px] mt-0.5 font-sans leading-none">المفضلة</span>
        {wishlist.length > 0 && activeIndex !== 2 && (
          <span className="absolute top-2 right-1/2 translate-x-3 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Button 4: دخول / حسابي */}
      <button
        onClick={() => handleNavClick(3)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full w-full min-w-0 py-1 ${
          activeIndex === 3 ? 'text-white font-black' : 'text-slate-500 hover:text-emerald-800 font-bold'
        }`}
      >
        {currentUser ? (
          <>
            <User className={`w-5 h-5 transition-transform ${activeIndex === 3 ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5 font-sans leading-none">حسابي</span>
          </>
        ) : (
          <>
            <LogIn className={`w-5 h-5 transition-transform ${activeIndex === 3 ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5 font-sans leading-none">دخول</span>
          </>
        )}
      </button>

    </div>
  );
}

