import { API_BASE_URL } from "../config/api";

export type MediaType = "image" | "video" | "audio";

export type RemoteMedia = {
  id: string;
  slug: string;
  title: string;
  type: MediaType;
  category: string;
  mediaUrl: string;
  thumbnailUrl: string;
  duration?: number | null;
  localId?: number | null;
};

/** Turn API relative `/media/...` paths into a phone-reachable URL. 
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string | null {
  const value = String(pathOrUrl || "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE_URL}${path}`;
}*/
export function resolveMediaUrl(
  pathOrUrl: string | null | undefined,
): string | null {
  const value = String(pathOrUrl || "").trim();
  if (!value) return null;

  // Already an absolute URL
 if (/^https?:\/\//i.test(value)) {
  return value;
}
  

  // Relative backend media path
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE_URL}${path}`;
}

export async function fetchMediaByCategory(
  category: string,
): Promise<RemoteMedia[]> {
  const started = Date.now();
  const res = await fetch(
    `${API_BASE_URL}/api/media?category=${encodeURIComponent(category)}`,
  );
  const data = await res.json();
  if (__DEV__) {
    console.log(
      `[stories-perf] GET /api/media?category=${category} ${Date.now() - started}ms status=${res.status}`,
    );
  }
  if (!res.ok || !data?.success || !Array.isArray(data.data)) {
    throw new Error(data?.message || "Failed to load media");
  }
  return (data.data as RemoteMedia[]).map((item) => ({
    ...item,
    mediaUrl: resolveMediaUrl(item.mediaUrl) || "",
    thumbnailUrl: resolveMediaUrl(item.thumbnailUrl) || "",
  }));
}

export function indexMediaByLocalId(
  items: RemoteMedia[],
): Record<number, RemoteMedia> {
  const map: Record<number, RemoteMedia> = {};
  for (const item of items) {
    const localId = Number(item.localId);
    if (Number.isFinite(localId) && localId > 0) {
      map[localId] = item;
    }
  }
  return map;
}
