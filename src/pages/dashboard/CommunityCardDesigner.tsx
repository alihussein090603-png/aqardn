/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, Eye, Phone, MessageSquare, Save, 
  Trash2, Image, Layers, HelpCircle, Sliders, Type, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InvestmentCommunity, Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { getDynamicCommunities } from '../../data/communitiesMock';
import DashboardLayout from '../../components/layout/DashboardLayout';

const BRAND_COVERS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
];

const PRESET_EMOJIS = ['🏢', '🏡', '🌸', '⭐', '🏙️', '🏰', '🏫', '🌳', '🔑', '💎', '🌴', '📍'];

export default function CommunityCardDesigner(): React.ReactElement {
  const { currentUser, currentUserRecord } = useAuth();
  const { showToast } = useAppState();

  // Selected community
  const [myCommunity, setMyCommunity] = useState<InvestmentCommunity | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('🏢');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formCustomUrl, setFormCustomUrl] = useState('');
  const [formProgress, setFormProgress] = useState(85);
  const [formDistrict, setFormDistrict] = useState('السماوة');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBlocksStr, setFormBlocksStr] = useState('');
  const [formMapEmbedCode, setFormMapEmbedCode] = useState('');

  // Helper function to extract embedding URL safely from Google Maps sharing iframe string
  const extractMapUrl = (input: string): string => {
    if (!input) return '';
    const clean = input.trim();
    if (clean.includes('<iframe')) {
      const match = clean.match(/src="([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    if (clean.startsWith('http')) {
      return clean;
    }
    return '';
  };

  // Find and load community
  useEffect(() => {
    const list = getDynamicCommunities();
    const emailStr = (currentUserRecord?.email || currentUser?.id || '').toLowerCase();
    
    // Attempt match with logged in community user
    let match = list.find(c => c.id === currentUser?.id || c.phone === currentUserRecord?.phone);
    if (!match) {
      const fallbackId = emailStr.includes('narjis') ? 'comm-narjis' : emailStr.includes('tabarak') ? 'comm-tabarak' : 'comm-sudeer';
      match = list.find(c => c.id === fallbackId) || list[0];
    }

    if (match) {
      setMyCommunity(match);
      setFormName(match.name);
      setFormLogo(match.logo || '🏢');
      setFormCoverImage(match.coverImage);
      setFormProgress(match.progress);
      setFormDistrict(match.district || 'السماوة');
      setFormNeighborhood(match.neighborhood || '');
      setFormPhone(match.phone || '');
      setFormDesc(match.description || '');
      setFormBlocksStr(match.blocks?.join('، ') || '');
      setFormMapEmbedCode(match.mapEmbedCode || '');
      
      // If cover image is not in standard presets, set custom URL
      if (!BRAND_COVERS.includes(match.coverImage)) {
        setFormCustomUrl(match.coverImage);
      }
    }
  }, [currentUser, currentUserRecord]);

  if (!myCommunity) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-500 font-sans" dir="rtl">
          <div className="w-10 h-10 border-4 border-emerald-500/10 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p>جاري مزامنة بيانات المجمع لاستعادة كارت الهوية وتدقيق الهياكل...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCover = formCustomUrl.trim() ? formCustomUrl.trim() : formCoverImage;
    const parsedBlocks = formBlocksStr
      .split(/[،,ـ]/)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const updatedCommunity: InvestmentCommunity = {
      ...myCommunity,
      name: formName.trim(),
      logo: formLogo,
      coverImage: finalCover,
      progress: formProgress,
      district: formDistrict,
      neighborhood: formNeighborhood.trim(),
      phone: formPhone.trim(),
      whatsapp: formPhone.trim().replace('+', ''),
      description: formDesc.trim(),
      blocks: parsedBlocks.length > 0 ? parsedBlocks : myCommunity.blocks,
      mapEmbedCode: formMapEmbedCode.trim()
    };

    // Save in localStorage communities list for global retrieval
    const cached = localStorage.getItem('aqarat_cached_communities');
    let list = [];
    if (cached) {
      try { list = JSON.parse(cached); } catch (err) {}
    }

    const existIdx = list.findIndex((c: any) => c.id === myCommunity.id);
    if (existIdx > -1) {
      list[existIdx] = { ...list[existIdx], ...updatedCommunity };
    } else {
      list.push(updatedCommunity);
    }

    localStorage.setItem('aqarat_cached_communities', JSON.stringify(list));
    setMyCommunity(updatedCommunity);
    showToast('✨ تم حفظ وتطبيق تحديثات تصميم بطاقة المجمع وعرضها الفوري للجمهور!', 'system');
  };

  const previewCover = formCustomUrl.trim() ? formCustomUrl.trim() : formCoverImage;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-right font-sans" dir="rtl">
        
        {/* Intro Tag & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full font-bold">بوابة أعمال المطور — تصميم الهوية</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">تخصيص وتصميم بطاقة المجمع السكني</h2>
            <p className="text-xs text-slate-500">قم بتصميم الملمح العام والبروشور ومعدلات التقدم وبثها فورياً للمستثمرين والجمهور</p>
          </div>
          
          <button
            onClick={handleSaveDesign}
            className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>تثبيت تصميم البطاقة الجديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CHUNK: Customizer Inputs */}
          <form onSubmit={handleSaveDesign} className="lg:col-span-7 space-y-6 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
            
            {/* Sec 1: Name and Emojis badge */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1">
                <Type className="w-4 h-4 text-emerald-800" />
                <span>الهوية التجارية للمصنف الاستثماري</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 block">اسم المجمع العقاري المعتمد:</label>
                  <input 
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right font-bold focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 block">رقم هاتف المبيعات والاستفسار:</label>
                  <input 
                    type="text"
                    required
                    value={formPhone}
                    placeholder="078XXXXXXXX"
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-left font-mono focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Emoji icon list */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-705 block">شعار المجمع (رمز الأيقونة الفرعي):</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormLogo(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border-2 transition-all cursor-pointer ${
                        formLogo === emoji
                          ? 'border-emerald-800 bg-emerald-50 scale-105'
                          : 'border-slate-200 hover:bg-slate-55 bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sec 2: Cover image presets and URL input */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1">
                <Image className="w-4 h-4 text-emerald-850" />
                <span>غلاف البروشور وصورة البطاقة (16:9)</span>
              </h3>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">اختر طرازا هندسيا ترويجياً لغلاف المجمع السكني:</label>
                <div className="grid grid-cols-3 gap-2">
                  {BRAND_COVERS.map((cov, i) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => {
                        setFormCoverImage(cov);
                        setFormCustomUrl('');
                      }}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer p-0 ${
                        formCoverImage === cov && !formCustomUrl.trim()
                          ? 'border-emerald-800 scale-95 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <img src={cov} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        {formCoverImage === cov && !formCustomUrl.trim() && (
                          <div className="w-5 h-5 bg-emerald-800 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cover Url Text Box */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-450">أو قم بربط صورة مخصصة لكارت المجمع بـ URL مباشر:</span>
                <input 
                  type="url"
                  value={formCustomUrl}
                  onChange={(e) => setFormCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... (رابط الصورة المباشر من الإنترنت)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-left focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Sec 3: Completion slider and description, block configuration */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <span>مواصفات وتصانيف الإنجاز والتقسيم الهيكلي</span>
              </h3>

              {/* Slider construction progress */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-extrabold text-slate-700">نسبة تقدم المعمار والبناء الإنشائي الكلي:</label>
                  <span className="font-sans text-emerald-800 font-extrabold text-sm">{formProgress}% متكامل</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="100"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <p className="text-[9px] text-slate-400 leading-relaxed font-bold">يتم ترجمة النسبة ومزامنتها على الخرائط وبطاقات البحث للزوار مباشرة لرفع الموثوقية.</p>
              </div>

              {/* Geographics District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">منطقة ترخيص المجمع (القضاء):</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right font-bold focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    <option value="السماوة">السماوة</option>
                    <option value="الرميثة">الرميثة</option>
                    <option value="الخضر">الخضر</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">الحي أو المعلم الجغرافي القريب:</label>
                  <input 
                    type="text"
                    required
                    value={formNeighborhood}
                    onChange={(e) => setFormNeighborhood(e.target.value)}
                    placeholder="مثال: حي صدر القناة / حي بابل"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right font-bold focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description definition */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">الوصف الهندسي والبروشور التعريفي لبطاقتكم الاستثمارية:</label>
                <textarea 
                  rows={4}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="اكتب نبذة توضيحية لجمهور المنصة لتشجيعهم على زيارة مجمعاتكم والشراء الفوري..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Structural sectors / blocks layout builder */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block">أسماء البلوكات السكنية الحالية (تفصل بينها بفارزة):</label>
                <input 
                  type="text"
                  required
                  value={formBlocksStr}
                  placeholder="البلوك A، البلوك B، البلوك C"
                  onChange={(e) => setFormBlocksStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white font-bold"
                />
                <p className="text-[9px] text-slate-400 font-bold">عند تغيير أو إضافة البلوكات هنا، سينعكس هذا في قوائم عزل الوحدات تلقائياً.</p>
              </div>
            </div>

            {/* Sec 4: Google Maps integration */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>الخارطة الجغرافية وموقع المجمع على الواقع (Google Maps)</span>
              </h3>

              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 space-y-3">
                <div className="flex gap-2.5">
                  <span className="text-xs">💡</span>
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-black text-emerald-950">كيفية الحصول على كود الخريطة واللصق:</p>
                    <ul className="text-[10px] text-slate-600 list-decimal list-inside space-y-1 font-bold leading-relaxed">
                      <li>افتح تطبيق أو موقع <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-800 underline font-extrabold hover:text-emerald-950">خرائط جوجل</a> وابحث عن موقع مجمعكم السكني.</li>
                      <li>اضغط على زر <span className="text-slate-900 font-extrabold">"مشاركة" (Share)</span> ثم اختر علامة تبويب <span className="text-slate-900 font-extrabold">"تضمين خريطة" (Embed a map)</span>.</li>
                      <li>اضغط على <span className="text-emerald-900 font-extrabold">"نسخ محتوى HTML" (Copy HTML)</span> والصق الكود الكامل المبتدئ بـ <span className="font-mono text-emerald-800">&lt;iframe...&gt;</span> أدناه مباشرة.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[11px] font-bold text-slate-700 block">كود تضمين الخارطة المنسوخ من Google Maps:</label>
                <textarea 
                  rows={3}
                  value={formMapEmbedCode}
                  onChange={(e) => setFormMapEmbedCode(e.target.value)}
                  placeholder='الصق كود الـ <iframe src="https://www.google.com/maps/embed?..." ... هنا'
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-left font-mono focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white resize-none"
                />
                <p className="text-[9px] text-slate-400 font-bold leading-relaxed">يدعم النظام استخراج الرابط تلقائياً وعرض أي موقع جغرافي تحدده لتسهيل استدلال الجمهور والمشترين.</p>
              </div>

              {/* Live Mini Preview Inside Form */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 block">معاينة استجابة الخارطة التفاعلية الفورية:</span>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative flex items-center justify-center shadow-xs">
                  {extractMapUrl(formMapEmbedCode) ? (
                    <iframe 
                      src={extractMapUrl(formMapEmbedCode)}
                      title="موقع المجمع السكني المعتمد"
                      className="w-full h-full border-0 absolute inset-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-lg mx-auto animate-pulse">
                        📍
                      </div>
                      <h4 className="text-xs font-black text-slate-700">لا يوجد موقع مدمج حالياً في كارت المجمع</h4>
                      <p className="text-[9px] text-slate-400 font-semibold max-w-[280px] mx-auto">عند قيامك بلصق الرابط أو الكود في الحقل أعلاه، ستظهر الخارطة الحقيقية هنا فورياً وفي صفحة التفاصيل الحية!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs cursor-pointer shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 font-sans"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتثبيت التصميم</span>
              </button>
            </div>

          </form>

          {/* RIGHT CHUNK: Real-time High fidelity interactive design visual preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-5 text-white border border-white/5 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-black text-emerald-400 font-sans tracking-wide">تصور غلافي معزز للـ SaaS والعامة في المنصة (١)</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] text-amber-300 font-black flex items-center gap-0.5 border border-white/5">
                  <Eye className="w-3" /> معينة فورية
                </span>
              </div>

              {/* REAL-TIME CARD PREVIEW EXACTLY REPRESENTING THE MULTI-COMMUNITIES VIEW CARD (16:9 Aspect Video) */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10">
                <img 
                  src={previewCover} 
                  alt={formName} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
                  }}
                />

                {/* Dark rich premium gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />

                {/* Top Right custom branding logo/emojis badge overlay */}
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 text-emerald-900 text-[10px] font-black rounded-lg flex items-center gap-1 shadow-md border border-white/20">
                  <span className="text-xs">{formLogo}</span>
                  <span className="font-sans text-[10px] font-black max-w-[130px] truncate">{formName || 'مجمع سكني قيد التسمية'}</span>
                </div>

                {/* Bottom district details bar and CTA button mockup */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white font-sans text-[10px]">
                  <div className="flex items-center gap-1 text-[9px] font-bold bg-slate-900/60 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{formDistrict} - حي {formNeighborhood || 'يرجى التحديد'}</span>
                  </div>
                  
                  <span className="text-[9px] font-black bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg border border-emerald-600/30">
                    استعراض العقارات ←
                  </span>
                </div>
              </div>

              {/* Construction status preview */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between font-sans text-xs">
                  <span className="text-slate-400 font-bold">معدل الإنجاز المعماري العام:</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{formProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${formProgress}%` }} />
                </div>
              </div>

            </div>

            {/* PREIEW 2: Custom public profile detailed overview (21:9 Aspect detailed Banner Mockup) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 space-y-4 shadow-sm text-right">
              <span className="text-[10px] font-black text-slate-400 font-sans block uppercase tracking-wider border-b pb-1.5">منظر كارت بروشور التفاصيل (٢)</span>
              
              <div className="space-y-4 font-sans">
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-800 text-xl font-bold rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                    {formLogo}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-900 leading-none">{formName || 'مجمع سكني'}</h4>
                    <p className="text-[10px] text-slate-400 font-black">المثنى، قضاء {formDistrict} - حي {formNeighborhood || '---'}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  {formDesc || 'اكتب الوصف التفصيلي لمجمعك السكني ليظهر للزوار على صفحة تفاصيل المجمع ويدعم خطة الشراء...'}
                </p>

                <div className="border-t pt-3 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border">
                    📞 اتصالات: {formPhone || '078...' }
                  </span>
                  {formBlocksStr.split(/[،,ـ]/).map((b, idx) => b.trim() && (
                    <span key={idx} className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-xs leading-none">
                      🏡 {b.trim()}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* PREVIEW 3: Map Preview Card in Right Column */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 space-y-3 shadow-sm text-right">
              <span className="text-[10px] font-black text-slate-400 font-sans block uppercase tracking-wider border-b pb-1.5">موقع الخارطة التفاعلية والواقع الجغرافي (٣)</span>
              
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative shadow-inner">
                {extractMapUrl(formMapEmbedCode) ? (
                  <iframe 
                    src={extractMapUrl(formMapEmbedCode)}
                    title="الخارطة التفصيلية للعموم"
                    className="w-full h-full border-0 absolute inset-0 md:relative"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-slate-100/40">
                    <div className="w-10 h-10 bg-slate-250 text-slate-400 rounded-full flex items-center justify-center text-sm font-black animate-bounce mb-2">📍</div>
                    <h5 className="text-xs font-black text-slate-700">الخارطة التفاعلية غير مدمجة بعد</h5>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 max-w-[200px]">الصق كود جوجل مابس لتفعيل الخارطة ونقاط الإدلال المباشرة للجمهور.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
