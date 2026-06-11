import React, { useState } from 'react';
import { 
  Users, Plus, Sparkles, Phone, MessageSquare, CheckCircle, 
  Trash2, Filter, DollarSign, Locate, Minimize, X, ChevronLeft, 
  ArrowUpRight, Copy, Share2, ClipboardCheck, Trash, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../../context/AppStateContext';
import { useAuth } from '../../context/AuthContext';
import { LeadRequest, Property, PropertyCategory, DISTRICTS, NEIGHBORHOODS } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function LeadsMatching(): React.ReactElement {
  const { currentUser } = useAuth();
  const { properties, leads, addLead, deleteLead, updateLeadStatus, showToast, inquiries, deleteInquiry } = useAppState();
  
  // States
  const [activeTab, setActiveTab] = useState<'leads' | 'inquiries'>('leads');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedPropertyId, setCopiedPropertyId] = useState<string | null>(null);

  // Form states for adding a lead
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [requiredCategory, setRequiredCategory] = useState<PropertyCategory | 'all'>('all');
  const [transactionType, setTransactionType] = useState<'sale' | 'rent' | 'all'>('all');
  const [preferredDistrict, setPreferredDistrict] = useState('السماوة');
  const [preferredNeighborhood, setPreferredNeighborhood] = useState('كل المناطق');
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Filter leads to find those belonging to this broker, public system seeker requests, or admin
  const brokerLeads = leads.filter((l) => l.brokerId === currentUser?.id || l.brokerId === 'system' || currentUser?.id === 'b1');
  const activeSelectedLead = leads.find((l) => l.id === selectedLeadId) || brokerLeads[0] || null;

  // Compute matches for a lead
  const getMatchesForLead = (lead: LeadRequest): { property: Property; score: number; matchReasons: string[] }[] => {
    return properties
      .map((p) => {
        let score = 100;
        const matchReasons = [];

        // 1. Category mismatch is a deal breaker unless requested 'all'
        if (lead.requiredCategory !== 'all' && p.category !== lead.requiredCategory) {
          return null;
        } else if (lead.requiredCategory !== 'all') {
          matchReasons.push('نوع العقار متطابق');
        }

        // 2. Transaction type mismatch is a deal breaker unless requested 'all'
        if (lead.transactionType !== 'all' && p.transactionType !== lead.transactionType) {
          return null;
        } else if (lead.transactionType !== 'all') {
          matchReasons.push('طبيعة المعاملة متطابقة');
        }

        // 3. District Match
        if (lead.preferredDistrict !== 'كل الأقضية') {
          if (p.district !== lead.preferredDistrict) {
            score -= 40;
          } else {
            matchReasons.push('القضاء متطابق');
            // Neighborhood Match (only if same district)
            if (lead.preferredNeighborhood !== 'كل المناطق' && lead.preferredNeighborhood !== '') {
              if (p.neighborhood !== lead.preferredNeighborhood) {
                score -= 15;
              } else {
                matchReasons.push('المنطقة/الحي متطابق تماماً');
              }
            }
          }
        }

        // 4. Budget Compatibility
        const price = p.priceIQD; // in Millions of IQD
        const bMin = lead.budgetMin;
        const bMax = lead.budgetMax;

        if (bMin !== null && price < bMin) {
          // Property price is lower than minimum budget - usually fine, but might imply lower quality
          const diffPercent = ((bMin - price) / bMin) * 100;
          if (diffPercent > 35) {
            score -= 20; // major diff
          }
        } else if (bMax !== null && price > bMax) {
          // Exceeds max budget
          const diffPercent = ((price - bMax) / bMax) * 100;
          if (diffPercent > 20) {
            score -= 30; // completely unaffordable
          } else {
            score -= 15; // slightly over budget
          }
        } else {
          matchReasons.push('سعر العقار يقع ضمن الموازنة المدفوعة');
        }

        // 5. Area Constraint
        if (lead.minArea !== null) {
          if (p.area < lead.minArea) {
            const areaDiff = ((lead.minArea - p.area) / lead.minArea) * 100;
            if (areaDiff > 25) {
              score -= 20;
            } else {
              score -= 10;
            }
          } else {
            matchReasons.push('مساحة العقار تلبي طموح العميل');
          }
        }

        // Ensure score doesn't fall below 0
        const finalScore = Math.max(0, score);

        // Only return if match score is reasonably high (e.g. >= 50%)
        if (finalScore < 50) return null;

        return {
          property: p,
          score: finalScore,
          matchReasons
        };
      })
      .filter((m): m is { property: Property; score: number; matchReasons: string[] } => m !== null)
      .sort((a, b) => b.score - a.score);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      showToast('⚠️ يرجى كتابة اسم العميل ورقم هاتفه للاتصال.', 'system');
      return;
    }

    const bMinParsed = budgetMin ? parseFloat(budgetMin) : null;
    const bMaxParsed = budgetMax ? parseFloat(budgetMax) : null;
    const areaParsed = minArea ? parseFloat(minArea) : null;

    const newLead: LeadRequest = {
      id: 'lead_' + Date.now(),
      clientName,
      clientPhone,
      clientWhatsApp: clientPhone.startsWith('07') ? '964' + clientPhone.substring(1) : clientPhone,
      requiredCategory,
      transactionType,
      preferredDistrict,
      preferredNeighborhood,
      budgetMin: bMinParsed,
      budgetMax: bMaxParsed,
      minArea: areaParsed,
      notes,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      brokerId: currentUser?.id || 'b1'
    };

    addLead(newLead);
    setSelectedLeadId(newLead.id);
    
    // Reset form
    setClientName('');
    setClientPhone('');
    setRequiredCategory('all');
    setTransactionType('all');
    setBudgetMin('');
    setBudgetMax('');
    setMinArea('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleShareToClient = (p: Property, lead: LeadRequest) => {
    let priceText = '';
    if (p.priceIQD) {
      priceText = `${p.priceIQD} مليون دينار عراقي`;
    } else if (p.priceUSD) {
      priceText = `$${p.priceUSD.toLocaleString()}`;
    }

    const textToCopy = `السلام عليكم أخي الكريم ${lead.clientName}،
لقد وجدنا عقاراً رائعاً يطابق طلبك المسجل لدينا في عقارات المثنى:
🏡 العنوان الأساسي: ${p.title}
📍 الموقع: قضاء ${p.district} - حي ${p.neighborhood}
📐 المساحة الكلية: ${p.area} متر مربع
💰 السعر المطروح: ${priceText}
📞 للتفاصيل والاتصال المباشر: ${p.broker.phone}

رقم طلبك لدينا للمطابقة الآلية الذكية: #${lead.id}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedPropertyId(p.id);
    showToast('📋 تم نسخ تفاصيل المطابقة ورابط التواصل بنجاح لإرسالها للعميل!', 'system');
    setTimeout(() => setCopiedPropertyId(null), 3000);
  };

  const selectedLeadMatches = activeSelectedLead ? getMatchesForLead(activeSelectedLead) : [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in-50 duration-200 text-right font-sans" dir="rtl">
        
        {/* Banner header title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" />
              <span>نظام الطلبات والمطابقة الآلية</span>
            </h2>
            <p className="text-xs text-slate-500">إدارة طلبات المشترين ومطابقتها فورياً مع العروض العقارية المنشورة</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طلب عميل جديد</span>
          </button>
        </div>

        {/* Informational Widget demonstrating free-tier SaaS compliance and business productivity */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-500/10 rounded-2xl p-5 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-800 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">كيف يعمل نظام المطابقة الآلية؟</h3>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
              عند إدراج أي عميل يبحث عن عقار ذو مواصفات وميزانية محددة، يقوم محرك البيانات بمقارنة الحقول المتطابقة (المنطقة، الميزانية، ومساحة الأرض/البيت) مع مئات العقارات المتاحة على المنصة فورياً، ويرتبها لك بمعدل توافق نسبي مئوي لحسم الصفقات بأقل مجهود.
            </p>
          </div>
        </div>

        {/* Modern Tab Selector Switch */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-6 text-xs font-black transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'leads'
                ? 'border-emerald-850 text-emerald-850 font-extrabold border-b-2 border-emerald-800 bg-slate-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>نظام مطابقة طلبات الشراء ({brokerLeads.length} طلب نشط)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3.5 px-6 text-xs font-black transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-emerald-850 text-emerald-850 font-extrabold border-b-2 border-emerald-800 bg-slate-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>الرسائل والطلبات الواردة الفورية ({inquiries.filter(i => i.ownerId === currentUser?.id || currentUser?.id === 'b1' || !i.ownerId).length} رسالة)</span>
          </button>
        </div>

        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1 text-right">
                <span className="text-sm font-black text-slate-900 block">مركز الرسائل والاستفسارات المباشرة</span>
                <p className="text-[11px] text-slate-500">مراسلات حية مرسلة من الزوار بخصوص إعلانات عروضك العقارية النشطة.</p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold font-mono">
                {inquiries.filter(i => i.ownerId === currentUser?.id || currentUser?.id === 'b1' || !i.ownerId).length} رسائل واردة
              </div>
            </div>

            {inquiries.filter(i => i.ownerId === currentUser?.id || currentUser?.id === 'b1' || !i.ownerId).length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-50 text-slate-450 rounded-full flex items-center justify-center mx-auto text-xl">
                  📨
                </div>
                <span className="text-sm block font-black">لا توجد رسائل واردة حالياً لمكتبك.</span>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  عندما يتصفح أحد الباحثين عن البيوت والأراضي إعلاناتك، سيظهر لديه نموذج مراسلة فورية مباشر. تواصل معه لخدمته وإتمام صفقاتك السعيدة!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inquiries.filter(i => i.ownerId === currentUser?.id || currentUser?.id === 'b1' || !i.ownerId).map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between gap-4 relative text-right"
                  >
                    <button
                      onClick={() => deleteInquiry(inq.id)}
                      className="absolute top-4 left-4 p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                      title="حذف الرسالة"
                    >
                      <Trash className="w-4 h-4" />
                    </button>

                    <div className="space-y-3 text-right">
                      {/* Badge pointing to property name */}
                      <div className="inline-block bg-emerald-500/10 text-emerald-900 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg">
                        🎯 العقار المستعلم عنه: {inq.propertyTitle}
                      </div>

                      <div className="space-y-1 text-right">
                        <p className="text-xs font-black text-slate-950 flex items-center justify-end gap-1.5">
                          <span>المرسل: {inq.clientName}</span>
                          <User className="w-4 h-4 text-emerald-800" />
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 font-mono text-left">تاريخ الاستلام: {inq.createdAt}</p>
                      </div>

                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold text-right shadow-xs">
                        "{inq.messageText}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <a
                        href={`tel:${inq.clientPhone}`}
                        className="w-full text-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>اتصال هاتفي</span>
                      </a>

                      <a
                        href={`https://wa.me/964${inq.clientPhone.startsWith('0') ? inq.clientPhone.substring(1) : inq.clientPhone}?text=${encodeURIComponent(
                          `السلام عليكم أخي الكريم ${inq.clientName}، مع حضرتك مكتب العقارات من منصة عقارات المثنى دوت كوم. يسعدنا الإجابة عن استفسارك بخصوص عقار: ${inq.propertyTitle}. كيف يمكننا مساعدتك اليوم؟`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>واتساب فوري</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Right Column (Col span 5): Lead List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <span className="text-[10px] text-slate-400 font-extrabold block pb-3 border-b border-slate-50">قائمة العملاء وطلباتهم ({brokerLeads.length})</span>
              
              {brokerLeads.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <span className="text-sm block font-bold">لا يوجد طلبات مسجلة حالياً تابعة لمكتبك.</span>
                  <p className="text-[11px] text-slate-500">قم بتسجيل طلبات العملاء الذين يتواصلون معك لكي تجد لهم عقارات مطابقة آلياً وبصورة فورية.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                  {brokerLeads.map((lead) => {
                    const matchesCount = getMatchesForLead(lead).length;
                    const isSelected = lead.id === selectedLeadId;

                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`p-3.5 my-1.5 rounded-xl transition-all cursor-pointer text-right space-y-2 border ${
                          isSelected 
                            ? 'bg-emerald-500/5 border-emerald-500/40 shadow-xs' 
                            : 'border-transparent hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-grow">
                            <span className="text-xs font-black text-slate-900 block truncate">{lead.clientName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">تاريخ التسجيل: {lead.createdAt}</span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                            lead.status === 'closed' 
                              ? 'bg-slate-100 text-slate-500 line-through' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {lead.status === 'closed' ? 'مكتمل الصفقة' : 'قيد المتابعة'}
                          </span>
                        </div>

                        {/* Request Summary Badge Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black">
                            {lead.requiredCategory === 'house' ? 'منزل' : lead.requiredCategory === 'apartment' ? 'شقة' : lead.requiredCategory === 'land' ? 'أرض زراعية/سكني' : 'أي تصنيف'}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black">
                            {lead.transactionType === 'sale' ? 'شراء' : lead.transactionType === 'rent' ? 'إيجار' : 'شراء أو إيجار'}
                          </span>
                          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black font-sans">
                            {lead.preferredDistrict}
                          </span>
                        </div>

                        {/* Spark matching stats */}
                        <div className="flex items-center justify-between text-[11px] border-t border-slate-100/60 pt-2 font-sans mt-2">
                          <span className="text-slate-500">عقارات متطابقة مرشحة:</span>
                          <span className={`font-black flex items-center gap-1 ${matchesCount > 0 ? 'text-emerald-700 animate-pulse' : 'text-slate-400'}`}>
                            {matchesCount > 0 ? `${matchesCount} عروض متاحة` : 'لا يوجد عروض متوافقة'}
                            <ChevronLeft className="w-3 h-3 shrink-0" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Left Column (Col span 7): Matching Engine Results for Selected Lead */}
          <div className="lg:col-span-7 space-y-5">
            {activeSelectedLead ? (
              <div className="space-y-5">
                
                {/* Selected Customer Card File Summary details */}
                <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 rounded-2xl p-5 text-white space-y-4 shadow-xl border border-white/5">
                  <div className="flex items-start justify-between pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-400 font-extrabold">الملف العقاري النشط للعميل</p>
                      <h3 className="text-base font-black text-white">{activeSelectedLead.clientName}</h3>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => deleteLead(activeSelectedLead.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-350 hover:text-rose-400 transition-colors cursor-pointer border border-white/5"
                        title="حذف طلب العميل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {activeSelectedLead.status !== 'closed' && (
                        <button
                          onClick={() => updateLeadStatus(activeSelectedLead.id, 'closed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-[10px] sm:text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>إغلاق الصفقة كمكتملة</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer needs layout details */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1">الموقع الجغرافي المطلوب:</span>
                      <p className="font-extrabold text-white flex items-center gap-1 justify-start">
                        <Locate className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>منطقة {activeSelectedLead.preferredDistrict} - {activeSelectedLead.preferredNeighborhood}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1">الميزانية المرصودة:</span>
                      <p className="font-extrabold text-amber-300 flex items-center gap-1 justify-start">
                        <DollarSign className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>
                          {activeSelectedLead.budgetMin ? `من ${activeSelectedLead.budgetMin}` : ''} 
                          {activeSelectedLead.budgetMax ? ` إلى ${activeSelectedLead.budgetMax}` : 'مفتوحة'} مليون د.ع
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1">المساحة الدنيا المرجوة:</span>
                      <p className="font-extrabold text-white flex items-center gap-1 justify-start">
                        <Minimize className="w-3.5 h-3.5 text-emerald-405 shrink-0" />
                        <span>{activeSelectedLead.minArea ? `${activeSelectedLead.minArea} متر مربع وأكثر` : 'مفتوحة'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1">طريقة الاتصال بالعميل:</span>
                      <div className="flex items-center gap-1.5 justify-start mt-0.5">
                        <a
                          href={`tel:${activeSelectedLead.clientPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{activeSelectedLead.clientPhone}</span>
                        </a>
                        {activeSelectedLead.clientWhatsApp && (
                          <a
                            href={`https://wa.me/${activeSelectedLead.clientWhatsApp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600/30 text-green-400 hover:bg-green-600/50 p-1 rounded transition-colors"
                            title="تواصل واتساب مباشر"
                          >
                            <MessageSquare className="w-3 h-3 text-green-400 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeSelectedLead.notes && (
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-slate-300 text-xs leading-relaxed font-sans mt-3">
                      <strong className="text-emerald-300 font-extrabold block mb-1">ملاحظات تتبع الصفقة:</strong>
                      {activeSelectedLead.notes}
                    </div>
                  )}
                </div>

                {/* Simulated AI Match Engine Results (Matche Results Header with Score ratings) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-700 rounded-full shrink-0" />
                      <span>عقارات متوافقة من نظام المطابقة الآلية ({selectedLeadMatches.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">مرتبة حسب قوة التوافق والمواءمة</span>
                  </div>

                  {selectedLeadMatches.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center text-slate-400 text-xs space-y-2">
                      <Filter className="w-8 h-8 text-slate-200 mx-auto" strokeWidth={1.5} />
                      <p className="font-extrabold font-sans">لم نجد حالياً عقارات تتطابق بدقة مع مواصفات وميزانية العميل.</p>
                      <p className="text-[10px] text-slate-500">جرب توسيع مجالات الميزانية أو الأقضية العقارية لتلقي مطابقات جزئية.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedLeadMatches.map(({ property, score, matchReasons }) => {
                        const isCopied = copiedPropertyId === property.id;
                        
                        return (
                          <div 
                            key={property.id}
                            className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-right space-y-4"
                          >
                            {/* Score match indicator ribbon badge */}
                            <div className="absolute top-0 left-0">
                              <span className={`text-[10px] font-black px-3 py-1.5 rounded-br-2xl inline-block ${
                                score >= 85 
                                  ? 'bg-emerald-600 text-white shadow-emerald-500/10 shadow-lg' 
                                  : score >= 70
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-amber-500 text-slate-950'
                              }`}>
                                {score}% متطابق عالي
                              </span>
                            </div>

                            {/* Property Info metadata row */}
                            <div className="flex gap-4 pt-3">
                              <div className="flex-1 min-w-0 space-y-1.5 text-right">
                                <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-black font-sans shrink-0 uppercase">
                                  {property.transactionType === 'sale' ? 'للبيع بمحافظة المثنى' : 'للإيجار بأقضية المثنى'}
                                </span>
                                
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug truncate">
                                  {property.title}
                                </h4>

                                <p className="text-[11px] text-slate-500 font-sans flex items-center gap-1 justify-start">
                                  <Locate className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{property.district} - {property.neighborhood}</span>
                                </p>
                              </div>

                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-3xs">
                                <img 
                                  src={property.images[0]} 
                                  alt={property.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>

                            {/* Compatibility reasons analysis */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                              <span className="text-[9px] text-slate-400 font-extrabold block">تحليل مطابقة المعايير:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {matchReasons.map((reason, idx) => (
                                  <span key={idx} className="bg-emerald-500/10 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-right">
                                    <span className="w-1 h-1 bg-emerald-600 rounded-full shrink-0" />
                                    <span>{reason}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions bar for closing the deal */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                              
                              {/* Price tags block */}
                              <div className="text-right space-y-0.5 font-sans">
                                <span className="text-[10px] text-slate-450 block font-bold">مبلغ المعاملة العقارية المطروح:</span>
                                <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                                  {property.priceIQD ? `${property.priceIQD} مليون دينار عراقي` : `$${property.priceUSD.toLocaleString()}`}
                                </span>
                              </div>

                              {/* Collaborative contact actions */}
                              <div className="flex gap-2">
                                
                                <button
                                  onClick={() => handleShareToClient(property, activeSelectedLead)}
                                  className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    isCopied 
                                      ? 'bg-emerald-600 text-white' 
                                      : 'bg-emerald-800 hover:bg-emerald-950 text-white'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <ClipboardCheck className="w-4 h-4 text-white shrink-0" />
                                      <span>تم نسخ العرض</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share2 className="w-4 h-4 shrink-0" />
                                      <span>مشاركة ومطابقة</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={`tel:${property.broker.phone}`}
                                  className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 min-h-[44px] rounded-xl flex items-center justify-center gap-1 border border-slate-150 text-xs font-black"
                                  title="الاتصال بالمكتب العقاري مالك العرض للتنسيق المشترك"
                                >
                                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>تنسيق عمولة</span>
                                </a>

                              </div>

                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center text-slate-450 text-xs space-y-2">
                <Users className="w-10 h-10 text-slate-200 mx-auto" strokeWidth={1.5} />
                <p className="font-extrabold">منطقة استعراض المطابقات خالية تماماً.</p>
                <p className="text-[10px] text-slate-500">اختر طلب عميل من القائمة الجانبية أو قم بإضافة طلب جديد لرؤية مطابقات النظام الذكي فوراً.</p>
              </div>
            )}
          </div>

        </div>
        )}

      </div>

      {/* 4. Overlay Modal: Add Client Lead and Request parameters */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden p-6 text-right space-y-5 shadow-2xl border border-slate-100"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-emerald-800" />
                    <span>تسجيل طلب عميل ومطابقة آلية</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">إدخال متطلبات البحث لمشتري أو مستأجر لتفعيل معالج المطابقات البيعية والعمولات</p>
                </div>

                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form elements */}
              <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-sans">
                
                {/* Name & Phone Info Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">اسم العميل الكلي *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="مثال: المهندس سجاد الحميداوي"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">رقم هاتف العميل *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="مثال: 07801234567"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-left placeholder:text-right text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Filter and matching choices category/type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">تصنيف العقار المرجو</label>
                    <select
                      value={requiredCategory}
                      onChange={(e) => setRequiredCategory(e.target.value as PropertyCategory | 'all')}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none"
                    >
                      <option value="all">أي تصنيف عقاري</option>
                      <option value="house">منزل مستقل (بيت)</option>
                      <option value="apartment">شقة سكنية</option>
                      <option value="commercial">مبنى أو محل تجاري</option>
                      <option value="land">أرض (زراعي/سكني/فرص)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">نوع الصفقة المطلوبة</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as 'sale' | 'rent' | 'all')}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none"
                    >
                      <option value="all">شراء أو إيجار</option>
                      <option value="sale">شراء وتمليك للبيع</option>
                      <option value="rent">إيجار (شهري/سنوي)</option>
                    </select>
                  </div>
                </div>

                {/* Geolocation dropdown matching DISTRICTS and NEIGHBORHOODS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">القضاء المحبذ</label>
                    <select
                      value={preferredDistrict}
                      onChange={(e) => {
                        setPreferredDistrict(e.target.value);
                        setPreferredNeighborhood('كل المناطق');
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-extrabold block">المنطقة أو الحي السكني</label>
                    <select
                      value={preferredNeighborhood}
                      onChange={(e) => setPreferredNeighborhood(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs"
                    >
                      <option value="كل المناطق">كل المناطق</option>
                      {NEIGHBORHOODS[preferredDistrict]?.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget range parameters & Area minima */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-slate-600 font-extrabold block">ميزانية دنيا (مليون)</label>
                    <input 
                      type="number" 
                      placeholder="عتبة الأقل"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-slate-600 font-extrabold block">ميزانية قصوى (مليون)</label>
                    <input 
                      type="number" 
                      placeholder="الحد الأقصى"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-slate-600 font-extrabold block">المساحة الأدنى (م²)</label>
                    <input 
                      type="number" 
                      placeholder="الحد الأدنى م²"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Notes and additional guidelines */}
                <div className="space-y-1">
                  <label className="text-slate-600 font-extrabold block">ملاحظات إضافية وتفاصيل</label>
                  <textarea 
                    placeholder="مثال: يفضل أن يحتوي البيت على ملحق حديقة صغيرة أو كراج سيارات مزدوج ويكون البناء درجة أولى ممتاز."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-right p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500/35 focus:outline-none"
                  />
                </div>

                {/* Submit actions */}
                <div className="pt-4 flex justify-end gap-2 text-xs font-bold border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-850 hover:bg-slate-50 cursor-pointer"
                  >
                    تراجع وإلغاء
                  </button>

                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    حفظ الطلب وتشغيل معالج المطابقة
                  </button>
                </div>

              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
