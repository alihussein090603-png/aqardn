/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import logoUrl from '../muthanna_brand.jpeg';
import { 
  Home, User, LogOut, LayoutDashboard, ShieldCheck, 
  ChevronDown, Menu, X, Heart, Building, PlusCircle, MessageSquare,
  Bell, Trash2, ExternalLink, Sparkles
} from 'lucide-react';
import { Broker } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../context/AppStateContext';
import PropertyAlertModal from './property/PropertyAlertModal';
import PropertyWishlistModal from './property/PropertyWishlistModal';

interface HeaderProps {
  currentUser: Broker | null;
  onSetUser: (user: Broker | null) => void;
  activePage: string;
  onNavigate: (page: string) => void;
  mockBrokers: Broker[];
}

export default function Header({
  currentUser,
  onSetUser,
  activePage,
  onNavigate,
  mockBrokers
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topDrawerOpen, setTopDrawerOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    wishlist, 
    properties, 
    toggleWishlist, 
    showToast,
    isWishlistModalOpen,
    setIsWishlistModalOpen
  } = useAppState();
  const wishlistProperties = properties.filter((p) => wishlist.includes(p.id));

  const handleMobileNav = (page: string) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const handeAdminNav = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/admin-dashboard');
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-emerald-950/10 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Right Side (First in RTL): Hamburger Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            
            {/* 1. Hamburger button on mobile/desktop screen formats, visible for logged in offices only */}
            {currentUser && (
              <button
                onClick={() => setTopDrawerOpen(!topDrawerOpen)}
                className="p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none flex items-center justify-center border border-slate-100"
                title="قائمة إدارة المكتب السريعة"
              >
                {topDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* 2. Brand logo descriptor */}
            <div 
              id="logo-container" 
              className="flex items-center gap-2.5 cursor-pointer select-none text-right"
              onClick={() => onNavigate('home')}
            >
              <img 
                src={logoUrl} 
                alt="عقارات المثنى" 
                className="w-10 h-10 rounded-xl object-cover shadow-emerald-900/15 shadow-md border border-emerald-500/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-right">
                <span id="logo-text" className="text-sm font-black text-slate-900 tracking-tight leading-tight">عقارات المثنى</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Visible on desktop screen formats) */}
          <nav className="hidden md:flex items-center gap-3">
            
            {/* Safe, Clean Nav Connections (Proposal 2) */}
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activePage === 'home'
                  ? 'text-emerald-800 bg-emerald-500/10 font-black'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-800" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => navigate('/communities')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                location.pathname === '/communities' || location.pathname.startsWith('/community/')
                  ? 'text-emerald-800 bg-emerald-500/10 font-black'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-800" />
              <span>المجمعات السكنية</span>
            </button>

            <button
              onClick={() => setIsWishlistModalOpen(true)}
              className="px-4 py-2 text-xs font-extrabold rounded-xl text-slate-600 hover:text-emerald-850 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5 relative border border-transparent"
            >
              <Heart className={`w-3.5 h-3.5 text-rose-500 ${wishlist.length > 0 ? 'fill-rose-500 animate-pulse' : ''}`} />
              <span>المفضلة</span>
              {wishlist.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white font-sans">
                  {wishlist.length}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'dashboard'
                      ? 'text-emerald-800 bg-emerald-500/10 font-black'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-800" />
                  <span>لوحة المكتب</span>
                </button>

                {role === 'admin' && (
                  <button
                    onClick={handeAdminNav}
                    className="px-4 py-2 text-xs font-black text-amber-600 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-amber-500/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>الإدارة العليا</span>
                  </button>
                )}

                {/* Dropdown Profile Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 transition-all cursor-pointer"
                  >
                    <img 
                      src={currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=system'} 
                      alt={currentUser.name} 
                      className="w-6 h-6 rounded-full object-cover border border-emerald-600 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px] font-extrabold text-slate-800">{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-lg overflow-hidden py-1 z-50 text-right">
                      <div className="px-3.5 py-2 bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500">
                        <p className="font-extrabold text-slate-800">{currentUser.agencyName || 'مكتب عقاري معتمد'}</p>
                        <p className="text-[9px] mt-0.5">الهاتف: {currentUser.phone || 'غير مسجل'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-3.5 py-2 text-right text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-800 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                        لوحة التحكم العقارية
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onSetUser(null);
                          onNavigate('home');
                        }}
                        className="w-full px-3.5 py-2 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-slate-100 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </nav>



        </div>
      </div>

      {/* 3. New High-Fidelity Responsive Top Drawer Menu for Offices */}
      <AnimatePresence>
        {topDrawerOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-emerald-900/15 shadow-xl z-50 overflow-hidden text-right"
            dir="rtl"
          >
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. الرئيسية (لوحة التحكم) */}
                <button
                  onClick={() => {
                    setTopDrawerOpen(false);
                    navigate('/dashboard');
                  }}
                  className="p-5 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/60 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="p-3 bg-white rounded-full text-emerald-800 shadow-sm border border-emerald-50/50 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 font-sans">📊 الرئيسية (لوحة التحكم)</span>
                </button>

                {/* 2. عقاراتي */}
                <button
                  onClick={() => {
                    setTopDrawerOpen(false);
                    navigate('/dashboard/my-properties');
                  }}
                  className="p-5 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/60 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="p-3 bg-white rounded-full text-emerald-800 shadow-sm border border-emerald-50/50 group-hover:scale-110 transition-transform">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 font-sans">🏢 عقاراتي</span>
                </button>

                {/* 3. إضافة عقار جديد */}
                <button
                  onClick={() => {
                    setTopDrawerOpen(false);
                    navigate('/dashboard/add-property');
                  }}
                  className="p-5 rounded-2xl bg-amber-50/20 hover:bg-amber-50/40 border border-amber-100/60 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group hover:border-amber-300 hover:shadow-md"
                >
                  <div className="p-3 bg-white rounded-full text-amber-600 shadow-sm border-amber-50/50 group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 font-sans">➕ إضافة عقار جديد</span>
                </button>

                {/* 4. الرسائل والطلبات */}
                <button
                  onClick={() => {
                    setTopDrawerOpen(false);
                    navigate('/dashboard/leads');
                  }}
                  className="p-5 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/60 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="p-3 bg-white rounded-full text-emerald-800 shadow-sm border border-emerald-50/50 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 font-sans">💬 الرسائل والطلبات</span>
                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL INSTANTIATION OF SMART PROPERTY ALERTS MODAL */}
      <PropertyAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        propertiesList={properties}
        onShowToast={showToast}
      />

      {/* GLOBAL INSTANTIATION OF SAVED FAVORITES (WISHLIST) MODAL */}
      <PropertyWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        wishlistProperties={wishlistProperties}
        onToggleWishlist={toggleWishlist}
        onNavigateDetail={(id) => {
          if (id === 'wishlist_page') {
            onNavigate('wishlist');
          } else {
            navigate(`/property/${id}`);
          }
        }}
        onShowToast={showToast}
      />

    </header>
  );
}
