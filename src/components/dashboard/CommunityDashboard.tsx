/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, Eye, Plus, Trash2, CheckCircle, AlertCircle, 
  Sparkles, MapPin, Phone, MessageSquare, Edit2, 
  Upload, Save, Layers, Check, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, InvestmentCommunity, Broker } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { getDynamicCommunities } from '../../data/communitiesMock';

const BROCHURE_PRESETS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
];

export default function CommunityDashboard() {
  const { currentUser, currentUserRecord } = useAuth();
  const { properties, addProperty, deleteProperty, markAsSold, showToast } = useAppState();

  const [activeTab, setActiveTab] = useState<'listings' | 'brochure' | 'analytics'>('listings');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  
  // Load community metadata
  const [myCommunity, setMyCommunity] = useState<InvestmentCommunity | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProgress, setEditProgress] = useState(90);
  const [editDistrict, setEditDistrict] = useState('السماوة');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editBlocksStr, setEditBlocksStr] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnitNo, setNewUnitNo] = useState('');
  const [newUnitBlock, setNewUnitBlock] = useState('');
  const [newUnitCategory, setNewUnitCategory] = useState<'house' | 'apartment'>('house');
  const [newUnitArea, setNewUnitArea] = useState('150');
  const [newUnitPriceIQD, setNewUnitPriceIQD] = useState('150');
  const [newUnitPriceUSD, setNewUnitPriceUSD] = useState('');
  const [newUnitRooms, setNewUnitRooms] = useState('3');
  const [newUnitBathrooms, setNewUnitBathrooms] = useState('2');
  const [newUnitFloors, setNewUnitFloors] = useState('2');
  const [newUnitFeatures, setNewUnitFeatures] = useState<string[]>(['أمن وحراسة ٢٤ ساعة', 'خط كهرباء ذهبي']);
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [newUnitStatus, setNewUnitStatus] = useState<'available' | 'reserved' | 'sold'>('available');

  // Load community on mount or when user record updates
  useEffect(() => {
    const list = getDynamicCommunities();
    const emailStr = (currentUserRecord?.email || currentUser?.id || '').toLowerCase();
    
    // Attempt match
    let match = list.find(c => c.id === currentUser?.id || c.phone === currentUserRecord?.phone);
    if (!match) {
      const fallbackId = emailStr.includes('narjis') ? 'comm-narjis' : emailStr.includes('tabarak') ? 'comm-tabarak' : 'comm-sudeer';
      match = list.find(c => c.id === fallbackId) || list[0];
    }

    if (match) {
      setMyCommunity(match);
      setEditName(match.name);
      setEditDesc(match.description);
      setEditPhone(match.phone);
      setEditProgress(match.progress);
      setEditDistrict(match.district);
      setEditNeighborhood(match.neighborhood);
      setEditCoverImage(match.coverImage);
      setEditBlocksStr(match.blocks.join('، '));
    }
  }, [currentUser, currentUserRecord]);

  if (!myCommunity) {
    return (
      <div className="py-20 text-center text-slate-500 font-sans">
        <div className="w-10 h-10 border-4 border-emerald-500/10 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
        <p>جاري مزامنة بيانات المجمع الاستثماري وسجلاته الكودية...</p>
      </div>
    );
  }

  // Filter listings belonging to this community
  const myUnits = properties.filter(p => p.belongsToCommunity && p.communityId === myCommunity.id);
  const filteredUnits = selectedBlockFilter === 'all' 
    ? myUnits 
    : myUnits.filter(u => u.blockIdentifier === selectedBlockFilter);

  // Statistics
  const totalAddedCount = myUnits.length;
  const availableCount = myUnits.filter(u => u.availabilityStatus === 'available' || !u.status || u.status === 'active').length;
  const reservedCount = myUnits.filter(u => u.availabilityStatus === 'reserved').length;
  const soldCount = myUnits.filter(u => u.availabilityStatus === 'sold' || u.status === 'sold').length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedBlocks = editBlocksStr
      .split(/[،,ـ]/)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const updated: Partial<InvestmentCommunity> = {
      id: myCommunity.id,
      name: editName,
      description: editDesc,
      phone: editPhone,
      whatsapp: editPhone.replace('+', ''),
      progress: editProgress,
      district: editDistrict,
      neighborhood: editNeighborhood,
      coverImage: editCoverImage,
      blocks: parsedBlocks.length > 0 ? parsedBlocks : myCommunity.blocks
    };

    // Save in cached communities list
    const cached = localStorage.getItem('aqarat_cached_communities');
    let list = [];
    if (cached) {
      try { list = JSON.parse(cached); } catch (err) {}
    }

    const existIdx = list.findIndex((c: any) => c.id === myCommunity.id);
    if (existIdx > -1) {
      list[existIdx] = { ...list[existIdx], ...updated };
    } else {
      list.push({ ...myCommunity, ...updated });
    }

    localStorage.setItem('aqarat_cached_communities', JSON.stringify(list));
    setMyCommunity({ ...myCommunity, ...updated } as InvestmentCommunity);
    setIsEditingProfile(false);
    showToast('✨ تم تعديل وحفظ البروشور التعريفي وعموم الهوية الاستثمارية بنجاح!', 'system');
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitNo || !newUnitBlock) {
      alert('يرجى تحديد رقم الوحدة والبلوك التابع لها.');
      return;
    }

    const priceIQD = Number(newUnitPriceIQD) || 150;
    const priceUSD = Number(newUnitPriceUSD) || Math.round(priceIQD * 1000000 / 1500);

    // Create unique properties array representation as Broker
    const compBroker: Broker = {
      id: myCommunity.id,
      name: myCommunity.name,
      avatar: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=150&q=80',
      phone: myCommunity.phone,
      whatsapp: myCommunity.whatsapp,
      agencyName: myCommunity.name,
      rating: 5.0,
      isVerified: true,
      activeListingsCount: totalAddedCount + 1
    };

    const newUnitProperty: Property = {
      id: `prop-dynamic-comp-${myCommunity.id}-${Date.now()}`,
      title: `${newUnitCategory === 'house' ? 'فيلا راقية' : 'شقة متكاملة التأسيسات'} رقم ${newUnitNo} في ${myCommunity.name} (${newUnitBlock})`,
      description: newUnitDesc || `وحدة سكنية عقارية بمساحة متميزة وتصميم هندسي فاخر تتبع ${newUnitBlock} داخل أحد أرقى المجمعات الاستثمارية الحاصلة على نسب إنجاز مرتفعة بالمنطقة.`,
      priceIQD,
      priceUSD,
      category: newUnitCategory,
      transactionType: 'sale',
      district: myCommunity.district,
      neighborhood: myCommunity.neighborhood,
      addressDetails: `داخل المجمع، ${newUnitBlock}، شقة/فيلا رقم ${newUnitNo}`,
      area: Number(newUnitArea) || 150,
      rooms: Number(newUnitRooms) || 3,
      bathrooms: Number(newUnitBathrooms) || 2,
      floors: Number(newUnitFloors) || 2,
      images: [
        newUnitCategory === 'house' 
          ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ],
      isPremium: true,
      broker: compBroker,
      features: newUnitFeatures,
      createdAt: new Date().toISOString().split('T')[0],
      views: 12,
      belongsToCommunity: true,
      communityId: myCommunity.id,
      blockIdentifier: newUnitBlock,
      unitNumber: newUnitNo,
      availabilityStatus: newUnitStatus,
      status: newUnitStatus === 'sold' ? 'sold' : 'active'
    };

    addProperty(newUnitProperty);
    setShowAddModal(false);

    // Reset fields
    setNewUnitNo('');
    setNewUnitDesc('');
    showToast(`🎉 تم إدراج الشقة/الفيلا رقم ${newUnitNo} وبثها بنجاح داخل ${newUnitBlock}!`, 'system');
  };

  const handleToggleState = (id: string, currentStatus: string) => {
    const list = ['available', 'reserved', 'sold'];
    const currentIdx = list.indexOf(currentStatus || 'available');
    const nextStatus = list[(currentIdx + 1) % list.length] as 'available' | 'reserved' | 'sold';

    // Update global state
    markAsSold(id, nextStatus === 'sold');
    
    // We also map availabilityStatus property specifically
    const propIdx = properties.findIndex(p => p.id === id);
    if (propIdx > -1) {
      properties[propIdx].availabilityStatus = nextStatus;
      properties[propIdx].status = nextStatus === 'sold' ? 'sold' : 'active';
    }

    showToast(`✅ تم تعديل حالة الوحدة فورياً لـ: ${
      nextStatus === 'available' ? 'متوفرة للجمهور' : nextStatus === 'reserved' ? 'محجوزة مؤقتاً' : 'مباعة بالكامل'
    }`, 'system');
  };

  return (
    <div className="space-y-8 animate-fade-in text-right font-sans" dir="rtl">
      
      {/* 1. Header Bar with dynamic info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">بوابة أعمال المطور العقاري</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">لوحة تحكم: {myCommunity.name}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
            <MapPin className="w-4 h-4 text-emerald-800" />
            <span>محافظة المثنى، قضاء {myCommunity.district} - حي {myCommunity.neighborhood}</span>
          </p>
        </div>
        
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <Edit2 className="w-4 h-4 text-emerald-700" />
            <span>تعديل بروفايل المجمع</span>
          </button>

          <button
            onClick={() => {
              setNewUnitBlock(myCommunity.blocks[0] || '');
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-800/10 transition-all active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>إدراج وحدة سكنية جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Panoramic Brochure Display Area */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-4 relative overflow-hidden">
        <div className="absolute top-2 right-2 z-10 bg-emerald-900/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-[10px] font-black flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>الهوية العينية - كارت الاستثمار والبروشور</span>
        </div>
        
        <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
          <img 
            src={myCommunity.coverImage} 
            alt={myCommunity.name} 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900">وصف الهوية الاستثمارية المنشور للجمهور:</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-2xl">{myCommunity.description}</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shrink-0 text-center space-y-1 min-w-[140px]">
            <span className="text-[10px] text-slate-400 font-black block">إنجاز البناء الكلي:</span>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-lg font-black text-emerald-800 font-mono">{myCommunity.progress}%</span>
              <div className="w-12 h-2 bg-slate-250 rounded-full overflow-hidden shrink-0 mt-0.5">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${myCommunity.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Micro Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
            <Building className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-right font-sans">
            <span className="text-[10px] text-slate-400 font-black block">إجمالي الوحدات المدرجة</span>
            <span className="text-xl font-bold font-mono text-slate-800">{totalAddedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
            <Check className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-0.5 text-right font-sans">
            <span className="text-[10px] text-emerald-700/80 font-black block">الوحدات المعروضة الآن</span>
            <span className="text-xl font-bold font-mono text-emerald-800">{availableCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-0.5 text-right font-sans">
            <span className="text-[10px] text-amber-700/80 font-black block">الوحدات المحجوزة مؤقتاً</span>
            <span className="text-xl font-bold font-mono text-amber-600">{reservedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5 text-right font-sans">
            <span className="text-[10px] text-slate-300 font-black block">الوحدات المباعة بنجاح</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{soldCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Filter list by Blocks */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
        
        {/* Unit browser header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900">سجل الوحدات المعمارية وشق فيلات المجمع</h3>
            <p className="text-[11px] text-slate-400 font-bold">تحديد وحوكمة الحالات الإنشائية للبيوت والشقق بنقرة سريعة</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black text-slate-400 whitespace-nowrap">عزل بالبلوكات:</span>
            <button
              onClick={() => setSelectedBlockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border whitespace-nowrap ${
                selectedBlockFilter === 'all'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350'
              }`}
            >
              جميع الكتل والبلوكات ({totalAddedCount})
            </button>
            {myCommunity.blocks.map(b => {
              const blkCount = myUnits.filter(u => u.blockIdentifier === b).length;
              return (
                <button
                  key={b}
                  onClick={() => setSelectedBlockFilter(b)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border whitespace-nowrap ${
                    selectedBlockFilter === b
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350'
                  }`}
                >
                  {b} ({blkCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Units List Table */}
        {filteredUnits.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-sm mx-auto p-4 text-slate-400">
            <Building className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
            <h4 className="text-xs font-extrabold text-slate-700">لا توجد وحدات تابعة للبلوك النشط حالياً</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              انقر فوق زر "إضافة وحدة سكنية جديدة" في الأعلى لإدراج شقق وفلل وعرضها لجمهور المنصة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-550 border-b border-slate-150 font-black">
                  <th className="p-4">رقم الوحدة العقارية</th>
                  <th className="p-4">البلوك / الكتلة</th>
                  <th className="p-4">النوع والمساحة</th>
                  <th className="p-4">سعر البيع المعزز</th>
                  <th className="p-4">أولوية الترخيص</th>
                  <th className="p-4 text-center">أمر تبديل الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUnits.map((u) => {
                  const availability = u.availabilityStatus || 'available';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="font-extrabold text-slate-900 text-sm font-mono">رقم {u.unitNumber}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 font-extrabold px-2 py-0.5 rounded text-[10px]">
                          {u.blockIdentifier}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-black text-slate-900">{u.category === 'house' ? '🏡 منزل متكامل' : '🏢 شقة سكنية'}</p>
                          <p className="text-[10px] text-slate-400 font-extrabold font-sans font-mono">{u.area} م² مساحة صافية</p>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-800 text-sm">
                        {u.priceIQD} مليون د.ع
                      </td>

                      <td className="p-4">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>مسجل طابو</span>
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleState(u.id, availability)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-black cursor-pointer inline-flex items-center gap-1 transition-all hover:scale-102 ${
                            availability === 'available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : availability === 'reserved'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200 font-bold'
                          }`}
                        >
                          {availability === 'available' ? '✓ متوفر ومعروض' : availability === 'reserved' ? '⏳ محجوز مؤقتاً' : '🔒 مباع ومكتمل'}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من رغبتك بحذف هذه الوحدة وإلغاء إدراجها؟')) {
                              deleteProperty(u.id);
                              showToast('🚪 تم إزالة الوحدة وحذف كارت العرض بنجاح.', 'system');
                            }
                          }}
                          title="حذف الوحدة نهائياً"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 5. EDIT PROFILE WRAPPER MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span>تعديل بروشور الهوية الاستثمارية للمجمع</span>
                </h3>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  إغلاق ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-700">
                
                <div className="space-y-1.5">
                  <label className="block font-black text-slate-800">اسم المجمع اللائق استثمارياً</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-slate-800">وصف المجمع السكني والمميزات العامة للتصميم المعماري</label>
                  <textarea 
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50 resize-none font-semibold text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">هيئة الاستثمار - القضاء</label>
                    <input 
                      type="text" 
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">الهيئة الجيو-منطقية للحي</label>
                    <input 
                      type="text" 
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">معدل تقدير الإنجاز الإنشائي (%)</label>
                    <input 
                      type="number" 
                      min="10"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(Number(e.target.value))}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">رقم هاتف المبيعات والاستفسار</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50 font-mono text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-slate-800">نظام تقسيم البلوكات (افصل بينها بفارزة)</label>
                  <input 
                    type="text" 
                    value={editBlocksStr}
                    placeholder="البلوك A، البلوك B، البلوك C"
                    onChange={(e) => setEditBlocksStr(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50"
                  />
                </div>

                {/* Cover Image selector */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block font-black text-slate-800">بروشور الهوية الاستثمارية المعتمد (رابط صورة بديل)</label>
                  <input 
                    type="text" 
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-slate-800 focus:border-emerald-850 bg-slate-50/50 font-mono"
                  />
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold block">اختر من بروشورات وتصاميم Unsplash المعمارية الجاهزة:</span>
                    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                      {BROCHURE_PRESETS.map((p, i) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditCoverImage(p)}
                          className={`relative w-16 h-10 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
                            editCoverImage === p ? 'border-emerald-600 ring-2 ring-emerald-500/10' : 'border-slate-200'
                          }`}
                        >
                          <img src={p} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    تراجع وإلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات للبروشور والبيانات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DYNAMIC ADD UNIT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span>إدراج وحدة سكنية معمارية جديدة في المجمع</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>

              <form onSubmit={handleCreateUnit} className="space-y-4 text-xs font-semibold text-slate-700">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">رقم الوحدة السكنية (شقة/فيلا)</label>
                    <input
                      type="text"
                      placeholder="مثال: الشقة 104، الفيلا 12"
                      value={newUnitNo}
                      onChange={(e) => setNewUnitNo(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">اختر بلوك المجمع التابع لها</label>
                    <select
                      value={newUnitBlock}
                      onChange={(e) => setNewUnitBlock(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 font-black text-slate-800"
                    >
                      {myCommunity.blocks.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">الفئة والمعمار الهيكلي</label>
                    <select
                      value={newUnitCategory}
                      onChange={(e) => setNewUnitCategory(e.target.value as any)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 font-black text-slate-800"
                    >
                      <option value="house">🏡 منزل مستقل / فيلا</option>
                      <option value="apartment">🏢 شقة سكنية متكاملة</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">المساحة الإجمالية بـ (م²)</label>
                    <input
                      type="number"
                      value={newUnitArea}
                      onChange={(e) => setNewUnitArea(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">القيمة والسر المالي بالدينار العراقي (مليون د.ع)</label>
                    <input
                      type="number"
                      placeholder="مثال: 120 (لـ 120 مليون)"
                      value={newUnitPriceIQD}
                      onChange={(e) => setNewUnitPriceIQD(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">القيمة البديلة بالدولار ($ محتسب للمطابقة)</label>
                    <input
                      type="number"
                      placeholder="اتركها فارغة للاحتساب التلقائي"
                      value={newUnitPriceUSD}
                      onChange={(e) => setNewUnitPriceUSD(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">عدد الغرف</label>
                    <input
                      type="number"
                      value={newUnitRooms}
                      onChange={(e) => setNewUnitRooms(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none bg-slate-50/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">الحمامات</label>
                    <input
                      type="number"
                      value={newUnitBathrooms}
                      onChange={(e) => setNewUnitBathrooms(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none bg-slate-50/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-800">الطوابق</label>
                    <input
                      type="number"
                      value={newUnitFloors}
                      onChange={(e) => setNewUnitFloors(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-205 outline-none bg-slate-50/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-slate-800">مميزات وتجهيزات إضافية بالوحدة</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-black text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {['أمن وحراسة ٢٤ ساعة', 'خط كهرباء ذهبي', 'طابو استثماري سند مستقل', 'عزل حراري ورطوبة', 'تأسيسات غاز مركزية', 'حديقة أمامية مستقلة'].map(feat => {
                      const isChecked = newUnitFeatures.includes(feat);
                      return (
                        <label key={feat} className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setNewUnitFeatures(newUnitFeatures.filter(f => f !== feat));
                              } else {
                                setNewUnitFeatures([...newUnitFeatures, feat]);
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-800 accent-emerald-800"
                          />
                          <span>{feat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-slate-800">وصف خاص بالوحدة السكنية (شورتكات إرشادي)</label>
                  <textarea
                    rows={2}
                    placeholder="مزايا تفصيلية عن التشطيب والنظافة وتوزيع الغرف داخل الفيلا/الشقة..."
                    value={newUnitDesc}
                    onChange={(e) => setNewUnitDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-205 outline-none focus:border-emerald-850 bg-slate-50/50 resize-none font-semibold text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    تراجع وإلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    إدراج وبث الإعلان للجمهور فورياً
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
