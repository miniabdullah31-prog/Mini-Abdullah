import "@react-native-firebase/app";
import {
  getAuth,
  getIdToken,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { API_BASE_URL } from "../config/api";
import {
  getGoogleSignInSetupMessage,
  GOOGLE_WEB_CLIENT_ID,
  isGoogleSignInConfigured,
} from "../config/googleAuth";

export type GoogleBackendLoginResult = {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

let configured = false;

function ensureGoogleConfigured() {
  if (!isGoogleSignInConfigured()) {
    throw new Error(getGoogleSignInSetupMessage());
  }
  if (!configured) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
    configured = true;
  }
}

export async function signInWithGoogle(): Promise<GoogleBackendLoginResult> {
  ensureGoogleConfigured();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const signInResponse = await GoogleSignin.signIn();
  if (!isSuccessResponse(signInResponse)) {
    return { success: false, message: "Google Sign-In cancelled" };
  }

  const googleIdToken = signInResponse.data.idToken;
  if (!googleIdToken) {
    throw new Error("Google did not return an ID token");
  }

  const auth = getAuth();
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const userCredential = await signInWithCredential(auth, credential);
  const firebaseUser = userCredential.user;

  if (!firebaseUser) {
    throw new Error("Firebase authentication failed");
  }

  const firebaseIdToken = await getIdToken(firebaseUser);

  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });

  const data = (await res.json()) as GoogleBackendLoginResult;
  return data;
}

/** Clears Google + Firebase session so account chooser works on next login */
export async function signOutGoogleSession(): Promise<void> {
  try {
    const auth = getAuth();
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch {
    // ignore
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — user may never have used Google Sign-In
  }
}
