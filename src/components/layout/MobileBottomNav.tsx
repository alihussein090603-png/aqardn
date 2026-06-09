/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';

export default function MobileBottomNav(): React.ReactElement | null {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { wishlist, resetAllFilters } = useAppState();

  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Sync state cleanly when URL changes
  useEffect(() => {
    if (location.pathname === '/wishlist') {
      setLastClickedIndex(2);
    } else if (location.pathname === '/auth' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin-dashboard')) {
      setLastClickedIndex(3);
    } else if (location.pathname === '/') {
      // Default to index 0 (الرئيسية) unless index 1 (عرض الكل) was explicitly selected
      if (lastClickedIndex !== 0 && lastClickedIndex !== 1) {
        setLastClickedIndex(0);
      }
    }
  }, [location.pathname, lastClickedIndex]);

  // If inside any dashboard or admin pages, hide bottom nav to prevent layout overlay
  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin-dashboard')) {
    return null;
  }

  // Determine active index purely dynamically
  let activeIndex = 0;
  if (location.pathname === '/wishlist') {
    activeIndex = 2;
  } else if (location.pathname === '/auth' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin-dashboard')) {
    activeIndex = 3;
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
      resetAllFilters();
      navigate('/');
    } else if (index === 2) {
      navigate('/wishlist');
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-md h-16 bg-white/95 backdrop-blur-md shadow-2xl rounded-full p-1.5 grid grid-cols-4 items-center border border-slate-100/80 outline-none select-none"
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
          activeIndex === 0 ? 'text-white' : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <Home className={`w-5 h-5 transition-transform ${activeIndex === 0 ? 'active-icon' : ''}`} />
        <span className="text-[10px] font-bold mt-0.5 font-sans leading-none">الرئيسية</span>
      </button>

      {/* Button 2: عرض الكل */}
      <button
        onClick={() => handleNavClick(1)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full w-full min-w-0 py-1 ${
          activeIndex === 1 ? 'text-white' : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <Compass className={`w-5 h-5 transition-transform ${activeIndex === 1 ? 'active-icon' : ''}`} />
        <span className="text-[10px] font-bold mt-0.5 font-sans leading-none">عرض الكل</span>
      </button>

      {/* Button 3: المفضلة */}
      <button
        onClick={() => handleNavClick(2)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full relative w-full min-w-0 py-1 ${
          activeIndex === 2 ? 'text-white' : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        <Heart className={`w-5 h-5 transition-transform ${activeIndex === 2 ? 'active-icon' : ''} ${activeIndex !== 2 && wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span className="text-[10px] font-bold mt-0.5 font-sans leading-none">المفضلة</span>
        {wishlist.length > 0 && activeIndex !== 2 && (
          <span className="absolute top-2 right-1/2 translate-x-3 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        )}
      </button>

      {/* Button 4: دخول / لوحة التحكم */}
      <button
        onClick={() => handleNavClick(3)}
        className={`h-full flex flex-col items-center justify-center z-10 transition-colors duration-300 select-none cursor-pointer bg-transparent border-0 outline-none rounded-full w-full min-w-0 py-1 ${
          activeIndex === 3 ? 'text-white' : 'text-slate-500 hover:text-emerald-800'
        }`}
      >
        {currentUser ? (
          <>
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeIndex === 3 ? 'active-icon' : ''}`} />
            <span className="text-[10px] font-bold mt-0.5 font-sans leading-none">تحكم</span>
          </>
        ) : (
          <>
            <User className={`w-5 h-5 transition-transform ${activeIndex === 3 ? 'active-icon' : ''}`} />
            <span className="text-[10px] font-bold mt-0.5 font-sans leading-none">دخول</span>
          </>
        )}
      </button>

    </div>
  );
}
