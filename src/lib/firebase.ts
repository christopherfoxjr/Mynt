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
  console.log(`Initializing client Firestore. Preferred: ${dbId}`);
  
  if (dbId !== '(default)') {
    // We try to initialize with the named database, but wrap it in a way 
    // that we can potentially know if it fails.
    dbInstance = initializeFirestore(app, {
      databaseId: dbId
    });
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
  
  // Wait for Auth to settle
  await new Promise(resolve => setTimeout(resolve, 1500));
  
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
    
    // Attempt fallback to default database if named one looks broken
    if (error.message && (error.message.includes('offline') || error.message.includes('Failed to get document'))) {
      console.warn("Named database appears unreachable. This can happen if the database ID in config is wrong or the database was deleted. Retrying with (default)...");
      try {
        const fallbackDb = getFirestore(app);
        await getDoc(doc(fallbackDb, 'test', testDocId));
        console.log("Firestore FALLBACK (default) Test: SUCCESS");
        // We can't easily re-export the fallbackDb to already-loaded components,
        // but this confirms the issue.
      } catch (fallbackError: any) {
        console.error("Firestore FALLBACK Test: FAILED", fallbackError.message);
      }
    }
    
    if (error.code === 'permission-denied') {
      console.error("Firestore Permission Denied. Check rules and auth state.");
    }
  }
}
testConnection();
