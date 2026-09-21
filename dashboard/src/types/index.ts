export type CaseStatus =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "DUPLICATE"
  | "REOPENED";

export type UserRole =
  | "CITIZEN"
  | "PSP_OPERATOR"
  | "AGENCY_OPERATOR"
  | "COLLECTOR"
  | "ADMIN";

export interface WasteCase {
  id: string;
  caseNumber: string;
  reporterId?: string;
  source: string;
  status: CaseStatus;
  description?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  locationAccuracy?: string | null;
  address?: string | null;
  ward?: string | null;
  lga?: string | null;
  privacyLevel: "IDENTIFIED" | "PRIVATE";
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}

export interface CaseEvidence {
  id: string;
  caseId: string;
  uploadedBy?: string;
  type: string;
  mediaUrl: string;
  description?: string;
  capturedAt?: string;
  createdAt: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  actorId?: string;
  eventType: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CaseDetail {
  wasteCase: WasteCase;
  evidence: CaseEvidence[];
  events: CaseEvent[];
}

export interface AnalyticsOverview {
  totalCases: number;
  casesByStatus: {
    reported: number;
    underReview: number;
    verified: number;
    assigned: number;
    accepted: number;
    inProgress: number;
    resolved: number;
    closed: number;
    rejected: number;
    duplicate: number;
    reopened: number;
  };
}

export interface CollectorOption {
  id: string;
  fullName: string;
  phone: string;
  wardCoverage: string;
  activeTrucks: number;
}
