/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import brandLogo from '../muthanna_brand.jpeg';
import { Home, Mail, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';
import { DISTRICTS } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
  onSetCategoryFilter: (category: string) => void;
}

export default function Footer({ onNavigate, onSetCategoryFilter }: FooterProps) {
  return (
    <footer id="global-footer" className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-12 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core footer elements grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-right">
          
          {/* Column A: Logo & Brand Pitch */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/10 shadow-lg">
                <img 
                  src={brandLogo} 
                  alt="عقارات المثنى" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-bold text-white">عقارات المثنى</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              المنصة العقارية الإلكترونية والحل المتكامل لتصفح، شراء، كراء، وبيع البيوت والشقق والأراضي في السماوة والرميثة والخضر وباقي أقضية محافظة المثنى العزيزة. مخصصة لتوفير واجهات البحث الفورية والتعاون الدائم مع المكاتب القانونية المعتمدة.
            </p>
          </div>

          {/* Column D: Access and Office coordinates */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white border-r-3 border-emerald-800 pr-2.5">بيانات المقر والاتصال المعتمدة</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>العراق، محافظة المثنى، مدينة السماوة، شارع باتا التجاري</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-slate-300">info@muthannaqarat.com</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-slate-300">0780 123 4567</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Outer bottom copyright elements row */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>جميع الحقوق محفوظة © 2026 عقارات المثنى</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>صُنع بشغف ودقّة لمحافظة المثنى العزيزة </span>
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-current" />
          </div>
        </div>

      </div>
    </footer>
  );
}
