import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import PropertyDetail from '../components/PropertyDetail';

export default function PropertyDetails(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    properties, 
    wishlist, 
    toggleWishlist, 
    showToast,
    incrementViews
  } = useAppState();

  const property = properties.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id) {
      incrementViews(id);
    }
  }, [id]);

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <h2 className="text-lg font-bold text-slate-800">عذراً! العقار الذي تحاول تصفحه غير موجود أو تم حذفه من قِبل الناشر</h2>
        <p className="text-xs text-slate-500">قد يكون العقار قد تم بيعه أو إغلاق إعلانه مؤخراً.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
        >
          العودة للبحث في عقارات المثنى
        </button>
      </div>
    );
  }

  const handleCall = (phone: string, e: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    showToast(`📞 جاري الاتصال المباشر برُقم الهاتف: ${phone}`, 'call');
  };

  const handleWhatsApp = (whatsapp: string, title: string, e: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const textMsg = encodeURIComponent(`السلام عليكم، استفسار بخصوص إعلان: "${title}" المعروض على عقارات المثنى.`);
    showToast(`💬 جاري توجيهك لفتح محادثة واتساب الفورية مع المكتب...`, 'whatsapp');
    setTimeout(() => {
      window.open(`https://wa.me/${whatsapp}?text=${textMsg}`, '_blank');
    }, 1000);
  };

  return (
    <PropertyDetail
      property={property}
      isWishlisted={wishlist.includes(property.id)}
      onToggleWishlist={(propId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        toggleWishlist(propId);
      }}
      onBack={() => navigate('/')}
      onCall={handleCall}
      onWhatsApp={handleWhatsApp}
    />
  );
}
