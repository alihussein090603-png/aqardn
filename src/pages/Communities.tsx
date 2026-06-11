/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Building2, AlertCircle, Search } from 'lucide-react';
import { getDynamicCommunities } from '../data/communitiesMock';

export default function Communities(): React.ReactElement {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const communitiesList = getDynamicCommunities();

  // Sort by highest progress% rate as requested: "فرزها حسب الأكثر اكتمالاً في نسب الإنجاز"
  const sortedCommunities = [...communitiesList].sort((a, b) => b.progress - a.progress);

  // Filter based on both selected district and search input
  const filteredCommunities = sortedCommunities.filter((c) => {
    const matchesDistrict = selectedDistrict === 'all' || c.district === selectedDistrict;
    
    // Text search on hidden parameters (name, district, neighborhood, description)
    const matchesSearch = 
      searchTerm.trim() === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDistrict && matchesSearch;
  });

  const districts = ['all', 'السماوة', 'الرميثة'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" dir="rtl">
      
      {/* Page Header */}
      <div className="mb-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-black px-3 py-1.5 rounded-full mb-3 border border-emerald-100 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>عرض الهوية الاستثمارية والبروشورات الجاهزة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans animate-fade-in">
            المجمعات السكنية الكبرى
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium font-sans leading-relaxed">
            تصفح بطاقات التصميم المعماري والبروشورات الجاهزة للمشاريع الاستثمارية المرخصة رسمياً في محافظة المثنى. تفضل بنقر الكارت لاستكشاف البيوت والشقق الشاغرة ومطابقة رسوم الطابو فوراً.
          </p>
        </div>

        {/* Filters and Search and Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-slate-100">
          
          {/* Geographics Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-black text-slate-700 font-sans whitespace-nowrap">المنطقة المتواجدة:</span>
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all border whitespace-nowrap cursor-pointer ${
                  selectedDistrict === d
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-800/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {d === 'all' ? 'جميع الأقضية' : d}
              </button>
            ))}
          </div>

          {/* Search box connected to hidden texts */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم المجمع أو موقعه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800/10 text-xs font-bold font-sans outline-none bg-slate-50 focus:bg-white transition-all shadow-sm"
            />
          </div>

        </div>
      </div>

      {/* Grid view showing promotional image cards (16:9 brochures) of the communities */}
      {filteredCommunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm font-sans">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-sans">لا توجد مجمعات تتطابق مع بحثك حالياً</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
            يرجى التأكد من كتابة اسم المجمع بشكل صحيح أو تغيير فلتر تصفية الأقضية لتشمل باقي مجمعات المثنى.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => navigate(`/community/${community.id}`)}
              className="group relative aspect-video w-full rounded-xl overflow-hidden shadow-md bg-white border border-slate-200/50 hover:border-emerald-600/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              id={`community-card-${community.id}`}
            >
              {/* Ready Visual Brochure Image filled in 16:9 container, perfectly scaled with object-cover */}
              <img
                src={community.coverImage}
                alt={community.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Sophisticated Dark Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Small branding badge */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 text-emerald-800 text-xs font-black rounded-lg flex items-center gap-1 shadow-md border border-white/20">
                <span className="text-sm">{community.logo}</span>
                <span className="font-sans text-[10px] sm:text-[11px] font-black">{community.name}</span>
              </div>

              {/* Hidden Search Parameter Display & District Info Tag (Bottom Layout) */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white font-sans">
                <div className="flex items-center gap-1 text-[10px] font-bold bg-slate-900/60 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{community.district} - حي {community.neighborhood}</span>
                </div>
                
                <span className="text-[10px] font-black bg-emerald-850 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-900 transition-colors shadow-md">
                  استعراض العقارات ←
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Trust & licensing footnotes */}
      <div className="mt-12 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-slate-700 font-sans">
        <Building2 className="w-8 h-8 text-emerald-800 shrink-0" />
        <div className="space-y-1 text-center sm:text-right">
          <h4 className="text-xs font-black text-slate-900 font-sans">ضمان الترخيص الاستثماري الفيدرالي</h4>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed font-semibold">
            جميع البروشورات والبطاقات التعريفية المرفوعة تخص شركات ومجمعات سكنية حاصلة على إجازات رسمية ومسجلة في قواعد بيانات هيئة استثمار المثنى القانونية، لضمان سلامتكم القانونية والمالية.
          </p>
        </div>
      </div>

    </div>
  );
}
