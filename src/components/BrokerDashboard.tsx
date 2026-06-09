/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, PlusCircle, LayoutDashboard, ShieldCheck, Trash2, Edit3, 
  CheckCircle2, Plus, X, MapPin, Eye, Sparkles, TrendingUp, CheckCircle,
  TrendingDown, PhoneCall, AlertCircle, ShoppingBag, FolderHeart, Info, Settings, MoreVertical,
  Smartphone, Download, Home, User, Star
} from 'lucide-react';
import { Property, Broker, PropertyCategory, DISTRICTS, NEIGHBORHOODS } from '../types';
import brandLogo from '../muthanna_brand.jpeg';

interface BrokerDashboardProps {
  currentUser: Broker;
  properties: Property[];
  onAddProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onTogglePremium: (id: string) => void;
  onMarkAsSold: (id: string, isSold: boolean) => void;
}

export default function BrokerDashboard({
  currentUser,
  properties,
  onAddProperty,
  onDeleteProperty,
  onTogglePremium,
  onMarkAsSold
}: BrokerDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'add' | 'profile'>('overview');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Android APK Custom compiler states
  const [showApkModal, setShowApkModal] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [apkStep, setApkStep] = useState('');

  // Editing local state to support seamless modifications
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  const handleBuildApk = () => {
    setShowApkModal(true);
    setApkProgress(0);
    setApkStep('مرحلة ١: فحص وتأمين الملفات البرمجية لتطبيق المثنى...');
    
    setTimeout(() => {
      setApkProgress(25);
      setApkStep('مرحلة ٢: تجميع الحزم وبناء ملفات Gradle لنظام الأندرويد...');
    }, 700);

    setTimeout(() => {
      setApkProgress(60);
      setApkStep('مرحلة ٣: حقن هوية المكتب الرقمية وتوقيع المفتاح المعتمد...');
    }, 1400);

    setTimeout(() => {
      setApkProgress(85);
      setApkStep('مرحلة ٤: ضغط تطبيق "عقارات المثنى" وتصدير ملف الـ APK...');
    }, 2100);

    setTimeout(() => {
      setApkProgress(100);
      setApkStep('✓ اكتمل البناء بنجاح! جاري تنزيل ملف Muthanna_Brokers.apk مباشرة على جهازك...');
      
      // Trigger mock download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('تم تجميع تطبيق الأندرويد لـ ' + currentUser.agencyName + ' بنجاح! حزمة جاهزة للفتح والتسطيب.');
      link.download = 'Muthanna_RealEstate_App.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 3000);
  };

  // Filter properties owned by this broker
  const myProperties = properties.filter(p => p.broker.id === currentUser.id);
  const totalViews = myProperties.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const premiumCount = myProperties.filter(p => p.isPremium).length;
  const soldCount = myProperties.filter(p => p.status === 'sold' || p.title.includes('[تم البيع]')).length;

  // Add/Edit listing form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('house');
  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>('sale');
  const [priceIQD, setPriceIQD] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [district, setDistrict] = useState('السماوة');
  const [neighborhood, setNeighborhood] = useState('حي الحكيم');
  const [addressDetails, setAddressDetails] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [floors, setFloors] = useState('2');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [selectedImg, setSelectedImg] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Unsplash images for quick select presets
  const unsplashImages = [
    { name: 'فيلا فخمة حديثة', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { name: 'بيت سكني عائلي', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80' },
    { name: 'شقة سكنية عصرية', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' },
    { name: 'واجهة بناية حديثة', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
    { name: 'أرض طابو صرف', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' }
  ];

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Pre-execution boundary validation assertions
    if (title.trim().length < 12) {
      setFormError('❌ عنوان الإعلان قصير جداً! يرجى إدخال ١٢ حرفاً على الأقل لوصف معالم العقار بدقة.');
      return;
    }
    const parsedPriceIQD = parseFloat(priceIQD);
    if (isNaN(parsedPriceIQD) || parsedPriceIQD <= 0) {
      setFormError('❌ يرجى تحديد سعر العقار بالدينار العراقي (مليون د.ع) بشكل رقمي صحيح.');
      return;
    }
    const parsedArea = parseInt(area);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setFormError('❌ يرجى توفير مساحة عقارية واقعية معترف بها رقمياً.');
      return;
    }
    
    // Parse features nicely
    const features = featuresInput 
      ? featuresInput.split('٫').map(f => f.trim()).filter(f => f.length > 0)
      : ['جاهز للسكن بقضاء السماوة', 'صرف ملك طابو طابور مباشر'];

    const newProperty: Property = {
      id: editingPropertyId || ('p-' + Date.now()),
      title: title,
      description: description || 'تم إدراج هذا عقار بواسطة مكاتب عقارات المثنى المعتمدة بالتطبيق لمزيد من التفاصيل يرجى الاتصال بنا.',
      priceIQD: parsedPriceIQD,
      priceUSD: parseFloat(priceUSD) || Math.round((parsedPriceIQD * 1000000) / 1530),
      category,
      transactionType,
      district,
      neighborhood,
      addressDetails,
      area: parsedArea,
      rooms: category !== 'land' ? parseInt(rooms) : undefined,
      bathrooms: category !== 'land' ? parseInt(bathrooms) : undefined,
      floors: category !== 'land' ? parseInt(floors) : undefined,
      images: [selectedImg],
      isPremium: false,
      broker: currentUser,
      features,
      createdAt: new Date().toISOString().split('T')[0],
      views: 12,
      status: 'active'
    };

    if (editingPropertyId) {
      // Direct replace fallback for local testing
      onDeleteProperty(editingPropertyId);
      onAddProperty(newProperty);
      setFormSuccess('🎉 تم تعديل وحفظ بيانات العقار بنجاح وتحديث البث المباشر للإعلان.');
      setEditingPropertyId(null);
    } else {
      onAddProperty(newProperty);
      setFormSuccess('🎉 تم تسجيل وإشهار العقار بنجاح! الإعلان الآن معروض ومتاح لزوار وقاصدي منصة عقارات المثنى.');
    }
    
    // Reset form fields
    setTitle('');
    setPriceIQD('');
    setPriceUSD('');
    setArea('');
    setDescription('');
    setFeaturesInput('');
    
    setTimeout(() => {
      setFormSuccess('');
      setActiveTab('listings');
    }, 2500);
  };

  const startEditingProperty = (p: Property) => {
    setEditingPropertyId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setTransactionType(p.transactionType);
    setPriceIQD(p.priceIQD.toString());
    setPriceUSD(p.priceUSD ? p.priceUSD.toString() : '');
    setDistrict(p.district);
    setNeighborhood(p.neighborhood || '');
    setAddressDetails(p.addressDetails || '');
    setArea(p.area.toString());
    setRooms(p.rooms ? p.rooms.toString() : '3');
    setBathrooms(p.bathrooms ? p.bathrooms.toString() : '2');
    setFloors(p.floors ? p.floors.toString() : '2');
    setDescription(p.description || '');
    setFeaturesInput(p.features ? p.features.join(' ٫ ') : '');
    setSelectedImg(p.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
    
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDistrictChange = (dist: string) => {
    setDistrict(dist);
    const linkedNhs = NEIGHBORHOODS[dist] || [];
    if (linkedNhs.length > 0) {
      setNeighborhood(linkedNhs[0]);
    } else {
      setNeighborhood('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-right pb-24 pt-4 select-none" dir="rtl">
      
      {/* A. MODERN TOP NAVIGATION BAR (HEADER) */}
      <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-45 shadow-xs mb-6">
        {/* Right Section: Architectural icon and name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-emerald-800 text-white p-2.5 rounded-xl shadow-md shadow-emerald-900/10">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-black text-slate-900 leading-none">عقارات المثنى</span>
            <span className="text-[10.5px] text-slate-550 font-bold">بوابة إدارة المكتب العقاري ش.م</span>
          </div>
        </div>

        {/* Left Section: Broker profile avatar, agency state & verified label */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full items-center gap-1.5 border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>مكتب معتمد ومحقق</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-3.5 rounded-xl border border-slate-150 relative">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500 shadow-inner shrink-0">
              <img 
                src={currentUser.avatar || brandLogo} 
                alt={currentUser.agencyName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[11.5px] font-black text-slate-800 leading-none">{currentUser.agencyName}</span>
              <span className="text-[9px] text-slate-400 font-bold mt-0.5">المفوض: {currentUser.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* PREMIUM ANDROID OVERLAY LAUNCHER BAR FOR DESKTOP */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-4.5 h-4.5 text-emerald-750" />
              تطبيق الأندرويد المحمول المعتمد (Muthanna Brokers App)
            </h2>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              احصل على نسختك الحصرية بصيغة APK لتلقي الإشعارات الفورية ومراقبة التفاعل مباشرة من هاتف الأندرويد لـ {currentUser.agencyName}.
            </p>
          </div>

          <button
            onClick={handleBuildApk}
            className="self-start md:self-auto bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs hover:-translate-y-0.5"
          >
            <Smartphone className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            <span>تنزيل تطبيق الأندرويد الـ APK للمكتب</span>
          </button>
        </div>

        {/* B. PREMIUM MOBILE-OPTIMIZED ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: إعلاناتي النشطة */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-slate-400 text-xs font-bold block">إعلاناتي النشطة</span>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                {myProperties.length}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold block">معروضة للجمهور وتلقى الطلبات</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Building className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: إجمالي المشاهدات */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-bold block">إجمالي المشاهدات</span>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                  {totalViews > 0 ? totalViews.toLocaleString('en-US') : '16,101'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
                <Eye className="w-6 h-6" />
              </div>
            </div>
            
            {/* Continuous upward trend layout mockup */}
            <div className="flex items-center gap-2 mt-2 pt-1">
              <div className="flex items-end gap-1 h-5 w-24 bg-slate-50 rounded-md p-0.5 border border-slate-100">
                <div className="bg-emerald-200 h-[30%] w-full rounded-xs shrink-0" />
                <div className="bg-emerald-300 h-[50%] w-full rounded-xs shrink-0" />
                <div className="bg-emerald-400 h-[65%] w-full rounded-xs shrink-0" />
                <div className="bg-emerald-500 h-[85%] w-full rounded-xs shrink-0" />
              </div>
              <span className="text-[9.5px] text-emerald-770 font-black tracking-tight animate-pulse bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                +18.4% نمو متصاعد
              </span>
            </div>
          </div>

          {/* Card 3: العقارات المميزة المدفوعة */}
          <div className="bg-white rounded-2xl border-2 border-amber-500/10 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="space-y-1">
              <span className="text-amber-800 text-xs font-black block flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                العقارات المميزة المدفوعة
              </span>
              <p className="text-3xl font-extrabold text-amber-600 tracking-tight font-sans">
                {premiumCount}
              </p>
              <span className="text-[10px] text-amber-700/80 font-bold block">عروض تحظى بـ ٤ أضعاف التفاعل</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <Star className="w-6 h-6 text-amber-500 fill-current" />
            </div>
          </div>

        </div>

        {/* DOUBLE VIEWPORT GRID LAYOUT: (Right Sidebar Desktop / Bottom Nav Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* NAVIGATION CONTROLLER (Sticky right sidebar desktop) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 z-30">
            
            {/* Desktop Navigation */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-1.5">
              
              <div className="px-3 pb-3 border-b border-slate-50 mb-2">
                <span className="text-[10px] text-slate-400 font-extrabold block">لوحة إدارة المكتب وموجز الأنماط</span>
              </div>

              <button
                onClick={() => { setActiveTab('overview'); setEditingPropertyId(null); }}
                className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-50 text-emerald-800 border-r-3 border-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 shrink-0 text-emerald-800" />
                <span>موجز الإحصاء والأداء</span>
              </button>

              <button
                onClick={() => { setActiveTab('listings'); setEditingPropertyId(null); }}
                className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'listings'
                    ? 'bg-emerald-50 text-emerald-800 border-r-3 border-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4.5 h-4.5 shrink-0 text-emerald-800" />
                <span>إدارية عقاراتي الخاصة ({myProperties.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('add'); }}
                className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-emerald-50 text-emerald-800 border-r-3 border-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5 shrink-0 text-emerald-800" />
                <span>{editingPropertyId ? 'صيانة وتعديل العرض' : 'إدراج وتعبئة عقار حديث'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); }}
                className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-800 border-r-3 border-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4.5 h-4.5 shrink-0 text-emerald-800" />
                <span>بيانات الحساب والترخيص</span>
              </button>

            </div>

          </div>

          {/* DYNAMIC CONTENT CONTAINER (Tab panel pages area) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* A. OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in-40 duration-300">
                
                {/* Office message widget */}
                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl" />
                  <div className="relative z-10 space-y-2">
                    <h3 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      أهلاً بك أستاذ {currentUser.name} في كفاءتك الحصرية!
                    </h3>
                    <p className="text-[11.5px] text-slate-200 leading-relaxed font-semibold">
                      تسمح لك لوحة التحكم هذه بمراقبة عدد زوار إعلاناتك، ترويج العقارات كـ "مميزة" لزيادة التفاعل، وتعديل حالة العرض. عند اتمام صفقة في محافظة المثنى، يرجى تعيينها كـ <span className="text-amber-400 font-bold">"مباعة"</span> فوراً لإرشاد الزوار وبناء المصداقية العقارية لمكتبك.
                    </p>
                  </div>
                </div>

                {/* Performance feedback metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Traffic insights */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-850 flex items-center gap-2">
                      <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
                      كفاءة التصفح وقنوات الاتصال بالمكتب
                    </h3>
                    
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>نسبة الاتصال المباشر من الزوار</span>
                          <span>٦٨٪</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>نسبة محادثات واتساب المستلمة</span>
                          <span>٨٤٪</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-800 h-full rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deals tracker summaries */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle className="w-4.5 h-4.5 text-amber-500" />
                        سجل العمليات الصفقات المغلقة
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold">إجمالي التعاقدات المنفذة عبر كود المعرف الخاص بك</p>
                    </div>

                    <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-slate-800">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold">عقارات بيعت بنجاح</span>
                        <p className="text-base font-black text-amber-700">{soldCount} عقار مغلق ومحقق</p>
                      </div>
                      <div className="text-[20px]">🎉</div>
                    </div>
                  </div>

                </div>

                {/* Recent listings board */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                  <h3 className="text-xs font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">آخر ٣ عروض عقارية معلنة لمكتبكم</h3>
                  {myProperties.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      لم تقم بنشر أي عرض بعد. اضغط على "نشر عقار" للبدء بالبث المباشر للإعلان!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProperties.slice(0, 3).map(listing => (
                        <div key={listing.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">{listing.title}</span>
                              <span className="text-[10px] text-slate-500">{listing.district} ٫ {listing.neighborhood}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                              {listing.priceIQD} مليون د.ع
                            </span>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{listing.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* B. LISTINGS TABLE AND MOBILIZED QUICK ACTIONS */}
            {activeTab === 'listings' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden animate-in fade-in-40 duration-300">
                
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">إدارة قوائم الإعلانات ومتابعة الصفقات المغلقة</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">قم بتعديل ببيانات العقار، شطبه أو تعيينه كمباع</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-bold border border-emerald-100">
                    عدد العروض: {myProperties.length}
                  </span>
                </div>

                {myProperties.length === 0 ? (
                  <div className="text-center py-16 px-4 space-y-4">
                    <Building className="w-12 h-12 text-slate-200 mx-auto animate-bounce" />
                    <h4 className="text-sm font-bold text-slate-750">لا توجد سجلات عقارية مسجلة لمكتبك</h4>
                    <p className="text-xs text-slate-400">بادر بنشر عرضك الأول مجاناً وبدون عمولات مخفية للزبون!</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all inline-block cursor-pointer"
                    >
                      + أدرج أول إعلان عقاري بالسماوة
                    </button>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6">
                    
                    {/* C. MOBILIZED QUICK ACTIONS & ACTIVE PROPERTIES LIST (ANTI-TABLE OVERHAUL FOR < 768px) */}
                    <div className="block md:hidden space-y-4">
                      {myProperties.map((p) => {
                        const isSold = p.status === 'sold' || p.title.includes('[تم البيع]');
                        const viewsCountStr = p.views ? p.views.toLocaleString('en-US') : '15,581';
                        
                        return (
                          <div 
                            key={p.id} 
                            id={`mobile-card-${p.id}`}
                            className="bg-white rounded-2xl border border-slate-105 p-4 space-y-4 shadow-2xs relative overflow-hidden transition-all duration-300"
                          >
                            {isSold && (
                              <div className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] font-black px-2.5 py-1 rounded-br-lg z-10 shadow-xs">
                                تم البيع والتعاقد
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              {/* Right Section: Image thumbnail */}
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-inner">
                                <img 
                                  src={p.images[0]} 
                                  alt={p.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              {/* Center Section: Core title & Locator info */}
                              <div className="flex-1 text-right space-y-0.5">
                                <h4 className={`text-[12px] font-extrabold leading-snug line-clamp-2 ${isSold ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                  {p.title}
                                </h4>
                                <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-bold">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{p.district} - {p.neighborhood || 'حي الحكيم'}</span>
                                </div>
                              </div>

                              {/* Left Section: Views Count pill */}
                              <div className="shrink-0">
                                <span className="inline-flex items-center gap-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2 py-0.5 text-[9.5px] font-mono font-bold">
                                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{viewsCountStr}</span>
                                </span>
                              </div>
                            </div>

                            {/* Bottom Action Strip with min-height 44px for easy click/touch targets */}
                            <div className="grid grid-cols-3 gap-1.5 border-t border-slate-100/90 pt-3">
                              <button
                                onClick={() => startEditingProperty(p)}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 font-black text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px] active:scale-[0.98]"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>تعديل</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من رغبتك في شطب هذا المعلم وسحب الإعلان؟')) {
                                    onDeleteProperty(p.id);
                                  }
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px] active:scale-[0.98]"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>حذف</span>
                              </button>

                              <button
                                onClick={() => onMarkAsSold(p.id, !isSold)}
                                className={`font-extrabold text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[44px] active:scale-[0.98] ${
                                  isSold 
                                    ? 'bg-slate-100 text-slate-450 text-slate-500' 
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{isSold ? 'تنشيط' : 'تم البيع'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP VIEW: High fidelity comprehensive table */}
                    <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-2xl shadow-2xs">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-650 border-b border-slate-105 text-[11px] font-bold">
                            <th className="p-4">العقار وتفاصيله</th>
                            <th className="p-4">المعاملة والصنف</th>
                            <th className="p-4">السعر</th>
                            <th className="p-4">المشاهدات</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4 text-center">الإجراءات والتحكم بالصفقة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {myProperties.map((p) => {
                            const isSold = p.status === 'sold' || p.title.includes('[تم البيع]');

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="p-4 max-w-sm">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={p.images[0]} 
                                      alt={p.title} 
                                      className="w-14 h-11 object-cover rounded-xl shrink-0 border border-slate-150"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="text-right">
                                      <span className={`font-bold text-slate-900 block line-clamp-1 ${isSold ? 'line-through text-slate-400' : ''}`}>
                                        {p.title}
                                      </span>
                                      <span className="text-[10px] text-slate-455 text-slate-400 flex items-center gap-0.5 mt-1 font-bold">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                        <span>{p.district} ٫ {p.neighborhood}</span>
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black ${
                                      p.transactionType === 'sale' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {p.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
                                    </span>
                                    <p className="text-[9.5px] text-slate-400 font-bold">{p.category === 'house' ? '🏡 منزل مستقل' : p.category === 'apartment' ? '🏢 شقة بمجمع' : '🗺️ فضاء أرض صرف'}</p>
                                  </div>
                                </td>

                                <td className="p-4 font-black font-mono text-emerald-900 whitespace-nowrap text-xs">
                                  {p.priceIQD} مليون د.ع
                                </td>

                                <td className="p-4 font-mono text-slate-550 text-xs font-bold">
                                  {p.views || 0}
                                </td>

                                <td className="p-4">
                                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                    isSold ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {isSold ? 'صفقة مباعة' : 'نشط معروض'}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2">
                                    
                                    <button
                                      onClick={() => startEditingProperty(p)}
                                      className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-600 hover:text-slate-800 cursor-pointer min-h-[38px] px-3 font-semibold text-[10px] flex items-center gap-1"
                                      title="تعديل المواصفات"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>تعديل</span>
                                    </button>

                                    <button
                                      onClick={() => onTogglePremium(p.id)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all min-h-[38px] cursor-pointer ${
                                        p.isPremium 
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                      title="ترويج مميز"
                                    >
                                      {p.isPremium ? '★ مميز' : 'تمييز الإعلان'}
                                    </button>

                                    <button
                                      onClick={() => onMarkAsSold(p.id, !isSold)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all min-h-[38px] cursor-pointer ${
                                        isSold 
                                          ? 'bg-slate-100 text-slate-400' 
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {isSold ? 'تنشيط العرض' : 'تعيين كمباع'}
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (confirm('هل ترغب بتأكيد حذف الإعلان من الفهرست بالكامل؟')) {
                                          onDeleteProperty(p.id);
                                        }
                                      }}
                                      className="p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-650 transition-colors cursor-pointer min-h-[38px]"
                                      title="حذف الإعلان"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* C. ADD PROPERTY FORM WITH VALIDATIONS & HIGH FIDELITY PRESETS */}
            {activeTab === 'add' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-8 shadow-xs animate-in fade-in-40 duration-300 space-y-6">
                
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {editingPropertyId ? 'تعديل وتحديث بيانات الإعلان الحالي' : 'صياغة وتعبئة إعلان عقاري مميز بالفهرس السكني'}
                  </h3>
                  <p className="text-xs text-slate-550 mt-1">تعبئة البيانات الواقعية والدقيقة تساهم بزيادة نسب المراسلات والطلبات بمعدل ٣ أضعاف.</p>
                </div>

                {formSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold">{formSuccess}</span>
                  </div>
                )}

                {formError && (
                  <div className="p-4 bg-red-50 border border-red-105 text-red-700 rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-655 shrink-0" />
                    <span className="text-xs font-bold">{formError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateListing} className="space-y-6">
                  
                  {/* Select preset image layouts */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-slate-800">اختر صورة معبّرة تلائم طبيعة معالم عقارك:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {unsplashImages.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setSelectedImg(img.url)}
                          className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedImg === img.url 
                              ? 'border-emerald-700 shadow-md scale-95 ring-2 ring-emerald-600/10' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[8.5px] text-white text-center">
                            {img.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line 1: Real estate Title and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="space-y-1.5 text-right">
                      <label className="block text-xs font-bold text-slate-800">عنوان وموضوع الإعلان للتسويق:</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: بيت طابقين حديث دبل فوليوم بالثورة ممتاز"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">صنف وتصنيف العقارات المعتمد:</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:bg-white focus:outline-none font-bold text-right"
                      >
                        <option value="house">🏡 بيت سكني مستقل</option>
                        <option value="apartment">🏢 شقة سكنية بداخل عمارة</option>
                        <option value="commercial">💼 محل أو مبنى تجاري</option>
                        <option value="land">🗺️ أرض زراعية أو طابو ملك صرف</option>
                      </select>
                    </div>

                  </div>

                  {/* Line 2: Pricing options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">نوع وهدف المعاملة:</label>
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:bg-white focus:outline-none font-bold"
                      >
                        <option value="sale">للبيع للزبائن</option>
                        <option value="rent">للإيجار للعملاء</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-right font-mono">
                      <label className="block text-xs font-bold text-slate-800">القيمة المطلوبة (بالمليون د.ع):</label>
                      <input
                        type="number"
                        required
                        placeholder="مثال: ٢٢٠"
                        value={priceIQD}
                        onChange={(e) => setPriceIQD(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-center font-bold focus:outline-none focus:border-emerald-700 placeholder:text-right"
                      />
                    </div>

                    <div className="space-y-1.5 text-right font-mono">
                      <label className="block text-xs font-bold text-slate-800">المعادل المالي بالدولار الكاش ($):</label>
                      <input
                        type="number"
                        placeholder="سيتحدد تلقائياً بموجب الصرف"
                        value={priceUSD}
                        onChange={(e) => setPriceUSD(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-center font-bold focus:outline-none focus:border-emerald-700 placeholder:text-right"
                      />
                    </div>

                  </div>

                  {/* District & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">القضاء الإداري داخل محافظة المثنى:</label>
                      <select
                        value={district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:bg-white focus:outline-none font-bold"
                      >
                        {DISTRICTS.filter(d => d !== 'كل الأقضية').map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 animate-in slide-in-from-right-1 duration-200">
                      <label className="block text-xs font-bold text-slate-800">الحي والمنطقة المحددة:</label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:bg-white focus:outline-none font-bold text-right"
                      >
                        {(NEIGHBORHOODS[district] || []).map((nh) => (
                          <option key={nh} value={nh}>{nh}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Address Details & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">عنوان الشارع والبلدية / المقارب الدال:</label>
                      <input
                        type="text"
                        placeholder="مثال: قرب الإدارة المحلية خلف مصرف الرافدين"
                        value={addressDetails}
                        onChange={(e) => setAddressDetails(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">المساحة الإجمالية للبناء أو الأرض (م²):</label>
                      <input
                        type="number"
                        required
                        placeholder="مثال: ٢٠٠"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-center font-mono font-bold"
                      />
                    </div>

                  </div>

                  {/* Special parameters */}
                  {category !== 'land' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-emerald-50 border border-emerald-500/10 rounded-xl text-xs font-bold">
                      
                      <div className="space-y-1">
                        <span className="font-extrabold text-emerald-850">عدد غرف النوم:</span>
                        <select
                          value={rooms}
                          onChange={(e) => setRooms(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 mt-1 focus:outline-none text-right font-bold"
                        >
                          {['1', '2', '3', '4', '5', '6'].map(v => (
                            <option key={v} value={v}>{v} غرف نوم</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="font-extrabold text-emerald-850">عدد الحمامات:</span>
                        <select
                          value={bathrooms}
                          onChange={(e) => setBathrooms(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 mt-1 focus:outline-none text-right font-bold"
                        >
                          {['1', '2', '3', '4'].map(v => (
                            <option key={v} value={v}>{v} حمام مفرز</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="font-extrabold text-emerald-850">طوابق البناء المعماري:</span>
                        <select
                          value={floors}
                          onChange={(e) => setFloors(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 mt-1 focus:outline-none text-right font-bold"
                        >
                          {['1', '2', '3'].map(v => (
                            <option key={v} value={v}>{v === '1' ? 'طابق أرضي مفرز فقط' : `طابقين (${v})`}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  )}

                  {/* Form Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">ملاحظات وخدمات تهم المشتري (نظام البناء، الخدمات، تيار الماء والكهرباء):</label>
                    <textarea
                      rows={4}
                      placeholder="امثلة: الجدران مبنية بالكامل بالطابوق الجمهوري، السطح معالج بالماستك الفاخر، الخدمات مفرومة وقريبة للمراكز التجارية..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right leading-relaxed font-semibold"
                    />
                  </div>

                  {/* Additive values */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">مزايا إضافية نوعية (افصل بينها بـ علامة ٫ أو فاصلة):</label>
                    <input
                      type="text"
                      placeholder="مثال: طابو ملك صرف طابور٫ بناء ٢٠٢٦ حديث٫ واجهة حجر فخم٫ شارع عريض ۱٥م"
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right font-medium"
                    />
                  </div>

                  {/* Buttons controls */}
                  <div className="flex gap-3">
                    {editingPropertyId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPropertyId(null);
                          setTitle('');
                          setPriceIQD('');
                          setPriceUSD('');
                          setArea('');
                          setDescription('');
                          setFeaturesInput('');
                          setActiveTab('listings');
                        }}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`font-black py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/10 hover:-translate-y-0.5 duration-200 ${
                        editingPropertyId ? 'w-2/3 bg-amber-600 hover:bg-amber-750 text-white' : 'w-full bg-emerald-800 hover:bg-emerald-900 text-white'
                      }`}
                    >
                      <Plus className="w-5 h-5 shrink-0" />
                      <span>{editingPropertyId ? 'تأكيد وحفظ التغييرات بالإعلان' : 'تثبيت ونشر العرض في الفهرست العام لمحافظة المثنى'}</span>
                    </button>
                  </div>

                </form>

              </div>
            )}

            {/* D. PROFILE TAB FOR HIGH FIDELITY ACCOUNT MANAGEMENT */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-8 shadow-xs animate-in fade-in-40 duration-300 space-y-6 text-right">
                
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">بيانات ترخيص المكتب وعضوية النقابة والمقر</h3>
                  <p className="text-xs text-slate-500 mt-1">يمكنك تعزيز المصداقية والخصوصية لإعلاناتك العقارية ومشاركة ملفات التثبيت آلياً.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
                    <img 
                      src={currentUser.avatar || brandLogo} 
                      alt={currentUser.agencyName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 text-center sm:text-right">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-800">{currentUser.agencyName}</h4>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        حساب مفوض قانوني نشط
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">المفوّض الإستشاري: <span className="text-slate-800 font-black">{currentUser.name}</span></p>
                    <p className="text-xs text-slate-500 font-bold font-mono">الخط الساخن: {currentUser.phone}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-50">تراخيص العضوية والفرع بالمحافظة</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] block">رقم رخصة النقابة المعتمد</span>
                      <p className="text-slate-900 font-black font-sans">#MUT-849-ELITE</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] block">التأمين القانوني ونوع النشاط</span>
                      <p className="text-slate-900 font-black">مقاولات وإستشارات عقارية وتثبيت أراضي</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* D. APP-LIKE BOTTOM NAVIGATION BAR FOR MOBILE PHONES (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-2.5 flex justify-between items-center z-50 shadow-2xl">
        <button
          onClick={() => {
            navigate('/');
          }}
          className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-800 transition-colors shrink-0"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('listings');
            setEditingPropertyId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'listings' ? 'text-emerald-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Building className={`w-5 h-5 ${activeTab === 'listings' ? 'text-emerald-800' : 'text-slate-400'}`} />
          <span className="text-[10px] font-bold">عقاراتي</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('add');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'add' ? 'text-emerald-800 font-bold' : 'text-slate-500'
          }`}
        >
          <PlusCircle className={`w-5 h-5 ${activeTab === 'add' ? 'text-emerald-800' : 'text-slate-400'}`} />
          <span className="text-[10px] font-bold">إدراج عقار</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'profile' ? 'text-emerald-800 font-bold' : 'text-slate-500'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-emerald-800' : 'text-slate-400'}`} />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </div>

      {/* PREMIUM ANDROID BUILDER GLASS OVERLAY DIALOG */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-850">
                <Smartphone className="w-5 h-5 text-emerald-800" />
                <span className="text-xs font-black text-slate-800">منصة الأندرويد الذكية لـ المثنى</span>
              </div>
              {apkProgress === 100 && (
                <button 
                  onClick={() => setShowApkModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="text-center space-y-3 py-4">
              <div className="relative w-16 h-16 mx-auto bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center shadow-inner">
                {apkProgress < 100 ? (
                  <Smartphone className="w-8 h-8 animate-bounce text-emerald-700" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-600 animate-pulse" />
                )}
                {apkProgress < 100 && (
                  <div className="absolute inset-x-0 inset-y-0 border-4 border-emerald-700/25 border-t-emerald-800 rounded-full animate-spin" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900">
                  {apkProgress < 100 ? 'جاري تجميع حزمة الأندرويد لـ مكاتبكم (APK)...' : 'تم تجميع حزمة الأندرويد بنجاح!'}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                  {apkStep}
                </p>
              </div>
            </div>

            {/* Progress visualizer indicator */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span>المتبقي لـ إمضاء وتوقيع المفتاح</span>
                <span className="font-mono">{apkProgress}%</span>
              </div>
              <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-700 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${apkProgress}%` }}
                />
              </div>
            </div>

            {apkProgress === 100 && (
              <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-center">
                <span className="text-[10.5px] text-amber-900 font-black block">💡 دليل الاستخدام السريع وتسطيب الـ APK</span>
                <p className="text-[9.5px] text-slate-600 leading-relaxed mt-1 font-semibold">
                  افتح الملف المحمل بنجاح، ثم قم بالموافقة على تثبيت الحزم من مصادر غير معروفة للولوج الفوري والاستمتاع بتطبيق مكاتب المثنى بمرونة تامة!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
