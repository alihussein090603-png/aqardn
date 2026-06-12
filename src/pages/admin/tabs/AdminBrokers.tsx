import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Building, Users, Award, Plus, ChevronLeft, Check, X, 
  CheckCircle2, Search, MapPin, Eye, Trash2, UserCheck, Landmark, 
  Copy, MessageSquare, Key, Calendar, Mail, Phone, ExternalLink, RefreshCw 
} from 'lucide-react';
import { Property } from '../../../types';

export default function AdminBrokers(context: any) {
  const { 
    totalPropertiesInApp, totalOfficesCount, totalCommunitiesCount, setShowOfficeModal, 
    setGeneratedCreds, setShowCommunityModal, pendingListings, handleApproveProperty, 
    handleRejectProperty, brokersPool, searchTerm, setSearchTerm, handleToggleBrokerVerification,
    properties, handleDeleteBroker, actionInProgress, showToast
  } = context;

  // Selected broker for full information dialog popup
  const [selectedBroker, setSelectedBroker] = useState<any>(null);

  // Filter logic
  const filteredOffices = brokersPool.filter((b: any) => {
    const term = searchTerm.toLowerCase();
    return (b.name || '').toLowerCase().includes(term) || 
           (b.phone || '').includes(term) || 
           (b.location || '').toLowerCase().includes(term) ||
           (b.agencyName || '').toLowerCase().includes(term);
  });

  // Count active vs pending
  const verifiedCount = brokersPool.filter((b: any) => b.isVerified).length;
  const pendingCount = brokersPool.length - verifiedCount;

  // Decrypt utility for security parameters (aqardn_secure_2026_)
  const decryptPassword = (hash: string) => {
    if (!hash) return 'غير متوفر';
    try {
      const decoded = atob(hash);
      const salt = "aqardn_secure_2026_";
      if (decoded.startsWith(salt)) {
        return decoded.replace(salt, '');
      }
      return decoded;
    } catch (e) {
      // Return plain text if not Base64 encoded or doesn't have salt
      return hash;
    }
  };

  // Helper to distinguish newly created/linked offices in the UI (added in last 30 minutes)
  const isNew = (broker: any) => {
    if (!broker.createdAt) return false;
    const diff = Date.now() - new Date(broker.createdAt).getTime();
    return diff > 0 && diff < 30 * 60 * 1000; // 30 mins
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (showToast) {
      showToast(`📋 تم نسخ ${label} إلى الحافظة بنجاح.`, 'system');
    } else {
      alert(`تم نسخ ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Management Stats (Refined for Mobile) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 justify-start md:justify-start">
            <Building className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>تراخيص واعتماد المكاتب العقارية</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            التحكم المطلق في صلاحيات الدلالين، معاينة كلمات المرور المولد، وإقرار الموثوقية التامة.
          </p>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث بالاسم، الموقع أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-slate-700 shadow-sm"
              id="broker-search-input"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button 
            onClick={() => { setShowOfficeModal(true); if (setGeneratedCreds) setGeneratedCreds(null); }}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black px-4 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            id="register-office-btn"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>إضافة مكتب جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Micro Stats Badges */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
          <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">إجمالي المقيدين</span>
          <span className="text-base sm:text-xl font-black text-slate-900 font-sans">{brokersPool.length}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-right">
          <span className="text-[10px] sm:text-xs text-emerald-800 block font-medium">تراخيص نشطة</span>
          <span className="text-base sm:text-xl font-black text-emerald-900 font-sans">{verifiedCount}</span>
        </div>
        <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 text-right">
          <span className="text-[10px] sm:text-xs text-amber-800 block font-medium">قيد الانتظار</span>
          <span className="text-base sm:text-xl font-black text-slate-900 font-sans">{pendingCount}</span>
        </div>
      </div>

      {/* 3. Modern Responsive Desktop & Mobile Cards Grid (Zero Table Bloat) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOffices.map((broker: any) => {
            // Aggregate metrics:
            const brokerListings = properties.filter((p: any) => p.broker?.id === broker.uid);
            const totalUploaded = brokerListings.length;
            const totalViews = brokerListings.reduce((sum: number, p: any) => sum + (p.views || 0), 0);

            const isVerified = broker.isVerified;
            const newlyLinked = isNew(broker);

            return (
              <motion.div
                key={broker.uid}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedBroker(broker)}
                className={`bg-white rounded-2xl border transition-all text-right overflow-hidden relative cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                  newlyLinked 
                    ? 'ring-2 ring-emerald-500 border-emerald-500 ring-offset-2' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                id={`broker-card-${broker.uid}`}
              >
                {/* Visual Highlights */}
                {newlyLinked && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse z-10">
                    مضاف حديثاً 🆕
                  </span>
                )}

                {/* Card Top Banner / Avatar Header */}
                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    {/* Visual Mark */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-400 flex items-center justify-center font-black select-none text-sm shrink-0 shadow-xs border border-emerald-800">
                      🏢
                    </div>

                    {/* Verification Toggle Direct Badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid opening dialog
                        handleToggleBrokerVerification(broker.uid, isVerified);
                      }}
                      disabled={actionInProgress !== null}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black transition-all flex items-center gap-1 shrink-0 ${
                        isVerified 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{isVerified ? 'ترخيص مفعل' : 'الترخيص معطل'}</span>
                    </button>
                  </div>

                  {/* Agency Details */}
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug truncate">
                      {broker.agencyName || 'مكتب عقاري معتمد'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-sans block truncate">
                      المالك: {broker.name} ({broker.email || 'بلا بريد مؤكد'})
                    </span>
                  </div>

                  {/* Location & Telephone Info block */}
                  <div className="space-y-2 pt-2 border-t border-slate-50 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 justify-start">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{broker.location || 'السماوة - غير محدد'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-start font-mono text-[10px] text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{broker.phone || '078xxxxxxxx'}</span>
                    </div>
                  </div>

                  {/* Interactive Stats Counters nested inside the card */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-50 text-center font-sans">
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[9px] text-slate-400 block font-medium">عدد الإعلانات</span>
                      <span className="text-xs font-black text-slate-800 block">{totalUploaded} إعلان</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[9px] text-slate-400 block font-medium">المشاهدات</span>
                      <span className="text-xs font-black text-emerald-800 block">{totalViews} مشاهدة</span>
                    </div>
                  </div>
                </div>

                {/* Actions Integrated Footer */}
                <div className="bg-slate-50/80 border-t border-slate-100 p-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {broker.createdAt ? new Date(broker.createdAt).toLocaleDateString('ar-IQ') : '--'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Delete action button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleDeleteBroker) handleDeleteBroker(broker.uid);
                      }}
                      disabled={actionInProgress !== null}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-150 hover:border-rose-100 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-30"
                      title="سحب التراخيص وحذف السجل نهائياً"
                      id={`delete-broker-btn-${broker.uid}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* View Details action button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBroker(broker);
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      id={`details-broker-btn-${broker.uid}`}
                    >
                      <span>عرض التفاصيل التفصيلية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredOffices.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-450 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <Building className="w-10 h-10 text-slate-300" />
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-700">لا توجد مكاتب دلالين مطابقة</p>
              <p className="text-[10px] text-slate-400 font-sans">تأكد من كتابة الاسم المناسب أو أضف مكتباً جديداً بالنقر أعلاه.</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. FULL SENSITIVE DETAILS POPUP DIALOG (MOBILE RESPONSIVE & PREMIUM) */}
      <AnimatePresence>
        {selectedBroker && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl p-6 text-right space-y-6 relative max-h-[90vh] overflow-y-auto"
              id="broker-details-modal"
            >
              {/* Modal Head */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-105">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-400 flex items-center justify-center text-xs font-black shadow-3xs">
                    🔒
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950">تفاصيل الكريدنشل المعتمد للمكتب</h3>
                </div>
                <button 
                  onClick={() => setSelectedBroker(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors pointer-events-auto cursor-pointer"
                  id="close-details-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                {/* Logo & Headline */}
                <div className="bg-slate-50/70 rounded-2xl p-4 text-center border space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-lg font-black mx-auto">
                    {(selectedBroker.agencyName || 'م').charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{selectedBroker.agencyName || 'مكتب عقاري'}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-sans">المالك: {selectedBroker.name}</p>
                  </div>
                </div>

                {/* SENSITIVE ACCREDITATION FIELDS */}
                <div className="space-y-3 text-xs">
                  {/* Password Field - Full display requested */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">كلمة مرور الإدارة للربط والمشاركة:</span>
                    <div className="flex items-center bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-mono text-emerald-950 font-black tracking-wider select-all">
                          {decryptPassword(selectedBroker.password || selectedBroker.passwordHash)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(decryptPassword(selectedBroker.password || selectedBroker.passwordHash), 'كلمة المرور')}
                        className="p-1 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        title="نسخ الرقم السري"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registered Email */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">البريد الإلكتروني المولد:</span>
                    <div className="flex items-center bg-slate-50 border rounded-xl p-3 justify-between gap-3 font-sans">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700 select-all truncate block">
                          {selectedBroker.email || 'غير مخصص بعد'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedBroker.email || '', 'البريد الإلكتروني')}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registered Location */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">المقر الجيد والمقاطعة الجغرافية:</span>
                    <div className="flex items-center bg-slate-50 border rounded-xl p-3 justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">
                          {selectedBroker.location || 'السماوة'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedBroker.location || 'السماوة', 'الموقع')}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Number of Views & listings count inside details modal */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-slate-400 block font-black">إجمالي عروض الإعلانات</span>
                      <span className="text-base font-black text-slate-800 font-sans">
                        {properties.filter((p: any) => p.broker?.id === selectedBroker.uid).length} عروض
                      </span>
                    </div>

                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-slate-500 block font-black">إجمالي مشاهدات الجمهور</span>
                      <span className="text-base font-black text-emerald-800 font-sans">
                        {properties.filter((p: any) => p.broker?.id === selectedBroker.uid).reduce((acc: number, cur: any) => acc + (cur.views || 0), 0)} مشاهدة
                      </span>
                    </div>
                  </div>

                  {/* Telephone with Direct Actions block */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">قنوات الاتصال والتواصل المخصصة:</span>
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <a 
                        href={`tel:${selectedBroker.phone}`}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-mono tracking-wider text-[11px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال مباشر: {selectedBroker.phone || 'غير متوفر'}</span>
                      </a>

                      <a 
                        href={`https://wa.me/${selectedBroker.whatsapp || (selectedBroker.phone ? '964' + selectedBroker.phone.replace(/^0/, '') : '')}`}
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>واتساب للدلالين</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail footer Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBrokerVerification(selectedBroker.uid, selectedBroker.isVerified);
                    // Dynamically update status in selection state
                    setSelectedBroker((prev: any) => prev ? { ...prev, isVerified: !prev.isVerified } : null);
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedBroker.isVerified 
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100' 
                      : 'bg-emerald-900 hover:bg-emerald-950 text-white shadow-md'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{selectedBroker.isVerified ? 'حظر وتجميد الرخصة والموثوقية مالمكتب' : 'تنشيط وترخيص الحساب عقارياً'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBroker(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  عودة لمستكشف الضباط
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
