import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getValidAccessToken } from "./authSession";

export type TutorGender = "male" | "female";

export type Tutor = {
  id: string;
  slug: string;
  name: string;
  role: string;
  gender: TutorGender;
  specializations: string[];
  bio: string;
  subject: string;
  isActive: boolean;
};

export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

export type TutorAvailability = {
  date: string;
  slots: AvailabilitySlot[];
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "not_required"
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type TutorAppointment = {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorRole: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  zoomLink: string;
  canJoin: boolean;
  notes?: string;
  createdAt?: string;
  isFreeTrial?: boolean;
  paymentRequired?: boolean;
  paymentStatus?: PaymentStatus;
  amount?: number;
  currency?: string;
  paymentOrderId?: string | null;
  requiresPayment?: boolean;
  isUpcoming?: boolean;
  sessionStarted?: boolean;
  paymentLabel?: string;
};

export type PaymentCheckoutInfo = {
  orderId: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  checkoutConfigured: boolean;
  checkoutUrl: string | null;
  message: string;
};

export type CreateAppointmentResult = {
  appointment: TutorAppointment;
  payment: PaymentCheckoutInfo | null;
  freeTrialAvailable: boolean;
};

function apiMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    (error?.message?.includes("Network Error")
      ? "Could not reach the server. Check Wi‑Fi and try again."
      : fallback)
  );
}

async function authHeaders() {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return { token, headers };
}

export async function fetchTutors(): Promise<Tutor[]> {
  const response = await axios.get(`${API_BASE_URL}/api/tutors`, {
    timeout: 12000,
  });
  if (!response.data?.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data?.message || "Failed to load tutors");
  }
  return response.data.data as Tutor[];
}

export async function fetchTutorAvailability(
  tutorId: string,
  date: string,
): Promise<TutorAvailability> {
  const response = await axios.get(
    `${API_BASE_URL}/api/tutors/${tutorId}/availability`,
    { params: { date }, timeout: 12000 },
  );
  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || "Failed to load times");
  }
  return response.data.data as TutorAvailability;
}

export async function fetchFreeTrialStatus(): Promise<boolean> {
  const { token, headers } = await authHeaders();
  if (!token) {
    return true;
  }
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/appointments/trial-status`,
      { timeout: 10000, headers },
    );
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to load trial status");
    }
    return !!response.data.data?.freeTrialAvailable;
  } catch (error: any) {
    throw new Error(apiMessage(error, "Failed to load trial status"));
  }
}

export async function createAppointment(payload: {
  tutorId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  idempotencyKey?: string;
}): Promise<CreateAppointmentResult> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in to book a tutor.");
  }
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/appointments`,
      payload,
      { timeout: 15000, headers },
    );
    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || "Could not book this session.");
    }
    return {
      appointment: response.data.data as TutorAppointment,
      payment: (response.data.payment as PaymentCheckoutInfo) || null,
      freeTrialAvailable: !!response.data.freeTrialAvailable,
    };
  } catch (error: any) {
    throw new Error(apiMessage(error, "Could not book this session."));
  }
}

export async function fetchMyAppointments(): Promise<{
  appointments: TutorAppointment[];
  freeTrialAvailable: boolean;
}> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in to see your appointments.");
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/api/appointments/my`, {
      timeout: 12000,
      headers,
    });
    if (!response.data?.success || !Array.isArray(response.data.data)) {
      throw new Error(response.data?.message || "Failed to load appointments");
    }
    return {
      appointments: response.data.data as TutorAppointment[],
      freeTrialAvailable:
        typeof response.data.freeTrialAvailable === "boolean"
          ? response.data.freeTrialAvailable
          : true,
    };
  } catch (error: any) {
    throw new Error(apiMessage(error, "Failed to load appointments"));
  }
}

export async function fetchAppointment(
  appointmentId: string,
): Promise<TutorAppointment> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in again.");
  }
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/appointments/${appointmentId}`,
      { timeout: 12000, headers },
    );
    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || "Appointment not found");
    }
    return response.data.data as TutorAppointment;
  } catch (error: any) {
    throw new Error(apiMessage(error, "Failed to load appointment"));
  }
}

export async function createPaymentOrder(payload: {
  appointmentId: string;
  idempotencyKey?: string;
}): Promise<PaymentCheckoutInfo> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in again.");
  }
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/create-order`,
      payload,
      { timeout: 15000, headers },
    );
    if (!response.data?.success || !response.data.data?.payment) {
      throw new Error(
        response.data?.message || "Could not create payment order.",
      );
    }
    return response.data.data.payment as PaymentCheckoutInfo;
  } catch (error: any) {
    throw new Error(apiMessage(error, "Could not create payment order."));
  }
}

/**
 * Asks the server to verify payment with the configured provider.
 * Will not succeed until a real provider adapter verifies — never treat local UI as paid.
 */
export async function verifyPaymentOrder(payload: {
  orderId?: string;
  idempotencyKey?: string;
}): Promise<{
  verified: boolean;
  appointment: TutorAppointment | null;
  message: string;
}> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in again.");
  }
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/verify`,
      payload,
      { timeout: 15000, headers },
    );
    if (!response.data?.success) {
      return {
        verified: false,
        appointment: null,
        message: response.data?.message || "Payment not verified",
      };
    }
    return {
      verified: true,
      appointment: (response.data.data?.appointment as TutorAppointment) || null,
      message: response.data.message || "Payment confirmed",
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const message = apiMessage(error, "Payment not verified");
    if (status === 402 || status === 400) {
      return { verified: false, appointment: null, message };
    }
    throw new Error(message);
  }
}

export async function cancelAppointment(
  appointmentId: string,
): Promise<TutorAppointment> {
  const { token, headers } = await authHeaders();
  if (!token) {
    throw new Error("Please log in again.");
  }
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`,
      {},
      { timeout: 12000, headers },
    );
    if (!response.data?.success || !response.data.data) {
      throw new Error(response.data?.message || "Could not cancel.");
    }
    return response.data.data as TutorAppointment;
  } catch (error: any) {
    throw new Error(apiMessage(error, "Could not cancel this appointment."));
  }
}

export function formatSlotLabel(startTime: string, endTime: string) {
  return `${startTime} – ${endTime}`;
}

export function formatFriendlyDate(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatMoney(amount?: number, currency?: string) {
  const cur = currency || "PKR";
  const n = typeof amount === "number" ? amount : 0;
  return `${cur} ${n}`;
}
