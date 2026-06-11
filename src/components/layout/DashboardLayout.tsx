import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building, PlusCircle, LayoutDashboard, UserCheck, LogOut, 
  ShieldCheck, MapPin, BarChart3, Home, User, Users, Menu, X, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, logout, role, currentUserRecord } = useAuth();
  const { properties } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!currentUser) return null;

  // Determine if this is an "Office User" based on email matching the "office" prefix
  const isOfficeUser = (currentUserRecord?.email || (currentUser as any)?.email || '').toLowerCase().startsWith('office');

  const isComp = currentUserRecord?.role === 'community' ||
                 (currentUserRecord?.email || '').toLowerCase().includes('comp') || 
                 currentUser?.id.toLowerCase().includes('comp') || 
                 (currentUser?.agencyName || '').includes('مجمع');

  // Compute stats
  const myProperties = properties.filter((p) => p.broker?.id === currentUser.id);

  // Normal navigation items
  const navItems = [
    {
      label: isComp ? 'إحصائيات المجمع العامة' : 'إحصائيات المكتب العامة',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: isComp ? 'التحليلات العقارية للمجمع' : 'التحليلات ومؤشرات السوق',
      path: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: isComp ? `وحدات المجمع النشطة (${myProperties.length})` : `عقاراتي النشطة (${myProperties.length})`,
      path: '/dashboard/my-properties',
      icon: Building,
    },
    {
      label: isComp ? 'إدراج وحدة سكنية جديدة' : 'إدراج عقار جديد',
      path: '/dashboard/add-property',
      icon: PlusCircle,
    },
    {
      label: 'الطلبات والمطابقة الآلية',
      path: '/dashboard/leads',
      icon: Users,
    },
    {
      label: 'بيانات حسابي الشخصي',
      path: '/dashboard/profile',
      icon: UserCheck,
    }
  ];

  if (role === 'admin') {
    navItems.push({
      label: 'لوحة التحكم الإدارية',
      path: '/dashboard/admin',
      icon: ShieldCheck,
    });
  }

  // Office User specific menu options as requested in prompt:
  // 1. القائمة المخفية العلوية (Top Drawer Menu):
  // 📊 الرئيسية (لوحة التحكم).
  // 🏢 عقاراتي (إدارة الإعلانات).
  // ➕ إضافة عقار جديد.
  // 💬 الرسائل والطلبات.
  const officeNavItems = [
    {
      label: 'الرئيسية (لوحة التحكم)',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'عقاراتي (إدارة الإعلانات)',
      path: '/dashboard/my-properties',
      icon: Building,
    },
    {
      label: 'إضافة عقار جديد',
      path: '/dashboard/add-property',
      icon: PlusCircle,
    },
    {
      label: 'الرسائل والطلبات',
      path: '/dashboard/leads',
      icon: MessageSquare,
    }
  ];

  const handleLinkClick = (path: string) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  // IF OFFICE USER: RENDER STREAMLINED CONTENT CANVAS (GLOBAL HEADER & MOBILE BOTTOM NAV HANDLE CONTROLS)
  if (isOfficeUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-right font-sans pb-28 pt-4" dir="rtl">
        {/* Dynamic Children Center Canvas Screen */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6">
          {children}
        </main>
      </div>
    );
  }

  // STANDARD LAYOUT FOR NON-OFFICE BROKERS / ADMINS
  const isTabActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right font-sans pb-24 md:pb-8" dir="rtl">
      
      {/* Intro Header Banner */}
      <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden border border-emerald-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/15 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping shrink-0" />
              <span className="text-xs text-emerald-300 font-extrabold tracking-wide">
                {isComp ? 'بوابة المجمعات السكنية المعتمدة — محافظة المثنى' : 'بوابة الشركاء المعتمدين — محافظة المثنى'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.agencyName || 'مكتب السماوي للعقارات والمقاولات'}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              أهلاً بك، <span className="text-white font-extrabold">{currentUser.name || 'مدير الحساب'}</span>. 
              {isComp ? ' يمكنك التحكم بالوحدات العقارية وعروض البيوع التابعة للمجمع السكني فورياً.' : ' يمكنك إدارة عروض البيع والإيجار فورياً لصالح مكتبكم العقاري بمرونة تامة.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 justify-end mt-2 md:mt-0">
            <span className="bg-white/10 text-emerald-300 text-xs font-black px-4 py-2 rounded-xl border border-white/5 flex items-center gap-1.5 shrink-0 shadow-lg backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <span>{isComp ? 'مجمع سكني معتمد ومحقق' : 'مكتب معتمد ومحقق'}</span>
            </span>

            <button 
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              title="تسجيل الخروج من الحساب"
              className="bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-rose-300 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Navigation Sidebar and Active Subpath View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Column (Hidden entirely on mobile screens under 768px) */}
        <div className="hidden md:block lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1.5 flex flex-col gap-1">
            <p className="text-[10px] text-slate-400 font-extrabold px-4 pb-2 border-b border-slate-100/60 select-none">منطقة لوحة القيادة</p>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-emerald-600/10 text-emerald-800 border-r-4 border-emerald-600 font-extrabold scale-[1.01]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-800'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pages Area Content Section */}
        <div className="col-span-1 lg:col-span-3">
          {children}
        </div>

      </div>

    </div>
  );
}
