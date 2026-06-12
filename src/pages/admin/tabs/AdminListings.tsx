import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Building, Users, Award, Plus, ChevronLeft, Check, X, CheckCircle2, Search, MapPin, Eye, Trash2, UserCheck, Landmark } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Property, Community, DISTRICTS } from '../../../types';
export interface AdminProperty extends Property { status: 'pending' | 'active' | 'sold' | 'rejected'; }


export default function AdminListings(context: any) {
  
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
      {/* SUBPATH B: PENDING REQUESTS TRAFFIC */}
              
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
                    <p className="text-xs font-black text-slate-750">عروض معلقة بانتظار الترخيص والنشر الرسمي</p>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 px-3 py-1 rounded-full">{pendingListings.length} طلبات معلقة</span>
                  </div>

                  {pendingListings.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-3xl space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">كل السجلات مستقرة ونشطّة</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed font-sans">
                          لا توجد أي عروض عقارية معلقة في محافظة المثنى حالياً، كل عروض الدلالين مرخصة بنجاح.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingListings.map((prop) => (
                        <div key={prop.id} className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xs transition-all relative">
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                            <img src={prop.images[0]} alt="" className="w-full sm:w-28 h-20 rounded-xl bg-slate-100 object-cover border" />
                            <div className="space-y-1.5 text-right">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                  prop.transactionType === 'sale' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-250'
                                }`}>
                                  {prop.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold font-sans">| {prop.area} م²</span>
                              </div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-950 leading-snug">{prop.title}</h3>
                              <p className="text-[10px] text-slate-400 font-sans leading-none">مقدم الطلب: <span className="font-bold text-slate-650">{prop.broker.agencyName} ({prop.broker.name})</span> | الهاتف: {prop.broker.phone}</p>
                            </div>
                          </div>

                          <div className="flex sm:flex-row items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-150 pt-4 lg:pt-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">القيمة المعلنة</span>
                              <span className="text-sm font-black text-emerald-800 font-mono">
                                {prop.priceIQD >= 1 ? `${prop.priceIQD} مليون د.ع` : `${prop.priceIQD * 1000} ألف د.ع`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleApproveProperty(prop)}
                                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-3xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>موافقة ونشر</span>
                              </button>
                              <button 
                                onClick={() => handleRejectProperty(prop.id)}
                                className="h-10 w-10 bg-rose-50 hover:bg-rose-100 text-rose-605 text-rose-600 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95"
                                title="تحييد ورفض"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </motion.div>
              
    </>
  );
}
