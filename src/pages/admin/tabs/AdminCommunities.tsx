import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, MapPin, Key, Landmark, Trash2, ChevronLeft, Plus, 
  Search, X, Copy, Mail, Phone, MessageSquare, ExternalLink, Calendar 
} from 'lucide-react';
import { Community } from '../../../types';

export default function AdminCommunities(context: any) {
  const { 
    setShowCommunityModal, setGeneratedCreds, communitiesPool, 
    properties, searchTerm, setSearchTerm, handleDeleteCommunity, 
    actionInProgress, showToast 
  } = context;

  // Selected community for sensitive info popup dialog
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  // Filter logic
  const filteredCommunities = communitiesPool.filter((c: any) => {
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || 
           (c.phone || '').includes(term) || 
           (c.location || '').toLowerCase().includes(term);
  });

  // Decrypt password hash helper (salt is "aqardn_secure_2026_")
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
      return hash;
    }
  };

  // Check if community is added recently (last 30 minutes)
  const isNew = (comp: any) => {
    if (!comp.createdAt) return false;
    const diff = Date.now() - new Date(comp.createdAt).getTime();
    return diff > 0 && diff < 30 * 60 * 1000;
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
      {/* 1. Header and Search controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 justify-start">
            <Landmark className="w-5 h-5 text-amber-650 shrink-0" />
            <span>سجل ومفاتيح المجمعات السكنية</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            متابعة تراخيص وشهادات الدخول للمجمعات السكنية الكبرى وتفويض صلاحية إدخال الوحدات الذكية.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث باسم المجمع أو الموقع أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-700 shadow-sm"
              id="community-search-input"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button 
            onClick={() => { setShowCommunityModal(true); if (setGeneratedCreds) setGeneratedCreds(null); }}
            className="bg-amber-500 hover:bg-amber-600 font-black text-slate-950 text-xs px-4 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            id="register-community-btn"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>إضافة مجمع جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
          <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">إجمالي المجمعات</span>
          <span className="text-base sm:text-lg font-black text-slate-900 font-sans">{communitiesPool.length} مجمع</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-right">
          <span className="text-[10px] sm:text-xs text-amber-900 block font-black">الوحدات السكنية المدخلة</span>
          <span className="text-base sm:text-lg font-black text-slate-900 font-sans">
            {properties.filter((p: any) => p.belongsToCommunity === true).length} وحدة
          </span>
        </div>
      </div>

      {/* 3. Modern Grid of Cards (Completely Mobile Compatible, No Tables) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCommunities.map((comp: any) => {
            // Calculate total properties associated with this community:
            const relatedListings = properties.filter((p: any) => p.belongsToCommunity && p.communityId === comp.id);
            const totalUploaded = relatedListings.length;
            const totalViews = relatedListings.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
            
            const newlyCreated = isNew(comp);

            return (
              <motion.div
                key={comp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedCommunity(comp)}
                className={`bg-white rounded-2xl border transition-all text-right overflow-hidden relative cursor-pointer shadow-3xs hover:shadow-md flex flex-col justify-between ${
                  newlyCreated 
                    ? 'ring-2 ring-amber-500 border-amber-500 ring-offset-2' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                id={`community-card-${comp.id}`}
              >
                {newlyCreated && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse z-10">
                    مستثمر جديد ✨
                  </span>
                )}

                {/* Card Top / Details */}
                <div className="p-4 sm:p-5 space-y-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    {/* Visual Stamp */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black select-none text-base shrink-0 shadow-xs border border-amber-400">
                      🏢
                    </div>

                    <div className="bg-slate-50 border border-slate-150 text-slate-400 text-[9px] sm:text-[10px] font-sans px-2.5 py-1 rounded-lg shrink-0">
                      سجل مستثمر دولي
                    </div>
                  </div>

                  {/* Institution Details */}
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug truncate">
                      {comp.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-sans block truncate">
                      رابط البريد: {comp.email || 'بلا بريد منوط'}
                    </span>
                  </div>

                  {/* Location & Contact */}
                  <div className="space-y-2 pt-2 border-t border-slate-50 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 justify-start">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{comp.location || 'السماوة'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-start font-mono text-[10px] text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{comp.phone || '078xxxxxxxx'}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-50 text-center font-sans">
                    <div className="bg-amber-50 ml-1 rounded-xl p-2 border border-amber-100/40">
                      <span className="text-[9px] text-amber-900 block font-black">الوحدات المعروضة</span>
                      <span className="text-xs font-black text-slate-800 block">{totalUploaded} وحدة</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <span className="text-[9px] text-slate-400 block font-medium">إجمالي المشاهدات</span>
                      <span className="text-xs font-black text-slate-800 block">{totalViews} زائر</span>
                    </div>
                  </div>
                </div>

                {/* Card Integrated Actions Footer */}
                <div className="bg-slate-50/80 border-t border-slate-100 p-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString('ar-IQ') : '--'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Delete button option */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleDeleteCommunity) handleDeleteCommunity(comp.id);
                      }}
                      disabled={actionInProgress !== null}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-150 hover:border-rose-100 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-30"
                      title="سحب تراخيص المجمع وحذفه نهائياً"
                      id={`delete-community-btn-${comp.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* View Details button option */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCommunity(comp);
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      id={`details-community-btn-${comp.id}`}
                    >
                      <span>عرض تفاصيل الدخول</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredCommunities.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-450 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
            <Building className="w-10 h-10 text-slate-300" />
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-700">لا توجد مجمعات سكنية متوافقة</p>
              <p className="text-[10px] text-slate-400 font-sans">تأكد من إعداد مرشح البحث العقاري أو أضف مجمعاً سكنياً معتمداً.</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. DETAILS POPUP DIALOG WITH PASSWORD, LOCATION, AND PHONE CHECKS (MOBILE FRIENDLY & PREMIUM) */}
      <AnimatePresence>
        {selectedCommunity && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl p-6 text-right space-y-6 relative max-h-[90vh] overflow-y-auto"
              id="community-details-modal"
            >
              {/* Modal Head */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-105">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-3xs">
                    🛡️
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950">بيانات اعتماد المجمع السكني الاستثماري</h3>
                </div>
                <button 
                  onClick={() => setSelectedCommunity(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors pointer-events-auto cursor-pointer"
                  id="close-community-details-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                {/* Stamp */}
                <div className="bg-amber-50/50 rounded-2xl p-4 text-center border border-amber-100/50 space-y-2">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-lg font-black mx-auto">
                    {(selectedCommunity.name || 'م').charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{selectedCommunity.name}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-sans">المالية أو المطور العقاري المعتمد</p>
                  </div>
                </div>

                {/* Fields List */}
                <div className="space-y-3 text-xs">
                  {/* Password Decrypted */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">كلمة المرور الآمنة للدخول:</span>
                    <div className="flex items-center bg-amber-50/40 border border-amber-100 rounded-xl p-3 justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-mono text-slate-900 font-black tracking-wider select-all">
                          {decryptPassword(selectedCommunity.password || selectedCommunity.passwordHash)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(decryptPassword(selectedCommunity.password || selectedCommunity.passwordHash), 'كلمة المرور')}
                        className="p-1 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors cursor-pointer"
                        title="نسخ الرقم السري"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registered Email */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">البريد الإلكتروني للإدارة:</span>
                    <div className="flex items-center bg-slate-50 border rounded-xl p-3 justify-between gap-3 font-sans">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700 select-all truncate block">
                          {selectedCommunity.email || 'غير مخصص'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedCommunity.email || '', 'البريد الإلكتروني')}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registered Location */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">الموقع الجغرافي المسجل:</span>
                    <div className="flex items-center bg-slate-50 border rounded-xl p-3 justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">
                          {selectedCommunity.location || 'السماوة'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedCommunity.location || 'السماوة', 'الموقع')}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Units and combined views */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-amber-900 block font-black">الوحدات العقارية</span>
                      <span className="text-base font-black text-slate-800 font-sans">
                        {properties.filter((p: any) => p.belongsToCommunity && p.communityId === selectedCommunity.id).length} وحدة
                      </span>
                    </div>

                    <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-slate-400 block font-black">إجمالي المشاهَدات</span>
                      <span className="text-base font-black text-emerald-800 font-sans">
                        {properties.filter((p: any) => p.belongsToCommunity && p.communityId === selectedCommunity.id).reduce((sum: number, p: any) => sum + (p.views || 0), 0)} مشاهدة
                      </span>
                    </div>
                  </div>

                  {/* Communication shortcuts */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-black">قنوات الإتصال المباشرة:</span>
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <a 
                        href={`tel:${selectedCommunity.phone}`}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-mono tracking-wider text-[11px]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال مباشر: {selectedCommunity.phone || 'غير متوفر'}</span>
                      </a>

                      <a 
                        href={`https://wa.me/${selectedCommunity.phone ? '964' + selectedCommunity.phone.replace(/^0/, '') : ''}`}
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>مراسلة واتساب</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Footer */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCommunity(null)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  إغلاق لوحة المعاينة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
