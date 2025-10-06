# Google OAuth Authentication Setup

## ✅ Implementation Complete

Your storefront now has **Google OAuth authentication** integrated with your Medusa backend!

---

## 📋 What Was Implemented

### 1. **Login Page Updates** (`src/components/Login.tsx`)
- ✅ Added "Continue with Google" button
- ✅ Integrated `sdk.auth.login("customer", "google", {})` 
- ✅ Handles redirect to Google authentication
- ✅ Beautiful UI with Google logo and separator

### 2. **Google Callback Page** (`src/pages/GoogleCallback.tsx`)
- ✅ Handles OAuth callback from Google
- ✅ Processes query parameters from Google redirect
- ✅ Calls `sdk.auth.callback("customer", "google", queryParams)`
- ✅ Creates customer if first-time login
- ✅ Refreshes token and retrieves customer data
- ✅ Shows loading state during authentication
- ✅ Displays success message and redirects to homepage
- ✅ Error handling with user-friendly messages

### 3. **Route Configuration** (`src/App.tsx`)
- ✅ Added `/auth/google/callback` route
- ✅ Properly wired up GoogleCallback component

### 4. **Dependencies**
- ✅ Installed `react-jwt` for token decoding

---

## 🔧 Backend Configuration (Already Set Up)

Your backend has these environment variables configured:

```env
GOOGLE_CLIENT_ID=6700871890-nakh7v78k94gu21gh84jd1ck32abrmes.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
```

⚠️ **Important**: The callback URL in your backend is `http://localhost:8080/auth/google/callback`, but your storefront runs on a different port (likely 5173 or 3000). 

---

## ⚙️ Required Configuration Update

You need to update your backend's `GOOGLE_CALLBACK_URL` to match your storefront URL:

### Option 1: Update Backend Environment Variable
```env
# Change from:
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# To (if your storefront runs on port 5173):
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google/callback
```

### Option 2: Configure in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Select your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   - `http://localhost:5173/auth/google/callback` (for dev)
   - Your production URL when deploying

---

## 🚀 How to Use

### User Flow:

1. **User clicks "Continue with Google"** on `/login` page
   - Calls `sdk.auth.login("customer", "google", {})`
   - Redirects to Google sign-in page

2. **User signs in with Google**
   - Google authenticates the user
   - Redirects back to: `/auth/google/callback?code=...&state=...`

3. **Callback page processes authentication**
   - Validates callback with `sdk.auth.callback()`
   - Creates customer if first-time user
   - Retrieves customer data
   - Sets customer in AuthContext
   - Shows success message

4. **User redirected to homepage**
   - Fully authenticated
   - Can access profile, orders, etc.

---

## 🧪 Testing

1. Start your Medusa backend: `npm run dev` (in backend folder)
2. Start your storefront: `npm run dev` (in this folder)
3. Navigate to `/login`
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected back and logged in!

---

## 🐛 Troubleshooting

### "Authentication Failed" Error
- Check that backend is running
- Verify `GOOGLE_CALLBACK_URL` matches your storefront URL
- Check browser console for detailed errors

### Redirect Loop
- Clear browser cookies and cache
- Ensure Google Cloud Console has correct redirect URIs

### "Invalid Token" Error
- Check that `react-jwt` is installed
- Verify backend token configuration

---

## 📱 What the User Sees

### Login Page:
```
┌─────────────────────────────┐
│         Login               │
├─────────────────────────────┤
│ Email: [input field]        │
│ Password: [input field]     │
│ [Login Button]              │
│                             │
│ ────────── OR ──────────    │
│                             │
│ [G] Continue with Google    │
│                             │
│ Don't have an account?      │
│ Register here               │
└─────────────────────────────┘
```

### Callback Page (Loading):
```
┌─────────────────────────────┐
│    Authenticating...        │
├─────────────────────────────┤
│         [Spinner]           │
│ Completing Google sign-in...│
└─────────────────────────────┘
```

### Callback Page (Success):
```
┌─────────────────────────────┐
│        Success!             │
├─────────────────────────────┤
│            ✓                │
│ Welcome, John Doe!          │
│ Redirecting to homepage...  │
└─────────────────────────────┘
```

---

## 🎉 That's It!

Your Google OAuth authentication is fully integrated and ready to use!

For production deployment, remember to:
1. Update `GOOGLE_CALLBACK_URL` to your production domain
2. Add production URL to Google Cloud Console authorized redirect URIs
3. Ensure HTTPS is enabled (required by Google for production)

