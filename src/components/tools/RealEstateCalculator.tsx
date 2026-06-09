/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calculator, ShieldCheck, HelpCircle, Landmark, Briefcase, FileText, Sparkles } from 'lucide-react';

interface RealEstateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPriceIQD?: number | null;
}

export default function RealEstateCalculator({
  isOpen,
  onClose,
  defaultPriceIQD = null
}: RealEstateCalculatorProps): React.ReactElement | null {
  
  const [propertyPrice, setPropertyPrice] = useState<string>(
    defaultPriceIQD ? defaultPriceIQD.toString() : '150'
  );
  const [propertyType, setPropertyType] = useState<'house' | 'land' | 'commercial'>('house');
  
  if (!isOpen) return null;

  // Calculators logic inside Iraq
  const price = parseFloat(propertyPrice) || 0; // price in Million IQD

  // 1. الضريبة العامة في العراق (General Tax / General Commission for Taxes - الهيئة العامة للضرائب)
  // دار سكني: 3%, أرض فضاء: 4%, عقار تجاري: 5% للتقييم العقاري لوزارة المالية
  const taxMultiplier = propertyType === 'house' ? 0.03 : propertyType === 'land' ? 0.04 : 0.05;
  const generalTax = price * taxMultiplier;

  // 2. رسم التسجيل العقاري (الطابو / Real Estate Registration Directorate fee)
  // رسم تسجيل ملكية في الطابو العراقي يبلغ 1% من قيمة العقار المعمدة في اللجنة
  const registrationFee = price * 0.01;

  // 3. أجور المحاماة وضريبة نقابة المحامين ورسوم البلدية ومصادقة الطابو
  // رسوم ثابتة تقديرية تبلغ حوالي 0.5% لغاية 0.8% أو ما يوازي 250,000 إلى 750,000 دينار
  const adminFees = price * 0.003; 

  // 4. دلالية وكيل العقار أو المكتب (Broker Standard Commission)
  // العرف التجاري والقانون يحدد دلالية وساطة بمقدار 1% تُدفع من البائع والمشتري بالتساوي أو حسب الاتفاق
  const brokerCommission = price * 0.01;

  // Total Legal Expenses in Iraq
  const totalLegalExpenses = generalTax + registrationFee + adminFees;
  const grandTotalInvestment = price + totalLegalExpenses + brokerCommission;

  return (
    <div id="calculator-overlay" className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 text-right" dir="rtl">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Container */}
      <div 
        id="calculator-sheet" 
        className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-990 text-white flex items-center justify-center shadow-md shadow-emerald-800/10 border border-emerald-700/10">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">الآلة الحاسبة للرسوم والضرائب القانونية</h2>
              <p className="text-[10px] text-emerald-850 font-bold mt-0.5">وفق قانون التسجيل العقاري العراقي والتحاسب الضريبي الساري</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Calculations Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Inputs Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-205">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>إدخال معطيات صفقات وكالات السماوة والمثنى:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Input Price */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 block">قيمة صفقة العقار (بالمليون دينار عراقي):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    placeholder="مثال: 150"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-800 rounded-xl p-2.5 px-3 text-xs font-extrabold font-sans text-right focus:outline-none"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-extrabold">مليون د.ع</span>
                </div>
              </div>

              {/* Property Classification selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 block">تصنيف العقار للتقدير المالي:</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-800 rounded-xl p-2.5 px-3 text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="house">🏡 دار سكني / بناء متكامل (ضريبة 3%)</option>
                  <option value="land">🗺️ أرض ملك صرف / فضاء (ضريبة 4%)</option>
                  <option value="commercial">💼 موقع أو محل تجاري (ضريبة 5%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900">تفاصيل ومصاريف نقل الملكية (الطابو والضريبة):</h3>
            
            <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white">
              
              {/* Item: General Tax */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <div className="flex gap-2.5">
                  <Landmark className="w-4 h-4 text-emerald-850 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">ضريبة نقل الملكية (العشر المالي للضريبة العامة)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      تُدفع للهيئة العامة للضرائب بمعدل {(taxMultiplier * 100)}% من قيمة العقار المقدرة.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 shrink-0 font-sans">
                  {generalTax.toLocaleString('ar-IQ')} مليون د.ع
                </span>
              </div>

              {/* Item: Registry deed fee */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <div className="flex gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-850 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">رسم الطابو والتسجيل العقاري</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      رسم تسجيل سند طابو الملك الصرف بمعدل 1% مخصص للدولة لإصدار السند الجديد.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 shrink-0 font-sans">
                  {registrationFee.toLocaleString('ar-IQ')} مليون د.ع
                </span>
              </div>

              {/* Item: Administrative / Court & attorney fees */}
              <div className="p-3.5 flex items-start justify-between gap-4">
                <div className="flex gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">أجور مصادقة المحاماة والبلدية ومصاريف الطابو</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      تشمل مصاريف مصادقة نقابة المحامين العراقيين وأتعاب اللجان والتنظيم والبلديات.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-700 shrink-0 font-sans">
                  {adminFees.toLocaleString('ar-IQ')} مليون د.ع ({ (adminFees * 1000 * 1000).toLocaleString('ar-IQ') } د.ع)
                </span>
              </div>

              {/* Item: Standard Broker Commission */}
              <div className="p-3.5 flex items-start justify-between gap-4 bg-amber-500/5">
                <div className="flex gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-amber-950 block">دلالية وعمولة المكتب المعتمد</span>
                    <span className="text-[10px] text-amber-900 mt-0.5 block">
                      دلالية الوكالة الرسمية المعتمدة قانونياً بمقدار 1% تُدفع للمكتب كأتعاب تعقيب وتوثيق الصفقات.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-805 shrink-0 font-sans">
                  {brokerCommission.toLocaleString('ar-IQ')} مليون د.ع
                </span>
              </div>

            </div>
          </div>

          {/* Highlight Totals banner */}
          <div className="bg-gradient-to-l from-emerald-950 to-slate-900 p-5 rounded-2xl border border-emerald-500/20 text-white space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-350 font-bold">إجمالي الضرائب والرسوم القانونية:</span>
              <span className="text-emerald-400 font-black font-sans">{totalLegalExpenses.toLocaleString('ar-IQ')} مليون د.ع</span>
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-xs font-black text-white">التكلفة الإجمالية الإرشادية للصفقة:</span>
              <div className="text-left">
                <span className="text-sm font-black text-amber-400 font-sans">
                  {grandTotalInvestment.toLocaleString('ar-IQ')} مليون د.ع
                </span>
                <span className="text-[9px] text-slate-300 block font-bold font-sans mt-0.5">
                  ({(price).toLocaleString('ar-IQ')} م عقار + {(totalLegalExpenses + brokerCommission).toFixed(2)} م إضافات)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 rounded-xl p-4 border border-rose-200/20 flex gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-700 shrink-0" />
            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
              تذكير قانوني: يعتمد التحاسب الضريبي في دوائر المثنى على "التقدير المالي" الفعلي للجنة الكشف العقاري لوزارة المالية، وقد يختلف بنسبة بسيطة صعوداً أو نزولاً عن سعر البيع المتفق عليه والمسجل بالإعلان.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>حاسبة الضرائب الرسمية - عقارات المثنى</span>
          <span>آخر تحديث للقوانين: ٢٠٢٦ ⚖</span>
        </div>

      </div>
    </div>
  );
}
