/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Star, Info, TrendingUp, Building, ArrowUpRight, 
  ShieldCheck, ChevronLeft, Sparkles, MapPin, Edit3, Trash2, CheckCircle2, Plus 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Property } from '../../types';
import CommunityDashboard from '../../components/dashboard/CommunityDashboard';

export default function DashboardHome(): React.ReactElement {
  const { currentUser, currentUserRecord } = useAuth();
  const { properties, markAsSold, showToast } = useAppState();
  const navigate = useNavigate();

  const isOfficeUser = (currentUserRecord?.email || (currentUser as any)?.email || '').toLowerCase().startsWith('office');
  const isCommunityUser = currentUserRecord?.role === 'community' || (currentUserRecord?.email || (currentUser as any)?.email || '').toLowerCase().startsWith('comp');

  if (isCommunityUser) {
    return (
      <DashboardLayout>
        <CommunityDashboard />
      </DashboardLayout>
    );
  }

  const myProperties = properties.filter((p) => p.broker?.id === currentUser?.id);
  const totalViews = myProperties.reduce((acc, curr) => acc + curr.views, 0);
  
  // Active/Sold listings calculation
  const activeCount = myProperties.filter((p) => p.status === 'active' || !p.status).length;
  const soldCount = myProperties.filter((p) => p.status === 'sold' || p.title.startsWith('[تم البيع]')).length;

  // Render a continuous upward sparkline trend using simple Tailwind divs
  const renderTrendMockup = () => (
    <div className="flex items-end gap-1.5 h-10 px-2 mt-1" aria-hidden="true">
      <div className="w-1.5 h-3 bg-emerald-500/20 rounded-full" />
      <div className="w-1.5 h-4 bg-emerald-500/30 rounded-full" />
      <div className="w-1.5 h-6 bg-emerald-500/40 rounded-full" />
      <div className="w-1.5 h-5 bg-emerald-500/30 rounded-full" />
      <div className="w-1.5 h-7 bg-emerald-500/60 rounded-full" />
      <div className="w-1.5 h-9 bg-emerald-500 rounded-full shadow-emerald-500/30 shadow-xs animate-pulse" />
    </div>
  );

  const formatCurrency = (p: Property) => {
    if (p.priceIQD && p.priceIQD > 0) {
      if (p.priceIQD >= 1) {
        return `${p.priceIQD} مليون د.ع`;
      } else {
        return `${p.priceIQD * 1000} ألف د.ع`;
      }
    } else if (p.priceUSD && p.priceUSD > 0) {
      return `$${p.priceUSD.toLocaleString()}`;
    }
    return 'قابل للتفاوض';
  };

  // OFFICE EXCLUSIVE DASHBOARD VIEW
  if (isOfficeUser) {
    const latestProperties = [...myProperties]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return (
      <DashboardLayout>
        <div className="space-y-8 animate-in fade-in-50 duration-200 text-right font-sans" dir="rtl">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">بوابة أعمال المكتب</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-930 mt-1">لوحة التتبع الإحصائية للمكتب</h2>
              <p className="text-xs text-slate-500">مراقبة التفاعل اليومي وحالة المعروضات في محافظة المثنى فورياً</p>
            </div>
            
            <button
              onClick={() => navigate('/dashboard/add-property')}
              className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all self-start cursor-pointer active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>إدراج عقار جديد للجمهور</span>
            </button>
          </div>

          {/* 1. Smart Digital Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* KPI 1: Active properties */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-right"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-black block">عقارات المكتب النشطة</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-500/10">
                  <Building className="w-5 h-5 shrink-0" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-800 tracking-tight mt-4 font-mono">
                {activeCount}
              </p>
              <p className="text-[11px] text-slate-500 font-extrabold mt-2 leading-relaxed">
                الإعلانات المنشورة حالياً وتستقبل اتصالات ومعاينات من الزوار بالكامل.
              </p>
            </motion.div>

            {/* KPI 2: Sold properties */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-right"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-black block">العقارات المباعة / المؤجرة</span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-500/10">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-amber-600 tracking-tight mt-4 font-mono">
                {soldCount}
              </p>
              <p className="text-[11px] text-slate-500 font-extrabold mt-2 leading-relaxed">
                الصفقات المكتملة وعقود التنازل التي جرى تعبئتها بنجاح عبر بوابة شركائنا.
              </p>
            </motion.div>

            {/* KPI 3: Total Views */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-right"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs font-black block">إجمالي عدد المشاهدات لعقاراتكم</span>
                <div className="p-2.5 rounded-xl bg-white/5 text-emerald-400 border border-white/10">
                  <Eye className="w-5 h-5 shrink-0" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 mt-3">
                <p className="text-2xl md:text-3xl font-bold text-emerald-300 tracking-tight font-mono">
                  {totalViews > 0 ? totalViews.toLocaleString('en-US') : '0'}
                </p>
                {renderTrendMockup()}
              </div>
              <p className="text-[11px] text-slate-400 font-extrabold mt-2 leading-relaxed">
                مزيج رصد الزيارات العامة ومعدل فتح كروت تفاصيل معروضات مكتبكم العقاري.
              </p>
            </motion.div>

          </div>

          {/* 2. Latest 5 Properties Ingested Table Card */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">أحدث ٥ عقارات تم إضافتها للمكتب</h3>
                <p className="text-[11px] text-slate-400 font-medium">جدول تفصيلي يتتبع الحالات الحالية والتنسيقات المعمارية</p>
              </div>

              <button
                onClick={() => navigate('/dashboard/my-properties')}
                className="text-xs font-extrabold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة كافة العقارات ({myProperties.length})</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {latestProperties.length === 0 ? (
              <div className="py-16 text-center space-y-4 max-w-sm mx-auto p-4">
                <Building className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                <h4 className="text-xs font-extrabold text-slate-700">لا توجد عقارات مدرجة لحساب مكتبكم</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  اضغط على زر "إضافة عقار جديد" في الأعلى للبدء بالبث وعرض الصفقات على الجمهور.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-550 border-b border-slate-150 font-black">
                      <th className="p-4">العقار وتصنيفه</th>
                      <th className="p-4">الموقع الإداري</th>
                      <th className="p-4">طبيعة العقد والمالية</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {latestProperties.map((p) => {
                      const isSold = p.status === 'sold' || p.title.startsWith('[تم البيع]');
                      const isPending = p.status === 'pending';
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={p.images[0]} 
                                alt={p.title} 
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <span className="text-[10px] text-emerald-800 bg-emerald-55/60 px-2 py-0.5 rounded font-black max-w-max inline-block mb-1">
                                  {p.category === 'house' ? '🏡 منزل' : p.category === 'apartment' ? '🏢 شقة' : p.category === 'commercial' ? '💼 تجاري' : '🗺️ أرض'}
                                </span>
                                <p className="font-extrabold text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">{p.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="font-black text-slate-900">{p.district || 'السماوة'}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{p.neighborhood || 'الحي السكني'}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5 font-mono">
                              <p className="font-bold text-emerald-800">{formatCurrency(p)}</p>
                              <p className="text-[10px] text-slate-450 font-bold font-sans">{p.area} م² مسطح</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {isSold ? (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-md">
                                تم البيع / مكتمل
                              </span>
                            ) : isPending ? (
                              <span className="bg-amber-100 text-amber-805 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-md">
                                غير نشط (معلق)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-808 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-md">
                                نشط ومعروض ✓
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => navigate(`/dashboard/add-property?edit=${p.id}`)}
                              className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-bold cursor-pointer"
                            >
                              تعديل الإعلان
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tips Info box for Office user */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  بروتوكول حوكمة وإيداع صور المكاتب المعتمدة
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed max-w-2xl font-semibold">
                  باسم مكاتب عقارات المثنى، نلتزم بتغذية الإعلانات بمحيط جغرافي دقيق على الخرائط، وصورة بناء معمارية فوتوغرافية واحدة على الأقل. يسهم الإكمال الدقيق للبيانات برفع معدل مشاهدات وتفضيلات زوار المحافظة بنسبة تتجاوز ٧٠٪ وتيسير تصفيات عقود التميز الفورية.
                </p>
              </div>
              
              <button
                onClick={() => navigate('/dashboard/my-properties')}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs self-start md:self-center shrink-0 border-0 cursor-pointer shadow-md transition-all active:scale-95"
              >
                المطالعة وتصفية كروتي
              </button>
            </div>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // STANDARD VISUALS
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in-50 duration-200 text-right font-sans" dir="rtl">
        
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">نظرة عامة على نشاط المكتب</h2>
            <p className="text-xs text-slate-500">متابعة دقيقة لمؤشرات النفوذ والوصول عبر الخارطة</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-sans">
            <span>التحديث الأخير:</span>
            <span className="text-slate-700 font-mono">الآن</span>
          </div>
        </div>

        {/* 1. Premium Mobile-Optimized Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Active Ads */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group text-right"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-black block">إعلاناتي النشطة</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <Building className="w-4 h-4 shrink-0" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-emerald-700 tracking-tight mt-4 font-mono">
              {myProperties.length}
            </p>
            <p className="text-[11px] text-slate-500 font-extrabold mt-2 leading-relaxed">
              إعلانات مرئية بالكامل للجمهور في محافظة المثنى وبقية الأقضية العقارية.
            </p>
          </motion.div>

          {/* Card 2: Aggregate Views */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group text-right"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-black block">إجمالي عدد المشاهدات</span>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/10">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>متطور نشط</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-3">
              <p className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight font-mono">
                {totalViews > 0 ? totalViews.toLocaleString('en-US') : '0'}
              </p>
              {renderTrendMockup()}
            </div>
            
            <p className="text-[11px] text-slate-500 font-extrabold mt-2 leading-relaxed">
              مجموع زيارات وتفاعل مستخدمي المنطقة لتفاصيل عقارات مكتبكم.
            </p>
          </motion.div>

          {/* Card 3: Featured Slots */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-amber-500/5 border-2 border-amber-500/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group text-right animate-in zoom-in-95"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-amber-805 text-xs font-black block">عروض مميزة مدفوعة</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 tracking-tight mt-4 font-mono">
              {myProperties.filter((p) => p.isPremium).length}
            </p>
            <p className="text-[11px] text-amber-900/80 font-extrabold mt-2 leading-relaxed">
              تتصدر واجهة البحث الفوقية والفرص ذات الأولوية المطلقة للاستقطاب.
            </p>
          </motion.div>

        </div>

        {/* Info Helper Notice Card */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex gap-4 items-start shadow-sm text-right">
          <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-800 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-950 text-xs sm:text-sm leading-none">شريك معتمد وموثق في منظومة عقارات المثنى</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">
              نحن نلتزم بعرض إعلاناتك المصنفة فورياً وبأولوية ظهور تامة لضمان تواصل الزوار ورفع معدلات البيع والشراء في المنطقة.
            </p>
          </div>
        </div>

        {/* 2. Quick Actions & Active Properties List */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">أحدث الإعلانات العقارية المباشرة لمكتبكم</h3>
              <p className="text-[11px] text-slate-400 font-sans">تتبع حالات العروض والمشاهدات وإدارة كروت العمل الفورية</p>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard/my-properties')}
              className="text-xs font-extrabold text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>إظهار الكل ({myProperties.length})</span>
              <ChevronLeft className="w-4 h-4 shrink-0" />
            </button>
          </div>
          
          {myProperties.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-3">
              <Building className="w-10 h-10 text-slate-200 mx-auto" strokeWidth={1.5} />
              <p className="font-extrabold font-sans">لم تقم بإدراج أي عقارات تابعة لحسابكم حالياً.</p>
              <button 
                onClick={() => navigate('/dashboard/add-property')}
                className="bg-emerald-800 hover:bg-emerald-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all"
              >
                إدراج عقار جديد في السماوة
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {myProperties.slice(0, 3).map((p) => {
                const isSold = p.status === 'sold' || p.title.startsWith('[تم البيع]');
                const viewsCountStr = p.views ? p.views.toLocaleString('en-US') : '0';
                
                return (
                  <div 
                    key={p.id}
                    className="bg-slate-50/50 rounded-2xl border border-slate-150 p-4 sm:p-5 space-y-4 shadow-sm relative overflow-hidden transition-all text-right"
                  >
                    {isSold && (
                      <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-bl-xl z-10 shadow-3xs">
                        مباع ومكتمل
                      </span>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5 text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            p.transactionType === 'sale' ? 'bg-amber-150 text-amber-900' : 'bg-emerald-150 text-emerald-950'
                          }`}>
                            {p.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold font-sans">#{p.category === 'house' ? 'منزل مستقل' : p.category === 'apartment' ? 'شقة' : 'تجاري'}</span>
                        </div>

                        <h4 className={`text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1 ${isSold ? 'line-through text-slate-400' : ''}`}>
                          {p.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black justify-start leading-none font-sans">
                          <MapPin className="w-3.5 h-3.5 text-emerald-808 shrink-0" />
                          <span>{p.district || 'السماوة'} - {p.neighborhood || 'حي الحكيم'}</span>
                        </div>
                      </div>

                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-650">
                      <div className="space-x-1 space-x-reverse font-sans">
                        <span>المساحة:</span>
                        <span className="text-slate-900 font-black">{p.area} م²</span>
                      </div>

                      <div className="font-mono text-emerald-890">
                        <span>السعر الإجمالي:</span>
                        <span className="text-sm font-bold mr-1">{formatCurrency(p)}</span>
                      </div>

                      <div className="flex items-center gap-1 font-sans">
                        <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>الزيارات العامة:</span>
                        <span className="font-mono text-slate-900">{viewsCountStr}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => navigate(`/dashboard/add-property?edit=${p.id}`)}
                        className="p-3 rounded-xl bg-slate-50 active:bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-700 cursor-pointer border border-slate-100 min-h-[44px] transition-all"
                      >
                        <Edit3 className="w-4 h-4 ml-1.5 text-slate-500 shrink-0" />
                        <span>تعديل الإعلان</span>
                      </button>

                      <button
                        onClick={() => {
                          const isCurrentlySold = p.status === 'sold' || p.title.startsWith('[تم البيع]');
                          markAsSold(p.id, !isCurrentlySold);
                          showToast(isCurrentlySold ? 'تم تفعيل العرض للإدراج مجدداً.' : '🎉 مبارك تحديث الصفقة كمباعة ومكتملة.', 'system');
                        }}
                        className={`p-3 rounded-xl flex items-center justify-center text-sm font-medium cursor-pointer min-h-[44px] transition-all ${
                          isSold 
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-100' 
                            : 'bg-emerald-800 hover:bg-emerald-950 text-white shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1.5 shrink-0 text-emerald-704" />
                        <span>{isSold ? 'تم البيع ✓' : 'وسم كمباع'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
