import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveUserKey } from "./accountStore";
import type { TutorAppointment } from "./tutorService";

const BASE_KEY = "miniabdullah_tutor_free_trial_used_v1";

function scopedKey(userKey: string) {
  const safe = (userKey || "guest").toLowerCase().trim() || "guest";
  return `${BASE_KEY}__${safe}`;
}

function appointmentUsedTrial(list: TutorAppointment[]): boolean {
  return list.some(
    (a) =>
      a.status === "pending" ||
      a.status === "confirmed" ||
      a.status === "completed",
  );
}

/** True when this profile has already used the one-time free tutor session. */
export async function hasUsedTutorFreeTrial(
  appointments?: TutorAppointment[],
): Promise<boolean> {
  try {
    const userKey = await resolveUserKey();
    const flagged = await AsyncStorage.getItem(scopedKey(userKey));
    if (flagged === "1") return true;
    if (appointments && appointmentUsedTrial(appointments)) {
      await AsyncStorage.setItem(scopedKey(userKey), "1");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Persist that the active profile's free tutor trial has been used. */
export async function markTutorFreeTrialUsed(): Promise<void> {
  try {
    const userKey = await resolveUserKey();
    await AsyncStorage.setItem(scopedKey(userKey), "1");
  } catch {
    // ignore — next successful load from appointments can still recover
  }
}
