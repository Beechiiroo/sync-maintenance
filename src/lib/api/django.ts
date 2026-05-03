/**
 * Django REST API surface.
 * Mirrors the Supabase schema so pages can swap data sources with minimal changes.
 *
 * Endpoint convention (matches the generated Django backend):
 *   /api/auth/{login,register,token/refresh,me,logout}/
 *   /api/equipment/             CRUD
 *   /api/interventions/         CRUD
 *   /api/spare-parts/           CRUD
 *   /api/stock-movements/       CRUD
 *   /api/maintenance-schedules/ CRUD
 *   /api/tickets/               CRUD
 *   /api/contracts/             CRUD
 *   /api/notifications/         CRUD
 *   /api/messages/              CRUD
 *   /api/profiles/              list/retrieve/update
 *   /api/user-roles/            list/retrieve
 *   /api/audit-logs/            list/create
 *   /api/ai/chat/               POST { messages, language } -> { content }
 */
import { apiClient, tokenStorage } from "./client";

// ---------- helpers ----------
type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
const unwrap = <T,>(data: T | Paginated<T>): T extends any[] ? T : T =>
  // DRF can return either a plain list or a paginated object
  // @ts-expect-error runtime narrowing
  Array.isArray(data) ? data : data?.results ?? data;

function crud<T, CreateT = Partial<T>, UpdateT = Partial<T>>(resource: string) {
  const base = `/${resource}/`;
  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      const { data } = await apiClient.get(base, { params });
      return unwrap<T[]>(data) as T[];
    },
    get: async (id: string): Promise<T> => {
      const { data } = await apiClient.get(`${base}${id}/`);
      return data;
    },
    create: async (payload: CreateT): Promise<T> => {
      const { data } = await apiClient.post(base, payload);
      return data;
    },
    update: async (id: string, payload: UpdateT): Promise<T> => {
      const { data } = await apiClient.patch(`${base}${id}/`, payload);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`${base}${id}/`);
    },
  };
}

// ---------- auth ----------
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login/", { email, password });
    tokenStorage.set(data.access, data.refresh);
    return data.user;
  },
  register: async (payload: { email: string; password: string; full_name?: string; role?: string }) => {
    const { data } = await apiClient.post("/auth/register/", payload);
    if (data.access) tokenStorage.set(data.access, data.refresh);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get("/auth/me/");
    return data;
  },
  logout: async () => {
    try { await apiClient.post("/auth/logout/", { refresh: tokenStorage.getRefresh() }); } catch {}
    tokenStorage.clear();
  },
  isAuthenticated: () => !!tokenStorage.getAccess(),
};

// ---------- domain resources ----------
export const equipmentApi = crud<any>("equipment");
export const interventionsApi = crud<any>("interventions");
export const sparePartsApi = crud<any>("spare-parts");
export const stockMovementsApi = crud<any>("stock-movements");
export const maintenanceSchedulesApi = crud<any>("maintenance-schedules");
export const ticketsApi = crud<any>("tickets");
export const contractsApi = crud<any>("contracts");
export const notificationsApi = crud<any>("notifications");
export const messagesApi = crud<any>("messages");
export const profilesApi = crud<any>("profiles");
export const userRolesApi = crud<any>("user-roles");
export const auditLogsApi = crud<any>("audit-logs");

// ---------- AI ----------
export const aiApi = {
  chat: async (messages: Array<{ role: string; content: string }>, language: "fr" | "en" | "ar" = "fr") => {
    const { data } = await apiClient.post("/ai/chat/", { messages, language });
    return data as { content: string };
  },
};
