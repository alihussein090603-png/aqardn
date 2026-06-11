/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, FileText, Users, Landmark, Building, 
  Menu, X, ShieldCheck, LogOut, Home, Compass,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from '../../muthanna_brand.jpeg';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'overview' | 'listings' | 'brokers' | 'communities' | 'catalog';
  setActiveTab: (tab: 'overview' | 'listings' | 'brokers' | 'communities' | 'catalog') => void;
  pendingListingsCount: number;
  brokersCount: number;
  communitiesCount: number;
  propertiesCount: number;
}

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
  pendingListingsCount,
  brokersCount,
  communitiesCount,
  propertiesCount
}: AdminLayoutProps): React.ReactElement {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define sidebar navigation items with their respective icons & count indicators
  const sidebarItems = [
    { id: 'overview', label: 'لوحة التحكم والملخص العام', icon: LayoutGrid, count: null },
    { id: 'listings', label: 'طلبات الإدراج المعلقة', icon: FileText, count: pendingListingsCount },
    { id: 'brokers', label: 'إحصائيات المكاتب العقارية', icon: Users, count: brokersCount },
    { id: 'communities', label: 'إحصائيات المجمعات السكنية', icon: Landmark, count: communitiesCount },
    { id: 'catalog', label: 'كتالوج العقارات العام', icon: Building, count: propertiesCount },
  ] as const;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-right font-sans" dir="rtl">
      
      {/* 1. Mobile Hamburger Top Header (Visible ONLY on viewport <= 767px) */}
      <div className="bg-gradient-to-l from-emerald-950 to-slate-900 border-b border-white/5 py-3 px-5 flex items-center justify-between shadow-md md:hidden relative z-45">
        
        {/* Right Side (First in RTL): Interactive Hamburger Button to trigger side menu */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-emerald-300 hover:text-white transition-all focus:outline-none cursor-pointer flex items-center gap-2.5 bg-white/5 hover:bg-white/10 rounded-xl"
          title="افتح قائمة التحكم الإدارية"
        >
          <Menu className="w-5.5 h-5.5" />
          <span className="text-xs font-black text-emerald-300">لوحة التحكم</span>
        </button>

        {/* Left Side (Second in RTL): Elegant Platform Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-left">
            <span className="text-white font-black text-xs leading-tight">عقارات المثنى</span>
            <span className="text-[9px] text-emerald-400 font-bold">الإدارة العليا</span>
          </div>
          <img 
            src={logoUrl} 
            alt="شعار عقارات المثنى" 
            className="w-8 h-8 rounded-lg object-cover shadow-md border border-emerald-500/10 shrink-0"
            referrerPolicy="no-referrer"
          />
        </div>

      </div>

      {/* 2. Drawer Navigation Panel Sidebar for Mobile Screen Formats */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
          >
            <motion.div 
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 to-emerald-950 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto text-white border-l border-white/5"
            >
              <div className="space-y-6">
                {/* Drawer Header Brand */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={logoUrl} 
                      alt="شعار" 
                      className="w-8 h-8 rounded-lg object-cover border border-emerald-500/15"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-black tracking-tight text-white leading-none">إدارة المنصة</span>
                      <span className="text-[9px] text-emerald-400 font-bold mt-1">التحكم الفني المشترك</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Menu Navigation Options */}
                <div className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { 
                          setActiveTab(item.id); 
                          setSidebarOpen(false); 
                        }}
                        className={`w-full text-right px-4.5 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-between transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-md font-extrabold border-r-3 border-amber-400' 
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0 font-bold" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== null && item.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            isActive ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer controls */}
              <div className="border-t border-white/5 pt-4 space-y-3.5">
                {/* Back to Home Public page context shortcut link */}
                <button
                  onClick={() => { navigate('/'); setSidebarOpen(false); }}
                  className="w-full h-11 bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>العودة إلى الموقع الرئيسي</span>
                </button>

                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md font-black">
                    {currentUser?.name?.charAt(0) || 'م'}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-black text-white block truncate">{currentUser?.name || 'مدير الحساب العام'}</span>
                    <span className="text-[10px] text-emerald-300 block">إداري مفوض</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full h-11 bg-red-650 hover:bg-red-700 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل خروج آمن</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Static High-Contrast Sidebar for Desktop Resolutions (Visible ONLY on md: viewports) */}
      <div className={`hidden md:flex bg-slate-950 text-white flex-col justify-between shrink-0 p-5 border-l border-white/5 select-none relative z-10 bg-gradient-to-b from-slate-950 to-emerald-950 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-66'}`}>
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Logo Brand Segment */}
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <img 
                    src={logoUrl} 
                    alt="لوجو" 
                    className="w-10 h-10 rounded-xl object-cover shadow-emerald-500/10 shadow-lg border border-emerald-500/15 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-black tracking-tight text-white block leading-tight">عقارات المثنى</span>
                    <span className="text-[9px] text-emerald-400 block font-bold mt-0.5">لوحة التحكم والمراقبة العليا</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 transition-all cursor-pointer"
                  title="تصغير القائمة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                <img 
                  src={logoUrl} 
                  alt="لوجو" 
                  className="w-8 h-8 rounded-lg object-cover border border-emerald-500/15 cursor-pointer"
                  onClick={() => setIsCollapsed(false)}
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 transition-all cursor-pointer"
                  title="توسيع القائمة"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-right py-3.5 rounded-xl text-xs sm:text-sm font-black flex items-center transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-1' : 'justify-between px-4.5'
                  } ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md font-extrabold border-r-3 border-amber-400 scale-[1.02]' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.count !== null && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Desk controls and Profile Badge */}
        <div className="border-t border-white/5 pt-5 space-y-4">
          {/* Main system entry page return shortcut link */}
          <button
            onClick={() => navigate('/')}
            className={`w-full h-11 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="عرض واجهة الموقع العام"
          >
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>عرض الموقع العام</span>}
          </button>

          <div className={`flex items-center bg-white/5 rounded-xl border border-white/5 ${
            isCollapsed ? 'p-1.5 justify-center' : 'p-3 gap-3'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm shadow-md">
              {currentUser?.name?.charAt(0) || 'ع'}
            </div>
            {!isCollapsed && (
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-black text-white block truncate">{currentUser?.name || 'المدير العام والمسؤول الفني'}</span>
                <span className="text-[10px] text-emerald-300 block font-bold">بوابة الإدارة الشاملة</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full h-11 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-rose-300 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="إنهاء الجلسة المشتركة وتأمين الخروج"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>تسجيل خروج إداري</span>}
          </button>
        </div>
      </div>

      {/* 4. Scrollable Workspace viewport component context */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full md:py-8 space-y-6">
        {children}
      </div>

    </div>
  );
}
