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
import { useAppState } from '../context/AppStateContext';

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

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('calc') === 'true') {
      setIsCalculatorOpen(true);
    }
  }, []);

  const { addInquiry, showToast } = useAppState();
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqMsg, setInqMsg] = useState('السلام عليكم، يرجي التواصل معي للمعاينة ومعرفة المزيد من التفاصيل بخصوص هذا الملف العقاري.');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inqName.trim() || !inqPhone.trim()) {
      showToast('⚠️ يرجى تعبئة الاسم ورقم الهاتف لإرسال الاستفسار.', 'system');
      return;
    }
    
    setIsSendingInquiry(true);
    setTimeout(() => {
      addInquiry({
        id: `inq_${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        clientName: inqName.trim(),
        clientPhone: inqPhone.trim(),
        messageText: inqMsg.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        ownerId: (property as any).ownerId || 'system_broker'
      });
      setInqName('');
      setInqPhone('');
      setInqMsg('السلام عليكم، يرجي التواصل معي للمعاينة ومعرفة المزيد من التفاصيل بخصوص هذا الملف العقاري.');
      setIsSendingInquiry(false);
    }, 1200);
  };

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
      
      {/* Back button and share features (Back button removed as requested by user) */}
      <div className="flex items-center justify-end mb-6">

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

            {/* In-app Message Inquiry Form Component */}
            <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-800" />
                  <span>تواصل فوري (إرسال رسالة مباشرة للمكتب)</span>
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">سيظهر استفسارك في لوحة التحكم الواردة للمكتب فوراً.</p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-3 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">الاسم الكريم بالكامل:</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="مثال: يوسف الكناني"
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">رقم هاتفك للتواصل الفوري:</label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 07801234567"
                    value={inqPhone}
                    onChange={(e) => setInqPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-mono font-bold focus:ring-1 focus:ring-emerald-800 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">صيغة وملاحظات الاستفسار:</label>
                  <textarea
                    rows={3}
                    required
                    value={inqMsg}
                    onChange={(e) => setInqMsg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none leading-relaxed text-right"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingInquiry}
                  className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSendingInquiry ? (
                    <span>جاري إرسال المراسلات... ⌛</span>
                  ) : (
                    <span>إرسال الاستفسار الفوري السحري 📨</span>
                  )}
                </button>
              </form>
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
