// Mirrors the DTOs returned by the ASP.NET Core API 1:1 (System.Text.Json's
// default camelCase policy translates the backend's PascalCase C# properties
// to these field names automatically).

export type ManifestStatus = 'InTransit' | 'Open' | 'Closed' | 'ClosedWithDiscrepancy';
export type SpecimenStatus = 'Pending' | 'Received' | 'Flagged' | 'Added';

export interface ManifestListItem {
  id: string;
  code: string;
  clinicName: string;
  status: ManifestStatus;
  sentAt: string;
  specimenCount: number;
  receivedCount: number;
  pendingCount: number;
  openDiscrepancyCount: number;
}

export interface Specimen {
  id: string;
  code: string;
  patient: string;
  site: string;
  provider: string;
  status: SpecimenStatus;
}

export interface ManifestCounts {
  total: number;
  received: number;
  pending: number;
  flagged: number;
  added: number;
  openDiscrepancies: number;
}

export interface ManifestDetail {
  id: string;
  code: string;
  clinicName: string;
  status: ManifestStatus;
  sentAt: string;
  specimens: Specimen[];
  counts: ManifestCounts;
  readyToClose: boolean;
}

export interface AddOffManifestSpecimenRequest {
  code: string;
  patient: string;
  site?: string;
  provider?: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    traceId: string;
  };
}

export interface Lab {
  id: string;
  name: string;
}

// The two seeded labs from the backend's SeedData.cs, used for the dev-mode
// lab switcher that stands in for a real login (see backend README - login
// infra is explicitly out of scope for this assignment).
export const SEEDED_LABS: Lab[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Meridian Pathology Lab' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Coastal Diagnostics Lab' }
];
