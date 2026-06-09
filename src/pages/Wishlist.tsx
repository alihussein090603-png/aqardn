import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import PropertyCard from '../components/PropertyCard';

export default function Wishlist(): React.ReactElement {
  const navigate = useNavigate();
  const { 
    properties, 
    wishlist, 
    toggleWishlist, 
    showToast,
    incrementViews
  } = useAppState();

  // Find properties in the wishlist
  const wishlistedItems = properties.filter((p) => wishlist.includes(p.id));

  // Click handlers
  const handleCall = (phone: string, e: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    showToast(`📞 جاري الاتصال المباشر برُقم الهاتف: ${phone}`, 'call');
  };

  const handleWhatsApp = (whatsapp: string, title: string, e: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const textMsg = encodeURIComponent(`السلام عليكم، استفسار بخصوص إعلان: "${title}" المعروض على عقارات المثنى.`);
    showToast(`💬 جاري توجيهك لفتح محادثة واتساب الفورية مع المكتب...`, 'whatsapp');
    setTimeout(() => {
      window.open(`https://wa.me/${whatsapp}?text=${textMsg}`, '_blank');
    }, 1000);
  };

  const handleViewDetails = (id: string) => {
    incrementViews(id);
    navigate(`/property/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300" dir="rtl">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
          <span>قائمة العقارات المفضلة</span>
        </h1>
        <p className="text-xs text-slate-500">
          تصفح وتنسيق عقارات المثنى التي قمت بحفظها ومتابعتها لاحقاً.
        </p>
      </div>

      {/* Main Grid or Empty state */}
      {wishlistedItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <Heart className="w-12 h-12 text-slate-200 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">قائمة المفضلة فارغة حالياً</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            استكشف البيوت، الأراضي الشاغرة، والشقق الفاخرة المتاحة في السماوة والرميثة وبقية الأقضية، واضغط على رمز القلب لحفظها هنا للوصول السريع ومقارنة الأسعار.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            تصفح عقارات المثنى الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedItems.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isWishlisted={true}
              onToggleWishlist={(id, e) => {
                e.stopPropagation();
                toggleWishlist(id);
              }}
              onViewDetails={handleViewDetails}
              onCall={handleCall}
              onWhatsApp={handleWhatsApp}
            />
          ))}
        </div>
      )}

    </div>
  );
}
