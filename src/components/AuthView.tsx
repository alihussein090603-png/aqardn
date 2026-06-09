/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Mail, Lock, User, Phone, CheckCircle, ArrowRight, AlertTriangle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onContinueAsGuest: () => void;
}

export default function AuthView({
  onContinueAsGuest
}: AuthViewProps) {
  const { signInWithEmail, signUpBroker, authError, isLoadingDoc } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const errorToDisplay = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg('');

    // Pre-flight Client Input Sanitization validations
    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailPattern.test(email.trim())) {
        throw new Error('يرجى تزويدنا ببريد إلكتروني رسمي وصحيح للمكتب.');
      }
      if (password.length < 6) {
        throw new Error('حفاظاً على سرية عقود الملاك؛ يرجى كتابة رمز مرور يتجاوز 6 خانات.');
      }

      if (isRegister) {
        if (!fullName.trim() || fullName.trim().length < 5) {
          throw new Error('الرجاء إدخال الاسم الثلاثي كاملاً لصاحب المكتب العقاري.');
        }
        if (!whatsapp.trim() || whatsapp.trim().length < 10) {
          throw new Error('يرجى إدخال رقم هاتف اتصال وواتساب صحيح لتوجيه طلبات الشراء تلقائياً.');
        }
        
        // Register transaction with real-time firestore collection syncing
        await signUpBroker(email, password, {
          name: fullName.trim(),
          phone: whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          agencyName: agencyName.trim() || fullName.trim()
        });

        setSuccessMsg('أهلاً بك شريكاً لنا! تم تأمين وتفعيل حسابك العقاري بنجاح.');
      } else {
        // Authenticate via native firebase providers
        await signInWithEmail(email, password);
        setSuccessMsg('تم التصديق العقاري بنجاح! جاري توجيهك الفوري للوحة الإدارة...');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'عذراً، تعذر إتمام العملية السحابية حالياً.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12" dir="rtl">
      
      {/* Absolute Master Container Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 relative">
        
        {/* Visual design accentuation gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

        {/* Corporate Arabized branding header */}
        <div className="text-center space-y-3 mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 text-white shadow-emerald-950/10 shadow-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug">بوابة المكاتب وعقارات المثنى</h1>
            <p className="text-xs text-slate-500 mt-0.5">أعلن معنا وسوّق الأراضي والمنازل لعشرات الآلاف من الباحثين</p>
          </div>
        </div>

        {/* Dynamic authenticating segment tabs */}
        <div className="grid grid-cols-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            disabled={isLoadingDoc}
            onClick={() => {
              setIsRegister(false);
              setLocalError(null);
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-100/30 font-sans'
                : 'text-slate-500 hover:text-slate-800 font-sans'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            disabled={isLoadingDoc}
            onClick={() => {
              setIsRegister(true);
              setLocalError(null);
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-100/30 font-sans'
                : 'text-slate-500 hover:text-slate-800 font-sans'
            }`}
          >
            حساب جديد للمكاتب
          </button>
        </div>

        {/* Alert block displaying contextual validation errors */}
        {errorToDisplay && (
          <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-start gap-2.5 text-right mb-6 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-900">حدث خطأ أثناء التصديق</h4>
              <p className="text-xs text-red-700 leading-relaxed">{errorToDisplay}</p>
            </div>
          </div>
        )}

        {/* Success confirmation alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-center space-y-2 mb-6 animate-in zoom-in-95 duration-200">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-emerald-900 leading-relaxed">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">الاسم الثلاثي المعتمد:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isLoadingDoc}
                    placeholder="الحاج جهاد الحميد السماوي"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white text-right disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Agency Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">اسم المكتب أو المجمع العقاري:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isLoadingDoc}
                    placeholder="مكتب بابل العقاري في السماوة"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white text-right disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">رقم واتساب واتصال فعال (العراق):</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    disabled={isLoadingDoc}
                    placeholder="07801122334"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center font-mono focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white placeholder:text-right disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني للشركة:</label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoadingDoc}
                placeholder="name@muthanna-agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white text-right font-mono disabled:opacity-50"
              />
              <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">رقم المرور السري الخاص بالمكتب:</label>
              {!isRegister && (
                <button type="button" className="text-[10px] text-emerald-800 hover:underline">أنسيت كلمة المرور؟</button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                disabled={isLoadingDoc}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white text-right disabled:opacity-50"
              />
              <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Submit Action Block */}
          <button
            type="submit"
            disabled={isLoadingDoc}
            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-emerald-800/40 disabled:cursor-not-allowed"
          >
            {isLoadingDoc ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                <span>جاري الاتصال بقاعدة البيانات... ⏳</span>
              </div>
            ) : (
              <span>{isRegister ? 'تثبيت الحساب والبدء في نشر العقارات' : 'دخول بحساب المكتب'}</span>
            )}
          </button>

        </form>

        {/* Visitor Fallback Link */}
        <div className="border-t border-slate-100 mt-6 pt-5 text-center">
          <p className="text-[11px] text-slate-400 font-sans">هل تبحث عن عقارات فقط ولست مكتباً شريكاً؟</p>
          <button
            onClick={onContinueAsGuest}
            disabled={isLoadingDoc}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-800 font-sans hover:underline focus:outline-none cursor-pointer"
          >
            <span>الدخول كزائر وتصفح العقارات المتاحة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security sandbox disclaimer notice */}
        {!isRegister && (
          <div className="mt-4 bg-emerald-500/5 rounded-xl p-3 text-[10px] text-slate-600 border border-emerald-800/5 leading-relaxed font-sans">
            🛡️ <span className="font-bold text-emerald-950">بيئة سحابية مؤمنة:</span> يمكنك إدخال بريدك للدخول المباشر؛ وفي حال عدم تفعيل السيرفرات السحابية بالكامل، ستتولى الإدارة نقل الجلسة تلقائياً لوضع المحاكمة العقارية دون تعطيل تصفحك.
          </div>
        )}

      </div>
    </div>
  );
}
