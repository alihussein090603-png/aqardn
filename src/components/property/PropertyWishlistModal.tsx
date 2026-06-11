/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Heart, Trash2, Phone, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { Property } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProperties: Property[];
  onToggleWishlist: (id: string) => void;
  onNavigateDetail: (id: string) => void;
  onShowToast: (message: string, type: 'call' | 'whatsapp' | 'system') => void;
}

export default function PropertyWishlistModal({
  isOpen,
  onClose,
  wishlistProperties,
  onToggleWishlist,
  onNavigateDetail,
  onShowToast
}: PropertyWishlistModalProps): React.ReactElement | null {

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCall = (phone: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onShowToast(`📲 جاري الاتصال بالمكتب عقار: ${title}...`, 'call');
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (whatsapp: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onShowToast(`💬 جاري توجيهك لواتساب المكتب لعقار: ${title}...`, 'whatsapp');
    const encodedMsg = encodeURIComponent(`السلام عليكم، أنا مهتم بعقاركم المعروض: "${title}" على منصة عقارات المثنى.`);
    window.open(`https://wa.me/${whatsapp}?text=${encodedMsg}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="wishlist-modal-overlay" className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          {/* Backdrop with elegant blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Dialog Container */}
          <motion.div 
            id="wishlist-sheet"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[85vh] overflow-hidden text-right border-t sm:border border-slate-100"
            dir="rtl"
          >
            
            {/* Header / Grabber bar for mobile feel */}
            <div className="flex md:hidden justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Standard Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-55/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/15">
                  <Heart className="w-5 h-5 fill-white text-rose-500" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">مفضلتك العقارية المحفوظة</h2>
                  <p className="text-[10px] text-rose-600 font-bold mt-0.5">عقارات قمت بحفظها للمتابعة والمعاينة</p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main content body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/30">
              {wishlistProperties.length > 0 ? (
                <div className="space-y-4">
                  
                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between bg-rose-500/5 px-4 py-2.5 rounded-2xl border border-rose-500/10 text-xs">
                    <span className="text-rose-950 font-black flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>{wishlistProperties.length} عقارات في المفضلة</span>
                    </span>
                    <span className="text-[9px] bg-white text-rose-600 font-black px-2 py-0.5 rounded-lg shadow-xs border border-rose-500/10">
                      محفوظة محلياً 💾
                    </span>
                  </div>

                  {/* List of property cards */}
                  <div className="space-y-3">
                    {wishlistProperties.map((prop) => {
                      const brokerPhone = prop.broker?.phone || '07801234567';
                      const brokerMsgPhone = prop.broker?.whatsapp || '9647801234567';
                      
                      return (
                        <div 
                          key={prop.id}
                          onClick={() => {
                            onClose();
                            onNavigateDetail(prop.id);
                          }}
                          className="bg-white p-3 rounded-2xl border border-slate-150/80 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-350 cursor-pointer flex gap-4 relative group"
                        >
                          {/* Image area */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden relative border border-slate-100 shrink-0">
                            <img 
                              src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Premium / Status badges */}
                            <span className="absolute top-1.5 right-1.5 bg-emerald-800 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none">
                              {prop.transactionType === 'sale' ? 'بيع طابو' : 'إيجار سنوي'}
                            </span>
                          </div>

                          {/* Detail fields */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between pl-1">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-black text-slate-850 truncate group-hover:text-emerald-850 transition-colors">
                                  {prop.title}
                                </h4>
                                
                                {/* Trash button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleWishlist(prop.id);
                                  }}
                                  className="text-slate-300 hover:text-rose-500 p-1 hover:bg-slate-50 rounded-lg transition-all duration-200 shrink-0 -mt-1 -ml-1"
                                  title="إزالة من المفضلة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-[10px] sm:text-xs text-slate-450 font-bold mt-1">
                                📍 القضاء: {prop.district} • الحي: {prop.neighborhood}
                              </p>
                              
                              <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">
                                {prop.category === 'house' ? '🏠 بيت سكني' 
                                 : prop.category === 'apartment' ? '🏢 شقة فاخرة'
                                 : prop.category === 'commercial' ? '💼 عقار تجاري'
                                 : '🌱 أرض عقارية'} • مساحة {prop.area} م²
                              </p>
                            </div>

                            {/* Price block & Smart triggers */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                              <span className="text-[12px] sm:text-xs font-black text-emerald-850 font-sans tracking-tight">
                                {prop.priceIQD >= 1 ? `${prop.priceIQD} مليون د.ع` : `${(prop.priceIQD * 1000).toLocaleString()} ألف د.ع`}
                              </span>

                              {/* Express interactive contact channels */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleWhatsApp(brokerMsgPhone, prop.title, e)}
                                  className="w-7 h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-emerald-500/10"
                                  title="واتساب المكتب"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
                                </button>
                                <button
                                  onClick={(e) => handleCall(brokerPhone, prop.title, e)}
                                  className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-teal-500/10"
                                  title="اتصل بالمكتب"
                                >
                                  <Phone className="w-3.5 h-3.5 text-teal-650 shrink-0" />
                                </button>
                                <span className="text-[9px] bg-slate-50 text-slate-500 group-hover:bg-slate-100 font-black px-1.5 py-1 rounded-lg flex items-center gap-0.5 border border-slate-150">
                                  <span>تفاصيل</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                  
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-4">
                  <div className="w-16 h-16 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Heart className="w-7 h-7 fill-neutral-100 text-rose-350" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700">قائمة المفضلة فارغة حالياً</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto text-center leading-relaxed font-semibold">
                      تصفح عقارات المثنى الموثقة واضغط على رمز القلب لحفظ أي عقار يعجبك هنا للمراجعة والمقارنة السريعة لاحقاً.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-emerald-850 hover:bg-emerald-900 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all duration-300 cursor-pointer shadow-md shadow-emerald-900/15"
                  >
                    تصفح عقارات المثنى الآن 🔎
                  </button>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            {wishlistProperties.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateDetail('wishlist_page'); // Special nav trigger or direct to filter
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-colors text-center cursor-pointer block border-none select-none font-sans"
                >
                  عرض مقارنة الأسعار والتحليل 📊
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer block border-none select-none font-sans"
                >
                  إغلاق النافذة
                </button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
