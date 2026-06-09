import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, FilterState } from '../types';
import { initialProperties } from '../mockData';

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
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const initialFilters: AppFilterState = {
  district: 'كل الأقضية',
  neighborhood: 'كل المناطق',
  type: 'all',
  minPrice: null,
  maxPrice: null,
  rooms: 'all',
  category: 'all',
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Global React states corresponding to database tables
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('aqarat_properties');
    return saved ? JSON.parse(saved) : initialProperties;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AppFilterState>(initialFilters);
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('aqarat_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync state with LocalStorage for durable cloud/local persistence simulation
  useEffect(() => {
    localStorage.setItem('aqarat_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('aqarat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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
