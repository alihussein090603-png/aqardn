/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, MapPin, Grid, Briefcase, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import { FilterState, DISTRICTS, NEIGHBORHOODS } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters
}: FilterModalProps) {
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDistrictChange = (district: string) => {
    onUpdateFilters({
      ...filters,
      district,
      neighborhood: 'كل المناطق' // reset neighborhood on district change
    });
  };

  const neighborhoods = filters.district === 'كل الأقضية' 
    ? [] 
    : NEIGHBORHOODS[filters.district] || [];

  return (
    <div id="filter-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Container */}
      <div 
        id="filter-sheet" 
        className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300 text-right"
        dir="rtl"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-930">تصفية النتائج والخيارات</h2>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* District Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">العقار في قضاء:</label>
            <div className="relative">
              <select
                value={filters.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none transition-all appearance-none"
              >
                {DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                <MapPin className="w-4 h-4 text-emerald-700 hover:text-emerald-900" />
              </div>
            </div>
          </div>

          {/* Neighborhood Dropdown - Dynamically synchronized */}
          {filters.district !== 'كل الأقضية' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-sm font-bold text-slate-800">الحي أو المنطقة:</label>
              <div className="relative">
                <select
                  value={filters.neighborhood}
                  onChange={(e) => onUpdateFilters({ ...filters, neighborhood: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none transition-all appearance-none"
                >
                  <option value="كل المناطق">كل مناطق {filters.district}</option>
                  {neighborhoods.map((nh) => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">نوع المعاملة:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'للبيع والإيجار', value: 'all' },
                { label: 'للبيع فقط', value: 'sale' },
                { label: 'للإيجار فقط', value: 'rent' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => onUpdateFilters({ ...filters, transactionType: btn.value as any })}
                  className={`py-3 px-1 rounded-xl text-xs font-bold transition-all border ${
                    filters.transactionType === btn.value
                      ? 'border-emerald-800 bg-emerald-800 text-white shadow-md shadow-emerald-950/10'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range (in million Dinars) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">مستوى السعر المطلوب (بالملايين د.ع):</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">الحد الأدنى</span>
                <input
                  type="number"
                  placeholder="مثال: ١٠"
                  value={filters.minPriceIQD}
                  onChange={(e) => onUpdateFilters({ ...filters, minPriceIQD: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-center focus:outline-none focus:border-emerald-800 focus:bg-white placeholder:text-right"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">الحد الأعلى</span>
                <input
                  type="number"
                  placeholder="مثال: ٥٠٠"
                  value={filters.maxPriceIQD}
                  onChange={(e) => onUpdateFilters({ ...filters, maxPriceIQD: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-center focus:outline-none focus:border-emerald-800 focus:bg-white placeholder:text-right"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms Count */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">عدد الغرف الأدنى للبيت/الشقة:</label>
            <div className="grid grid-cols-6 gap-2">
              {['all', '1', '2', '3', '4', '5'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdateFilters({ ...filters, rooms: v })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    filters.rooms === v
                      ? 'border-emerald-800 bg-emerald-800 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {v === 'all' ? 'الكل' : v === '5' ? '+٥' : v}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            تصفير الخيارات
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-6 text-sm rounded-xl text-center shadow-lg shadow-emerald-950/10 transition-colors"
          >
            تطبيق تصفية النتائج
          </button>
        </div>

      </div>
    </div>
  );
}
