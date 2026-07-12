import { Injectable, signal } from '@angular/core';
import { SEEDED_LABS } from './models';

const STORAGE_KEY = 'specimen-checkin.currentLabId';

// Stands in for real auth/session (out of scope per the assignment brief).
// Holds which seeded lab the technician is "logged in" as, persisted to
// localStorage only so a page refresh doesn't lose your place - this is a
// dev convenience, not a security boundary. The real boundary is server-side
// tenant scoping in the API (see backend README, Section 6).
@Injectable({ providedIn: 'root' })
export class TenantService {
  readonly labs = SEEDED_LABS;

  readonly currentLabId = signal<string>(this.readInitialLabId());

  setLab(labId: string): void {
    this.currentLabId.set(labId);
    localStorage.setItem(STORAGE_KEY, labId);
  }

  currentLabName(): string {
    return this.labs.find(l => l.id === this.currentLabId())?.name ?? 'Unknown lab';
  }

  private readInitialLabId(): string {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && this.labs.some(l => l.id === stored)) {
      return stored;
    }
    return this.labs[0].id;
  }
}
