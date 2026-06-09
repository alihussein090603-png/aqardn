/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Share2, Phone, MessageSquare, MapPin, ShieldCheck, Award, Star, Printer, Sparkles, Building2, Eye, Compass, Grid } from 'lucide-react';
import { Property } from '../../types';

interface PropertySharePosterProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function PropertySharePoster({
  isOpen,
  onClose,
  property
}: PropertySharePosterProps): React.ReactElement | null {
  
  const posterRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formatIQD = (val: number) => {
    if (val >= 1) {
      return `${val.toLocaleString('ar-IQ')} مليون د.ع`;
    } else {
      return `${(val * 1000).toLocaleString('ar-IQ')} ألف د.ع`;
    }
  };

  const formatUSD = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="poster-overlay" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-xs text-right" dir="rtl">
      
      {/* Backdrop click close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Actions bar at the very top */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 relative z-10">
          <span className="text-[10px] font-black text-slate-500">بطاقة الترويج الرقمية لواتساب 📱</span>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black transition-colors flex items-center gap-1 cursor-pointer border border-emerald-150"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة كارت</span>
            </button>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-200/50 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* The Printable / Screenshotable Visual Card Container */}
        <div 
          ref={posterRef} 
          id="recruitment-poster"
          className="print:p-8 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 pb-8 space-y-5 relative overflow-hidden"
        >
          {/* Visual decorations for aesthetic depth */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-0" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-amber-500 via-emerald-600 to-amber-500" />

          {/* Card Header: Brand info */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-990 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                <Building2 className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-black tracking-tight leading-tight">عقارات المثنى</span>
                <span className="text-[8px] text-emerald-400 font-extrabold">المنصة العقارية السحابية المعتمدة</span>
              </div>
            </div>

            <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full">
              {property.isPremium ? '⭐ عرض متميز' : 'دار موثقة'}
            </span>
          </div>

          {/* Property Image Cover */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
            <img 
              src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'} 
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Classification label badge overlay */}
            <span className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[9px] font-black px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
              {property.category === 'house' ? '🏡 بيت سكني' : property.category === 'apartment' ? '🏢 شقة سكنية' : property.category === 'commercial' ? '💼 موقع تجاري' : '🗺️ أرض فضاء'}
            </span>
          </div>

          {/* Property details */}
          <div className="space-y-3 relative z-10">
            <span className={`inline-block px-2 py-0.5 text-[8px] font-extrabold rounded-md ${
              property.transactionType === 'sale' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              {property.transactionType === 'sale' ? 'للبيع والشراء المباشر' : 'للإيجار والصفقات الدورية'}
            </span>
            
            <h1 className="text-sm font-black text-white leading-snug">
              {property.title}
            </h1>

            {/* Geographical marker info */}
            <div className="flex items-center gap-1.5 text-slate-350 text-[10px] font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{property.district}، {property.neighborhood}</span>
            </div>
          </div>

          {/* Big Pricing Block inside poster */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1 relative z-10 font-sans">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>السعر المطلوب (دينار عراقي):</span>
              <span>السعر المعادل بالدولار الأمريكي:</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-black text-emerald-400">
                {formatIQD(property.priceIQD)}
              </span>
              <span className="text-[11px] font-bold text-slate-200">
                {formatUSD(property.priceUSD)}
              </span>
            </div>
          </div>

          {/* Highlights specifications panel */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-900/60 p-2.5 rounded-xl border border-white/5 relative z-10 font-sans">
            <div className="border-l border-white/5 justify-center flex flex-col items-center">
              <span className="text-slate-400 text-[8px]">المساحة</span>
              <span className="font-extrabold text-white mt-0.5">{property.area} م²</span>
            </div>
            <div className="border-l border-white/5 justify-center flex flex-col items-center">
              <span className="text-slate-400 text-[8px]">الغرف / الصالة</span>
              <span className="font-extrabold text-white mt-0.5">{property.rooms || '-'} غرف</span>
            </div>
            <div className="justify-center flex flex-col items-center">
              <span className="text-slate-400 text-[8px]">الطوابق</span>
              <span className="font-extrabold text-white mt-0.5">{property.floors || 'طبيعي'}</span>
            </div>
          </div>

          {/* Broker Information Area */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img 
                  src={property.broker.avatar} 
                  alt={property.broker.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-650"
                  referrerPolicy="no-referrer"
                />
                {property.broker.isVerified && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white border border-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold leading-none">مكتب الوساطة المعتمد:</span>
                <span className="text-xs font-black text-white leading-normal block mt-1">{property.broker.name}</span>
                <span className="text-[8px] text-amber-400 font-bold block mt-0.5">{property.broker.agencyName}</span>
              </div>
            </div>

            {/* Custom stamp badge */}
            <div className="w-12 h-12 rounded-full border border-dashed border-emerald-500/30 font-extrabold text-[7px] text-emerald-400 flex flex-col items-center justify-center rotate-12 bg-emerald-500/5 select-none shrink-0 uppercase tracking-tight text-center leading-none">
              <span>مدقق وموثق</span>
              <span className="text-[5px] text-slate-350 transform scale-90 block mt-0.5">عقارات المثنى</span>
            </div>
          </div>

          {/* Floating Contact Number display */}
          <div className="pt-2 flex gap-2 justify-center text-[10px] font-mono font-bold text-slate-300 relative z-10 shrink-0 select-all border-t border-white/5">
            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>هاتف: {property.broker.phone}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <MessageSquare className="w-3.5 h-3.5 text-green-400" />
              <span>واتساب: {property.broker.whatsapp}</span>
            </div>
          </div>

        </div>

        {/* Under instruction help */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center space-y-1 select-none">
          <p className="text-[9px] text-slate-600 font-black flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow shrink-0" />
            <span>نصيحة: خذ لقطة شاشة (Screenshot) سريعة الآن بهاتفك ومكنّها في حالة واتساب!</span>
          </p>
          <p className="text-[8px] text-slate-450 leading-relaxed font-bold">
            تم ضبط المقاييس خصيصاً بمحيط 9:16 لتلائم تصوير الهاتف ومراكز نشر المنشورات السريعة.
          </p>
        </div>

      </div>
    </div>
  );
}
