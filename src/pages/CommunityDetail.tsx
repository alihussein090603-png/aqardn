/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Phone, MessageSquare, Sparkles, MapPin, 
  AlertCircle, Building2, HelpCircle 
} from 'lucide-react';
import { getDynamicCommunities } from '../data/communitiesMock';
import { useAppState } from '../context/AppStateContext';
import PropertyCard from '../components/PropertyCard';

export default function CommunityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, wishlist, toggleWishlist, showToast } = useAppState();

  const communitiesList = getDynamicCommunities();
  const community = communitiesList.find(c => c.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!community) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 font-sans" dir="rtl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">عذراً! المجمع المطلوب غير مسجل حالياً</h2>
        <p className="text-xs text-slate-400 font-sans">قد يكون قد تم تحديث رمز المجمع أو إيقاف خدمته مؤقتاً.</p>
        <button
          onClick={() => navigate('/communities')}
          className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer font-sans"
        >
          العودة للمجمعات السكنية
        </button>
      </div>
    );
  }

  // Handle sales management contact
  const handleCall = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast(`📞 جاري تحضير الاتصال بإدارة مبيعات: ${community.name}`, 'call');
    setTimeout(() => {
      window.location.href = `tel:${community.phone}`;
    }, 800);
  };

  const handleWhatsApp = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const textMsg = encodeURIComponent(`السلام عليكم ورحمة الله، أنا أتصفح منصة عقارات المثنى وأريد الاستفسار عن الوحدات المتاحة بـ "${community.name}".`);
    showToast(`💬 جاري الانتقال لدردشة واتساب الفورية مع إدارة المجمع السكني...`, 'whatsapp');
    setTimeout(() => {
      window.open(`https://wa.me/${community.whatsapp}?text=${textMsg}`, '_blank');
    }, 800);
  };

  // 1. Constrained filtering logic: pull only items related to this specific community (communityId)
  const communityProperties = properties.filter(
    (p) => p.belongsToCommunity && p.communityId === community.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans animate-fade-in" dir="rtl">
      
      {/* Back button & page tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/communities')}
          className="w-fit flex items-center gap-2 text-slate-700 hover:text-emerald-800 bg-white border border-slate-200/80 shadow-sm px-4 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer font-sans"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمجمعات السكنية</span>
        </button>
        
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black px-3.5 py-1.5 rounded-full border border-emerald-100 w-fit font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          <span>عرض الوحدات الاستثمارية المطابقة</span>
        </div>
      </div>

      {/* Specialty Top Header (الهيدر العلوي المخصص) */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo, Name, Location details */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="bg-emerald-50 text-emerald-800 text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0 border border-emerald-100 font-bold">
              {community.logo}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                {community.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 font-sans">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>المثنى، قضاء {community.district} - حي {community.neighborhood}</span>
              </p>
            </div>
          </div>

          {/* Action Call & WhatsApp direct buttons (أزرار إجراءات التواصل المباشر) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCall()}
              className="px-5 py-3 rounded-xl bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer font-sans"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>اتصال بالمبيعات</span>
            </button>
            <button
              onClick={() => handleWhatsApp()}
              className="px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <MessageSquare className="w-4 h-4 text-emerald-800" />
              <span>واتساب المبيعات</span>
            </button>
          </div>
        </div>

        {/* Community Description Panel */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-605 leading-relaxed font-sans font-medium">
          <p>{community.description}</p>
        </div>
      </div>

      {/* Main Image banner representing the luxury brochure */}
      <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-sm mb-6 bg-slate-100 border border-slate-200/50">
        <img
          src={community.coverImage}
          alt={community.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Geographics & Real Estate Google Map section */}
      {community.mapEmbedCode && (
        <div className="bg-white rounded-3xl border border-slate-200/50 p-6 mb-8 shadow-sm">
          <h3 className="text-sm sm:text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-800" />
            </span>
            <span>موقع وتخطيط المجمع الجغرافي التفاعلي:</span>
          </h3>
          <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative shadow-inner min-h-[280px]">
            <iframe 
              src={(() => {
                const input = community.mapEmbedCode || '';
                if (input.includes('<iframe')) {
                  const match = input.match(/src="([^"]+)"/);
                  if (match && match[1]) return match[1];
                }
                return input;
              })()}
              title={`موقع ${community.name} الجغرافي`}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      {/* Sub-header section: Properties list label */}
      <div className="mb-6 font-sans mt-8">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-emerald-800" />
          <span>الوحدات والخيارات العقارية المتوفرة داخل المجمع ({communityProperties.length})</span>
        </h2>
        <p className="text-xs text-slate-450 font-bold mt-1 font-sans">تصفح العقارات الحالية المطروحة للبيع المباشر من المطور والمطابقة برمجياً.</p>
      </div>

      {/* Standard Property Grid View */}
      {communityProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm font-sans max-w-xl mx-auto">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-sans">لا توجد عقارات معروضة للبيع حالياً</h3>
          <p className="text-xs text-slate-500 font-sans">
            يرجى التواصل المباشر مع مبيعات المجمع عبر أزرار الهاتف أو الواتساب للاستفسار عن الفلل والشقق الجديدة الشاغرة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {communityProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isWishlisted={wishlist.includes(property.id)}
              onToggleWishlist={(id, e) => {
                e.stopPropagation();
                toggleWishlist(id);
              }}
              onViewDetails={(id) => navigate(`/property/${id}`)}
              onCall={(phone, e) => {
                e.stopPropagation();
                showToast(`📞 جاري الاتصال المباشر...`, 'call');
                window.location.href = `tel:${phone}`;
              }}
              onWhatsApp={(whatsapp, title, e) => {
                e.stopPropagation();
                const textMsg = encodeURIComponent(`السلام عليكم، استفسار بخصوص عقار رقم ${property.unitNumber ? property.unitNumber : ''} بالمجمع: ${title}`);
                showToast(`💬 جاري الانتقال لواتساب المبيعات...`, 'whatsapp');
                window.open(`https://wa.me/${whatsapp}?text=${textMsg}`, '_blank');
              }}
              viewMode="grid"
            />
          ))}
        </div>
      )}

    </div>
  );
}
