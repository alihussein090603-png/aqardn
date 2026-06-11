import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('broker' | 'admin' | 'community')[];
}

export default function ProtectedRoute({ children, allowedRoles = ['broker', 'admin', 'community'] }: ProtectedRouteProps) {
  const { currentUser, role, isAuthenticated, isAuthenticating, isLoadingDoc } = useAuth();
  const location = useLocation();

  if (isAuthenticating || isLoadingDoc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/10 border-t-emerald-600 animate-spin mb-6"></div>
          <h2 className="text-lg font-sans font-medium text-gray-800 mb-2">جاري مزامنة الهوية العقارية...</h2>
          <p className="text-sm font-sans text-gray-500 leading-relaxed">
            نقوم بقراءة وتأمين سجلات مكتبك العقاري من خوادم عقارات المثنى. يرجى الانتظار لحظة.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    // Redirect them to the /auth page, but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as any)) {
    // If authenticated but role is not allowed, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
