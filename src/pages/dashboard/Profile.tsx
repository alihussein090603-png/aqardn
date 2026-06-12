import React, { useState } from 'react';
import { User, Phone, MapPin, ShieldCheck, Mail, Save, Star, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Profile(): React.ReactElement {
  const { currentUser, login } = useAuth();
  const { showToast, properties } = useAppState();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [agencyName, setAgencyName] = useState(currentUser?.agencyName || '');
  const [email, setEmail] = useState('manager@almuthanna-aqar.com');

  // Interactive Verification features states
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isSubmitVerificationOpen, setIsSubmitVerificationOpen] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const myProperties = properties.filter((p) => p.broker?.id === currentUser?.id);
  const totalViews = myProperties.reduce((acc, curr) => acc + curr.views, 0);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Update the Auth context state
    const updatedUser = {
      ...currentUser,
      name,
      phone,
      whatsapp,
      agencyName,
    };

    login(updatedUser);
    showToast('💾 تم حفظ بيانات مكتبك العقاري بنجاح وتحديث الهوية الإلكترونية!', 'system');
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in-50 duration-200 text-right" dir="rtl">
        
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-extrabold text-slate-900">بيانات حسابي الشخصي وإدارة الهوية التجارية</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">تحكم بالشعارات التجارية ومعلومات التواصل المباشرة المرفقة تحت كل عقار تنشره.</p>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card left: Meta-status & badges */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-4">
              <div className="relative inline-block">
                <img 
                  src={currentUser?.avatar} 
                  alt={currentUser?.name} 
                  className="w-20 h-20 rounded-full mx-auto object-cover border-3 border-emerald-500 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>شريك مبيعات معتمد وعضو ذهبي</span>
                </h4>
                <p className="font-bold text-sm mt-1">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{currentUser?.agencyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">عقاراتك النشطة</span>
                  <p className="font-black text-sm text-white mt-0.5">{myProperties.length}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">مشاهداتك</span>
                  <p className="font-black text-sm text-emerald-400 mt-0.5">{totalViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-800/10 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
              <h5 className="font-extrabold text-emerald-950 flex items-center gap-1.5 border-b border-emerald-800/5 pb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>التحقق القانوني والهوية المهنية:</span>
              </h5>
              
              {currentUser?.isVerified ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-900 px-2.5 py-1 rounded-md text-[10px] font-black w-fit">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current ml-0.5" />
                    <span>مكتب مرخص وعضو ذهبي معتمد</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                    تم تدقيق رخصة الممارسة الصادرة عن الجمعية العراقية للوسطاء العقاريين لمكتبكم بمقركم بالسماوة. حسابكم معتمد بالكامل بنجمة التحقق الذهبية.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCertificateOpen(true)}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer border-0"
                  >
                    <span>📜 عرض وثيقة ترخيص الاعتماد السنوية الرقمية</span>
                  </button>
                </div>
              ) : verificationSubmitted ? (
                <div className="space-y-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-[10px] text-amber-950 font-semibold">
                  <span className="font-black text-amber-805 block">⏳ طلب التوثيق قيد التدقيق الفني:</span>
                  <p className="leading-relaxed text-[9px] text-slate-600 font-bold">
                    رقم المعاملة: #{Math.floor(Math.random() * 89999 + 10000)}<br />
                    قدّمت رخصة رقم {licenseNumber || '٨٧٣/ب'} بنجاح. سنقوم بحوسبة الملف وتفعيل الشارة لحسابكم بعد تدقيق السجلات.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-black w-fit">
                    <span>حساب غير موثق مؤقتاً</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    حسابكم لا يحتوي على شارة التحقق الصفراء. لزيادة مصداقية عملائكم وتفعيل المزايا المتقدمة، يرجى تقديم وثائق الرخصة للتصديق ومطابقة السجل.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitVerificationOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer border-0"
                  >
                    <span>🔱 طلب الشارة الذهبية وتوثيق المقر</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card right: config input settings form */}
          <form onSubmit={handleUpdateProfile} className="md:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 gap-6">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">الاسم الكامل لصاحب المكتب العقاري:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-4 pl-10 py-3 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white text-right"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1.5 font-mono">
                <label className="block text-xs font-bold text-slate-700 text-right">رقم للتواصل والاتصال الهاتفي:</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-4 pl-10 py-3 text-center text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="block text-xs font-bold text-slate-700 text-right">رقم تحويل واتساب الدولي (بدون +):</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none focus:bg-white"
                />
              </div>

            </div>

            <div className="space-y-1.5 font-mono">
              <label className="block text-xs font-bold text-slate-700 text-right">البريد الإلكتروني المعتمد لتلقي إشعارات الحساب:</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-100 border border-slate-250 text-slate-500 rounded-xl pr-4 pl-10 py-3 text-right text-xs focus:outline-none"
                />
                <div className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 inline-block">لا يمكن تغيير البريد الإلكتروني دون مراجعة موظف الدعم التقني لعقارات المثنى.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتثبيت تعديل ملف حسابي</span>
            </button>

          </form>

        </div>

      </div>

      {/* Gold Royal Accreditation Certificate Modal Dialog */}
      {isCertificateOpen && (
        <div id="certificate-portal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs text-right text-slate-900" dir="rtl">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCertificateOpen(false)} />
          
          <div className="relative bg-[#faf7f0] border-8 border-double border-amber-600/70 w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-10 text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Elegant pattern lines decoration */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/5 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/5 rounded-full blur-xl" />

            <button 
              type="button" 
              onClick={() => setIsCertificateOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-amber-800/10 hover:bg-amber-800/20 text-amber-900 flex items-center justify-center transition-all cursor-pointer text-xs"
            >
              ✕
            </button>

            {/* Crest / Emblem */}
            <div className="space-y-1 select-none">
              <span className="text-[9px] uppercase tracking-widest font-black text-amber-800 block">جمهورية العراق</span>
              <span className="text-[8px] font-bold text-slate-500 block">نقابة الوسطاء والمكاتب العقارية القانونية في المثنى</span>
              <div className="w-16 h-16 rounded-full border-2 border-stone-400 bg-amber-500/10 flex items-center justify-center mx-auto shadow-sm mt-3">
                <span className="text-xl">⚖</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5 border-b-2 border-stone-300 pb-4">
              <h2 className="text-base sm:text-lg font-black text-amber-900 tracking-wide">وثيقة ترخيص واعتماد عقاري رقمية سنوية</h2>
              <p className="text-[10px] text-stone-500 font-bold">بروتوكول الاعتماد والتحقق لعام ٢٠٢٦ مـ</p>
            </div>

            {/* Certificate Body text */}
            <div className="py-2 space-y-4 text-xs font-semibold leading-relaxed text-stone-800">
              <p>
                تُقر الهيئة العليا واللجنة التنظيمية لإدارة منصة <span className="font-black text-emerald-900">عقارات المثنى</span> الرقمية بأن:
              </p>
              
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-600/25 max-w-md mx-auto space-y-1">
                <span className="text-[10px] text-amber-800 font-bold block">مكتب الوساطة القانوني المرخص:</span>
                <span className="text-sm font-black text-emerald-950 block">{currentUser?.agencyName}</span>
                <span className="text-[9px] text-stone-505 block">بإدارة الوكيل العقاري: {currentUser?.name}</span>
              </div>

              <p className="text-[10px] text-stone-600 max-w-sm mx-auto">
                هو شريك تجاري <span className="text-amber-800 font-black">معتمد ومحقق من الفئة الذهبية</span> لممارسة الوساطة العقارية وجلب وترويج الأراضي السكنية ومطابقة الطابو في عموم أقضية محافظة المثنى. يحمل الترخيص الرقمي ذو المعرف الفريد للتسجيل:
              </p>

              <p className="font-mono text-emerald-800 text-[11px] font-black tracking-widest bg-stone-100 py-1.5 px-3 rounded-lg w-fit mx-auto border border-stone-200">
                AQAR-MUTHANNA-{currentUser?.id?.toUpperCase()?.substring(0, 8) || 'VERIFIED'}
              </p>
            </div>

            {/* Seals and Signatures */}
            <div className="pt-4 border-t border-dotted border-stone-300 flex items-center justify-between px-4 sm:px-8 text-right bg-stone-50/50 p-4 rounded-xl">
              <div>
                <span className="text-[8px] text-stone-400 block font-bold">توقيع المدير المسؤول:</span>
                <span className="text-[10px] font-black text-stone-800 block mt-1.5 italic decorative">علي الحسين</span>
                <span className="text-[7px] text-stone-500 block">إدارة شؤون الوسطاء والتحقق</span>
              </div>

              {/* Gold Seal */}
              <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-full border-2 border-amber-600 outline outline-4 outline-amber-500/20 font-black text-[7px] flex flex-col items-center justify-center -rotate-6 shadow-md shadow-amber-500/20 shrink-0">
                <span>ختم مرخص</span>
                <span>٢٠٢٦</span>
              </div>
            </div>

            {/* Note */}
            <p className="text-[8px] text-slate-400">
              تخضع هذه الوثيقة الرقمية لشروط الترخيص العقاري السنوي في العراق، وتعتبر ملغاة تلقائياً في حال انتهاء الرخصة السنوية للمكتب.
            </p>

          </div>
        </div>
      )}

      {/* Submit Verification Application Modal Form */}
      {isSubmitVerificationOpen && (
        <div id="submit-verification-portal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-right text-slate-900 animate-in fade-in duration-200" dir="rtl">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSubmitVerificationOpen(false)} />
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setVerificationSubmitted(true);
              setIsSubmitVerificationOpen(false);
              showToast('🔱 تم تقديم مستندات الترخيص بنجاح! جاري المراجعة والتدقيق بواسطة الإدارة العليا.', 'system');
            }}
            className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-black text-slate-900">طلب تفعيل الهوية المعتمدة والشارة الذهبية</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSubmitVerificationOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
              أهلاً بكم شريكنا العقاري. لمطابقة السجل الفني لمكتبكم مع سجلات طابو المثنى وتفعيل الشارة الذهبية الموثقة على منشوراتكم، يرجى تزويدنا بالمعلومات الرسمية التالية:
            </p>

            <div className="space-y-4">
              
              {/* Field 1: License ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block">رقم رخصة مهنة العقارات / الهوية النقابية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ٨٧٣ / ب (أو نقابة ذوي المهن)"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-emerald-800 text-right"
                />
              </div>

              {/* Field 2: Office Physical Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block">عنوان المقر الفعلي والمحل الميداني بسند الإيجار/الملك:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: السماوة - حي المعلمين - قرب بناية البلدية"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-emerald-800 text-right"
                />
              </div>

              {/* Field 3: Backup Phone Contact number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block">رقم هاتف بديل لمكتبك لاستلام مكالمة التأكيد الكشفية:</label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: ٠٧٨٠١٢٣٤٥٦٧"
                  value={alternativePhone}
                  onChange={(e) => setAlternativePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center font-mono font-bold text-slate-900 focus:outline-emerald-800"
                />
              </div>

            </div>

            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex gap-2">
              <span className="text-sm">🔱</span>
              <p className="text-[9px] text-slate-650 leading-relaxed font-semibold">
                طريقة التفعيل: يقوم كادر التدقيق الفني لعقارات المثنى بالتواصل مع الرقم البديل أو كشف موقعكم الميداني في السماوة لمطابقة الهوية خلال ٢٤ ساعة عمل من تقديم الطلب.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0 shadow-md"
            >
              تقديم الطلب والمستندات للمراجعة الأمنية 📤
            </button>

          </form>
        </div>
      )}

    </DashboardLayout>
  );
}
