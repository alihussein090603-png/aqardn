import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Building, Users, Award, Plus, ChevronLeft, Check, X, CheckCircle2, Search, MapPin, Eye, Trash2, UserCheck, Landmark } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Property, Community, DISTRICTS } from '../../../types';
export interface AdminProperty extends Property { status: 'pending' | 'active' | 'sold' | 'rejected'; }


export default function AdminCatalog(context: any) {
  
  const { 
    totalPropertiesInApp, totalOfficesCount, totalCommunitiesCount, setShowOfficeModal, 
    setGeneratedCreds, setShowCommunityModal, pendingListings, handleApproveProperty, 
    handleRejectProperty, brokersPool, searchTerm, setSearchTerm, handleToggleBrokerVerification,
    communitiesPool, properties, catalogSearch, setCatalogSearch, catalogDistrict, setCatalogDistrict,
    handleAbsoluteDeleteProperty, actionInProgress, setActiveTab
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
      {/* SUBPATH E: EXECUTIVE STANDARD GENERAL CATALOG CONTROL */}
              
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 animate-in fade-induration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
                    <div className="space-y-0.5 text-right">
                      <h3 className="text-sm sm:text-base font-black text-slate-900">سجل المعروضات المنشورة — الرقابة الكلية</h3>
                      <p className="text-xs text-slate-500 font-medium">تفتيش المطبوعات وإقناع الوسطاء بمسح العقارات المخالفة أو منتهية الصلاحية فورياً.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:max-w-xl justify-end">
                      
                      {/* Search box */}
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="ابحث بالاسم أو وصف العقارات..."
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-800 text-right font-sans shadow-3xs"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <Search className="w-4 h-4" />
                        </div>
                      </div>

                      {/* District filters list */}
                      <select
                        value={catalogDistrict}
                        onChange={(e) => setCatalogDistrict(e.target.value)}
                        className="py-2.5 px-3 bg-white border border-slate-250 text-slate-700 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 font-bold select-none cursor-pointer"
                      >
                        <option value="جميع الأقضية">جميع الأقضية</option>
                        {DISTRICTS.filter(d => d !== 'كل الأقضية').map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                    </div>
                  </div>

                  {/* Grid layout containing all high-fidelity cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCatalogProperties.map((p) => {
                      const hasPriceIQD = p.priceIQD && p.priceIQD > 0;
                      const hasPriceUSD = p.priceUSD && p.priceUSD > 0;
                      
                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                          <div className="relative h-44 bg-slate-100 border-b">
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                              <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg ${
                                p.transactionType === 'sale' ? 'bg-amber-400 text-slate-950 font-sans shadow-3xs' : 'bg-emerald-600 text-white font-sans shadow-3xs'
                              }`}>
                                {p.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
                              </span>
                              {p.isPremium && (
                                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-lg shadow-3xs text-center border border-amber-300">مميز</span>
                              )}
                            </div>
                            
                            <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 text-white text-[9px] font-bold px-2 rounded-lg py-1 backdrop-blur-xs">
                              {p.category === 'house' ? 'منزل مستقل' : p.category === 'apartment' ? 'شقة مستقلة' : p.category === 'land' ? 'عرصة / أرض' : 'تجاري'}
                            </div>
                          </div>

                          {/* Body with exact requested card statistics fields */}
                          <div className="p-4.5 space-y-3.5 text-right flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="text-xs sm:text-sm font-black text-slate-950 leading-snug line-clamp-2">{p.title}</h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold font-sans">
                                <MapPin className="w-3.5 h-3.5 text-emerald-805" />
                                <span>{p.district} — {p.neighborhood || 'وسط المدينة'}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 w-full space-y-1 text-right font-sans">
                              {hasPriceIQD && (
                                <p className="text-xs font-bold text-slate-500">
                                  السعر (د.ع): <span className="text-emerald-805 font-black text-sm font-mono mr-1">{p.priceIQD} مليون دينار</span>
                                </p>
                              )}
                              {hasPriceUSD && (
                                <p className="text-xs font-bold text-slate-500">
                                  السعر (دولار): <span className="text-amber-700 font-black text-sm font-mono mr-1">${p.priceUSD.toLocaleString()}</span>
                                </p>
                              )}
                              <p className="text-xs font-bold text-slate-500">
                                المساحة الإجمالية: <span className="text-slate-900 font-black font-sans shrink-0 mr-1">{p.area} م²</span>
                              </p>
                            </div>

                            {/* Advertiser Info and Deletion controls */}
                            <div className="border-t border-slate-150/70 pt-3 flex items-center justify-between gap-3 font-sans">
                              <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 block font-bold leading-none mb-1">الجهة المعلنة</span>
                                <span className="text-[10px] font-bold text-slate-800 truncate block max-w-[150px]" title={p.broker?.agencyName || p.broker?.name}>
                                  {p.broker?.agencyName || p.broker?.name || 'أفراد / مواطنين'}
                                </span>
                              </div>

                              <button
                                onClick={() => handleAbsoluteDeleteProperty(p.id, p.title)}
                                disabled={actionInProgress === p.id}
                                className="h-9 px-3.5 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 text-red-600 font-black rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-3xs"
                                title="إزالة إدارية عاجلة ومطلقة"
                              >
                                {actionInProgress === p.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>حذف إداري</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                    {filteredCatalogProperties.length === 0 && (
                      <div className="col-span-full py-16 text-center space-y-2 text-slate-400">
                        <Building className="w-10 h-10 mx-auto text-slate-200" />
                        <p className="text-xs font-bold font-sans">لا توجد معروضات تطابق خيارات ومصطلحات البحث.</p>
                      </div>
                    )}
                  </div>

                </motion.div>
    </>
  );
}
