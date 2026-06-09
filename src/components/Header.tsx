/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import logoUrl from '../muthanna_brand.jpeg';
import { Home, User, LogOut, LayoutDashboard, Key, ShieldCheck, ChevronDown, Building2 } from 'lucide-react';
import { Broker } from '../types';

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

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-emerald-950/10 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Right Side: Modern Architectural Icon with text */}
          <div 
            id="logo-container" 
            className="flex items-center gap-2.5 cursor-pointer select-none text-right"
            onClick={() => onNavigate('home')}
          >
            <img 
              src={logoUrl} 
              alt="عقارات المثنى" 
              className="w-10 h-10 rounded-xl object-cover shadow-emerald-900/15 shadow-lg border border-emerald-500/10 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-right">
              <span id="logo-text" className="text-base font-black text-slate-900 tracking-tight leading-tight">عقارات المثنى</span>
              <span className="text-[10px] text-emerald-800 font-extrabold font-sans">سوق العقارات السحابي الموثق</span>
            </div>
          </div>

          {/* Center Navigation Links (Hidden on small mobile, elegant spacing) */}
          <nav className="hidden md:flex items-center gap-1">
            {currentUser && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePage === 'dashboard'
                    ? 'text-emerald-800 bg-emerald-500/10'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-800" />
                لوحة التحكم للمكاتب
              </button>
            )}
          </nav>

          {/* Left Side: Auth & User Dropdown */}
          <div className="flex items-center gap-3">
            
            {currentUser ? (
              <div className="relative flex items-center gap-3">
                {/* Glassmorphic Verification Pill Component */}
                <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/10 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>مكتب معتمد ومحقق</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-gradient-to-l from-emerald-950/5 to-transparent px-3 py-1.5 rounded-xl border border-slate-200/60 hover:bg-slate-50/80 transition-all text-right cursor-pointer"
                  >
                    <img 
                      src={currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=system'} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        {currentUser.name}
                        {currentUser.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 sm:hidden" />}
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold max-w-[120px] truncate">{currentUser.agencyName || 'مكتب السماوي للعقارات'}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden py-2 animate-in fade-in-50 slide-in-from-top-2 duration-200 z-50 text-right">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 font-bold">حساب المكتب العقاري</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{currentUser.agencyName || 'مكتب السماوي للعقارات والمقاولات'}</p>
                        <div className="mt-2 text-[10px] bg-emerald-100/60 text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg inline-block">
                          رقم الهاتف: {currentUser.phone || 'غير مسجل'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-emerald-500/5 hover:text-emerald-800 transition-colors cursor-pointer text-right"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          لوحة إدارة العقارات
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onSetUser(null);
                          onNavigate('home');
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 cursor-pointer text-right"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex text-right flex-col mr-1">
                  <span className="text-[10px] text-slate-500 font-medium">تصفح كـ مكتب عقاري؟</span>
                  <button
                    onClick={() => {
                      onSetUser(mockBrokers[0]);
                      onNavigate('dashboard');
                    }}
                    className="text-xs font-extrabold text-emerald-800 hover:underline cursor-pointer"
                  >
                    دخول سريع (أبو علي)
                  </button>
                </div>

                <button
                  onClick={() => onNavigate('auth')}
                  className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-950/10 transition-all duration-200 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>دخول المكاتب</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
