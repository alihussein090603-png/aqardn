import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, FilterState, LeadRequest, PropertyInquiry } from '../types';
import { initialProperties } from '../mockData';
import { mockCommunityProperties } from '../data/communitiesMock';

export interface AppFilterState {
  district: string;
  neighborhood: string;
  type: string; // 'all' | 'sale' | 'rent'
  minPrice: number | null;
  maxPrice: number | null;
  rooms: string;
  category: string; // 'all' | 'house' | 'apartment' | 'commercial' | 'land'
}

interface ToastMessage {
  message: string;
  type: 'call' | 'whatsapp' | 'system';
}

interface AppStateContextType {
  properties: Property[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: AppFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AppFilterState>>;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  toast: ToastMessage | null;
  showToast: (message: string, type: 'call' | 'whatsapp' | 'system') => void;
  closeToast: () => void;
  resetAllFilters: () => void;
  addProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  togglePremium: (id: string) => void;
  markAsSold: (id: string, isSold: boolean) => void;
  incrementViews: (id: string) => void;
  leads: LeadRequest[];
  addLead: (lead: LeadRequest) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: 'active' | 'matched' | 'closed') => void;
  
  // Real Estate Message Inquiry Ingestion Streams
  inquiries: PropertyInquiry[];
  addInquiry: (inquiry: PropertyInquiry) => void;
  deleteInquiry: (id: string) => void;
  isWishlistModalOpen: boolean;
  setIsWishlistModalOpen: (open: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const initialLeads: LeadRequest[] = [
  {
    id: 'l1',
    clientName: 'أبو أحمد الجبوري',
    clientPhone: '07815551234',
    clientWhatsApp: '9647815551234',
    requiredCategory: 'house',
    transactionType: 'sale',
    preferredDistrict: 'السماوة',
    preferredNeighborhood: 'حي الحكيم',
    budgetMin: 200,
    budgetMax: 300,
    minArea: 200,
    notes: 'يبحث عن بيت طابقين نظيف وبناء حديث، يفضل قرب شارع باتا أو الخدمات.',
    createdAt: '2026-06-05',
    status: 'active',
    brokerId: 'b1'
  },
  {
    id: 'l2',
    clientName: 'المهندس علاء الشمري',
    clientPhone: '07705559876',
    clientWhatsApp: '9647705559876',
    requiredCategory: 'land',
    transactionType: 'sale',
    preferredDistrict: 'الرميثة',
    preferredNeighborhood: 'منطقة السراي',
    budgetMin: 50,
    budgetMax: 150,
    minArea: 1000,
    notes: 'طلب عاجل لأرض زراعية أو بستان مطل على النهر أو بالقرب من الطريق العام.',
    createdAt: '2026-06-07',
    status: 'active',
    brokerId: 'b1'
  },
  {
    id: 'l3',
    clientName: 'الدكتورة زينب الخفاجي',
    clientPhone: '07802223344',
    clientWhatsApp: '9647802223344',
    requiredCategory: 'apartment',
    transactionType: 'rent',
    preferredDistrict: 'السماوة',
    preferredNeighborhood: 'مجمع تبارك السكني',
    budgetMin: 0.5,
    budgetMax: 1.5,
    minArea: 100,
    notes: 'شقة مفروشة للإيجار الشهري لعائلة صغيرة، بضمان وتجهيز متميز في مجمع مؤمن.',
    createdAt: '2026-06-08',
    status: 'active',
    brokerId: 'b2'
  }
];

const initialFilters: AppFilterState = {
  district: 'كل الأقضية',
  neighborhood: 'كل المناطق',
  type: 'all',
  minPrice: null,
  maxPrice: null,
  rooms: 'all',
  category: 'all',
};

const initialInquiries: PropertyInquiry[] = [
  {
    id: 'inq_1',
    propertyId: 'p1',
    propertyTitle: 'بيت حديث طابو صرف بمساحة ٢٥٠م في حي الحكيم',
    clientName: 'الحاج جاسم آل كاطع',
    clientPhone: '07801234567',
    messageText: 'السلام عليكم أخي، أنا مهتم ببيت الطابو الصرف المعروض في حي الحكيم. هل السعر المعلن قابل للتفاوض البسيط؟ وهل يمكنني معاينة البيت غداً عصراً؟',
    createdAt: '2026-06-08',
    ownerId: 'system_broker' // Accessible by system office account
  },
  {
    id: 'inq_2',
    propertyId: 'p3',
    propertyTitle: 'شقة فاخرة للإيجار السنوي مجمع تبارك السكني',
    clientName: 'الأستاذ مرتضى العبيدي',
    clientPhone: '07712345678',
    messageText: 'مرحباً، أبحث عن شقة لعائلتي في مجمع تبارك السكني لستة أشهر أو سنة. هل الخدمات والكهرباء بالمجمع مستقرة؟ ومتى يتوافر موعد للمعاينة؟ وشكراً.',
    createdAt: '2026-06-09',
    ownerId: 'system_broker'
  },
  {
    id: 'inq_3',
    propertyId: 'p2',
    propertyTitle: 'أرض زراعية خصبة ١٥ دونم على ضفاف الفرات في الخضر',
    clientName: 'أبو حيدر الياسري',
    clientPhone: '07501234567',
    messageText: 'مساء الخير، أتساءل هل الأرض صالحة لزراعة شجر النخيل والبرسيم؟ وهل توجد حصة مائية معتمدة لها من الشط مباشرة؟',
    createdAt: '2026-06-09',
    ownerId: 'b2'
  }
];

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Global React states corresponding to database tables
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('aqarat_properties');
    if (saved) {
      try {
        const parsed = (JSON.parse(saved) as Property[]).map(p => {
          // Self-heal: If the property belongs to a community but has standard broker 'b1', correct it to point to the community developer.
          if (p.belongsToCommunity && p.communityId && (!p.broker || p.broker.id !== p.communityId)) {
            const correctProp = mockCommunityProperties.find(mp => mp.id === p.id);
            if (correctProp) {
              return { ...p, broker: correctProp.broker };
            }
          }
          return p;
        });
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = mockCommunityProperties.filter(p => !existingIds.has(p.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch (err) {
        return [...initialProperties, ...mockCommunityProperties];
      }
    }
    return [...initialProperties, ...mockCommunityProperties];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AppFilterState>(initialFilters);
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('aqarat_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [leads, setLeads] = useState<LeadRequest[]>(() => {
    const saved = localStorage.getItem('aqarat_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [inquiries, setInquiries] = useState<PropertyInquiry[]>(() => {
    const saved = localStorage.getItem('aqarat_inquiries');
    return saved ? JSON.parse(saved) : initialInquiries;
  });

  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync state with LocalStorage for durable cloud/local persistence simulation
  useEffect(() => {
    localStorage.setItem('aqarat_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('aqarat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('aqarat_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('aqarat_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Toast automatic removal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'call' | 'whatsapp' | 'system') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('تم إزالة العقار من قائمة تفضيلاتك المحفوظة.', 'system');
        return prev.filter((item) => item !== id);
      } else {
        showToast('📍 تم حفظ العقار في مفضلتك لتصفحه لاحقاً.', 'system');
        return [...prev, id];
      }
    });
  };

  const resetAllFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
    showToast('🧹 تم تصفير جميع خيارات الفرز والبحث.', 'system');
  };

  const addProperty = (property: Property) => {
    setProperties((prev) => [property, ...prev]);
    showToast('🎉 تم إضافة عقارك بنجاح ونشره على منصة عقارات المثنى!', 'system');
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    showToast('❌ تم إزالة الإعلان بنجاح من المنصة.', 'system');
  };

  const togglePremium = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isPremium;
          showToast(
            nextState
              ? '⭐ تم ترقية الإعلان إلى مميز بنجاح لزيادة الوصول!'
              : 'تم خفض الإعلان إلى إعلان عادي.',
            'system'
          );
          return { ...p, isPremium: nextState };
        }
        return p;
      })
    );
  };

  const markAsSold = (id: string, isSold: boolean) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextTitle = isSold
            ? `[تم البيع] - ${p.title.replace('[تم البيع] - ', '')}`
            : p.title.replace('[تم البيع] - ', '');
          showToast(
            isSold ? '🎉 مبارك! تم تمييز الإعلان بمكتمل وإغلاقه.' : 'تم إعادة تنشيط العقار وجعله متاحاً.',
            'system'
          );
          return { ...p, title: nextTitle };
        }
        return p;
      })
    );
  };

  const incrementViews = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, views: p.views + 1 };
        }
        return p;
      })
    );
  };

  const addLead = (lead: LeadRequest) => {
    setLeads((prev) => [lead, ...prev]);
    showToast('📍 تم إضافة طلب العميل والمطابقة آلياً بنجاح!', 'system');
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showToast('❌ تم إزالة طلب العميل والمطابقة بنجاح.', 'system');
  };

  const updateLeadStatus = (id: string, status: 'active' | 'matched' | 'closed') => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          showToast(
            status === 'closed'
              ? '🎉 مبارك! تم إغلاق الطلب وتأكيد اكتمال الصفقة بنجاح.'
              : 'تم تحديث حالة المتابعة للطلب العقاري.',
            'system'
          );
          return { ...l, status };
        }
        return l;
      })
    );
  };

  const addInquiry = (inquiry: PropertyInquiry) => {
    setInquiries((prev) => [inquiry, ...prev]);
    showToast('📨 تم إرسال استفسارك الفوري وملاحظاتك لمكتب العقار بنجاح!', 'system');
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    showToast('❌ تم حذف الاستفسار بنجاح من المراسلات الواردة.', 'system');
  };

  return (
    <AppStateContext.Provider
      value={{
        properties,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        wishlist,
        toggleWishlist,
        toast,
        showToast,
        closeToast,
        resetAllFilters,
        addProperty,
        deleteProperty,
        togglePremium,
        markAsSold,
        incrementViews,
        leads,
        addLead,
        deleteLead,
        updateLeadStatus,
        inquiries,
        addInquiry,
        deleteInquiry,
        isWishlistModalOpen,
        setIsWishlistModalOpen
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
