import { AnalyticsOverview, CaseDetail, CaseStatus, WasteCase } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend-6vdv-blue.vercel.app";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("lawma_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/overview`, {
      headers: {
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // If endpoint requires auth or returns error, provide structured fallback
      throw new Error(`Analytics overview failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.warn("API analytics overview failed, using mock data:", error);
    // Return sample municipal overview for instant visual preview
    return {
      totalCases: 24,
      casesByStatus: {
        reported: 6,
        underReview: 4,
        verified: 5,
        assigned: 3,
        accepted: 2,
        inProgress: 2,
        resolved: 2,
        closed: 0,
        rejected: 0,
        duplicate: 0,
        reopened: 0,
      },
    };
  }
}

export async function fetchAllCases(): Promise<WasteCase[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/reports`, {
      headers: {
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Fetch cases failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn("API fetch cases failed, using mock data:", error);
    return [
      {
        id: "case-001",
        caseNumber: "LAG-2026-0891",
        source: "MOBILE",
        status: "REPORTED",
        description: "Heavy commercial refuse overflow blocking road gutter and pedestrian walkway.",
        latitude: "6.524379",
        longitude: "3.379206",
        locationAccuracy: "8.5",
        address: "24 Allen Avenue, Ikeja, Lagos",
        ward: "Ikeja Central",
        lga: "Ikeja",
        privacyLevel: "PRIVATE",
        reportedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "case-002",
        caseNumber: "LAG-2026-0889",
        source: "MOBILE",
        status: "UNDER_REVIEW",
        description: "Illegal dumping of construction aggregate and plastics near secondary canal.",
        latitude: "6.505000",
        longitude: "3.362000",
        locationAccuracy: "12.0",
        address: "Bode Thomas St, Surulere, Lagos",
        ward: "Surulere Central",
        lga: "Surulere",
        privacyLevel: "IDENTIFIED",
        reportedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "case-003",
        caseNumber: "LAG-2026-0884",
        source: "MOBILE",
        status: "VERIFIED",
        description: "Major market bin overflow near transit roundabout. Needs compactor truck dispatch.",
        latitude: "6.518000",
        longitude: "3.385000",
        locationAccuracy: "10.0",
        address: "Ojuelegba Bus Stop Corridor, Lagos",
        ward: "Yaba East",
        lga: "Lagos Mainland",
        privacyLevel: "PRIVATE",
        reportedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "case-004",
        caseNumber: "LAG-2026-0872",
        source: "MOBILE",
        status: "ASSIGNED",
        description: "Spillover along expressway shoulder. Assigned to Prime Waste PSP.",
        latitude: "6.453000",
        longitude: "3.428000",
        locationAccuracy: "15.0",
        address: "Ozumba Mbadiwe Way, Victoria Island",
        ward: "VI Ward A",
        lga: "Eti-Osa",
        privacyLevel: "IDENTIFIED",
        reportedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "case-005",
        caseNumber: "LAG-2026-0860",
        source: "MOBILE",
        status: "RESOLVED",
        description: "Cleared with photographic proof submitted by field team.",
        latitude: "6.601800",
        longitude: "3.351500",
        locationAccuracy: "6.0",
        address: "Agidingbi Industrial Layout, Ikeja",
        ward: "Agidingbi",
        lga: "Ikeja",
        privacyLevel: "PRIVATE",
        reportedAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      },
    ];
  }
}

export async function updateCaseStatusApi(
  caseId: string,
  newStatus: CaseStatus
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to update status to ${newStatus}`
    );
  }

  return res.json();
}

export async function assignCaseApi(
  caseId: string,
  collectorId: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/assignments/${caseId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ collectorId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || "Failed to assign case to collector"
    );
  }

  return res.json();
}

export async function loginAgencyApi(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Invalid email or password");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("lawma_access_token", json.data.accessToken);
    localStorage.setItem("lawma_user", JSON.stringify(json.data.user));
  }

  return json.data;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lawma_access_token");
}

export function getStoredUser(): any {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("lawma_user");
  return user ? JSON.parse(user) : null;
}

export function logoutAgency(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lawma_access_token");
    localStorage.removeItem("lawma_user");
  }
}

export function setStoredSession(token: string, user?: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lawma_access_token", token);
    if (user) {
      localStorage.setItem("lawma_user", JSON.stringify(user));
    }
  }
}

