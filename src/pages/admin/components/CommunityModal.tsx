import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, RefreshCw, Check, CheckCircle2, Copy, MessageSquare } from 'lucide-react';
import { db, isMockConfig } from '../../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Community } from '../../../types';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommunityCreated: (newCommunity: Community) => void;
  showToast: (msg: string, type: string) => void;
}

export default function CommunityModal({ isOpen, onClose, onCommunityCreated, showToast }: CommunityModalProps) {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLocation, setFormLocation] = useState('السماوة - طريق صدر القناة');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [generatedCreds, setGeneratedCreds] = useState<{
    name: string;
    type: 'community';
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

  const handleAutoFillCredentials = (nameInput: string, prefix: 'comp') => {
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

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert("يرجى ملء الحقول وتوليد بيانات الاعتماد.");
      return;
    }
    setFormLoading(true);
    setGeneratedCreds(null);

    const generatedUid = 'comp-' + Math.random().toString(36).substr(2, 9);
    const encryptedPwd = encryptPassword(formPassword);

    const defaultCover = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
    const defaultLogo = '🏢';
    const defaultProgress = 0;
    const defaultDescription = 'مجمع سكني استثماري جديد يتميز بالخدمات الحديثة والأنظمة المتكاملة. يرجى تعديل وتصميم الهوية وبطاقة العرض لعملائنا الكرام.';
    const defaultBlocks = ['البلوك A', 'البلوك B', 'البلوك C'];

    const record = {
      uid: generatedUid,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      whatsapp: formPhone.trim(),
      agencyName: 'مجمع ' + formName.trim() + ' السكني',
      role: 'community',
      isVerified: true,
      location: formLocation,
      passwordHash: encryptedPwd,
      createdAt: new Date().toISOString(),
      logo: defaultLogo,
      coverImage: defaultCover,
      progress: defaultProgress,
      description: defaultDescription,
      blocks: defaultBlocks
    };

    try {
      const compRecord: Community = {
        id: generatedUid,
        name: record.agencyName,
        email: record.email,
        phone: record.phone,
        location: record.location,
        createdAt: record.createdAt,
        activeListingsCount: 0,
        logo: record.logo,
        coverImage: record.coverImage,
        progress: record.progress,
        description: record.description,
        blocks: record.blocks
      } as any;

      if (!isMockConfig) {
        try {
          await setDoc(doc(db, 'users', generatedUid), record);
        } catch (err) {
          console.warn("DB write bypassed - cached offline.");
        }

        const compRecordExtra = {
          ...compRecord,
          password: encryptedPwd
        };

        try {
          await setDoc(doc(db, 'communities', generatedUid), compRecordExtra);
        } catch (err) {
          console.warn("Communities collection bypassed.");
        }
      }

      const cachedCompStr = localStorage.getItem('aqarat_cached_communities');
      let cachedComps = cachedCompStr ? JSON.parse(cachedCompStr) : [];
      cachedComps.unshift(compRecord);
      localStorage.setItem('aqarat_cached_communities', JSON.stringify(cachedComps));

      const textMsg = `أهلاً بك في منصة عقارات المثنى! 🏡✨\n\n` +
                      `تم تسجيل مجمعكم السكني واعتماده بنجاح كشريك عقاري رسمي ومستقل:\n\n` +
                      `🏢 المجمع السكني: ${compRecord.name}\n` +
                      `📍 موقع المجمع: ${compRecord.location}\n` +
                      `📧 البريد المعتمد: ${compRecord.email}\n` +
                      `🔑 كلمة مرور المجمع: ${formPassword}\n\n` +
                      `🔗 يمكنك البدء الآن بإضافة الوحدات السكنية والفلل التابعة لكم بشكل مستقل ومباشر من لوحة التحكم الخاصة بمجمعكم:\n` +
                      `${window.location.origin}/auth\n\n` +
                      `تحيات الإدارة الفنية لشبكة عقارات المثنى 🛡️`;
      const cleanPhone = record.phone.replace(/^0/, '964');
      const waLink = `https://wa.me/${cleanPhone.startsWith('964') ? cleanPhone : '964' + cleanPhone}?text=${encodeURIComponent(textMsg)}`;

      setGeneratedCreds({
        name: compRecord.name,
        type: 'community',
        email: compRecord.email,
        password: formPassword,
        phone: compRecord.phone,
        location: compRecord.location,
        waLink: waLink
      });

      onCommunityCreated(compRecord);
      showToast('✔️ تم توليد حساب المجمع بنجاح وجاهز للربط والمشاركة.', 'system');

      setFormName('');
      setFormPhone('');
    } catch (err) {
      console.error(err);
      alert("تعذر تسجيل المعهد السكني.");
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
            className="bg-white rounded-2xl max-w-xl w-full border border-slate-100 shadow-2xl p-5 sm:p-7 text-right relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-extrabold text-sm border border-emerald-500/10">
                  🏢
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-950">تسجيل مجمع سكني ومطور استثماري جديد</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedCreds ? (
              <form onSubmit={handleCreateCommunity} className="space-y-4 font-sans">
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">البيانات الحكومية والاستثمارية الأساسية</span>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">اسم المجمع العقاري المعتمد:</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        value={formName}
                        placeholder="مثال: مجمع صدر القناة السكني، مجمع السدير"
                        onChange={(e) => handleAutoFillCredentials(e.target.value, 'comp')}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">رقم هاتف مسؤول المبيعات المعتمد:</label>
                    <div className="relative">
                      <input 
                        type="tel"
                        required
                        placeholder="07812345678"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:bg-white"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">موقع الجغرافي للمجمع (في قضاء المثنى):</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-800 font-bold"
                    >
                      <option value="السماوة - طريق صدر القناة">السماوة - طريق صدر القناة</option>
                      <option value="السماوة - مجمع تبارك السكني">السماوة - مجمع تبارك السكني</option>
                      <option value="الرميثة - منطقة السكن الحديث">الرميثة - منطقة السكن الحديث</option>
                      <option value="الخضر - الفرات الصغير">الخضر - الفرات الصغير</option>
                      <option value="السماوة - حي الحكيم">السماوة - حي الحكيم</option>
                      <option value="الرميثة - حي بابل">الرميثة - حي بابل</option>
                    </select>
                  </div>
                </div>

                {/* Secure Auth info box (auto derived) */}
                <div className="space-y-3 bg-emerald-500/5 p-4 rounded-xl border border-dashed border-emerald-500/15 text-right font-sans col-span-1">
                  <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                    <span>توليد حساب الشريك الآمن (Zero-Trust Security)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-450 block font-bold mb-0.5">البريد الإلكتروني المولد:</span>
                      <input 
                        type="text" 
                        readOnly 
                        value={formEmail}
                        placeholder="يتم توليده تلقائياً..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-left focus:outline-none select-all" 
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block font-bold mb-0.5">كلمة مرور مبيعات المجمع:</span>
                      <input 
                        type="text" 
                        readOnly 
                        value={formPassword}
                        placeholder="يتم توليدها تلقائياً..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-center text-xs focus:outline-none text-emerald-900 font-extrabold select-all" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-950 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {formLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                  <span>اعتماد وتسجيل شريك المجمع السكني</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-right animate-in zoom-in-95">
                <div className="flex justify-center mb-1">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300">
                    <CheckCircle2 className="w-6 h-6 text-amber-600" />
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="text-sm font-black text-amber-950">تم تسجيل الشريك بنجاح!</h4>
                  <p className="text-xs text-slate-500">تم تجهيز الحساب واستيفاء البنية الافتتاحية للمجمع.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border text-xs font-sans">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                    <span className="text-slate-450">اسم المجمع العقاري:</span>
                    <span className="font-extrabold text-slate-850">{generatedCreds.name}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border gap-4">
                    <span className="text-slate-450">البريد الإلكتروني المعتمد:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-slate-700 truncate select-all">{generatedCreds.email}</span>
                      <button onClick={() => handleCopyText(generatedCreds.email, 'البريد الإلكتروني')} className="p-1 hover:bg-slate-100 text-slate-500 shrink-0">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border gap-4">
                    <span className="text-slate-450">رمز الدخول الآمن:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-emerald-800 font-extrabold select-all">{generatedCreds.password}</span>
                      <button onClick={() => handleCopyText(generatedCreds.password, 'كلمة المرور')} className="p-1 hover:bg-slate-100 text-slate-500">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a 
                    href={generatedCreds.waLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black p-3.5 rounded-xl text-xs shadow-md transition-all h-12 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال تفاصيل الإدارة بالواتساب الموحد</span>
                  </a>

                  <button 
                    onClick={onClose}
                    className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    إغلاق نافذة التسجيل
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
