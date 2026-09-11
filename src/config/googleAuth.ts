/**
 * Google Sign-In configuration for Mini Abdullah (Firebase project: mini-abdullah).
 *
 * ── Why this file exists ──────────────────────────────────────────────────────
 * @react-native-google-signin/google-signin needs the Firebase **Web client ID**
 * (OAuth client_type 3). It is public and safe to ship in the app — not a secret.
 *
 * android/app/google-services.json currently has `"oauth_client": []` because
 * Google Sign-In is not fully enabled in Firebase yet. After setup, that array
 * will contain a client_id ending in `.apps.googleusercontent.com` with
 * `"client_type": 3`. You can copy that value here OR read it from Firebase Console.
 *
 * ── Firebase Console setup (one-time) ─────────────────────────────────────────
 * 1. Open https://console.firebase.google.com/project/mini-abdullah/authentication/providers
 * 2. Click **Google** → **Enable** → set support email → **Save**
 * 3. Open https://console.firebase.google.com/project/mini-abdullah/settings/general
 *    → Your apps → Android (`com.miniabdullah`)
 * 4. Add your **SHA-1** fingerprint (required for Google Sign-In on Android):
 *    - Debug keystore (local dev):
 *        cd android && gradlew signingReport
 *      Copy the SHA-1 under `Variant: debug` → `SHA1`.
 *    - Release: use your upload/release keystore SHA-1 when publishing.
 * 5. Download the updated **google-services.json** and replace
 *    android/app/google-services.json (keeps FCM working — same file).
 * 6. Copy the **Web client ID**:
 *    - Firebase Console → Authentication → Sign-in method → Google
 *      → "Web SDK configuration" → Web client ID, OR
 *    - google-services.json → oauth_client entry with `"client_type": 3`
 *      → `client_id` field.
 * 7. Paste it into GOOGLE_WEB_CLIENT_ID below.
 * 8. Rebuild the app: npx react-native run-android
 *
 * Until GOOGLE_WEB_CLIENT_ID is set, the Login screen shows a clear
 * "Not configured" message instead of attempting Google Sign-In.
 */

/** Matches android/app/google-services.json → project_info.project_id */
export const FIREBASE_PROJECT_ID = "mini-abdullah";

/** Matches android/app/google-services.json → client → android_client_info.package_name */
export const ANDROID_PACKAGE_NAME = "com.miniabdullah";

/**
 * Web client ID from Firebase (client_type 3).
 * Replace the placeholder after completing Firebase Console setup above.
 */
export const GOOGLE_WEB_CLIENT_ID =
  "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

export function isGoogleSignInConfigured(): boolean {
  return (
    GOOGLE_WEB_CLIENT_ID.length > 0 &&
    !GOOGLE_WEB_CLIENT_ID.startsWith("YOUR_WEB_CLIENT_ID")
  );
}

/** Shown in Login when Google Sign-In is not configured yet. */
export function getGoogleSignInSetupMessage(): string {
  return (
    "Google Sign-In is not configured yet.\n\n" +
    "1. Firebase Console → mini-abdullah → Authentication → enable Google\n" +
    "2. Project settings → Android app → add SHA-1 (run: cd android && gradlew signingReport)\n" +
    "3. Download new google-services.json → android/app/\n" +
    "4. Copy Web client ID → src/config/googleAuth.ts → GOOGLE_WEB_CLIENT_ID\n" +
    "5. Rebuild: npx react-native run-android"
  );
}
