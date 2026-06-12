import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building, PlusCircle, LayoutDashboard, UserCheck, LogOut, 
  ShieldCheck, MapPin, BarChart3, Home, User, Users, Menu, X, MessageSquare, Sparkles
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

  // Normal navigation items structured beautifully as requested
  const navItems = isComp ? [
    {
      label: 'إحصائيات المجمع العامة',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'التحليلات العقارية للمجمع',
      path: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: `وحدات المجمع النشطة (${myProperties.length})`,
      path: '/dashboard/my-properties',
      icon: Building,
    },
    {
      label: 'تصميم بطاقة المجمع',
      path: '/dashboard/community-card',
      icon: Sparkles,
    },
    {
      label: 'إدراج وحدة سكنية جديدة',
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
  ] : [
    {
      label: 'إحصائيات المكتب العامة',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'التحليلات ومؤشرات السوق',
      path: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: `عقاراتي النشطة (${myProperties.length})`,
      path: '/dashboard/my-properties',
      icon: Building,
    },
    {
      label: 'إدراج عقار جديد',
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

  // Define sidebar items: For community dashboard, only show "تصميم بطاقة المجمع" and "بيانات حسابي الشخصي"
  const sidebarItems = isComp ? [
    {
      label: 'تصميم بطاقة المجمع',
      path: '/dashboard/community-card',
      icon: Sparkles,
    },
    {
      label: 'بيانات حسابي الشخصي',
      path: '/dashboard/profile',
      icon: UserCheck,
    }
  ] : navItems;

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
      
      {/* Dynamic Pages Area Content Section - Rendered full-width as the sidebar and navigation rail have been deleted per your request */}
      <div className="w-full">
        {children}
      </div>

    </div>
  );
}
