/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Maximize, Bed, Bath, Layers, Calendar, Eye, 
  Phone, MessageSquare, ShieldCheck, Heart, Share2, Tags, Star, Smartphone, Calculator 
} from 'lucide-react';
import { Property } from '../types';
import AiPredictorWidget from './property/AiPredictorWidget';
import PropertySharePoster from './property/PropertySharePoster';
import RealEstateCalculator from './tools/RealEstateCalculator';

interface PropertyDetailProps {
  property: Property;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e: any) => void;
  onBack: () => void;
  onCall: (phone: string, e: any) => void;
  onWhatsApp: (whatsapp: string, title: string, e: any) => void;
}

export default function PropertyDetail({
  property,
  isWishlisted,
  onToggleWishlist,
  onBack,
  onCall,
  onWhatsApp
}: PropertyDetailProps) {
  const [activeImage, setActiveImage] = useState(property.images[0]);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const formatIQD = (val: number) => {
    if (val >= 1) {
      return `${val.toLocaleString('ar-IQ')} مليون دينار عراقي`;
    } else {
      return `${(val * 1000).toLocaleString('ar-IQ')} ألف دينار عراقي`;
    }
  };

  const formatUSD = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" dir="rtl">
      
      {/* Back button and share features */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-emerald-800 bg-white border border-slate-200/80 hover:border-emerald-800/10 shadow-sm px-4 py-2 rounded-xl transition-all font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          {/* WhatsApp poster generator button */}
          <button
            onClick={() => setIsPosterOpen(true)}
            className="flex items-center gap-1.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 h-10 rounded-xl transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-amber-500/10 border-0 cursor-pointer"
            title="تصدير كارت ترويج WhatsApp"
          >
            <Smartphone className="w-4 h-4" />
            <span>كارت واتساب 📱</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={(e) => onToggleWishlist(property.id, e)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isWishlisted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-slate-50'
            }`}
            title="حفظ للمفضلة"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-800 hover:bg-slate-50 flex items-center justify-center transition-all"
            title="نسخ رابط الإعلان"
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          {copiedLink && (
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg animate-bounce">
              تم نسخ الرابط!
            </span>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Right Columns (2 blocks space on desktop for details & galleries) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Image Gallery */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-4 shadow-sm">
            <div 
              className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 cursor-zoom-in"
              onClick={() => setIsFullscreenImageOpen(true)}
            >
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-4 right-4 bg-slate-900/75 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-xs">
                انقر لتكبير الصورة 🔍
              </span>
            </div>

            {/* Thumbnail Carousel */}
            {property.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {property.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 transition-all ${
                      activeImage === img
                        ? 'ring-3 ring-emerald-800 opacity-100 scale-95'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`ثنائية ${index}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Details Header */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md text-white ${
                property.transactionType === 'sale' ? 'bg-amber-600' : 'bg-emerald-700'
              }`}>
                {property.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
              </span>

              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 text-xs font-bold rounded-md">
                {property.category === 'house' && '🏡 بيت سكني'}
                {property.category === 'apartment' && '🏢 شقة فاخرة'}
                {property.category === 'commercial' && '💼 محل أو مكتب تجاري'}
                {property.category === 'land' && '🗺️ أرض ملك صرف'}
              </span>

              {property.isPremium && (
                <span className="bg-amber-100 text-amber-800 border border-amber-300/30 px-2.5 py-1 text-xs font-bold rounded-md">
                  ⭐ إعلان متميز ونادر
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {property.title}
            </h1>

            {/* Geographic Tag with Details */}
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-5 h-5 text-emerald-800 shrink-0" />
              <p className="text-sm font-semibold">
                المحافظة: المثنى - <span className="text-emerald-900">{property.district}</span> - {property.neighborhood} {property.addressDetails ? `، ${property.addressDetails}` : ''}
              </p>
            </div>

            {/* Price Detail Block */}
            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-800/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">السعر المطلوب بالدينار العراقي:</p>
                  <p className="text-xl font-black text-emerald-800 mt-1 animate-pulse">
                    {formatIQD(property.priceIQD)}
                  </p>
                </div>
                <div className="border-r border-dotted border-slate-200 pr-0 sm:pr-4">
                  <p className="text-xs text-slate-500">السعر المقابل بالدولار الأمريكي:</p>
                  <p className="text-lg font-mono font-bold text-slate-700 mt-1">
                    {formatUSD(property.priceUSD)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>احسب رسوم طابو التسجيل والضريبة العقارية لهذا العقار 🧮</span>
              </button>
            </div>
          </div>

          {/* Specifications & Metrics Grid */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              المواصفات الأساسية والقياسات
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">المساحة الإجمالية</p>
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold">
                  <Maximize className="w-4.5 h-4.5 text-emerald-800" />
                  <span>{property.area} م²</span>
                </div>
              </div>

              {property.category !== 'land' && property.rooms && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">عدد غرف النوم</p>
                  <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold">
                    <Bed className="w-4.5 h-4.5 text-emerald-800" />
                    <span>{property.rooms} غرف</span>
                  </div>
                </div>
              )}

              {property.category !== 'land' && property.bathrooms && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">حمامات ومرافق</p>
                  <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold">
                    <Bath className="w-4.5 h-4.5 text-emerald-800" />
                    <span>{property.bathrooms} حمام</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">طوابق البناء</p>
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold">
                  <Layers className="w-4.5 h-4.5 text-emerald-800" />
                  <span>{property.floors || 'طبيعي'}</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>تاريخ النشر: {property.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>شوهد الإعلان {property.views} مرة</span>
              </div>
            </div>
          </div>

          {/* Description & Details Box */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              تفاصيل العقار والوصف المعماري
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {property.description}
            </p>
          </div>

          {/* AI Predictive Evaluation and Wait-Time Tool */}
          <AiPredictorWidget
            district={property.district}
            neighborhood={property.neighborhood}
            category={property.category}
            area={property.area}
            priceIQD={property.priceIQD}
            priceUSD={property.priceUSD}
          />

          {/* Features Tag Grid */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tags className="w-4.5 h-4.5 text-emerald-800" />
              <span>مزايا خدمية وإضافات</span>
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {property.features.map((feature, i) => (
                <span 
                  key={i} 
                  className="bg-emerald-500/5 text-emerald-800 border border-emerald-800/10 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Left Columns (Broker Card Info, persistent sticky action) */}
        <div className="lg:col-span-1">
          
          <div className="sticky top-24 space-y-6">
            
            {/* Broker Meta Information Floating Card */}
            <div className="bg-slate-900 text-white rounded-2xl border border-emerald-900/10 p-6 shadow-xl relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />

              <h4 className="text-xs font-bold text-amber-500 mb-4 border-b border-white/10 pb-2">
                المكتب المعتمد المسؤول عن هذا العقار
              </h4>

              <div className="flex items-center gap-4 relative z-10">
                <img 
                  src={property.broker.avatar} 
                  alt={property.broker.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-700"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right">
                  <h3 className="text-base font-extrabold flex items-center gap-1.5">
                    {property.broker.name}
                    {property.broker.isVerified && (
                      <span title="مكتب عقاري معتمد ومحقق">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{property.broker.agencyName}</p>
                </div>
              </div>

              {/* Performance Indicator Row */}
              <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-y border-white/5 text-center relative z-10 bg-white/5 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-400">تقييم العملاء</p>
                  <p className="text-sm font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-current text-amber-400" />
                    <span>{property.broker.rating} / ٥</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">العقارات المدرجة</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">{property.broker.activeListingsCount} إعلان</p>
                </div>
              </div>

              {/* Massive Action Buttons with Persistent Styles */}
              <div className="space-y-3 mt-6 relative z-10">
                <button
                  onClick={(e) => onCall(property.broker.phone, e)}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-950/20"
                >
                  <Phone className="w-4 h-4 fill-current text-white" />
                  اتصال هاتفي مباشر بالفون
                </button>

                <button
                  onClick={(e) => onWhatsApp(property.broker.whatsapp, property.title, e)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  محادثة واتساب الفورية
                </button>
              </div>

            </div>

            {/* Note Panel */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-slate-700">
              <h5 className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                ⚠ إخلاء مسؤولية تنبيهي:
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                عقارات المثنى منصة تواصل وتنسيق عقاري. نرجو عدم إرسال مبالغ الدفع المالي المقدمة لبيوت وأراضي إلا بعد لقاء المكتب العقاري ومعاينة الطابو والمستندات القانونية بحضور ممثلي مكاتب السماوة الرسمية.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Local Fullscreen Image Modal */}
      {isFullscreenImageOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreenImageOpen(false)}
        >
          <button 
            type="button"
            onClick={() => setIsFullscreenImageOpen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white text-white hover:text-slate-900 w-10 h-10 rounded-full flex items-center justify-center transition-all text-xl"
          >
            ✕
          </button>
          
          <img 
            src={activeImage} 
            alt="صورة العقار كاملة" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shrink"
            referrerPolicy="no-referrer"
          />
          <p className="text-white/60 text-xs font-semibold mt-4 text-center">
            {property.title}
          </p>
        </div>
      )}

      {/* Modern Dynamic Shareable poster */}
      <PropertySharePoster
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        property={property}
      />

      {/* Property Specific Iraqi Tax and Registration Calculator */}
      <RealEstateCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        defaultPriceIQD={property.priceIQD}
      />

    </div>
  );
}
