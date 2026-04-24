# Firebase Security Hardening

## Client-Side Configuration (NEXT*PUBLIC*\*)

The web Firebase configuration in `src/lib/firebase-client.ts` intentionally uses `NEXT_PUBLIC_*` environment variables. These values **must be public** for client-side authentication (Google Sign-In) to function.

**This is NOT a security risk** because:

- Web API keys have no secrets—they're meant to be public
- Authentication is secured via Firebase Security Rules
- Authorization is checked server-side via ID tokens

## Security Layers

### 1. **Firebase Security Rules**

- Firestore/Realtime Database rules enforce access control
- Rules check user authentication and ownership before allowing reads/writes
- Only authenticated users can access their own data

### 2. **Google Cloud API Key Restrictions**

Configure in Google Cloud Console > APIs & Services > Credentials:

- **Application Restrictions**: HTTP referrers (allowed domains only)
- **API Restrictions**: Limit to Firebase services only
- **Example**: Allow only `https://yourdomain.com/*`

### 3. **Authorized Domains**

Configure in Firebase Console > Authentication > Settings:

- Whitelist all domains where the app runs (production, staging)
- Unknown domains cannot use Google Sign-In

### 4. **Server-Side Admin SDK**

- `src/lib/firebase-admin.ts` uses `FIREBASE_*` secrets (never exposed to client)
- Environment variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Keep `.env` and `.env.local` **gitignored** (already configured)
- Use server-only endpoints to verify ID tokens and perform sensitive operations

## Environment Variable Checklist

### Public (Client)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Secret (Server Only)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Setup Instructions

1. **Local Development**
   - Create `.env.local` with all variables
   - `.env.local` is gitignored—never commit secrets

2. **Production (Vercel, etc.)**
   - Add environment variables in deployment dashboard
   - Platform automatically masks secrets in logs

3. **Verification**
   - Run `git status` to confirm `.env*` files are not tracked
   - Check Firebase Console for authorized domains
   - Test login with valid domain restrictions in place

## Troubleshooting

- **"Firebase web config is missing"**: Ensure all `NEXT_PUBLIC_FIREBASE_*` vars are set
- **"Unauthorized domain"**: Add domain to Firebase Console > Authentication > Authorized domains
- **"API key invalid"**: Verify Google Cloud API key restrictions allow your domain
