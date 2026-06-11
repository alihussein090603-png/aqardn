import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brandShowcase from '../muthanna_brand.jpeg';
import { 
  Home as HomeIcon, Building, Briefcase, MapPin, Search, SlidersHorizontal, 
  Map, Star, AlertCircle, Loader2, Bell, Calculator, Grid, List
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isMockConfig } from '../services/firebase';
import { useAppState } from '../context/AppStateContext';
import PropertyCard from '../components/property/PropertyCard';
import FilterModal from '../components/property/FilterModal';
import PropertyAlertModal from '../components/property/PropertyAlertModal';
import { Property, PropertyCategory } from '../types';
import RealEstateCalculator from '../components/tools/RealEstateCalculator';

/**
 * Normalizes Arabic letters to ensure highly accurate search results 
 * ignoring common letter-variants like (ة / ه) or (ى / ي / ئ).
 */
const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و');
};

export default function Home(): React.ReactElement {
  const navigate = useNavigate();
  const { 
    properties: contextProperties, 
    wishlist, 
    toggleWishlist, 
    showToast, 
    filters, 
    setFilters, 
    resetAllFilters,
    searchQuery,
    setSearchQuery,
    incrementViews
  } = useAppState();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PropertyCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 1. Setup real-time Firestore subscriber stream
  useEffect(() => {
    let isMounted = true;
    
    if (isMockConfig) {
      setIsLoading(false);
      return;
    }

    const propertiesRef = collection(db, 'properties');
    
    // Default optimized query: status == 'active', ordered chronologically
    const q = query(
      propertiesRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const parsePropertySnap = (docSnap: any): Property => {
      const dData = docSnap.data();
      return {
        id: docSnap.id,
        title: dData.title || '',
        description: dData.description || '',
        priceIQD: dData.priceIQD !== undefined ? dData.priceIQD : (dData.price !== undefined ? dData.price : 0),
        priceUSD: dData.priceUSD !== undefined ? dData.priceUSD : 0,
        category: dData.category || 'house',
        transactionType: dData.transactionType || dData.type || 'sale',
        district: dData.district || 'السماوة',
        neighborhood: dData.neighborhood || '',
        addressDetails: dData.addressDetails || '',
        area: dData.area || 0,
        rooms: dData.rooms !== undefined ? dData.rooms : undefined,
        bathrooms: dData.bathrooms !== undefined ? dData.bathrooms : undefined,
        floors: dData.floors !== undefined ? dData.floors : undefined,
        images: dData.images || ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
        isPremium: dData.isPremium || false,
        features: dData.features || [],
        createdAt: dData.createdAt instanceof Timestamp 
          ? dData.createdAt.toDate().toISOString() 
          : dData.createdAt || new Date().toISOString(),
        views: dData.views !== undefined ? dData.views : (dData.viewsCount !== undefined ? dData.viewsCount : 0),
        broker: dData.broker ? {
          id: dData.broker.id || dData.brokerId || 'system',
          name: dData.broker.name || 'مكتب عقاري معتمد',
          agencyName: dData.broker.agencyName || 'عقارات المثنى الرسمية',
          avatar: dData.broker.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=system',
          phone: dData.broker.phone || '',
          whatsapp: dData.broker.whatsapp || '',
          isVerified: dData.broker.isVerified !== undefined ? dData.broker.isVerified : true,
          rating: dData.broker.rating !== undefined ? dData.broker.rating : 5.0,
          activeListingsCount: dData.broker.activeListingsCount !== undefined ? dData.broker.activeListingsCount : 1
        } : {
          id: dData.brokerId || 'system',
          name: dData.brokerName || 'مكتب عقاري معتمد',
          agencyName: dData.brokerAgency || 'عقارات المثنى الرسمية',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system',
          phone: dData.brokerPhone || '',
          whatsapp: dData.brokerWhatsapp || '',
          isVerified: true,
          rating: 5.0,
          activeListingsCount: 1
        }
      };
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted) return;
        const activeList: Property[] = [];
        snapshot.forEach((docSnap) => {
          activeList.push(parsePropertySnap(docSnap));
        });
        setProperties(activeList);
        setIsLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        console.warn("Real-time snapshot ordering error. Swithing to un-ordered composite query:", error.message);
        
        // Handle index-pending issues gracefully fallback
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
          const fallbackQuery = query(
            propertiesRef,
            where('status', '==', 'active')
          );
          const unsubFallback = onSnapshot(fallbackQuery, (fallbackSnap) => {
            if (!isMounted) return;
            const activeList: Property[] = [];
            fallbackSnap.forEach((docSnap) => {
              activeList.push(parsePropertySnap(docSnap));
            });
            // Client-side sort fallback
            activeList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setProperties(activeList);
            setIsLoading(false);
          }, (err2) => {
            console.error("Critical fallback query failed:", err2);
            setIsLoading(false);
          });
          return;
        }
        
        // Throw for debugging tools if critical error occurs (excluding local index creations)
        try {
          handleFirestoreError(error, OperationType.GET, 'properties');
        } catch (e) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Synchronize filters.category with activeCategory tab selection
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: activeCategory
    }));
  }, [activeCategory, setFilters]);

  // Click-to-action handlers
  const handleCall = (phone: string, e: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    showToast(`📞 جاري الاتصال المباشر برقم الهاتف: ${phone}`, 'call');
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

  // If DB properties are empty or offline, utilize the local state pool safely for maximum user availability
  const activePropertiesPool = properties.length > 0 ? properties : contextProperties;

  // Evaluate final matching properties using robust multi-parameter criteria
  const filteredProperties = activePropertiesPool.filter(prop => {
    // 1. Category Filter
    if (filters.category !== 'all' && prop.category !== filters.category) return false;

    // 2. District Filter
    if (filters.district !== 'كل الأقضية' && prop.district !== filters.district) return false;

    // 3. Neighborhood Filter
    if (filters.district !== 'كل الأقضية' && filters.neighborhood !== 'كل المناطق' && filters.neighborhood !== '') {
      if (prop.neighborhood !== filters.neighborhood) return false;
    }

    // 4. Transaction Type Filter
    if (filters.type !== 'all' && prop.transactionType !== filters.type) return false;

    // 5. Price Min
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      if (prop.priceIQD < filters.minPrice) return false;
    }

    // 6. Price Max
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      if (prop.priceIQD > filters.maxPrice) return false;
    }

    // 7. Rooms Count
    if (filters.rooms !== 'all') {
      const reqRooms = parseInt(filters.rooms);
      if (prop.rooms === undefined || prop.rooms < reqRooms) return false;
    }

    // 8. Arabic Search Interception Text Match (Comparing normalized keywords)
    if (searchQuery.trim() !== '') {
      const normQuery = normalizeArabic(searchQuery);
      const matchTitle = normalizeArabic(prop.title).includes(normQuery);
      const matchDesc = normalizeArabic(prop.description).includes(normQuery);
      const matchNeighborhood = normalizeArabic(prop.neighborhood).includes(normQuery);
      const matchDistrict = normalizeArabic(prop.district).includes(normQuery);
      const matchDetails = normalizeArabic(prop.addressDetails || '').includes(normQuery);
      const matchFeatures = prop.features?.some(f => normalizeArabic(f).includes(normQuery)) || false;
      const matchBroker = normalizeArabic(prop.broker?.name || '').includes(normQuery);
      
      if (!matchTitle && !matchDesc && !matchNeighborhood && !matchDistrict && !matchDetails && !matchFeatures && !matchBroker) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300" dir="rtl">
      
      {/* HERO SECTION WITH LUXURY GRADIENT & ROYAL MOTIFS */}
      <section 
        id="hero-header" 
        className="relative text-white pt-12 pb-14 px-4 overflow-hidden bg-cover bg-center min-h-[160px] flex items-center justify-center border-b border-emerald-950/20 animate-fade-in"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.94), rgba(6, 78, 59, 0.82), rgba(15, 23, 42, 0.94)), url(${brandShowcase})` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.08),transparent_45%)]" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            عقارات المثنى — بوابتكم السكنية والاستثمارية
          </h1>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
            <span>إجمالي العقارات المعروضة: </span>
            <span className="text-white font-bold bg-[#ffffff1a] px-2.5 py-0.5 rounded-md font-sans">
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin inline ml-1" />
              ) : (
                activePropertiesPool.length
              )} إعلان نشط
            </span>
          </div>

        </div>
      </section>

      {/* INSTANT CATEGORY NAVIGATION ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 text-right" dir="rtl">
        <div className="categories-grid grid grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* كارت قسم الفلل/البيوت */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'house' ? 'all' : 'house')}
            className={`category-card cursor-pointer p-3 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center select-none active:scale-[0.97] ease-out ${
              activeCategory === 'house'
                ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950 shadow-inner ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-100 hover:bg-emerald-50/20 hover:border-emerald-500/10 text-slate-700 shadow-sm'
            }`}
          >
            <div className={`icon-wrapper p-2.5 rounded-xl transition-all duration-300 ${
              activeCategory === 'house' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <HomeIcon className="cat-icon w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="category-title text-[11px] sm:text-xs font-black tracking-wide transition-colors duration-200">بيوت مستقلة</span>
          </div>

          {/* كارت قسم الشقق */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'apartment' ? 'all' : 'apartment')}
            className={`category-card cursor-pointer p-3 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center select-none active:scale-[0.97] ease-out ${
              activeCategory === 'apartment'
                ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950 shadow-inner ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-100 hover:bg-emerald-50/20 hover:border-emerald-500/10 text-slate-700 shadow-sm'
            }`}
          >
            <div className={`icon-wrapper p-2.5 rounded-xl transition-all duration-300 ${
              activeCategory === 'apartment' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <Building className="cat-icon w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="category-title text-[11px] sm:text-xs font-black tracking-wide transition-colors duration-200">شقق</span>
          </div>

          {/* كارت قسم المكاتب والمحلات */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'commercial' ? 'all' : 'commercial')}
            className={`category-card cursor-pointer p-3 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center select-none active:scale-[0.97] ease-out ${
              activeCategory === 'commercial'
                ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950 shadow-inner ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-100 hover:bg-emerald-50/20 hover:border-emerald-500/10 text-slate-700 shadow-sm'
            }`}
          >
            <div className={`icon-wrapper p-2.5 rounded-xl transition-all duration-300 ${
              activeCategory === 'commercial' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <Briefcase className="cat-icon w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="category-title text-[11px] sm:text-xs font-black tracking-wide transition-colors duration-200">مكاتب ومحلات</span>
          </div>

          {/* كارت قسم الأراضي */}
          <div 
            onClick={() => setActiveCategory(activeCategory === 'land' ? 'all' : 'land')}
            className={`category-card cursor-pointer p-3 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center select-none active:scale-[0.97] ease-out ${
              activeCategory === 'land'
                ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950 shadow-inner ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-100 hover:bg-emerald-50/20 hover:border-emerald-500/10 text-slate-700 shadow-sm'
            }`}
          >
            <div className={`icon-wrapper p-2.5 rounded-xl transition-all duration-300 ${
              activeCategory === 'land' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <Map className="cat-icon w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="category-title text-[11px] sm:text-xs font-black tracking-wide transition-colors duration-200">أراضي</span>
          </div>

        </div>
      </section>

      {/* CITIZEN UTILITIES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 animate-in fade-in slide-in-from-bottom duration-300" dir="rtl">
        <div className="flex items-center justify-center">
          
          {/* Smart Property Alerts Interactive Card */}
          <div 
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 hover:border-amber-500/70 shadow-2xl relative overflow-hidden transition-all duration-400 hover:scale-[1.02] cursor-pointer group select-none flex flex-col md:flex-row items-center gap-6"
          >
            {/* Ambient Background Spotlights */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Modern Pulse Ring Animated Icon Area */}
            <div className="relative shrink-0 flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl group-hover:bg-amber-500/15 group-hover:border-amber-500/40 transition-colors duration-300 shadow-lg">
              {/* Double Glowing Radar Rings */}
              <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xs group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute w-full h-full rounded-2xl border-2 border-amber-500/30 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              <div className="absolute w-2/3 h-2/3 rounded-full bg-emerald-500/10 animate-pulse" />
              
              <Bell className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-400 relative z-10" />
            </div>

            {/* Arabic Copy Descriptions */}
            <div className="flex-1 text-center md:text-right space-y-2 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start">
                <span className="text-white text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
                  محرك التنبيهات العقارية الذكي 🔔
                </span>
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full font-sans uppercase">
                  تحديث فوري ٢٠٢٦
                </span>
              </div>
              
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold">
                ألا تجد طلبك السكني أو الاستثماري؟ حدد معاييرك (مثال: قضاء السماوة، نطاق السعر، أو المساحة) وسيرسل لك نظامنا إشعارًا فوريًا وتلقائيًا فور قيام أحد المكاتب الرسمية بنشر إعلان يطابق رغباتك!
              </p>
              
              {/* Click invitation bar */}
              <div className="pt-2 flex items-center justify-center md:justify-start gap-1.5 text-amber-400 font-extrabold text-[11px] tracking-wide group-hover:text-amber-300 transition-colors">
                <span>⚡ اضغط هنا لتسجيل تفضيلاتك وتفعيل التنبيه المخصص</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-300">←</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* DYNAMIC RESULTS HEADER AND GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              العقارات المتاحة بالمحافظة 
              <span className="text-base font-extrabold mr-2 text-emerald-800">
                 ({filteredProperties.length} من أصل {activePropertiesPool.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {filters.district !== 'كل الأقضية' ? `العقارات المتاحة في قضاء ${filters.district}` : 'كافة إعلانات محافظة المثنى'}
              {activeCategory !== 'all' && ` - صنف (${activeCategory === 'house' ? 'بيوت مستقلة' : activeCategory === 'apartment' ? 'شقق' : activeCategory === 'commercial' ? 'مكاتب ومتاجر' : 'أراضي طابو'})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter action trigger */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-emerald-50 hover:bg-[#e6f4ea] text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-black border border-emerald-500/10 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs border-none"
              title="تصفية وفلترة العقارات"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-800" />
              <span>تصفية متقدمة</span>
              {(filters.district !== 'كل الأقضية' || filters.type !== 'all' || filters.minPrice !== null || filters.maxPrice !== null || filters.rooms !== 'all') && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none border-0 outline-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="العرض الشبكي"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>شبكي</span>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none border-0 outline-none ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="عرض القائمة"
              >
                <List className="w-3.5 h-3.5" />
                <span>قائمة</span>
              </button>
            </div>

            {(filters.district !== 'كل الأقضية' || filters.type !== 'all' || filters.minPrice !== null || filters.maxPrice !== null || filters.rooms !== 'all' || searchQuery !== '') && (
              <button
                onClick={resetAllFilters}
                className="self-start text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-100 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs border-0 outline-none"
              >
                ✕ تصفير
              </button>
            )}
          </div>
        </div>

        {/* LOADING INDICATORS */}
        {isLoading ? (
          <div id="loading-shimmers" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 animate-pulse">
                <div className="bg-slate-200 aspect-video w-full rounded-xl" />
                <div className="bg-slate-200 h-4 w-2/3 rounded-md" />
                <div className="bg-slate-200 h-3 w-1/2 rounded-md" />
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <div className="bg-slate-200 h-3 w-1/4 rounded-md" />
                  <div className="bg-slate-200 h-3 w-1/4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          /* EMPTY STATE DISPLAY PANEL */
          <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center max-w-xl mx-auto space-y-4 min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <Building className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-800">لا توجد عقارات مطابقة لمعايير البحث الحالية في المثنى، حاول تغيير خيارات التصفية</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              يرجى تعديل خيارات الفرز كالأقضية أو تعديل نطاق الأسعار المعروضة أو كتابة كلمة مفتاحية بديلة للوصول للإعلان المطلوب.
            </p>
            <button
              onClick={resetAllFilters}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer mt-2"
            >
              تصفح كل العقارات المتوفرة
            </button>
          </div>
        ) : (
          /* PROPERTY LISTINGS GRID */
          <div 
            id="properties-grid" 
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-5 max-w-5xl mx-auto"
            }
          >
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                viewMode={viewMode}
                isWishlisted={wishlist.includes(property.id)}
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

      </section>

      {/* FILTER SHEET MODAL DIALOG */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{
          district: filters.district,
          neighborhood: filters.neighborhood,
          transactionType: filters.type as any,
          category: filters.category as any,
          minPriceIQD: filters.minPrice ? filters.minPrice.toString() : '',
          maxPriceIQD: filters.maxPrice ? filters.maxPrice.toString() : '',
          rooms: filters.rooms,
          searchQuery: searchQuery
        }}
        onUpdateFilters={(updated) => {
          setFilters({
            district: updated.district,
            neighborhood: updated.neighborhood,
            type: updated.transactionType,
            minPrice: updated.minPriceIQD ? parseFloat(updated.minPriceIQD) : null,
            maxPrice: updated.maxPriceIQD ? parseFloat(updated.maxPriceIQD) : null,
            rooms: updated.rooms,
            category: updated.category,
          });
        }}
        onResetFilters={resetAllFilters}
      />

      {/* SMART PROPERTY ALERTS MODAL DIALOG */}
      <PropertyAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        propertiesList={activePropertiesPool}
        onShowToast={showToast}
      />

      {/* DETACHED REAL ESTATE TAX & REGISTRATION FEE CALCULATOR */}
      <RealEstateCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

    </div>
  );
}
