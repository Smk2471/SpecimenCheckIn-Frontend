import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantService } from './tenant.service';
import {
  AddOffManifestSpecimenRequest,
  ApiErrorBody,
  ManifestDetail,
  ManifestListItem,
  ManifestStatus
} from './models';

// Thin wrapper around HttpClient: attaches the X-Lab-Id tenant header to
// every call and normalizes the backend's structured error shape into a
// plain Error with a friendly message, so components don't need to know
// about ApiErrorBody at all.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly tenant = inject(TenantService);

  private get baseUrl(): string {
    return `${environment.apiBaseUrl}/api/manifests`;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'X-Lab-Id': this.tenant.currentLabId(),
      'X-User-Id': 'frontend-technician'
    });
  }

  listManifests(status?: ManifestStatus): Observable<ManifestListItem[]> {
    const url = status ? `${this.baseUrl}?status=${status}` : this.baseUrl;
    return this.http.get<ManifestListItem[]>(url, { headers: this.headers }).pipe(
      catchError(err => this.rethrow(err))
    );
  }

  getManifest(id: string): Observable<ManifestDetail> {
    return this.http.get<ManifestDetail>(`${this.baseUrl}/${id}`, { headers: this.headers }).pipe(
      catchError(err => this.rethrow(err))
    );
  }

  receiveSpecimen(manifestId: string, specimenId: string): Observable<ManifestDetail> {
    return this.http
      .post<ManifestDetail>(`${this.baseUrl}/${manifestId}/specimens/${specimenId}/receive`, {}, { headers: this.headers })
      .pipe(catchError(err => this.rethrow(err)));
  }

  flagSpecimen(manifestId: string, specimenId: string, note?: string): Observable<ManifestDetail> {
    return this.http
      .post<ManifestDetail>(
        `${this.baseUrl}/${manifestId}/specimens/${specimenId}/flag`,
        { note: note ?? null },
        { headers: this.headers }
      )
      .pipe(catchError(err => this.rethrow(err)));
  }

  addOffManifestSpecimen(manifestId: string, request: AddOffManifestSpecimenRequest): Observable<ManifestDetail> {
    return this.http
      .post<ManifestDetail>(`${this.baseUrl}/${manifestId}/specimens`, request, { headers: this.headers })
      .pipe(catchError(err => this.rethrow(err)));
  }

  closeManifest(manifestId: string): Observable<ManifestDetail> {
    return this.http
      .post<ManifestDetail>(`${this.baseUrl}/${manifestId}/close`, {}, { headers: this.headers })
      .pipe(catchError(err => this.rethrow(err)));
  }

  private rethrow(err: HttpErrorResponse) {
    const body = err.error as ApiErrorBody | null;
    const message = body?.error?.message ?? this.fallbackMessage(err);
    return throwError(() => new Error(message));
  }

  private fallbackMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    return `Something went wrong (HTTP ${err.status}).`;
  }
}
