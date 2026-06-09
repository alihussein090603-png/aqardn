import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useAppState } from './context/AppStateContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import AppRoutes from './routes/AppRoutes';
import { mockBrokers } from './mockData';

export default function App(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { currentUser, login, logout } = useAuth();
  const { toast, closeToast, setFilters } = useAppState();

  // Handle standard translations from custom header/footer nav buttons to actual Router URLs
  const handleNavigate = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else if (page === 'auth') {
      navigate('/auth');
    } else if (page === 'dashboard') {
      navigate('/dashboard');
    } else if (page === 'wishlist') {
      navigate('/wishlist');
    }
  };

  // Keep track of current mapped activePage for the Header's tab highlighting rules
  let activePage = 'home';
  if (location.pathname === '/auth') {
    activePage = 'auth';
  } else if (location.pathname.startsWith('/dashboard')) {
    activePage = 'dashboard';
  } else if (location.pathname === '/wishlist') {
    activePage = 'wishlist';
  } else if (location.pathname.startsWith('/property')) {
    activePage = 'detail';
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col justify-between text-right" dir="rtl">
      
      {/* 1. Global Custom system toast notification alerts */}
      {toast && (
        <div 
          id="custom-toast" 
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom duration-300 max-w-sm ${
            toast.type === 'call' 
              ? 'bg-slate-900 text-white border-emerald-800'
              : toast.type === 'whatsapp'
              ? 'bg-green-700 text-white border-green-800'
              : 'bg-white text-slate-900 border-slate-100'
          }`}
        >
          {toast.type === 'call' && <Phone className="w-5 h-5 text-amber-500 fill-current shrink-0" />}
          {toast.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-white shrink-0" />}
          {toast.type === 'system' && <Sparkles className="w-5 h-5 text-emerald-800 shrink-0" />}
          
          <div className="text-right">
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </div>

          <button onClick={closeToast} className="mr-auto text-slate-400 hover:text-white hover:text-slate-800 text-sm cursor-pointer pr-2">
            ✕
          </button>
        </div>
      )}

      {/* 2. Global application Header */}
      <Header
        currentUser={currentUser}
        onSetUser={(broker) => {
          if (broker) {
            login(broker);
          } else {
            logout();
          }
        }}
        activePage={activePage}
        onNavigate={handleNavigate}
        mockBrokers={mockBrokers}
      />

      {/* 3. Main content wrapper with router views */}
      <main className="flex-grow min-h-[70vh]">
        <AppRoutes />
      </main>

      {/* 4. Global application Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSetCategoryFilter={(category) => {
          // Sync context category filter on direct footer selection clicks
          setFilters((prev) => ({
            ...prev,
            category: category,
          }));
        }}
      />

      {/* 5. Mobile Global Floating Navigation Bar */}
      <MobileBottomNav />

    </div>
  );
}
