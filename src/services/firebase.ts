import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize the core Firebase Application and register service layers
export const app = initializeApp(firebaseConfig);

// Detect if this is a simulation context with mock keys
const isMockConfig = firebaseConfig.apiKey && firebaseConfig.apiKey.includes('mock');

// Configure Firestore with elegant multi-tab persistent local cache to guarantee high durability and Zero Offline Cost
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handles security rule validation failures or storage exceed error codes,
 * serializes identity metadata context and raises JSON-structured exceptions.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error context parsed:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to the project's Firestore database instance on start.
 */
export async function validateConnection() {
  if (isMockConfig) {
    console.info("عقارات المثنى: تعمل البيئة حالياً بوضع المحاكاة المباشر والسريري الفوري لعدم تهيئة السحابة.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("عقارات المثنى: Firebase appears offline or local sandbox restrictions apply.");
    }
  }
}

validateConnection();
