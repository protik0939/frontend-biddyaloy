import { toSameOriginUrl } from "@/lib/same-origin";

export type NoticeAudienceRole = "ADMIN" | "FACULTY" | "DEPARTMENT" | "TEACHER" | "STUDENT";

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  senderRole: NoticeAudienceRole;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  targetRoles: NoticeAudienceRole[];
  isRead: boolean;
  canEdit: boolean;
}

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiError = {
  success: false;
  message?: string;
  error?: unknown;
  errors?: unknown;
};

function getApiPath(path: string) {
  return toSameOriginUrl(path);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return raw.data;
}

async function apiGet<T>(path: string) {
  const response = await fetch(getApiPath(path), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

async function apiPost<T>(path: string, body?: Record<string, unknown>) {
  const response = await fetch(getApiPath(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  return parseResponse<T>(response);
}

async function apiPatch<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(getApiPath(path), {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

async function apiDelete<T>(path: string) {
  const response = await fetch(getApiPath(path), {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<T>(response);
}

export const NoticeService = {
  listNotices(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<NoticeItem[]>(`/api/v1/notices${query}`);
  },

  getUnreadCount() {
    return apiGet<{ unreadCount: number }>("/api/v1/notices/unread-count");
  },

  markNoticeAsRead(noticeId: string) {
    return apiPost<{ id: string }>(`/api/v1/notices/${noticeId}/read`);
  },

  markAllAsRead() {
    return apiPost<{ markedCount: number }>("/api/v1/notices/read-all");
  },

  createNotice(payload: { title: string; content: string; targetRoles: NoticeAudienceRole[] }) {
    return apiPost<NoticeItem>("/api/v1/notices", payload);
  },

  updateNotice(noticeId: string, payload: { title?: string; content?: string; targetRoles?: NoticeAudienceRole[] }) {
    return apiPatch<NoticeItem>(`/api/v1/notices/${noticeId}`, payload);
  },

  deleteNotice(noticeId: string) {
    return apiDelete<{ id: string }>(`/api/v1/notices/${noticeId}`);
  },
};
