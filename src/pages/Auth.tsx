/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Mail, Lock, CheckCircle, 
  AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Auth(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    signInWithEmail, 
    authError, 
    isLoadingDoc, 
    currentUser, 
    role, 
    isAuthenticated 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [welcomeDetails, setWelcomeDetails] = useState<{ name: string; msg: string; isAdmin: boolean } | null>(null);

  const errorToDisplay = localError || authError;

  // Intercept authentication changes for dynamic, instant routing redirect logic
  useEffect(() => {
    if (isAuthenticated && role) {
      const name = currentUser?.name || 'مستخدم المنصة';
      const agency = currentUser?.agencyName || 'مكتب عقاري معتمد';

      if (role === 'admin') {
        setWelcomeDetails({
          name: name,
          msg: 'أهلاً بك يا سيادة المدير العام. جاري تأمين الاتصال ومطابقة مفاتيح الهوية للمدير الفني...',
          isAdmin: true
        });
        setShowWelcomeToast(true);
        
        // Execute dynamic force routing operation straight onto /admin-dashboard after a brief luxury notice pause
        const timer = setTimeout(() => {
          navigate('/admin-dashboard', { replace: true });
        }, 2200);
        return () => clearTimeout(timer);
      } else if (role === 'broker') {
        setWelcomeDetails({
          name: name,
          msg: `مرحباً بك في لوحة تحكم مكتب ${agency}. تم إقران جلسة الإدراج وتأمين المعاملات بنجاح.`,
          isAdmin: false
        });
        setShowWelcomeToast(true);

        const timer = setTimeout(() => {
          const destination = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(destination, { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else if (role === 'community') {
        setWelcomeDetails({
          name: name,
          msg: `مرحباً بك في لوحة تحكم مجمع ${agency || 'السكني'}. تم تأمين ملفات الهوية الاستثمارية وعرض البروشورات.`,
          isAdmin: false
        });
        setShowWelcomeToast(true);

        const timer = setTimeout(() => {
          const destination = (location.state as any)?.from?.pathname || '/dashboard';
          navigate(destination, { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Seeker or guest fallback
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, role, currentUser, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Pre-flight validation logic block
    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailPattern.test(email.trim())) {
        throw new Error('يرجى تزويدنا ببريد إلكتروني رسمي وصحيح للمكتب.');
      }
      if (password.length < 6) {
        throw new Error('حفاظاً على سرية عقود الملاك؛ يرجى كتابة رمز مرور يتجاوز 6 خانات.');
      }

      await signInWithEmail(email, password);
    } catch (err: any) {
      setLocalError(err?.message || 'عذراً، تعذر إتمام العملية السحابية حالياً.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      
      {/* Premium Background Ambiences */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" aria-hidden="true" />

      {/* Target Welcome Toast and Session Interception Overlays */}
      <AnimatePresence>
        {showWelcomeToast && welcomeDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`w-full max-w-md rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden ${
                welcomeDetails.isAdmin 
                  ? 'bg-gradient-to-b from-slate-900 to-emerald-950 border-2 border-amber-500/50 text-white' 
                  : 'bg-white text-slate-800 border border-slate-100'
              }`}
            >
              {/* Gold/Emerald Visual Feedback Ring */}
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  welcomeDetails.isAdmin 
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {welcomeDetails.isAdmin ? (
                    <ShieldCheck className="w-8 h-8 animate-pulse" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
              </div>

              <h2 className={`text-xl font-black mb-2 ${welcomeDetails.isAdmin ? 'text-amber-400' : 'text-slate-900'}`}>
                {welcomeDetails.isAdmin ? 'تمديد الصلاحيات للمدير العام' : 'تم التصديق السحابي الموثق'}
              </h2>
              
              <p className="text-sm font-bold opacity-90 leading-tight">
                أهلاً بك، {welcomeDetails.name}
              </p>

              <p className={`text-xs mt-3 leading-relaxed font-sans ${welcomeDetails.isAdmin ? 'text-slate-300' : 'text-slate-500'}`}>
                {welcomeDetails.msg}
              </p>

              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span>توليد مفاتيح الجلسة الآمنة...</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Login/Register Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 sm:p-10 relative z-10"
      >
        {/* Brand Accent Overlay */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-emerald-600 via-emerald-800 to-amber-500" />

        {/* Corporate Header Design */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-white shadow-emerald-950/10 shadow-lg shrink-0">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">بوابة مكاتب عقارات المثنى</h1>
            <p className="text-xs text-slate-500">حملة توثيق الهوية وتبسيط الصفقات والبيوع بالجنوب</p>
          </div>
        </div>

        {/* Floating Segment Control Tabs removed since self-registration is closed */}

        {/* Arabic exception error box mapping */}
        {errorToDisplay && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-start gap-2.5 mb-6 text-right"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-red-900">فشل التحقق والتصديق</h4>
              <p className="text-xs text-red-700 leading-relaxed font-sans">{errorToDisplay}</p>
            </div>
          </motion.div>
        )}

        {/* Input Form Fields Grid */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email address field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني المعتمد:</label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoadingDoc}
                placeholder="manager@muthanna-realestate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right font-mono disabled:opacity-50"
              />
              <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Secure password credential input field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">رمز المرور الخاص بالحساب:</label>
              <button type="button" className="text-[10px] text-emerald-800 hover:underline">فقدت الرمز؟</button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                disabled={isLoadingDoc}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:bg-white text-right disabled:opacity-50"
              />
              <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Action trigger button with elegant indicators */}
          <button
            type="submit"
            disabled={isLoadingDoc}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-950/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-emerald-800/40 disabled:cursor-not-allowed uppercase tracking-wide active:scale-[0.99] transition-all"
          >
            {isLoadingDoc ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>جاري تأمين وربط قنوات الجلسة...</span>
              </div>
            ) : (
              <span>دخول بحساب المكتب</span>
            )}
          </button>

        </form>

      </motion.div>
    </div>
  );
}
