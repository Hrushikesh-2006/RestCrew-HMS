import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function ensureFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin config is missing. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function verifyFirebaseIdToken(idToken: string) {
  const app = ensureFirebaseAdmin();
  return getAuth(app).verifyIdToken(idToken);
}

export async function getServerSession(req?: Request) {
  if (!req) return null;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const idToken = authHeader.replace('Bearer ', '');
  if (!idToken) return null;

  try {
    const decodedToken = await verifyFirebaseIdToken(idToken);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      userType: decodedToken.userType || 'owner', // assume owner for API routes
    };
  } catch {
    return null;
  }
}

