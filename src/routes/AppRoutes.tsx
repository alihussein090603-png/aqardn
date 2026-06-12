/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Page Imports
import Home from '../pages/Home';
import PropertyDetails from '../pages/PropertyDetails';
import Auth from '../pages/Auth';
import Wishlist from '../pages/Wishlist';
import Communities from '../pages/Communities';
import CommunityDetail from '../pages/CommunityDetail';

// Lazy Loaded Protected Broker/Admin Pages for Performance Optimization
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));
const MyProperties = lazy(() => import('../pages/dashboard/MyProperties'));
const AddProperty = lazy(() => import('../pages/dashboard/AddProperty'));
const DashboardAnalytics = lazy(() => import('../pages/dashboard/DashboardAnalytics'));
const LeadsMatching = lazy(() => import('../pages/dashboard/LeadsMatching'));
const Profile = lazy(() => import('../pages/dashboard/Profile'));
const CommunityCardDesigner = lazy(() => import('../pages/dashboard/CommunityCardDesigner'));
const AdminPanel = lazy(() => import('../pages/admin/AdminPanel'));

// Security Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Arabic High-fidelity Loader Fallback
const DashboardSkeletonLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/30 p-6" style={{ direction: 'rtl' }}>
    <div className="w-11 h-11 rounded-full border-4 border-emerald-500/15 border-t-emerald-850 animate-spin mb-4" />
    <span className="text-[11px] font-bold text-slate-500 font-sans">تأمين الاتصال وتحميل سجلات التبويب بمحافظة المثنى...</span>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<DashboardSkeletonLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/community/:id" element={<CommunityDetail />} />

        {/* Protected Broker Workspace Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <DashboardAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/my-properties"
          element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/community-card"
          element={
            <ProtectedRoute>
              <CommunityCardDesigner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/leads"
          element={
            <ProtectedRoute>
              <LeadsMatching />
            </ProtectedRoute>
          }
        />

        {/* Completely Isolated Administrative Segment */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Legacy redirect for admin workspace to absolute /admin-dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
