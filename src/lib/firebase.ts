import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, initializeFirestore } from 'firebase/firestore';
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

console.log('Firebase App Options:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseId: firebaseConfig.firestoreDatabaseId
});

let dbInstance;
try {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  console.log(`Initializing client Firestore with database: ${dbId}`);
  
  if (dbId !== '(default)') {
    dbInstance = initializeFirestore(app, {
      databaseId: dbId
    });
    
    // We can't easily "probe" and switch doc/collection refs once they are created,
    // but the testConnection will tell us if it's working.
  } else {
    dbInstance = getFirestore(app);
  }
} catch (error) {
  console.warn("Firestore initialization failed, using fallback", error);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

// Connectivity check as per instructions
async function testConnection() {
  const testDocId = 'connection';
  const testPath = 'test/' + testDocId;
  
  // Wait a bit for Auth to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Checking client connectivity for: ${testPath}`);
  try {
    const snap = await getDoc(doc(db, 'test', testDocId));
    console.log("Firestore Connectivity Test: SUCCESS", snap.exists() ? "Document found" : "Document not found (expected)");
  } catch (error: any) {
    console.error("Firestore Connectivity Test: FAILED", {
      code: error.code,
      message: error.message,
      database: (firebaseConfigRaw as any).firestoreDatabaseId || '(default)',
      projectId: firebaseConfig.projectId
    });
    
    // Attempt fallback only if it looks like a network or database-not-found error
    if (error.message && (error.message.includes('offline') || error.message.includes('Failed to get document'))) {
      console.warn("Retrying connectivity test with (default) database...");
      try {
        const fallbackDb = getFirestore(app);
        const fallbackSnap = await getDoc(doc(fallbackDb, 'test', testDocId));
        console.log("Firestore FALLBACK (default) Test: SUCCESS");
      } catch (fallbackError: any) {
        console.error("Firestore FALLBACK Test: FAILED", fallbackError.message);
      }
    }
  }
}
testConnection();
