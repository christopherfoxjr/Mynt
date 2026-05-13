import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import session from "express-session";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8"));

// Use config directly to avoid stale environment variables
const firebaseConfig = {
  projectId: config.projectId,
  firestoreDatabaseId: config.firestoreDatabaseId,
};

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    const options: any = {
      projectId: firebaseConfig.projectId,
    };
    initializeApp(options);
    console.log(`Firebase Admin initialized with Project ID: ${firebaseConfig.projectId}`);
  } catch (err: any) {
    console.error("Firebase Admin initialization failed:", err.message);
    initializeApp(); // Absolute fallback
  }
}

let db: any;
try {
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  console.log(`Attempting Firestore init with database ID: ${databaseId}`);
  
  const adminApp = getApps()[0];
  if (databaseId && databaseId !== '(default)') {
    db = getFirestore(adminApp, databaseId);
    console.log(`Firestore initialized with NAMED Database ID: ${databaseId}`);
  } else {
    db = getFirestore(adminApp);
    console.log("Firestore initialized with DEFAULT Database ID");
  }
} catch (error: any) {
  console.error("CRITICAL: Firestore initialization failed!", error.message);
  db = getFirestore();
}

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

// If you need the type:
type OperationType = (typeof OperationType)[keyof typeof OperationType];

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  serverTime: string;
  projectId: string | null;
  databaseId: string | null;
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType,
    path,
    serverTime: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId
  };
  console.error('Firestore Admin Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test database connectivity on startup and fallback if needed
(async () => {
  try {
    console.log(`Checking connectivity for database: ${firebaseConfig.firestoreDatabaseId || "(default)"}`);
    await db.collection("users").limit(1).get();
    console.log("Firestore Connectivity Test: SUCCESS");
  } catch (error: any) {
    console.error("Firestore Connectivity Test: FAILED", error.message);
    if (error.code === 7 || error.message.includes('permission') || error.message.includes('not found')) {
      console.warn("Permission denied or database not found for named database. Attempting fallback to (default) database...");
      try {
        const adminApp = getApps()[0];
        const fallbackDb = getFirestore(adminApp); // Uses (default)
        await fallbackDb.collection("users").limit(1).get();
        db = fallbackDb;
        console.log("Fallback to (default) database: SUCCESS");
      } catch (fallbackErr: any) {
        console.error("Fallback to (default) database: FAILED", fallbackErr.message);
      }
    }
  }
})();

const ADMIN_EMAILS = ["spoinkosgithub@gmail.com", "blooper.it@gmail.com"];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Stripe lazily
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        console.warn("STRIPE_SECRET_KEY is missing. Stripe features will be disabled.");
        return null;
      }
      stripe = new Stripe(key, {
        apiVersion: "2025-01-27.acacia" as any,
      });
    }
    return stripe;
  };

  // Stripe Webhook
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req: any, res) => {
    const s = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!s || !sig || !webhookSecret) {
      console.warn("Webhook received but Stripe/Secret not configured");
      return res.status(400).send("Webhook Error: Secret not configured");
    }

    let event;

    try {
      event = s.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const uid = paymentIntent.metadata.userId;
        if (uid) {
          console.log(`Payment succeeded for user ${uid}: ${paymentIntent.amount}`);
          // Balance is refreshed on the client, but we can also update Firestore here
          const userRef = db.collection('users').doc(uid);
          await userRef.update({
            balance: FieldValue.increment(paymentIntent.amount / 100),
            updatedAt: FieldValue.serverTimestamp()
          });
          
          // Add transaction record
          await userRef.collection('transactions').add({
            type: 'deposit',
            amount: paymentIntent.amount / 100,
            status: 'completed',
            description: 'Stripe Deposit',
            createdAt: FieldValue.serverTimestamp()
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || "mynt-secure-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Middleware to verify Firebase Auth token
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error: any) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ error: 'Invalid token', details: error.message });
    }
  };

  // Admin Middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.session.isAdmin) {
      return next();
    }
    res.status(403).json({ error: "Admin access required" });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mynt API is running" });
  });

  app.get("/api/debug/firestore", authenticateToken, async (req: any, res) => {
    const results: any = {};
    const uid = req.user.uid;

    try {
      const defaultDb = getFirestore();
      const snap = await defaultDb.collection("users").doc(uid).get();
      results.defaultDb = { exists: snap.exists, id: "(default)" };
    } catch (e: any) {
      results.defaultDb = { error: e.message, code: e.code };
    }

    try {
      const namedDb = getFirestore(firebaseConfig.firestoreDatabaseId);
      const snap = await namedDb.collection("users").doc(uid).get();
      results.namedDb = { exists: snap.exists, id: firebaseConfig.firestoreDatabaseId };
    } catch (e: any) {
      results.namedDb = { error: e.message, code: e.code };
    }

    res.json(results);
  });

  // Get Onboarding Link
  app.post("/api/create-account-link", authenticateToken, async (req: any, res) => {
    console.log("POST /api/create-account-link", req.body);
    const s = getStripe();
    if (!s) {
      console.warn("Stripe link failed: Not configured");
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { accountId } = req.body;
    const origin = req.headers.origin || `http://localhost:${PORT}`;

    try {
      const accountLink = await s.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/onboarding?refresh=true`,
        return_url: `${origin}/dashboard?onboarding=success`,
        type: 'account_onboarding',
      });

      console.log("Stripe account link created:", accountLink.url);
      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error("Stripe account link error:", error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Helper to get total available balance from Stripe
  const getActualBalance = async (uid: string) => {
    const s = getStripe();
    if (!s) return 0;

    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) return 0;
    const userData = userDoc.data();
    const stripeAccountId = userData?.stripeAccountId;

    if (!stripeAccountId) return 0;

    try {
      if (userData?.financialAccountId) {
        const fa = await s.treasury.financialAccounts.retrieve(userData.financialAccountId, {}, {
          stripeAccount: stripeAccountId
        });
        return fa.balance.cash.usd / 100;
      }
      
      const b = await s.balance.retrieve({ stripeAccount: stripeAccountId } as any);
      return (b.available[0]?.amount || 0) / 100;
    } catch (err: any) {
      console.warn(`Balance fetch failed for ${uid}:`, err.message);
      return 0;
    }
  };

  // Check Account Status
  app.get("/api/account-status", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const uid = req.user.uid;
    const path = `users/${uid}`;
    try {
      const userDocRef = db.doc(path);
      const userDoc = await userDocRef.get();
      const stripeAccountId = userDoc.data()?.stripeAccountId;

      if (!stripeAccountId) return res.status(404).json({ error: "No account found" });

      const account = await s.accounts.retrieve(stripeAccountId);
      const isVerified = account.details_submitted && account.charges_enabled;
      const status = isVerified ? 'active' : 'pending';

      if (isVerified || status !== userDoc.data()?.accountStatus) {
        await userDocRef.update({ 
          accountStatus: status,
          kycCompleted: isVerified,
          updatedAt: FieldValue.serverTimestamp()
        });
      }

      res.json({ status, kycCompleted: isVerified });
    } catch (error: any) {
      const docPath = `users/${req.user.uid}`;
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Fetch Balance from Stripe (Treasury + Connect)
  app.get("/api/balance", authenticateToken, async (req: any, res) => {
    const uid = req.user.uid;
    try {
      const balance = await getActualBalance(uid);
      res.json({ 
        available: [{ 
          amount: balance, 
          currency: 'usd' 
        }],
        treasury: true // UI uses this to show formatted balance
      });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Create Financial Account
  app.post("/api/banking/financial-account", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const uid = req.user.uid;
    try {
      const userDocRef = db.doc(`users/${uid}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();
      
      if (userData?.financialAccountId) {
        return res.json({ financialAccountId: userData.financialAccountId });
      }

      const stripeAccountId = userData?.stripeAccountId;
      if (!stripeAccountId) throw new Error("Stripe account not found");

      // Create Treasury Financial Account
      const financialAccount = await s.treasury.financialAccounts.create({
        supported_currencies: ['usd'],
        features: {
          card_issuing: { requested: true },
          // deposit_methods is requested through other means or omitted in newer versions
          inbound_transfers: { ach: { requested: true } },
          outbound_payments: { ach: { requested: true }, us_domestic_wire: { requested: true } },
          outbound_transfers: { ach: { requested: true }, us_domestic_wire: { requested: true } },
        }
      }, { stripeAccount: stripeAccountId });

      await userDocRef.update({
        financialAccountId: financialAccount.id,
        updatedAt: FieldValue.serverTimestamp()
      });

      res.json({ financialAccountId: financialAccount.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Get Account Numbers
  app.get("/api/banking/account-numbers", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const uid = req.user.uid;
    try {
      const userDoc = await db.doc(`users/${uid}`).get();
      const userData = userDoc.data();
      const stripeAccountId = userData?.stripeAccountId;
      const financialAccountId = userData?.financialAccountId;

      if (!stripeAccountId || !financialAccountId) {
        return res.status(404).json({ error: "Financial account not found" });
      }

      const fa = await s.treasury.financialAccounts.retrieve(financialAccountId, {
        expand: ['financial_addresses'],
      }, {
        stripeAccount: stripeAccountId
      });

      res.json({
        routingNumber: fa.financial_addresses?.[0]?.aba?.routing_number || "021000021",
        accountNumber: fa.financial_addresses?.[0]?.aba?.account_number || "8823490112",
        bankName: "Mynt Treasury Bank"
      });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Treasury Deposit (ACH Inbound)
  app.post("/api/banking/deposit", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const { amount, sourceId } = req.body;
    const uid = req.user.uid;

    try {
      const userDoc = await db.doc(`users/${uid}`).get();
      const stripeAccountId = userDoc.data()?.stripeAccountId;
      const financialAccountId = userDoc.data()?.financialAccountId;

      if (!stripeAccountId || !financialAccountId) throw new Error("Treasury account not set up");

      const inboundTransfer = await s.treasury.inboundTransfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        financial_account: financialAccountId,
        origin_payment_method: sourceId,
        description: 'Deposit to Mynt Wallet',
      }, { stripeAccount: stripeAccountId });

      res.json({ success: true, transferId: inboundTransfer.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Fetch Transactions
  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    const uid = req.user.uid;
    const docPath = `users/${uid}/transactions`;
    
    try {
      const transactions: any[] = [];

      // 1. Get local transactions from Firestore
      const txSnapshot = await db.collection("users").doc(uid).collection("transactions")
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      txSnapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          name: data.description || 'Transaction',
          type: data.type,
          amount: data.amount,
          date: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
          status: data.status,
          category: data.category || 'General'
        });
      });

      // 2. Get remote transactions from Stripe if available
      if (s) {
        const userDoc = await db.collection("users").doc(uid).get();
        const stripeAccountId = userDoc.data()?.stripeAccountId;

        if (stripeAccountId) {
          try {
            const charges = await s.charges.list({ limit: 10 }, { stripeAccount: stripeAccountId });
            const stripeTx = charges.data.map(charge => ({
              id: charge.id,
              name: charge.description || 'Stripe Transaction',
              type: charge.amount > 0 ? 'receive' : 'spend',
              amount: charge.amount / 100,
              date: new Date(charge.created * 1000).toLocaleDateString(),
              status: charge.status === 'succeeded' ? 'completed' : 'pending',
              category: 'Payments'
            }));
            transactions.push(...stripeTx);
          } catch (stripeErr: any) {
            console.warn('Stripe charges fetch failed:', stripeErr.message);
          }
        }
      }

      res.json(transactions);
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  app.post("/api/create-payment-intent", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });
    const { amount } = req.body;
    
    try {
      const paymentIntent = await s.paymentIntents.create({
        amount: Math.round((amount || 10) * 100), // convert to cents, default $10
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: { userId: req.user.uid }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Login (Session Bridge)
  app.post("/api/admin/login", authenticateToken, (req: any, res) => {
    if (ADMIN_EMAILS.includes(req.user.email)) {
      req.session.isAdmin = true;
      req.session.adminEmail = req.user.email;
      res.json({ success: true, isAdmin: true });
    } else {
      res.status(403).json({ error: "You are not an admin" });
    }
  });

  // Create Stripe Connected Account
  app.post("/api/create-connect-account", authenticateToken, async (req: any, res) => {
    console.log("POST /api/create-connect-account", req.body);
    const s = getStripe();
    if (!s) {
      console.warn("Stripe connect failed: Not configured");
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { email, accountType, birthDate } = req.body;
    const uid = req.user.uid;

    try {
      const userDocRef = db.doc(`users/${uid}`);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists && userDoc.data()?.stripeAccountId) {
        console.log("Using existing Stripe account:", userDoc.data()?.stripeAccountId);
        return res.json({ accountId: userDoc.data()?.stripeAccountId });
      }

      console.log("Creating new Stripe express account for:", email);
      const accountParams: Stripe.AccountCreateParams = {
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          treasury: { requested: true },
          card_issuing: { requested: true },
        },
        business_type: 'individual',
        metadata: { firebaseUid: uid, accountType },
      };

      const account = await s.accounts.create(accountParams);
      console.log("Stripe account created:", account.id);

      await userDocRef.set({ 
        stripeAccountId: account.id,
        accountType,
        birthDate,
        accountStatus: ADMIN_EMAILS.includes(email) ? 'active' : 'pending',
        kycCompleted: ADMIN_EMAILS.includes(email),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      res.json({ accountId: account.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Get user profile
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    const docPath = `users/${req.user.uid}`;
    try {
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
      res.json(userDoc.data());
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Claim or update Leaf (cashtag)
  app.post("/api/user/leaf", authenticateToken, async (req: any, res) => {
    let { leaf } = req.body;
    if (!leaf) return res.status(400).json({ error: "Leaf is required" });
    
    // Normalize leaf: remove @ if present, lowercase
    leaf = leaf.replace(/^@/, '').toLowerCase().trim();
    
    if (leaf.length < 3 || leaf.length > 20 || !/^[a-z0-9_]+$/.test(leaf)) {
      return res.status(400).json({ error: "Leaf must be 3-20 characters and contain only letters, numbers, and underscores." });
    }

    const docPath = `users/${req.user.uid}`;
    try {
      // Check if leaf is already taken
      const existing = await db.collection("users").where("leaf", "==", leaf).get();
      if (!existing.empty && existing.docs[0].id !== req.user.uid) {
        return res.status(400).json({ error: "This Leaf is already taken." });
      }

      await db.collection("users").doc(req.user.uid).update({
        leaf,
        updatedAt: FieldValue.serverTimestamp()
      });

      res.json({ success: true, leaf });
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Toggle Card Status (Freeze/Unfreeze)
  app.post("/api/banking/card/toggle", authenticateToken, async (req: any, res) => {
    const { frozen } = req.body;
    const docPath = `users/${req.user.uid}`;
    try {
      await db.collection("users").doc(req.user.uid).update({
        cardFrozen: frozen,
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true, frozen });
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Get Vaults
  app.get("/api/banking/vaults", authenticateToken, async (req: any, res) => {
    const docPath = `users/${req.user.uid}/pots`;
    try {
      const snapshot = await db.collection("users").doc(req.user.uid).collection("pots").get();
      const vaults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(vaults);
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Create Vault
  app.post("/api/banking/vaults", authenticateToken, async (req: any, res) => {
    const { name, goal, targetDate } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const docPath = `users/${req.user.uid}/pots`;
    try {
      const docRef = db.collection("users").doc(req.user.uid).collection("pots").doc();
      await docRef.set({
        id: docRef.id,
        name,
        balance: 0,
        goal: goal || 0,
        targetDate: targetDate || null,
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true, vaultId: docRef.id });
    } catch (error: any) {
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Find user by Leaf
  app.get("/api/user/leaf/:leaf", authenticateToken, async (req: any, res) => {
    let { leaf } = req.params;
    leaf = leaf.replace(/^@/, '').toLowerCase();

    try {
      const snapshot = await db.collection("users").where("leaf", "==", leaf).limit(1).get();
      if (snapshot.empty) return res.status(404).json({ error: "User not found" });
      
      const data = snapshot.docs[0].data();
      res.json({
        uid: data.uid,
        displayName: data.displayName,
        leaf: data.leaf,
        photoURL: data.photoURL
      });
    } catch (error: any) {
      const docPath = `users`;
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  // Internal Transfer (Between Pots)
  app.post("/api/transfer/internal", authenticateToken, async (req: any, res) => {
    const { amount, fromPotId, toPotId } = req.body;
    const uid = req.user.uid;

    try {
      const currentBalance = await getActualBalance(uid);
      if (currentBalance < amount) {
        return res.status(400).json({ error: `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}` });
      }

      await db.runTransaction(async (transaction) => {
        const fromRef = fromPotId === 'main' ? db.doc(`users/${uid}`) : db.doc(`users/${uid}/pots/${fromPotId}`);
        const toRef = toPotId === 'main' ? db.doc(`users/${uid}`) : db.doc(`users/${uid}/pots/${toPotId}`);

        const fromDoc = await transaction.get(fromRef);
        const toDoc = await transaction.get(toRef);

        if (!fromDoc.exists || !toDoc.exists) throw new Error("Source or destination not found");
        
        // If coming from a pot, check pot balance
        if (fromPotId !== 'main' && (fromDoc.data()?.balance || 0) < amount) {
          throw new Error("Insufficient funds in vault");
        }

        transaction.update(fromRef, { balance: FieldValue.increment(-amount) });
        transaction.update(toRef, { balance: FieldValue.increment(amount) });

        // Record locally within transactions as "transfer"
        const txRef = db.collection(`users/${uid}/transactions`).doc();
        transaction.set(txRef, {
          id: txRef.id,
          userId: uid,
          type: 'transfer',
          amount,
          description: `Internal Transfer: ${fromPotId} ➔ ${toPotId}`,
          status: 'completed',
          createdAt: FieldValue.serverTimestamp()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Real Stripe Connect Transfer (Legacy Bridge)
  app.post("/api/transfer", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });
    
    const { amount, recipientId } = req.body;
    const uid = req.user.uid;

    try {
      const currentBalance = await getActualBalance(uid);
      if (currentBalance < amount) {
        return res.status(400).json({ error: `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}` });
      }

      const userDoc = await db.doc(`users/${uid}`).get();
      const sourceAccountId = userDoc.data()?.stripeAccountId;

      if (!sourceAccountId) throw new Error("Source account not found");

      // In a real P2P neobank, you'd transfer from the platform to the destination account
      const transfer = await s.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: recipientId, 
      });

      res.json({ success: true, transferId: transfer.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // P2P Transfer (Stripe Connect)
  app.post("/api/transfer/p2p", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const { amount, recipientEmail, recipientLeaf, description } = req.body;
    const uid = req.user.uid;

    try {
      const currentBalance = await getActualBalance(uid);
      if (currentBalance < amount) {
        return res.status(400).json({ error: `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}` });
      }

      let recipientSnapshot;
      
      if (recipientLeaf) {
        const leaf = recipientLeaf.replace(/^@/, '').toLowerCase();
        recipientSnapshot = await db.collection("users").where("leaf", "==", leaf).get();
      } else if (recipientEmail) {
        recipientSnapshot = await db.collection("users").where("email", "==", recipientEmail).get();
      } else {
        throw new Error("Recipient required (Email or Leaf)");
      }

      if (!recipientSnapshot || recipientSnapshot.empty) throw new Error("Recipient not found in Mynt");
      
      const recipientData = recipientSnapshot.docs[0].data();
      const recipientStripeId = recipientData.stripeAccountId;
      const recipientUid = recipientData.uid;

      if (!recipientStripeId) throw new Error("Recipient has not connected a bank account");

      const userDoc = await db.doc(`users/${uid}`).get();
      const userData = userDoc.data();
      const sourceStripeId = userData?.stripeAccountId;

      if (!sourceStripeId) throw new Error("Source account not connected");

      // Stripe Transfer
      const transfer = await s.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: recipientStripeId,
        description: description || `P2P from ${userData?.displayName || 'Mynt User'}`,
        metadata: { fromUid: uid, toUid: recipientUid }
      });

      // Record in both transaction histories
      const batch = db.batch();
      
      const senderTx = db.collection(`users/${uid}/transactions`).doc();
      batch.set(senderTx, {
        id: senderTx.id,
        userId: uid,
        type: 'send',
        amount: -amount,
        description: `Sent to ${recipientData.displayName}`,
        counterpartyName: recipientData.displayName,
        counterpartyId: recipientUid,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp()
      });

      const receiverTx = db.collection(`users/${recipientUid}/transactions`).doc();
      batch.set(receiverTx, {
        id: receiverTx.id,
        userId: recipientUid,
        type: 'receive',
        amount: amount,
        description: `Received from ${userData?.displayName}`,
        counterpartyName: userData?.displayName,
        counterpartyId: uid,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp()
      });

      await batch.commit();
      res.json({ success: true, transferId: transfer.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // ACH Transfer (Stripe Payout)
  app.post("/api/transfer/ach", authenticateToken, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ error: "Stripe not configured" });

    const { amount } = req.body;
    const uid = req.user.uid;

    try {
      const currentBalance = await getActualBalance(uid);
      if (currentBalance < amount) {
        return res.status(400).json({ error: `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}` });
      }

      const userDoc = await db.doc(`users/${uid}`).get();
      const stripeAccountId = userDoc.data()?.stripeAccountId;

      if (!stripeAccountId) throw new Error("Connect account required");

      const payout = await s.payouts.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
      }, {
        stripeAccount: stripeAccountId
      });

      res.json({ success: true, payoutId: payout.id });
    } catch (error: any) {
      const docPath = `users/${uid}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Admin Routes
  app.get("/api/admin/kyc/list", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // For this demo, let's just list pending users from the main collection if no specific submission col exists
      const usersSnapshot = await db.collection("users").where("accountStatus", "==", "pending").get();
      const pendingUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(pendingUsers);
    } catch (error: any) {
      const docPath = `users`;
      const errInfo = handleFirestoreError(error, OperationType.GET, docPath);
      res.status(500).json(errInfo);
    }
  });

  app.post("/api/admin/kyc/verify", authenticateToken, requireAdmin, async (req, res) => {
    const { userId, status, reason } = req.body;
    try {
      const userRef = db.doc(`users/${userId}`);
      await userRef.update({
        accountStatus: status === 'approve' ? 'active' : 'restricted',
        kycCompleted: status === 'approve',
        kycNote: reason || '',
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error: any) {
      const docPath = `users/${userId}`;
      const errInfo = handleFirestoreError(error, OperationType.WRITE, docPath);
      res.status(400).json(errInfo);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express Global Error:", err.message || err);
    if (res.headersSent) return next(err);
    
    // If it is our JSON string error
    if (typeof err.message === 'string' && err.message.startsWith('{')) {
      try {
        return res.status(500).json(JSON.parse(err.message));
      } catch (e) {}
    }
    
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
  });
}

startServer();
