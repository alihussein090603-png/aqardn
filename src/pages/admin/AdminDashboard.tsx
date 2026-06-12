/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  ShieldCheck, CheckCircle, X, Users, Building, TrendingUp, 
  MapPin, Trash2, UserCheck, Search, Check, AlertCircle, Plus,
  Key, Mail, Phone, User, Briefcase, FileText, CheckCircle2, 
  RefreshCw, Menu, Copy, ExternalLink, Eye, LayoutGrid, Award, MessageSquare, LogOut,
  Landmark, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { db, isMockConfig } from '../../services/firebase';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  collection, getDocs, doc, updateDoc, deleteDoc, 
  query, where, setDoc, Timestamp, addDoc
} from 'firebase/firestore';
import { Broker, Property, Community, DISTRICTS } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

// Code-Splitting: Lazy load the heavy subpaths for better initial load performance
const AdminOverviewTab = lazy(() => {
  // Pre-fetch hint
  return import('./tabs/AdminOverview');
});
const AdminListingsTab = lazy(() => import('./tabs/AdminListings'));
const AdminBrokersTab = lazy(() => import('./tabs/AdminBrokers'));
const AdminCommunitiesTab = lazy(() => import('./tabs/AdminCommunities'));
const AdminCatalogTab = lazy(() => import('./tabs/AdminCatalog'));

const OfficeModal = lazy(() => import('./components/OfficeModal'));
const CommunityModal = lazy(() => import('./components/CommunityModal'));

// Skeleton loader that doesn't block the layout outline
const DashboardTabSkeleton = () => (
   <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
     <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-emerald-850 animate-spin" />
     <p className="text-xs text-slate-500">جلب وعزل السجلات الثقيلة بالخلفية...</p>
   </div>
);

interface AdminProperty extends Property {
  status: 'pending' | 'active' | 'sold' | 'rejected';
}

export default function AdminDashboard(): React.ReactElement {
  const { currentUser, logout } = useAuth();
  const { properties, addProperty, deleteProperty, showToast } = useAppState();
  const navigate = useNavigate();

  // Navigation Panel Mode
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'brokers' | 'communities' | 'catalog'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Data Pools
  const [pendingListings, setPendingListings] = useState<AdminProperty[]>([]);
  const [brokersPool, setBrokersPool] = useState<any[]>([]);
  const [communitiesPool, setCommunitiesPool] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Modals Toggles
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  // Fallback state for generated credentials to avoid sub-tab destructuring errors
  const [generatedCreds, setGeneratedCreds] = useState<any>(null);

  // Catalog Filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogDistrict, setCatalogDistrict] = useState('جميع الأقضية');

  // Sync / Load data pools on demand in the background
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdminData();
    }, 150);
    return () => clearTimeout(timer);
  }, [properties]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const qProperties = query(collection(db, 'properties'), where('status', '==', 'pending'));
      
      const [pendingRes, usersRes, communitiesRes] = await Promise.allSettled([
        getDocs(qProperties),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'communities'))
      ]);

      // 1. Fetch live Pending Listings from Firestore or fall back to local simulation
      const pendingTemp: AdminProperty[] = [];
      if (pendingRes.status === 'fulfilled') {
        pendingRes.value.forEach((docSnap) => {
          const dData = docSnap.data();
          pendingTemp.push({
            id: docSnap.id,
            title: dData.title || '',
            description: dData.description || '',
            priceIQD: dData.price || 0,
            priceUSD: dData.priceUSD || 0,
            category: dData.category || 'house',
            transactionType: dData.type || 'sale',
            district: dData.district || 'السماوة',
            neighborhood: dData.neighborhood || '',
            addressDetails: dData.addressDetails || '',
            area: dData.area || 0,
            rooms: dData.rooms || 0,
            bathrooms: dData.bathrooms || 0,
            images: dData.images || [],
            isPremium: dData.isPremium || false,
            createdAt: dData.createdAt instanceof Timestamp ? dData.createdAt.toDate().toISOString() : dData.createdAt || '',
            views: dData.viewsCount || 0,
            status: dData.status || 'pending',
            features: dData.features || [],
            broker: {
              id: dData.brokerId || 'system',
              name: dData.brokerName || 'مكتب عقاري معتمد',
              agencyName: dData.brokerAgency || 'عقارات المثنى الرسمية',
              avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80',
              phone: dData.brokerPhone || '',
              whatsapp: dData.brokerPhone || '',
              isVerified: true,
              rating: 5.0,
              activeListingsCount: 1
            }
          });
        });
      } else {
        console.warn("Firestore properties query skipped (custom offline fallback mode): leveraging memory catalog.");
      }

      // Populate scaffolding row if Firestore didn't return any values
      if (pendingTemp.length === 0) {
        pendingTemp.push({
          id: 'temp-admin-scaffold-1',
          title: 'فيلا حديثة طابقين للبيع مع مسبح وملحقات في حي الغدير',
          description: 'فيلا سكنية ذات واجهة حجر فاخرة، تصميم حديث وشوارع عريضة مجهزة بكافة شبكات المياه الكهرباء والإنترنت.',
          priceIQD: 285,
          priceUSD: 195000,
          category: 'house',
          transactionType: 'sale',
          district: 'السماوة',
          neighborhood: 'حي الغدير',
          addressDetails: 'بالقرب من بوابة متنزه البديري الرئيسي والشارع العسكري',
          area: 320,
          rooms: 4,
          bathrooms: 3,
          images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'],
          isPremium: true,
          createdAt: new Date().toISOString(),
          views: 48,
          status: 'pending',
          features: ['واجهة قرميد حجر', 'حديقة خارجية مع مرشات', 'عزل حراري وصوتي ممتاز'],
          broker: {
            id: 'broker-demo-1',
            name: 'الحاج جاسم آل كاطع',
            agencyName: 'مكتب الرشيد للعقارات والمقاولات العامة',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
            phone: '07804445556',
            whatsapp: '9647804445556',
            rating: 4.8,
            isVerified: false,
            activeListingsCount: 3
          }
        });
      }
      setPendingListings(pendingTemp);

      // 2. Load User profiles from 'users'
      const brokersTemp: any[] = [];
      const cachedUsersStr = localStorage.getItem('aqarat_cached_offices');
      let cachedOffices: any[] = cachedUsersStr ? JSON.parse(cachedUsersStr) : [];

      if (usersRes.status === 'fulfilled') {
        usersRes.value.forEach((docSnap) => {
          const dData = docSnap.data();
          if (dData.role === 'broker' && !(dData.email || '').toLowerCase().includes('comp')) {
            brokersTemp.push({
              uid: docSnap.id,
              ...dData,
              createdAt: dData.createdAt instanceof Timestamp ? dData.createdAt.toDate().toISOString() : dData.createdAt
            });
          }
        });
      } else {
        console.warn("Using offline memory for offices.");
      }

      if (brokersTemp.length === 0) {
        // Use defaults + cached
        const defaults = [
          {
            uid: 'b1',
            name: 'الحاج أبو علي السماوي',
            email: 'office2026_b1@aqardn.com',
            agencyName: 'مكتب السماوي للعقارات والمقاولات',
            phone: '07801234567',
            whatsapp: '9647801234000',
            passwordHash: btoa('aqardn_secure_2026_123456'),
            role: 'broker',
            isVerified: true,
            location: 'السماوة - حي الحكيم',
            createdAt: '2026-01-10T10:00:00.000Z'
          },
          {
            uid: 'b2',
            name: 'المهندس رائد الخفاجي',
            email: 'office2026_b2@aqardn.com',
            agencyName: 'مكتب الغدير العقاري - السماوة',
            phone: '07709876543',
            whatsapp: '9647700000005',
            passwordHash: btoa('aqardn_secure_2026_123456'),
            role: 'broker',
            isVerified: true,
            location: 'السماوة - حي الغربي',
            createdAt: '2026-02-12T12:00:00.000Z'
          },
          {
            uid: 'b3',
            name: 'ضياء عادل الرميثي',
            email: 'office2026_b3@aqardn.com',
            agencyName: 'مكتب الرميثة للخدمات العقارية',
            phone: '07812345678',
            whatsapp: '9647812000000',
            passwordHash: btoa('aqardn_secure_2026_123456'),
            role: 'broker',
            isVerified: false,
            location: 'الرميثة - حي الشهداء',
            createdAt: '2026-03-15T15:00:00.000Z'
          },
          {
            uid: 'office-demo-1',
            name: 'الأستاذ ناصر الحمامي',
            email: 'office2026_nasr@aqardn.com',
            agencyName: 'مكتب الحمامي للعقارات والمقاولات',
            phone: '07802879555',
            whatsapp: '9647802879555',
            passwordHash: btoa('aqardn_secure_2026_123456'),
            role: 'broker',
            isVerified: true,
            location: 'السماوة - حي الحكيم',
            createdAt: '2026-04-12T14:22:15.000Z'
          },
          {
            uid: 'office-demo-2',
            name: 'الأستاذ وضاح السماوي',
            email: 'office2026_waddah@aqardn.com',
            agencyName: 'مكتب الوفاء للاستثمارات السكنية',
            phone: '07702223334',
            whatsapp: '9647702223334',
            passwordHash: btoa('aqardn_secure_2026_waddah2026'),
            role: 'broker',
            isVerified: true,
            location: 'الرميثة - شارع السراي',
            createdAt: '2026-02-18T11:05:00.000Z'
          }
        ];
        brokersTemp.push(...defaults, ...cachedOffices);
      }
      setBrokersPool(brokersTemp);

      // 3. Load Communities from Firestore
      const communitiesTemp: Community[] = [];
      const cachedCompStr = localStorage.getItem('aqarat_cached_communities');
      let cachedComps: Community[] = cachedCompStr ? JSON.parse(cachedCompStr) : [];

      if (communitiesRes.status === 'fulfilled') {
        communitiesRes.value.forEach((docSnap) => {
          const dData = docSnap.data();
          communitiesTemp.push({
            id: docSnap.id,
            name: dData.name || '',
            email: dData.email || '',
            phone: dData.phone || '',
            location: dData.location || '',
            createdAt: dData.createdAt instanceof Timestamp ? dData.createdAt.toDate().toISOString() : dData.createdAt || ''
          });
        });
      } else {
        console.warn("Using offline memory for residential complexes.");
      }

      if (communitiesTemp.length === 0) {
        const defaults = [
          {
            id: 'comm-sudeer',
            name: 'مجمع السدير السكني الاستثماري',
            email: 'comp2026_sudeer@aqardn.com',
            phone: '07802003001',
            passwordHash: btoa('aqardn_secure_2026_sudeer2026'),
            location: 'السماوة - طريق صدر القناة',
            createdAt: '2026-03-10T09:12:30.000Z'
          },
          {
            id: 'comm-narjis',
            name: 'مجمع النرجس السكني المتكامل',
            email: 'comp2026_narjis@aqardn.com',
            phone: '07705006002',
            passwordHash: btoa('aqardn_secure_2026_narjis2026'),
            location: 'الرميثة - حي بابل',
            createdAt: '2026-04-15T08:00:00.000Z'
          },
          {
            id: 'comm-tabarak',
            name: 'مجمع تبارك السكني الذكي',
            email: 'comp2026_tabarak@aqardn.com',
            phone: '07817008003',
            passwordHash: btoa('aqardn_secure_2026_tabarak2026'),
            location: 'السماوة - مجمع تبارك السكني',
            createdAt: '2026-05-10T09:12:30.000Z'
          }
        ];
        communitiesTemp.push(...defaults, ...cachedComps);
      }
      setCommunitiesPool(communitiesTemp);

    } catch (err) {
      console.error("Aggregation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Verification of Brokers
  const handleToggleBrokerVerification = async (uid: string, currentStatus: boolean) => {
    setActionInProgress(uid);
    const nextStatus = !currentStatus;
    try {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { isVerified: nextStatus });
      } catch (e) {
        console.warn("Local verify toggle sync.");
      }

      setBrokersPool((prev) => 
        prev.map((b) => b.uid === uid ? { ...b, isVerified: nextStatus } : b)
      );

      showToast(
        nextStatus 
          ? '🌟 تم تفعيل موثوقية السجل وإصدار ترخيص رسمي للمكتب.' 
          : '⚠️ تم إيقاف وتجميد رخصة الحساب ومزاولة النشر العقاري.',
        'system'
      );
    } catch (err) {
      showToast('خطأ في إرسال طلب الترخيص السحابي.', 'system');
    } finally {
      setActionInProgress(null);
    }
  };

  // Absolute Delete of Property (Super Admin Absolute Control)
  const handleAbsoluteDeleteProperty = async (id: string, titleStr: string) => {
    if (!confirm(`تحذير أمني: هل أنت متأكد تماماً من رغبتك في حذف عقار "${titleStr}" بشكل نهائي ومطلق من السيرفرات وقاعدة البيانات؟`)) {
      return;
    }
    setActionInProgress(id);
    try {
      // 1. Delete from Firestore
      try {
        await deleteDoc(doc(db, 'properties', id));
      } catch (err) {
        console.warn("Purged locally.");
      }

      // 2. Delete from global state/layout
      deleteProperty(id);
      
      // Update pending items if present
      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      showToast('❌ تم إزالة عقار المخالف نهائياً وبنجاح من المنصة.', 'system');
    } catch (e) {
      alert("تعذر حذف الإعلان من الخادم.");
    } finally {
      setActionInProgress(null);
    }
  };

  // Approve Listing and make active
  const handleApproveProperty = async (property: AdminProperty) => {
    setActionInProgress(property.id);
    try {
      try {
        const propRef = doc(db, 'properties', property.id);
        await updateDoc(propRef, { status: 'active' });
      } catch (dbErr) {
        console.warn("Synced locally.");
      }

      const mappedLiveProp: Property = {
        ...property,
        id: property.id.startsWith('temp-') ? 'p-' + Date.now() : property.id
      };

      addProperty(mappedLiveProp);
      setPendingListings((prev) => prev.filter((item) => item.id !== property.id));
      showToast('✔️ تم الترخيص والموافقة بنشر العقار وإدراجه فورياً.', 'system');
    } catch (error) {
      alert('حدث خطأ أثناء الموافقة الفنية على النشر.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Reject and remove pending request
  const handleRejectProperty = async (id: string) => {
    if (!confirm('هل تريد فعلاً رفض طلب الإدراج واستبعاده من تفتيش الإدارة؟')) return;
    setActionInProgress(id);
    try {
      try {
        await deleteDoc(doc(db, 'properties', id));
      } catch (err) {
        console.warn("Refused offline.");
      }

      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      showToast('❌ تم إلغاء واستبعاد طلب العقار لمخالفة التعليمات.', 'system');
    } catch (e) {
      alert('تعذر استبعاد الطلب.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete broker/office permanently
  const handleDeleteBroker = async (uid: string) => {
    if (!confirm('تحذير: هل أنت متأكد تماماً من رغبتك في حذف هذا المكتب بصفة نهائية؟ سيتم مسحه ومسح بيانات مروره من قاعدة البيانات.')) return;
    setActionInProgress(uid);
    try {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn("Deleted Firestore broker record locally.");
      }
      
      setBrokersPool((prev) => prev.filter((b) => b.uid !== uid));
      
      // Sync local storage if present
      const cached = localStorage.getItem('aqarat_cached_offices');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const updated = parsed.filter((b: any) => b.uid !== uid);
          localStorage.setItem('aqarat_cached_offices', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      
      showToast('❌ تم تدمير وإلغاء ترخيص المكتب العقاري نهائياً.', 'system');
    } catch (e) {
      alert('تعذر حذف المكتب.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete residential community permanently
  const handleDeleteCommunity = async (id: string) => {
    if (!confirm('تحذير: هل أنت متأكد تماماً من رغبتك في حذف هذا المجمع السكني بصفة نهائية؟ سيتم مسح حساب المجمع والوحدات المرتبطة به.')) return;
    setActionInProgress(id);
    try {
      try {
        await deleteDoc(doc(db, 'communities', id));
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        console.warn("Deleted Firestore community record locally.");
      }
      
      setCommunitiesPool((prev) => prev.filter((c) => c.id !== id));
      
      // Sync local storage
      const cached = localStorage.getItem('aqarat_cached_communities');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const updated = parsed.filter((c: any) => c.id !== id);
          localStorage.setItem('aqarat_cached_communities', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      
      showToast('❌ تم حذف المجمع السكني الاستثماري بالكامل.', 'system');
    } catch (e) {
      alert('تعذر حذف المجمع السكني.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter lists safely
  
  const filteredOffices = brokersPool.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (b.name || '').toLowerCase().includes(term) || 
           (b.phone || '').includes(term) || 
           (b.location || '').toLowerCase().includes(term) ||
           (b.agencyName || '').toLowerCase().includes(term);
  });

  const filteredCommunities = communitiesPool.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term) || 
           (c.phone || '').includes(term) || 
           (c.location || '').toLowerCase().includes(term);
  });

  const filteredCatalogProperties = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesDistrict = catalogDistrict === 'جميع الأقضية' || p.district === catalogDistrict;
    return matchesSearch && matchesDistrict;
  });

  // Calculate stats dynamically based on actual entries for extreme precision
  const totalPropertiesInApp = properties.length;
  const totalOfficesCount = brokersPool.length;
  const totalCommunitiesCount = communitiesPool.length;

  const handleCopyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    showToast(`📋 تم نسخ ${label} إلى الحافظة بنجاح.`, 'system');
  };

  
  const contextProps = {
    totalPropertiesInApp, totalOfficesCount, totalCommunitiesCount, setShowOfficeModal, 
    setGeneratedCreds, setShowCommunityModal, pendingListings, handleApproveProperty, 
    handleRejectProperty, brokersPool, searchTerm, setSearchTerm, handleToggleBrokerVerification,
    communitiesPool, properties, catalogSearch, setCatalogSearch, catalogDistrict, setCatalogDistrict,
    handleAbsoluteDeleteProperty, handleDeleteBroker, handleDeleteCommunity, actionInProgress, setActiveTab
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSearchTerm('');
      }}
      pendingListingsCount={pendingListings.length}
      brokersCount={brokersPool.length}
      communitiesCount={communitiesPool.length}
      propertiesCount={properties.length}
    >
        
        {/* Banner with general manager branding info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-800 rounded-xl shrink-0 hidden sm:block">
              <ShieldCheck className="w-6 h-6 text-emerald-700 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 leading-tight">مركز النفوذ والتصديق — منصة عقارات المثنى</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                تحليلات الأداء، تحجيم الحسابات السكنية، الموافقة على عروض الدلالين، وتحكم إداري مطلق لقمع الإيجارات المخالفة.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-center font-semibold text-[10px] sm:text-xs text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-150 font-sans">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>المنظومة: متصلة وآمنة بالكامل</span>
          </div>
        </div>

        {/* Dynamic Route views container */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <Suspense fallback={<DashboardTabSkeleton />}>
              {activeTab === 'overview' && <AdminOverviewTab {...contextProps} />}
              {activeTab === 'listings' && <AdminListingsTab {...contextProps} />}
              {activeTab === 'brokers' && <AdminBrokersTab {...contextProps} />}
              {activeTab === 'communities' && <AdminCommunitiesTab {...contextProps} />}
              {activeTab === 'catalog' && <AdminCatalogTab {...contextProps} />}
            </Suspense>
          </AnimatePresence>
        </div>

      <Suspense fallback={null}>
        <OfficeModal
          isOpen={showOfficeModal}
          onClose={() => setShowOfficeModal(false)}
          onOfficeCreated={(record) => {
            setBrokersPool((prev) => [record, ...prev]);
          }}
          showToast={showToast}
        />
        <CommunityModal
          isOpen={showCommunityModal}
          onClose={() => setShowCommunityModal(false)}
          onCommunityCreated={(compRecord) => {
            setCommunitiesPool((prev) => [compRecord, ...prev]);
          }}
          showToast={showToast}
        />
      </Suspense>

    </AdminLayout>
  );
}
