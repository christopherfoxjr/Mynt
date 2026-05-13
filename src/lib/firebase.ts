import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

// Correct initialization for named databases in v9+
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = dbId && dbId !== '(default)' 
  ? getFirestore(app, dbId) 
  : getFirestore(app);

export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  const testDocId = 'connection';
  const testPath = 'test/' + testDocId;
  
  // Wait for Auth to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`Checking client connectivity for: ${testPath} on database: ${dbId || '(default)'}`);
  try {
    const snap = await getDoc(doc(db, 'test', testDocId));
    console.log("Firestore Connectivity Test: SUCCESS", snap.exists() ? "Document found" : "Document not found (expected)");
  } catch (error: any) {
    console.error("Firestore Connectivity Test: FAILED", {
      code: error.code,
      message: error.message,
      projectId: firebaseConfig.projectId,
      dbId: dbId
    });
    
    if (error.code === 'permission-denied') {
      console.error("Firestore Permission Denied. Check your security rules.");
    }
    
    if (error.message && (error.message.includes('offline') || error.message.includes('Failed to get document'))) {
       console.error("CRITICAL: Firestore appears unreachable. Please ensure the Firestore API is enabled and your Project ID / Database ID match the Firebase Console.");
    }
  }
}

testConnection();
