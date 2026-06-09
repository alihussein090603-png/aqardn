/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Trash2, ShieldCheck, Sparkles, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { DISTRICTS, NEIGHBORHOODS, Property } from '../../types';

export interface PropertyAlert {
  id: string;
  district: string;
  neighborhood: string;
  category: 'all' | 'house' | 'apartment' | 'commercial' | 'land';
  transactionType: 'all' | 'sale' | 'rent';
  maxPriceIQD: number | null;
  phoneOrWhatsapp: string;
  createdAt: string;
  isEnabled: boolean;
}

interface PropertyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertiesList: Property[];
  onShowToast: (message: string, type: 'call' | 'whatsapp' | 'system') => void;
}

export default function PropertyAlertModal({
  isOpen,
  onClose,
  propertiesList,
  onShowToast
}: PropertyAlertModalProps): React.ReactElement | null {
  const [alerts, setAlerts] = useState<PropertyAlert[]>(() => {
    const saved = localStorage.getItem('aqarat_smart_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Form State
  const [district, setDistrict] = useState('السماوة');
  const [neighborhood, setNeighborhood] = useState('كل المناطق');
  const [category, setCategory] = useState<'all' | 'house' | 'apartment' | 'commercial' | 'land'>('all');
  const [transactionType, setTransactionType] = useState<'all' | 'sale' | 'rent'>('all');
  const [maxPriceIQD, setMaxPriceIQD] = useState<string>('');
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState('');
  
  // Tab control: 'list' (عرض التنبيهات) or 'create' (إنشاء تنبيه جديد)
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('aqarat_smart_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Handle prevention of scroll
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

  const neighborhoods = district === 'كل الأقضية' 
    ? [] 
    : NEIGHBORHOODS[district] || [];

  const handleDistrictChange = (dist: string) => {
    setDistrict(dist);
    setNeighborhood('كل المناطق');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneOrWhatsapp.trim() || phoneOrWhatsapp.length < 10) {
      onShowToast('⚠️ يرجى إدخال رقم هاتف أو واتساب عراقي صالح (10 أرقام على الأقل) لإرسال التنبيهات.', 'system');
      return;
    }

    const newAlert: PropertyAlert = {
      id: `alert-${Date.now()}`,
      district,
      neighborhood,
      category,
      transactionType,
      maxPriceIQD: maxPriceIQD !== '' ? parseFloat(maxPriceIQD) : null,
      phoneOrWhatsapp,
      createdAt: new Date().toISOString(),
      isEnabled: true
    };

    setAlerts((prev) => [newAlert, ...prev]);
    onShowToast('🔔 تم تفعيل وإعداد التنبيه الذكي بنجاح! سنقوم بمطابقة العقارات فوراً.', 'system');
    
    // Reset Form
    setMaxPriceIQD('');
    // Switch to list tab
    setActiveTab('list');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    onShowToast('❌ تم إزالة التنبيه من السجل.', 'system');
  };

  const handleToggleAlert = (id: string, currentStatus: boolean) => {
    setAlerts((prev) => 
      prev.map((a) => a.id === id ? { ...a, isEnabled: !currentStatus } : a)
    );
    onShowToast(
      !currentStatus ? '🔔 تم تشغيل وإعادة تنشيط محرك التنبيه الذكي.' : '🔕 تم إيقاف التنبيه مؤقتاً.', 
      'system'
    );
  };

  // Live match calculator helper
  const getMatchingCount = (alert: PropertyAlert) => {
    return propertiesList.filter((prop) => {
      // 1. Status Check
      if (prop.status && prop.status !== 'active') return false;
      
      // 2. District Match
      if (alert.district !== 'كل الأقضية' && prop.district !== alert.district) return false;
      
      // 3. Neighborhood Match
      if (alert.district !== 'كل الأقضية' && alert.neighborhood !== 'كل المناطق' && alert.neighborhood !== '') {
        if (prop.neighborhood !== alert.neighborhood) return false;
      }
      
      // 4. Category Match
      if (alert.category !== 'all' && prop.category !== alert.category) return false;
      
      // 5. Transaction Type Match
      if (alert.transactionType !== 'all' && prop.transactionType !== alert.transactionType) return false;
      
      // 6. Max Price Match
      if (alert.maxPriceIQD !== null) {
        if (prop.priceIQD > alert.maxPriceIQD) return false;
      }

      return true;
    }).length;
  };

  return (
    <div id="alert-modal-overlay" className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Container */}
      <div 
        id="alert-sheet" 
        className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300 text-right"
        dir="rtl"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/15">
              <Bell className="w-5 h-5 animate-swing" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">محرك التنبيهات العقارية الذكي</h2>
              <p className="text-[10px] text-emerald-800 font-bold mt-0.5">منصة عقارات المثنى - حوسبة الإشعارات المباشرة</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-black px-4 relative transition-all cursor-pointer ${
              activeTab === 'list' 
                ? 'text-emerald-800 border-b-2 border-emerald-800' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            تنبيهاتي النشطة ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-xs font-black px-4 relative transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'create' 
                ? 'text-emerald-800 border-b-2 border-emerald-800' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            إعداد تنبيه ذكي جديد
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'create' ? (
            /* Tab: Create Alert Form */
            <form onSubmit={handleCreateAlert} className="space-y-5">
              <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-800/10 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>كيف تعمل الخدمة؟</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  بمجرد قيام أي مكتب أو معقب عقاري معتمد في السماوة أو بقية الأقضية بنشر عقار جديد يطابق معاييرك المحددة بالأسفل، سيقوم نظامنا السحابي بربط طلبك وإشعارك فوراً عبر الشاشة والوسائط المفضلة!
                </p>
              </div>

              {/* Grid 1: Location Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">حدد القضاء الرئيسي:</label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all cursor-pointer"
                  >
                    {DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">حدد الحي أو المنطقة:</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    disabled={district === 'كل الأقضية'}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <option value="كل المناطق">كل المناطق</option>
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2: Property Type & Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">تصنيف العقار الطلوب:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="all">كل التصانيف</option>
                    <option value="house">بيت أو فيلا</option>
                    <option value="apartment">شقة سكنية</option>
                    <option value="commercial">موقع تجاري / محل</option>
                    <option value="land">أرض فضاء / زراعية</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">نوع المعاملة:</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'sale', 'rent'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransactionType(type)}
                        className={`py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          transactionType === type
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type === 'all' ? 'شامل' : type === 'sale' ? 'شراء' : 'إيجار'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input: Maximum Budget */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-800 block">الحد الأقصى للميزانية المتوفرة (بالمليون دينار عراقي):</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="مثال: 150 (اختياري - اتركه فارغاً بدون حد)"
                    value={maxPriceIQD}
                    onChange={(e) => setMaxPriceIQD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold font-sans text-right focus:outline-none transition-all"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-extrabold">مليون د.ع</span>
                </div>
              </div>

              {/* Critical Contact Data for alerting channel */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>رقم الهاتف الخاص بك (لتلقي التنبيهات المباشرة):</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: 07801234567..."
                  value={phoneOrWhatsapp}
                  onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-800 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-bold font-sans text-right focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-3 text-xs font-extrabold shadow-lg shadow-emerald-800/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>حفظ وتفعيل محرك التنبيه لخياراتي</span>
              </button>
            </form>
          ) : (
            /* Tab: Saved Alerts List */
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-150 rounded-2xl space-y-3">
                  <div className="w-12 h-12 bg-slate-100/50 text-slate-450 rounded-full flex items-center justify-center mx-auto">
                    <BellOff className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700">لم تقم بضبط أي تنبيهات ذكية بعد</h4>
                  <p className="text-[10px] text-slate-550 leading-relaxed max-w-sm mx-auto">
                    أنشئ تنبيهاً ذكياً بالضغط على زر "إعداد تنبيه ذكي جديد" لتكون أول من يعلم بفرص البيع الطارئة والبيوت المعروضة بأسعار ممتازة في المثنى.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    إعداد تنبيلي الآن 🔔
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">إجمالي طلبات الفلترة النشطة والمراقبة</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-md">حوسبة فورية هجينة</span>
                  </div>

                  {alerts.map((alert) => {
                    const matches = getMatchingCount(alert);
                    return (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          alert.isEnabled 
                            ? 'bg-white border-slate-150/80 shadow-xs' 
                            : 'bg-slate-50/75 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          
                          <div className="space-y-1">
                            {/* Tags pill bar */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                                {alert.district}
                                {alert.neighborhood !== 'كل المناطق' && ` - ${alert.neighborhood}`}
                              </span>
                              
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-md">
                                {alert.category === 'all' ? 'جميع العقارات' : alert.category === 'house' ? 'بيت' : alert.category === 'apartment' ? 'شقة' : alert.category === 'commercial' ? 'تجاري' : 'أرض'}
                              </span>

                              <span className="bg-amber-50 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md">
                                {alert.transactionType === 'all' ? 'بيع أو إيجار' : alert.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
                              </span>

                              {alert.maxPriceIQD && (
                                <span className="bg-rose-50 text-rose-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                                  لغاية {alert.maxPriceIQD} مليون د.ع
                                </span>
                              )}
                            </div>

                            {/* Contact channel */}
                            <p className="text-[10px] text-slate-550 pt-1 font-sans">
                              قناة الاتصال: <span className="font-bold text-slate-700">{alert.phoneOrWhatsapp}</span>
                            </p>

                            {/* Match Simulation banner */}
                            {alert.isEnabled && (
                              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  الفحص التلقائي مطلي:
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  matches > 0 
                                    ? 'bg-emerald-500 text-white animate-pulse' 
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {matches > 0 ? `يتوفر ${matches} عقارات مطابقة الآن!` : 'بانتظار عقارات متطابقة جديدة'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {/* Toggle Switch Button */}
                            <button
                              onClick={() => handleToggleAlert(alert.id, alert.isEnabled)}
                              title={alert.isEnabled ? "تعطيل مؤقت" : "تشغيل التنبيه"}
                              className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                                alert.isEnabled 
                                  ? 'bg-amber-50 border-amber-200/55 text-amber-600 hover:bg-amber-100' 
                                  : 'bg-slate-200/50 border-slate-200 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {alert.isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              title="حذف التنبيه"
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>عقارات المثنى - حماية وأمان سحابي متكامل</span>
          <span>خدمة مجانية 100% المواطنين</span>
        </div>

      </div>
    </div>
  );
}
