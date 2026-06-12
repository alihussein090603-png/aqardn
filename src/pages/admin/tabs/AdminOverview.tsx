import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Building, Users, Award, Plus, ChevronLeft, Check, X, CheckCircle2, Search, MapPin, Eye, Trash2, UserCheck, Landmark } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Property, Community, DISTRICTS } from '../../../types';
export interface AdminProperty extends Property { status: 'pending' | 'active' | 'sold' | 'rejected'; }


export default function AdminOverview(context: any) {
  
  const { 
    totalPropertiesInApp, totalOfficesCount, totalCommunitiesCount, setShowOfficeModal, 
    setGeneratedCreds, setShowCommunityModal, pendingListings, handleApproveProperty, 
    handleRejectProperty, brokersPool, searchTerm, setSearchTerm, handleToggleBrokerVerification,
    communitiesPool, properties, catalogSearch, setCatalogSearch, catalogDistrict, setCatalogDistrict,
    handleAbsoluteDeleteProperty, actionInProgress, setActiveTab, loading
  } = context;

  const filteredOffices = brokersPool.filter((b: any) => {
    const term = searchTerm.toLowerCase();
    return (b.name || '').toLowerCase().includes(term) || 
           (b.phone || '').includes(term) || 
           (b.location || '').toLowerCase().includes(term) ||
           (b.agencyName || '').toLowerCase().includes(term);
  });

  const filteredCommunities = communitiesPool.filter((c: any) => {
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || 
           (c.phone || '').includes(term) || 
           (c.location || '').toLowerCase().includes(term);
  });

  const filteredCatalogProperties = properties.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesDistrict = catalogDistrict === 'جميع الأقضية' || p.district === catalogDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <>
      {/* SUBPATH A: EXECUTIVE OVERVIEW PANELS AND CARDS */}
              
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Digital Interactive KPI Cards Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    
                    {/* Card 1: Total Published Properties */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-extrabold max-w-xs truncate block">إجمالي العقارات المعمدة بالكامل</span>
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                          <Building className="w-4 h-4 text-emerald-800" />
                        </div>
                      </div>
                      {loading ? (
                        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-4" />
                      ) : (
                        <p className="text-3xl font-black text-emerald-700 tracking-tight mt-4 font-mono">{totalPropertiesInApp}</p>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium leading-relaxed">العروض المعلنة والنشطة حالياً للجمهور.</span>
                    </div>

                    {/* Card 2: Registered Offices */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-extrabold max-w-xs truncate block">المكاتب والوكالات المعتمدة</span>
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                          <Users className="w-4 h-4 text-emerald-800" />
                        </div>
                      </div>
                      {loading ? (
                        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-4" />
                      ) : (
                        <p className="text-3xl font-black text-slate-800 tracking-tight mt-4 font-mono">{totalOfficesCount}</p>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium leading-relaxed">الوسطاء العقاريين المالكين لتراخيص النشر.</span>
                    </div>

                    {/* Card 3: Residential Communities */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-extrabold max-w-xs truncate block">المجمعات السكنية المستقلة</span>
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                          <Award className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                      {loading ? (
                        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-4" />
                      ) : (
                        <p className="text-3xl font-black text-amber-600 tracking-tight mt-4 font-mono">{totalCommunitiesCount}</p>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium leading-relaxed">مجمعات سكنية ومطورين بأرقام مستقلة.</span>
                    </div>

                  </div>

                  {/* Executive Action Quick Access Banner */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden shadow-lg border border-white/5">
                    <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl -z-10 animate-pulse" />
                    <div className="space-y-1.5 text-right flex-1">
                      <h3 className="text-sm sm:text-base font-black text-white">تسهيل عملية نشر البيانات وخدمة المطورين</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        أنشئ فورياً حساباً جديداً بنظام التوليد الموثوق وارسله لصاحبه بضغطة واحدة عبر الواتساب لتنشيط حركات النشر العقاري بالمباني والمكاتب.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 select-none">
                      <button 
                        onClick={() => { setShowOfficeModal(true); setGeneratedCreds(null); }}
                        className="h-11 px-4.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>إضافة مكتب عقاري</span>
                      </button>

                      <button 
                        onClick={() => { setShowCommunityModal(true); setGeneratedCreds(null); }}
                        className="h-11 px-4.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-slate-950" />
                        <span>إضافة مجمع سكني</span>
                      </button>
                    </div>
                  </div>

                  {/* Pending Listings Quick Check Panel */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-150 mb-4">
                      <h3 className="text-xs sm:text-sm font-black text-slate-950">الأعمال والمراجعات الفنية العاجلة</h3>
                      <button 
                        onClick={() => setActiveTab('listings')}
                        className="text-xs font-black text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>مراجعة الطلبات ({pendingListings.length})</span>
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    {pendingListings.slice(0, 2).map((prop) => (
                      <div key={prop.id} className="p-3.5 bg-slate-50/70 border border-slate-150 rounded-xl.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
                        <div className="flex items-center gap-3">
                          <img src={prop.images[0]} alt="" className="w-12 h-12 rounded-lg bg-slate-100 border object-cover" />
                          <div className="space-y-0.5 text-right">
                            <h4 className="text-xs font-black text-slate-900">{prop.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{prop.district} — مساحة {prop.area} م² | {prop.broker.agencyName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleApproveProperty(prop)}
                            className="bg-emerald-800 text-white hover:bg-emerald-950 p-2 text-xs font-bold rounded-lg cursor-pointer transition-all"
                            title="موافقة ونشر مباشر"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRejectProperty(prop.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-2 text-xs rounded-lg cursor-pointer transition-all"
                            title="طرد وpurging"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingListings.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-6">الموقع مستقر: لا توجد طلبات إدراج معلقة.</p>
                    )}
                  </div>

                </motion.div>
              
    </>
  );
}
