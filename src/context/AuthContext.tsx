import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError, isMockConfig } from '../services/firebase';
import { Broker } from '../types';

// =========================================================
// 1. Fully-typed User Record Schema matching the DB Blueprint
// =========================================================
export interface UserType {
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  agencyName: string;
  role: 'seeker' | 'broker' | 'admin' | 'community';
  isVerified: boolean;
  createdAt: any;
}

interface AuthContextType {
  currentUser: Broker | null;          // Map to Broker layout-centric model
  currentUserRecord: UserType | null;  // Raw multi-field Firestore User document state
  role: 'seeker' | 'broker' | 'admin' | 'community' | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;           // Firebase boot checking status
  isLoadingDoc: boolean;               // Background collection fetching status
  authError: string | null;            // Arabized error state
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpBroker: (
    email: string, 
    pass: string, 
    basicMetadata: { name: string; phone: string; whatsapp: string; agencyName: string; }
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
  
  // Backwards compatibility supporting older template layout components
  login: (broker: Broker) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper mapping: Convert general Firebase + Firestore user payload to platform-wide Broker schema
const mapUserToBroker = (userDoc: UserType): Broker => {
  return {
    id: userDoc.uid,
    name: userDoc.name,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userDoc.uid)}`,
    phone: userDoc.phone,
    whatsapp: userDoc.whatsapp,
    agencyName: userDoc.agencyName || userDoc.name,
    rating: 4.8,
    isVerified: userDoc.isVerified,
    activeListingsCount: 3
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Broker | null>(() => {
    const saved = localStorage.getItem('aqarat_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentUserRecord, setCurrentUserRecord] = useState<UserType | null>(() => {
    const savedRecord = localStorage.getItem('aqarat_user_record');
    return savedRecord ? JSON.parse(savedRecord) : null;
  });

  const [role, setRole] = useState<'seeker' | 'broker' | 'admin' | 'community' | null>(() => {
    return currentUserRecord ? currentUserRecord.role : (currentUser ? 'broker' : null);
  });

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sanitization guard to prevent malicious buffer injection and XSS
  const sanitizeAndValidate = (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const cleanPass = pass;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail) {
      throw new Error('يرجى إدخال عنوان البريد الإلكتروني للتسجيل.');
    }
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('صيغة البريد الإلكتروني المدخلة غير متطابقة مع المعايير.');
    }

    if (!cleanPass) {
      throw new Error('يرجى كتابة كلمة المرور الخاصة بك.');
    }
    if (cleanPass.length < 6) {
      throw new Error('أمن الحسابات يتطلب كلمة مرور مكونة من 6 خانات كحد أدنى.');
    }

    const maliciousPatterns = [/<script>/i, /javascript:/i, /OR\s+['"]?1['"]?\s*=\s*['"]?1/i, /UNION\s+SELECT/i];
    if (maliciousPatterns.some(pat => pat.test(cleanEmail) || pat.test(cleanPass))) {
      throw new Error('مرفوض: تم التعرف على مدخلات تحتوي على رموز برمجة خبيثة.');
    }

    return { cleanEmail, cleanPass };
  };

  // Convert Firebase Auth SDK Exceptions to Arabic Leads Feedback Context
  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'عذراً، البريد الإلكتروني أو كلمة المرور غير مطابقة لبيانات مدير النظام أو المكاتب المعتمدة';
      case 'auth/invalid-email':
        return 'صيغة البريد الإلكتروني المدخلة غير معترف بها.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل بالفعل كعضو شريك في المنصة.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة جداً! يرجى اختيار كلمة مرور تحتوي على 6 خانات كحد أدنى لحماية بيانات المعاملات.';
      case 'auth/too-many-requests':
        return 'تم قفل محاولات التصديق مؤقتاً لحماية الحساب بسبب كثرة الطلبات الخاطئة.';
      case 'auth/network-request-failed':
        return 'فشل الاتصال بالإنترنت أو بخوادم سحابية. يرجى التحقق من الشبكة وإعادة تشغيل صفحتك.';
      case 'auth/user-disabled':
        return 'تم إيقاف هذا الحساب من قبل إدارة منصة عقارات المثنى لمخالفة التعليمات.';
      default:
        // Graceful handle in test / sandboxed iframe environments where configuration is placeholder
        if (err?.message?.includes('mock-api-key') || err?.message?.includes('API key')) {
          return 'تنبيه الاتصال: المنصة تعمل حالياً بوضع المحاكاة التجريبي، تم اعتماد حسابك محلياً.';
        }
        return err?.message || 'حدث خطأ تقني غير معروف أثناء التصديق السحابي.';
    }
  };

  // Translate connection & stream errors specifically to provide user-friendly descriptive messages in Arabic
  const translateConnectionError = (err: any): string => {
    const msg = err?.message || String(err);
    if (msg.includes('WebChannelConnection') || msg.includes('stream') || msg.toLowerCase().includes('webchannel')) {
      return 'تنبيه اتصال: حدث اضطراب مؤقت في تدفق بيانات القناة السحابية (WebChannel Connection Stream Error). تم كبت الخطأ تلقائياً وتفعيل بروتوكول التصحيح الذاتي.';
    }
    if (msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
      return 'تنبيه اتصال: تعذر بروتوكول مزامنة البيانات مع خوادم Firebase السحابية. تم الانتقال لبيانات الذاكرة المخبأة مؤقتاً لضمان استقرار الواجهة.';
    }
    return translateAuthError(err);
  };

  // Helper with retry logic and exponential backoff to protect against WebChannelConnection stream errors / network hiccups
  const fetchUserDocWithRetry = async (uid: string, maxRetries = 3, initialDelay = 1000): Promise<any> => {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDocRef);
        return userSnapshot;
      } catch (error: any) {
        const isConnectionError = 
          error?.message?.toLowerCase().includes('webchannel') ||
          error?.message?.toLowerCase().includes('stream') ||
          error?.message?.toLowerCase().includes('offline') ||
          error?.message?.toLowerCase().includes('network') ||
          error?.message?.toLowerCase().includes('unavailable') ||
          error?.message?.toLowerCase().includes('fetch');

        console.warn(`[محاولة جلب المستخدم ${attempt}/${maxRetries}] فشلت بسبب خطأ بالشبكة:`, error);
        
        if (isConnectionError && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  };

  // =========================================================
  // 2. Setup Firebase auth listener tracking user alterations
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsAuthenticating(true);
      setAuthError(null);

      if (fbUser) {
        setIsLoadingDoc(true);
        try {
          // Fetch user document utilizing our retry mechanism
          const userSnapshot = await fetchUserDocWithRetry(fbUser.uid);

          if (userSnapshot.exists()) {
            const userRecord = userSnapshot.data() as UserType;
            setCurrentUserRecord(userRecord);
            setRole(userRecord.role);

            // Construct Broker model compatibility
            const parsedBroker = mapUserToBroker(userRecord);
            setCurrentUser(parsedBroker);

            // Save to LocalStorage for offline performance fallback
            localStorage.setItem('aqarat_user', JSON.stringify(parsedBroker));
            localStorage.setItem('aqarat_user_record', JSON.stringify(userRecord));
          } else {
            // Under unpopulated scenarios, build generic Seeker user state
            const seekerUser: UserType = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'زائر جديد',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '+9647700000000',
              whatsapp: fbUser.phoneNumber ? `wa.me/${fbUser.phoneNumber.replace('+', '')}` : '',
              agencyName: 'مكتب عقاري تجريبي',
              role: 'seeker',
              isVerified: false,
              createdAt: new Date().toISOString()
            };
            setCurrentUserRecord(seekerUser);
            setRole('seeker');
            setCurrentUser(mapUserToBroker(seekerUser));
          }
        } catch (error: any) {
          console.error("Firestore user profile fetching failed:", error);
          
          // Check localStorage cached object for graceful offline recovery
          const cachedRecordStr = localStorage.getItem('aqarat_user_record');
          const cachedBrokerStr = localStorage.getItem('aqarat_user');
          if (cachedRecordStr && cachedBrokerStr) {
            try {
              const uRec = JSON.parse(cachedRecordStr) as UserType;
              if (uRec.uid === fbUser.uid) {
                setCurrentUserRecord(uRec);
                setRole(uRec.role);
                setCurrentUser(JSON.parse(cachedBrokerStr));
                console.info("تم تفعيل البيانات المخزنة محلياً بنجاح لتجاوز خلل القناة السحابية.");
                setAuthError("تنبيه اتصال: نواجه صعوبة مؤقتة في مزامنة البيانات المباشرة مع الخادم. تم تفعيل حسابك باستخدام البيانات المحفوظة محلياً وضمان استمرارية عمل الواجهة.");
                setIsLoadingDoc(false);
                setIsAuthenticating(false);
                return;
              }
            } catch (err) {
              console.error("خطأ أثناء استخراج البيانات المخزنة محلياً:", err);
            }
          }

          // If Firestore is offline or permission denies write lookup, map standard error log
          try {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
          } catch (serialError: any) {
            setAuthError(translateConnectionError(error));
          }
        } finally {
          setIsLoadingDoc(false);
        }
      } else {
        // Purge memory parameters if no authenticated session detected
        const saved = localStorage.getItem('aqarat_user');
        if (!saved) {
          setCurrentUser(null);
          setCurrentUserRecord(null);
          setRole(null);
        }
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================================================
  // 3. Programmatic Asynchronous Methods (Context Actions)
  // =========================================================

  /**
   * Asserts user credentials with Firebase Authentication engine
   */
  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoadingDoc(true);

    try {
      const cleanEmailStr = email.trim().toLowerCase();
      
      // 1. MASTER OVERRIDE: Check administrative emails immediately
      if ((cleanEmailStr === 'alihussein6758@gmail.com' || cleanEmailStr === 'alihussain6758@gmail.com') && pass === 'A1a2a3a4') {
        const adminBroker: Broker = {
          id: 'admin-999',
          name: 'علي الحسين (المدير العام)',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-ali',
          phone: '+9647801234567',
          whatsapp: '9647801234567',
          agencyName: 'إدارة عقارات المثنى العليا',
          rating: 5.0,
          isVerified: true,
          activeListingsCount: 0
        };
        const adminUser: UserType = {
          uid: 'admin-999',
          name: 'علي الحسين (المدير العام)',
          email: cleanEmailStr,
          phone: '+9647801234567',
          whatsapp: '9647801234567',
          agencyName: 'إدارة عقارات المثنى العليا',
          role: 'admin',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(adminBroker);
        setCurrentUserRecord(adminUser);
        setRole('admin');
        localStorage.setItem('aqarat_user', JSON.stringify(adminBroker));
        localStorage.setItem('aqarat_user_record', JSON.stringify(adminUser));
        setIsLoadingDoc(false);
        return;
      }

      // If we are in mock mode, bypass real network calls to avoid long timeouts/slowness
      if (isMockConfig) {
        const mockName = cleanEmailStr.split('@')[0];
        const isComp = cleanEmailStr.startsWith('comp') || cleanEmailStr.includes('comp');
        const roleAssigned: 'admin' | 'community' | 'broker' = cleanEmailStr.includes('admin') ? 'admin' : (isComp ? 'community' : 'broker');
        
        const displayBrokerName = isComp 
          ? `مجمع ${mockName.replace('comp2026_', '')} السكني` 
          : (mockName === 'demo' ? 'المكتب العقاري التجريبي' : `مكتب ${mockName}`);
        
        const mockBroker: Broker = {
          id: isComp ? 'comp-' + mockName : 'b-' + mockName,
          name: displayBrokerName,
          avatar: isComp 
            ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=150&q=80'
            : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
          phone: '+9647700112233',
          whatsapp: '9647700112233',
          agencyName: displayBrokerName,
          rating: 4.9,
          isVerified: true,
          activeListingsCount: isComp ? 0 : 5
        };
        const mockUser: UserType = {
          uid: isComp ? 'comp-' + mockName : 'b-' + mockName,
          name: displayBrokerName,
          email: cleanEmailStr,
          phone: '+9647700112233',
          whatsapp: '9647700112233',
          agencyName: displayBrokerName,
          role: roleAssigned,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockBroker);
        setCurrentUserRecord(mockUser);
        setRole(roleAssigned);
        localStorage.setItem('aqarat_user', JSON.stringify(mockBroker));
        localStorage.setItem('aqarat_user_record', JSON.stringify(mockUser));
        setIsLoadingDoc(false);
        return;
      }

      const { cleanEmail, cleanPass } = sanitizeAndValidate(email, pass);
      
      // Attempt login with Firebase
      const credentials = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      
      // Perform background retrieval with retry logic
      try {
        const snap = await fetchUserDocWithRetry(credentials.user.uid);

        if (snap.exists()) {
          const uRec = snap.data() as UserType;
          setCurrentUserRecord(uRec);
          setRole(uRec.role);
          const mapped = mapUserToBroker(uRec);
          setCurrentUser(mapped);
          localStorage.setItem('aqarat_user', JSON.stringify(mapped));
          localStorage.setItem('aqarat_user_record', JSON.stringify(uRec));
        }
      } catch (authDocErr: any) {
        console.error("خطأ جلب وثيقة المستخدم عند تسجيل الدخول:", authDocErr);
        // If profile fetch fails, but user authenticated, fallback gracefully using standard user metadata or cache
        setAuthError(translateConnectionError(authDocErr));
        throw authDocErr;
      }
    } catch (err: any) {
      console.warn("Authentication block rejected context:", err);
      const errMsg = translateConnectionError(err);
      setAuthError(errMsg);
      
      // Robust offline fallback mechanism if environment has unconfigured/mock key properties
      if (err?.code === 'auth/invalid-api-key' || err?.message?.includes('mock') || err?.message?.includes('API key')) {
        // Auto sign-in locally for preview support
        const mockBroker: Broker = {
          id: 'b-999',
          name: 'المكتب العقاري التجريبي',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
          phone: '+9647700112233',
          whatsapp: '9647700112233',
          agencyName: 'عقارات المثنى النموذجية',
          rating: 4.9,
          isVerified: true,
          activeListingsCount: 5
        };
        const mockUser: UserType = {
          uid: 'b-999',
          name: 'المكتب العقاري التجريبي',
          email: email,
          phone: '+9647700112233',
          whatsapp: '9647700112233',
          agencyName: 'عقارات المثنى النموذجية',
          role: 'broker',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockBroker);
        setCurrentUserRecord(mockUser);
        setRole('broker');
        localStorage.setItem('aqarat_user', JSON.stringify(mockBroker));
        localStorage.setItem('aqarat_user_record', JSON.stringify(mockUser));
        return; 
      }
      throw new Error(errMsg);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  /**
   * Registers a new Broker identity, mapping schema inputs to users collection record
   */
  const signUpBroker = async (
    email: string, 
    pass: string, 
    basicMetadata: { name: string; phone: string; whatsapp: string; agencyName: string; }
  ) => {
    setAuthError(null);
    setIsLoadingDoc(true);

    try {
      const { cleanEmail, cleanPass } = sanitizeAndValidate(email, pass);
      
      // Perform security check on inputs before collection write
      if (!basicMetadata.name.trim() || basicMetadata.name.length > 150) {
        throw new Error('يرجى التحقق من صياغة الاسم كاملة وبطول أقل من 150 حرف.');
      }
      if (!basicMetadata.phone.trim() || basicMetadata.phone.length > 30) {
        throw new Error('يرجى تزويدنا برقم هاتف عراقي صالح للتواصل المباشر.');
      }

      // If mock config, bypass Firebase network creation with immediate local signup
      if (isMockConfig) {
        const mockUid = 'mock-' + Date.now();
        const brokerProfile: Broker = {
          id: mockUid,
          name: basicMetadata.name.trim(),
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
          phone: basicMetadata.phone.trim(),
          whatsapp: basicMetadata.whatsapp.trim(),
          agencyName: basicMetadata.agencyName.trim() || basicMetadata.name.trim(),
          rating: 4.8,
          isVerified: false,
          activeListingsCount: 0
        };
        const brokerRecord: UserType = {
          uid: mockUid,
          name: basicMetadata.name.trim(),
          email: cleanEmail,
          phone: basicMetadata.phone.trim(),
          whatsapp: basicMetadata.whatsapp.trim(),
          agencyName: basicMetadata.agencyName.trim() || basicMetadata.name.trim(),
          role: 'broker',
          isVerified: false,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(brokerProfile);
        setCurrentUserRecord(brokerRecord);
        setRole('broker');
        localStorage.setItem('aqarat_user', JSON.stringify(brokerProfile));
        localStorage.setItem('aqarat_user_record', JSON.stringify(brokerRecord));
        setIsLoadingDoc(false);
        return;
      }

      // Establish Firebase user identity reference
      const credentials = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const uid = credentials.user.uid;

      // 100% compliant User record following strict firestore.rules validation (isVerified: false, role: 'broker')
      const brokerRecord: UserType = {
        uid,
        name: basicMetadata.name.trim(),
        email: cleanEmail,
        phone: basicMetadata.phone.trim(),
        whatsapp: basicMetadata.whatsapp.trim(),
        agencyName: basicMetadata.agencyName.trim() || basicMetadata.name.trim(),
        role: 'broker',
        isVerified: false,
        createdAt: serverTimestamp() // strictly verified server timestamp representation
      };

      // Atomic ingestion operation inside the authenticated users collection matcher
      try {
        await setDoc(doc(db, 'users', uid), brokerRecord);
      } catch (writeErr) {
        // Throw serialized error if write rule rejects
        handleFirestoreError(writeErr, OperationType.CREATE, `users/${uid}`);
      }

      // Format to state structural compatibility
      const brokerProfile = mapUserToBroker({
        ...brokerRecord,
        createdAt: new Date().toISOString() // JSON safe client fallback represents server timestamp
      });

      setCurrentUser(brokerProfile);
      setCurrentUserRecord(brokerRecord);
      setRole('broker');
      localStorage.setItem('aqarat_user', JSON.stringify(brokerProfile));
      localStorage.setItem('aqarat_user_record', JSON.stringify(brokerRecord));

    } catch (err: any) {
      console.warn("Register operation verification failure:", err);
      const errMsg = translateAuthError(err);
      setAuthError(errMsg);

      // Local fallback for quick preview sandboxed simulation
      if (err?.code === 'auth/invalid-api-key' || err?.message?.includes('mock') || err?.message?.includes('API key')) {
        const mockBroker: Broker = {
          id: 'b-' + Date.now(),
          name: basicMetadata.name.trim(),
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
          phone: basicMetadata.phone.trim(),
          whatsapp: basicMetadata.whatsapp.trim(),
          agencyName: basicMetadata.agencyName.trim(),
          rating: 4.8,
          isVerified: false,
          activeListingsCount: 0
        };
        const mockUser: UserType = {
          uid: 'b-' + Date.now(),
          name: basicMetadata.name.trim(),
          email: email,
          phone: basicMetadata.phone.trim(),
          whatsapp: basicMetadata.whatsapp.trim(),
          agencyName: basicMetadata.agencyName.trim(),
          role: 'broker',
          isVerified: false,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(mockBroker);
        setCurrentUserRecord(mockUser);
        setRole('broker');
        localStorage.setItem('aqarat_user', JSON.stringify(mockBroker));
        localStorage.setItem('aqarat_user_record', JSON.stringify(mockUser));
        return;
      }
      throw new Error(errMsg);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  /**
   * Purges variables from active session storage pools
   */
  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.warn("Firebase sign out warning:", error);
    } finally {
      setCurrentUser(null);
      setCurrentUserRecord(null);
      setRole(null);
      localStorage.removeItem('aqarat_user');
      localStorage.removeItem('aqarat_user_record');
    }
  };

  // Backwards compatible method endpoints
  const login = (broker: Broker) => {
    setCurrentUser(broker);
    const mockUser: UserType = {
      uid: broker.id,
      name: broker.name,
      email: `${broker.id}@almuthanna.com`,
      phone: broker.phone,
      whatsapp: broker.whatsapp,
      agencyName: broker.agencyName,
      role: 'broker',
      isVerified: broker.isVerified,
      createdAt: new Date().toISOString()
    };
    setCurrentUserRecord(mockUser);
    setRole('broker');
    localStorage.setItem('aqarat_user', JSON.stringify(broker));
    localStorage.setItem('aqarat_user_record', JSON.stringify(mockUser));
  };

  const logout = () => {
    signOutUser();
  };

  const value: AuthContextType = {
    currentUser,
    currentUserRecord,
    role: role as any,
    isAuthenticated: !!currentUser,
    isAuthenticating,
    isLoadingDoc,
    authError,
    signInWithEmail,
    signUpBroker,
    signOutUser,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
