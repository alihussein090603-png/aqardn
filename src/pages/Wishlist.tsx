import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export default function Wishlist(): React.ReactElement {
  const navigate = useNavigate();
  const { setIsWishlistModalOpen } = useAppState();

  useEffect(() => {
    // Open the modern micro-interacting wishlist modal globally
    setIsWishlistModalOpen(true);
    // Graceful automatic redirect back to active explore view or previous page
    navigate('/', { replace: true });
  }, [navigate, setIsWishlistModalOpen]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center font-sans" dir="rtl">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-800/20 border-t-emerald-800 animate-spin mx-auto" />
        <p className="text-xs font-black text-slate-500">جاري عرض مفضلتك العقارية التفاعلية...</p>
      </div>
    </div>
  );
}
