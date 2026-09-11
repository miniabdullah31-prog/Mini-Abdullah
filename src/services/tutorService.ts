import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getActiveAuthToken } from "./accountStore";

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
  createdAt?: string;
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
  const token = await getActiveAuthToken();
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

export async function createAppointment(payload: {
  tutorId: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<TutorAppointment> {
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
    return response.data.data as TutorAppointment;
  } catch (error: any) {
    throw new Error(apiMessage(error, "Could not book this session."));
  }
}

export async function fetchMyAppointments(): Promise<TutorAppointment[]> {
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
    return response.data.data as TutorAppointment[];
  } catch (error: any) {
    throw new Error(apiMessage(error, "Failed to load appointments"));
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
