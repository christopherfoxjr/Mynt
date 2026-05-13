import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: (firebaseConfigRaw as any).apiKey,
  authDomain: (firebaseConfigRaw as any).authDomain,
  projectId: (firebaseConfigRaw as any).projectId,
  storageBucket: (firebaseConfigRaw as any).storageBucket,
  messagingSenderId: (firebaseConfigRaw as any).messagingSenderId,
  appId: (firebaseConfigRaw as any).appId,
  measurementId: (firebaseConfigRaw as any).measurementId,
  firestoreDatabaseId: (firebaseConfigRaw as any).firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);

let dbInstance;
try {
  console.log(`Initializing Firestore with database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn("Failed to initialize with named database, falling back to (default)", error);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

// Connectivity check as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}
testConnection();
