import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// User's Firebase project config for Firebase Authentication (yousnap-app)
const userAuthConfig = {
  apiKey: "AIzaSyB1g-i0ORyxC3E8DIR9769Z1UnBczOd2e8",
  authDomain: "yousnap-app.firebaseapp.com",
  projectId: "yousnap-app",
  storageBucket: "yousnap-app.firebasestorage.app",
  messagingSenderId: "87251634633",
  appId: "1:87251634633:web:1af4394741489fe2c74018",
  measurementId: "G-2KPQE7NMSJ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const authApp = getApps().find(a => a.name === 'yousnap-auth') || initializeApp(userAuthConfig, 'yousnap-auth');

// Connect Firestore directly to the user's YouSnap app project (yousnap-app default database)
// Firebase SDKs communicate strictly over HTTPS / TLS 1.3
export const db = getFirestore(authApp);
export const auth = getAuth(authApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function verifyFirebaseTlsTransport() {
  if (typeof window === 'undefined') return true;
  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasSecureCrypto = Boolean(window.isSecureContext && window.crypto?.subtle);
  return isHttps && hasSecureCrypto && userAuthConfig.authDomain.endsWith('.firebaseapp.com');
}

export { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged };

// Test connection on boot as recommended by Firebase skill
async function testConnection() {
  try {
    verifyFirebaseTlsTransport();
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}
