/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Maximize, Bed, Bath, Heart, Phone, MessageSquare, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e: any) => void;
  onViewDetails: (id: string) => void;
  onCall: (phone: string, e: any) => void;
  onWhatsApp: (whatsapp: string, title: string, e: any) => void;
  viewMode?: 'grid' | 'list';
  key?: any;
}

export default function PropertyCard({
  property,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
  onCall,
  onWhatsApp,
  viewMode = 'grid'
}: PropertyCardProps): React.ReactElement {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const formatIQD = (val: number) => {
    if (val >= 1) {
      // It's in millions
      return `${val.toLocaleString('ar-IQ')} مليون د.ع`;
    } else {
      // E.g. 0.55 Million = 550,000 Dinars
      return `${(val * 1000).toLocaleString('ar-IQ')} ألف د.ع`;
    }
  };

  const formatUSD = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images.length > 1) {
      setCurrentImgIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const isList = viewMode === 'list';

  return (
    <article
      id={`property-card-${property.id}`}
      onClick={() => onViewDetails(property.id)}
      className={`group relative flex bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-600/20 transition-all duration-300 overflow-hidden cursor-pointer ${
        isList 
          ? 'flex-col md:flex-row w-full md:min-h-56' 
          : 'flex-col h-full'
      }`}
    >
      
      {/* Top Visual Slider */}
      <div 
        id="image-slider" 
        className={`relative overflow-hidden bg-slate-100 shrink-0 ${
          isList 
            ? 'aspect-video w-full md:w-64 md:h-full md:aspect-square' 
            : 'aspect-video w-full'
        }`}
      >
        <img
          src={property.images[currentImgIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Carousel indicators if multiple images */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 px-2 py-1 rounded-full backdrop-blur-xs">
            {property.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentImgIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Carousel Navigation Buttons */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="الصورة السابقة"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="الصورة التالية"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Transaction Badge (Top Right) */}
        <span
          className={`absolute top-3.5 right-3.5 px-3 py-1 text-xs font-bold rounded-lg text-white shadow-lg select-none ${
            property.transactionType === 'sale'
              ? 'bg-amber-600 shadow-amber-600/20'
              : 'bg-emerald-700 shadow-emerald-700/20'
          }`}
        >
          {property.transactionType === 'sale' ? 'للبيع' : 'للإيجار'}
        </span>

        {/* Premium Badge */}
        {property.isPremium && (
          <span className="absolute top-3.5 right-20 bg-emerald-950 text-amber-500 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-lg flex items-center gap-1">
            ★ مميز جداً
          </span>
        )}

        {/* Wishlist toggle button */}
        <button
          onClick={(e) => onToggleWishlist(property.id, e)}
          className={`absolute top-3.5 left-3.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110'
              : 'bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 shadow-md'
          }`}
          title="حفظ في المفضلة"
        >
          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content & Details Row */}
      <div className={`flex-1 flex ${isList ? 'flex-col md:flex-row p-5 gap-6 justify-between' : 'flex-col p-4'}`}>
        
        {/* Main textual info details info */}
        <div className={`flex-1 flex flex-col justify-between text-right ${isList ? 'space-y-3' : 'space-y-0'}`}>
          <div className="space-y-2">
            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-800 transition-colors">
              {property.title}
            </h3>

            {/* Geographic location tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="line-clamp-2 font-medium">
                {property.district} - {property.neighborhood} {property.addressDetails ? `، ${property.addressDetails}` : ''}
              </span>
            </div>
          </div>

          {/* Metrics details Row (Hidden if Land category) */}
          <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-slate-600 text-xs my-1">
            <div className="flex items-center gap-1 shrink-0">
              <Maximize className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-800">{property.area}</span> م²
            </div>

            {property.category !== 'land' && (
              <>
                {property.rooms && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{property.rooms}</span> غرف
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Bath className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{property.bathrooms}</span> حمام
                  </div>
                )}
              </>
            )}

            {property.category === 'land' && (
              <div className="text-[10px] text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md font-medium mr-auto">
                عقار أرض صرف
              </div>
            )}

            <div className="mr-auto font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {property.views}
            </div>
          </div>

          {/* Broker Signature */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={property.broker.avatar} 
                alt={property.broker.name} 
                className="w-7 h-7 rounded-full object-cover border border-emerald-950/10"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-900 leading-tight">{property.broker.name}</p>
                <p className="text-[9px] text-slate-500 leading-none">{property.broker.agencyName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel right details (Pricing & Action buttons) */}
        <div className={`flex flex-col justify-between shrink-0 font-sans ${
          isList 
            ? 'md:w-60 md:border-r md:border-slate-100 md:pr-6 md:justify-around text-right' 
            : 'mt-4'
        }`}>
          {/* Dual-currency Pricing Row */}
          <div id="pricing-container" className="flex flex-col gap-0.5 text-right font-sans">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-slate-500 shrink-0">الدينار:</span>
              <span className="text-lg font-extrabold text-emerald-800">
                {formatIQD(property.priceIQD || ((property.priceUSD || 0) * 1500 / 1000000))}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500 border-t border-dashed border-slate-100 pt-1">
              <span className="flex items-center gap-1 shrink-0 font-sans">
                الدولار:
                {(property.priceIQD > 0 && !property.priceUSD) && (
                  <span className="text-[9px] text-slate-400 font-normal select-none">(تقريبي)</span>
                )}
              </span>
              <span className="font-mono font-medium text-slate-700">
                {formatUSD(property.priceUSD || ((property.priceIQD || 0) * 1000000 / 1500))}
              </span>
            </div>
          </div>

          {/* Action Call / WhatsApp Buttons grid */}
          <div className={`grid grid-cols-2 gap-2 mt-4 ${isList ? 'md:grid-cols-1 md:mt-6' : ''}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCall(property.broker.phone, e);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-800 hover:bg-emerald-950 hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>اتصال هاتفي</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onWhatsApp(property.broker.whatsapp, property.title, e);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white bg-green-600 hover:bg-green-700 hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </button>
          </div>
        </div>

      </div>

    </article>
  );
}
