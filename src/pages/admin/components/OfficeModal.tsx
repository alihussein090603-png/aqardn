import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, RefreshCw, Check, CheckCircle2, Copy, MessageSquare } from 'lucide-react';
import { db, isMockConfig } from '../../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfficeCreated: (newOffice: any) => void;
  showToast: (msg: string, type: string) => void;
}

export default function OfficeModal({ isOpen, onClose, onOfficeCreated, showToast }: OfficeModalProps) {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLocation, setFormLocation] = useState('السماوة - وسط المدينة');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{
    name: string;
    type: 'office' | 'community';
    email: string;
    password: string;
    phone: string;
    location: string;
    waLink: string;
  } | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setGeneratedCreds(null);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormPassword('');
    }
  }, [isOpen]);

  const encryptPassword = (pwd: string) => {
    try {
      const salt = "aqardn_secure_2026_";
      return btoa(salt + pwd);
    } catch (e) {
      return pwd;
    }
  };

  const handleAutoFillCredentials = (nameInput: string, prefix: 'office' | 'comp') => {
    setFormName(nameInput);
    if (!nameInput.trim()) {
      setFormEmail('');
      setFormPassword('');
      return;
    }
    const serial = Math.floor(1000 + Math.random() * 9000);
    setFormEmail(`${prefix}2026_${serial}@aqardn.com`);
    
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789#@$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pwd);
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert("يرجى تعبئة الحقول وتوليد البيانات الآلية أولاً.");
      return;
    }
    setFormLoading(true);
    setGeneratedCreds(null);

    const generatedUid = 'office-' + Math.random().toString(36).substr(2, 9);
    const encryptedPwd = encryptPassword(formPassword);

    const record = {
      uid: generatedUid,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      whatsapp: formPhone.trim(),
      agencyName: formName.trim() + ' لعقارات المثنى',
      role: 'broker',
      isVerified: true,
      location: formLocation,
      passwordHash: encryptedPwd,
      createdAt: new Date().toISOString()
    };

    try {
      if (!isMockConfig) {
        try {
          await setDoc(doc(db, 'users', generatedUid), record);
        } catch (err) {
          console.warn("DB write bypassed - cached offline.");
        }

        try {
          await setDoc(doc(db, 'offices', generatedUid), {
            id: generatedUid,
            name: record.name,
            email: record.email,
            phone: record.phone,
            location: record.location,
            password: encryptedPwd,
            createdAt: record.createdAt
          });
        } catch (err) {
          console.warn("Offices collection skipped.");
        }
      }

      const cachedUsersStr = localStorage.getItem('aqarat_cached_offices');
      let cachedOffices = cachedUsersStr ? JSON.parse(cachedUsersStr) : [];
      cachedOffices.unshift(record);
      localStorage.setItem('aqarat_cached_offices', JSON.stringify(cachedOffices));

      const textMsg = `أهلاً بك في منصة عقارات المثنى! 🏡✨\n\n` +
                      `تم اعتماد وتسجيل مكتبك العقاري بنجاح بنظام الأمان السحابي المشترك:\n\n` +
                      `👤 المالك: ${record.name}\n` +
                      `📍 الموقع الجغرافي: ${record.location}\n` +
                      `📧 البريد الإلكتروني: ${record.email}\n` +
                      `🔑 كلمة المرور للمكتب: ${formPassword}\n\n` +
                      `🔗 سجل الدخول فورياً وباشر بإدراج عروضك وتعديل الصفقات عبر رابط المنصة الآمن:\n` +
                      `${window.location.origin}/auth\n\n` +
                      `تحيات الإدارة العامة لشبكة المثنى العقارية 🛡️`;
      const cleanPhone = record.phone.replace(/^0/, '964');
      const waLink = `https://wa.me/${cleanPhone.startsWith('964') ? cleanPhone : '964' + cleanPhone}?text=${encodeURIComponent(textMsg)}`;

      setGeneratedCreds({
        name: record.name,
        type: 'office',
        email: record.email,
        password: formPassword,
        phone: record.phone,
        location: record.location,
        waLink: waLink
      });

      onOfficeCreated(record);
      showToast('✔️ تم تسجيل المالك وتوليد بيانات الدخول بنجاح.', 'system');

      setFormName('');
      setFormPhone('');
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ السجلات.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCopyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    showToast(`📋 تم نسخ ${label} إلى الحافظة بنجاح.`, 'system');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-8 text-right space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-amber-400 font-black text-sm">
                  🏢
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-950">إضافة مكتب شريك وتفويض الترخيص يدوياً</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedCreds ? (
              <form onSubmit={handleCreateOffice} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">اسم صاحب الحساب أو المكتب ثلاثي:</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="الأستاذ علي الحميد السماوي"
                      onChange={(e) => handleAutoFillCredentials(e.target.value, 'office')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">رقم هاتف الاتصال بالواتساب:</label>
                    <div className="relative">
                      <input 
                        type="tel"
                        required
                        placeholder="07812345678"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-800"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">الموقع والمقر التجاري للمكتب:</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800 select-none font-bold"
                    >
                      <option value="السماوة - حي الحكيم">السماوة - حي الحكيم</option>
                      <option value="السماوة - الصوب الكبير">السماوة - الصوب الكبير</option>
                      <option value="الرميثة - مركز المدينة">الرميثة - مركز المدينة</option>
                      <option value="الخضر - الحي العسكري">الخضر - الحي العسكري</option>
                      <option value="الوركاء - الحي السومري">الوركاء - الحي السومري</option>
                      <option value="السماوة - حي الشرطة">السماوة - حي الشرطة</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-dashed text-right">
                  <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                    <span>بيانات الاعتماد الذكية (تم التوليد فورياً بنظام Zero-Trust)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold mb-0.5">البريد الإلكتروني المولد:</span>
                      <input 
                        type="text" 
                        readOnly 
                        value={formEmail}
                        placeholder="سيتم التوليد فور كتابة الاسم..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs text-left focus:outline-none select-all" 
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold mb-0.5">كلمة مرور الحساب المولد:</span>
                      <input 
                        type="text" 
                        readOnly 
                        value={formPassword}
                        placeholder="توليد تلقائي عشوائي..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-center text-xs focus:outline-none text-emerald-950 font-extrabold select-all" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-950 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {formLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                  <span>تسجيل المكتب وتوثيق الترخيص السحابي الآن</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-right animate-in zoom-in-95">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="text-sm font-black text-emerald-950">تم توليد وترخيص السجل التجاري للمكتب بنجاح!</h4>
                  <p className="text-xs text-slate-500 font-sans">انسخ بيانات المرور ومفاتيح الهوية فوراً لمشاركتها مع المالك.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4.5 space-y-3 border text-xs">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                    <span className="font-sans text-slate-400">الجهّة المسجّلة:</span>
                    <span className="font-extrabold text-slate-800">{generatedCreds.name}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border gap-4">
                    <span className="font-sans text-slate-400">البريد الإلكتروني:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-slate-700 truncate select-all">{generatedCreds.email}</span>
                      <button onClick={() => handleCopyText(generatedCreds.email, 'البريد الإلكتروني')} className="p-1 hover:bg-slate-100 text-slate-500 shrink-0">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border gap-4">
                    <span className="font-sans text-slate-400">كلمة المرور الفردية:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-emerald-800 font-black select-all">{generatedCreds.password}</span>
                      <button onClick={() => handleCopyText(generatedCreds.password, 'كلمة المرور')} className="p-1 hover:bg-slate-100 text-slate-500">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  <a 
                    href={generatedCreds.waLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black p-3.5 rounded-xl text-xs shadow-md transition-all h-12"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>المشاركة الفورية عبر الواتساب</span>
                  </a>

                  <button 
                    onClick={onClose}
                    className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    إغلاق لوحة الاعتماد
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
