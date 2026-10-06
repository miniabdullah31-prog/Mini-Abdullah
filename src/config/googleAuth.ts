/**
 * Google Sign-In configuration for Mini Abdullah (Firebase project: mini-abdullah).
 *
 * @react-native-google-signin/google-signin needs the Firebase **Web client ID**
 * (OAuth client_type 3). It is public and safe to ship in the app — not a secret.
 *
 * Current project files (verified in-repo):
 * - android/app/google-services.json → project_id mini-abdullah, package com.miniabdullah
 * - oauth_client includes Android (client_type 1) + Web (client_type 3)
 * - GOOGLE_WEB_CLIENT_ID below matches the Web (client_type 3) entry in google-services.json
 *
 * If Google Sign-In fails on a device, re-check Firebase Console:
 * 1. Authentication → Google provider enabled
 * 2. Android app SHA-1 matches the certificate used to build the APK
 *    (debug: `cd android && gradlew signingReport`)
 * 3. Re-download google-services.json if Console clients changed
 * 4. Keep GOOGLE_WEB_CLIENT_ID in sync with client_type 3
 * 5. Rebuild: npx react-native run-android
 */

/** Matches android/app/google-services.json → project_info.project_id */
export const FIREBASE_PROJECT_ID = "mini-abdullah";

/** Matches android/app/google-services.json → client → android_client_info.package_name */
export const ANDROID_PACKAGE_NAME = "com.miniabdullah";

/**
 * Web client ID from Firebase / google-services.json (client_type 3).
 * Must stay in sync with android/app/google-services.json oauth_client.
 */
export const GOOGLE_WEB_CLIENT_ID =
  "625740870303-nf2b5mbid3nac6jrr2vvrli60tabldc2.apps.googleusercontent.com";

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
