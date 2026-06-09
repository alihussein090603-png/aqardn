/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser, role, isAuthenticated, isAuthenticating, isLoadingDoc, logout } = useAuth();
  const location = useLocation();

  if (isAuthenticating || isLoadingDoc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-6" dir="rtl">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/10 border-t-emerald-600 animate-spin mb-6"></div>
          <h2 className="text-sm font-black text-slate-800 mb-2">التحقق من صفة المشرف...</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            يرجى الانتظار لحظة بينما نقوم بمطابقة مفاتيح الهوية للمشرف العام.
          </p>
        </div>
      </div>
    );
  }

  const isUserAdmin = role === 'admin';

  if (!isAuthenticated || !currentUser || !isUserAdmin) {
    // Purge session on unauthorized admin access attempts as strictly specified
    if (currentUser && !isUserAdmin) {
      console.warn("Unauthorized access purge triggered for user: ", currentUser.name);
      try {
        logout();
      } catch (err) {
        console.error("Purging error session:", err);
      }
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
