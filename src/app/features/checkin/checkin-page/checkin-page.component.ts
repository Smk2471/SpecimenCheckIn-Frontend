import { Component, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { TenantService } from '../../../core/tenant.service';
import { AddOffManifestSpecimenRequest, ManifestDetail, ManifestListItem } from '../../../core/models';
import { ManifestWorklistComponent } from '../manifest-worklist/manifest-worklist.component';
import { ManifestDetailComponent } from '../manifest-detail/manifest-detail.component';
import { AddSpecimenDialogComponent } from '../add-specimen-dialog/add-specimen-dialog.component';

@Component({
  selector: 'app-checkin-page',
  standalone: true,
  imports: [ManifestWorklistComponent, ManifestDetailComponent, AddSpecimenDialogComponent],
  templateUrl: './checkin-page.component.html',
  styleUrl: './checkin-page.component.css'
})
export class CheckinPageComponent {
  private readonly api = inject(ApiService);
  private readonly tenant = inject(TenantService);

  manifests = signal<ManifestListItem[]>([]);
  listLoading = signal(true);

  selectedManifestId = signal<string | null>(null);
  selectedManifest = signal<ManifestDetail | null>(null);
  detailLoading = signal(false);

  actionInFlightId = signal<string | null>(null);
  closing = signal(false);
  showAddDialog = signal(false);

  errorMessage = signal<string | null>(null);

  // Bumped on every lab switch. Any list-fetch response whose captured
  // sequence number doesn't match the *current* one when it resolves is
  // stale (it was in flight for a lab the user has since switched away
  // from) and is discarded instead of overwriting the UI.
  private listRequestSeq = 0;

  // Bumped on every manifest selection (and on lab switch, since the
  // selection is cleared then too). Same purpose, for detail fetches.
  private detailRequestSeq = 0;

  constructor() {
    // The effect's first run fires once automatically on creation, so this
    // single effect - not a separate explicit call - is both the initial
    // load AND the "lab changed" handler. Only one code path, so there's
    // no way for it to double-fire and race itself on startup.
    effect(() => {
      this.tenant.currentLabId(); // dependency: reruns whenever the lab changes
      this.selectedManifestId.set(null);
      this.selectedManifest.set(null);
      this.actionInFlightId.set(null);
      this.closing.set(false);
      this.showAddDialog.set(false);
      this.errorMessage.set(null);
      this.loadManifests();
    });
  }

  loadManifests(): void {
    const seq = ++this.listRequestSeq;
    this.listLoading.set(true);
    this.api.listManifests().subscribe({
      next: manifests => {
        if (seq !== this.listRequestSeq) return; // a newer request has since started; drop this one
        this.manifests.set(manifests);
        this.listLoading.set(false);
      },
      error: err => {
        if (seq !== this.listRequestSeq) return;
        this.listLoading.set(false);
        this.showError(err.message);
      }
    });
  }

  private refreshManifestsQuietly(): void {
    const seq = ++this.listRequestSeq;
    this.api.listManifests().subscribe({
      next: manifests => {
        if (seq !== this.listRequestSeq) return;
        this.manifests.set(manifests);
      },
      error: () => {} // non-critical background refresh
    });
  }

  selectManifest(id: string): void {
    const seq = ++this.detailRequestSeq;
    this.selectedManifestId.set(id);
    this.detailLoading.set(true);
    this.errorMessage.set(null);
    this.api.getManifest(id).subscribe({
      next: detail => {
        if (seq !== this.detailRequestSeq) return; // user has since switched labs or picked another manifest
        this.selectedManifest.set(detail);
        this.detailLoading.set(false);
      },
      error: err => {
        if (seq !== this.detailRequestSeq) return;
        this.detailLoading.set(false);
        this.selectedManifest.set(null);
        this.showError(err.message);
      }
    });
  }

  onReceive(specimenId: string): void {
    const manifestId = this.selectedManifestId();
    if (!manifestId) return;
    this.actionInFlightId.set(specimenId);
    this.api.receiveSpecimen(manifestId, specimenId).subscribe({
      next: detail => {
        this.selectedManifest.set(detail);
        this.actionInFlightId.set(null);
        this.refreshManifestsQuietly();
      },
      error: err => {
        this.actionInFlightId.set(null);
        this.showError(err.message);
      }
    });
  }

  onFlag(specimenId: string): void {
    const manifestId = this.selectedManifestId();
    if (!manifestId) return;
    this.actionInFlightId.set(specimenId);
    this.api.flagSpecimen(manifestId, specimenId).subscribe({
      next: detail => {
        this.selectedManifest.set(detail);
        this.actionInFlightId.set(null);
        this.refreshManifestsQuietly();
      },
      error: err => {
        this.actionInFlightId.set(null);
        this.showError(err.message);
      }
    });
  }

  onAddSpecimen(request: AddOffManifestSpecimenRequest): void {
    const manifestId = this.selectedManifestId();
    if (!manifestId) return;
    this.api.addOffManifestSpecimen(manifestId, request).subscribe({
      next: detail => {
        this.selectedManifest.set(detail);
        this.showAddDialog.set(false);
        this.refreshManifestsQuietly();
      },
      error: err => this.showError(err.message)
    });
  }

  onClose(): void {
    const manifestId = this.selectedManifestId();
    if (!manifestId) return;
    this.closing.set(true);
    this.api.closeManifest(manifestId).subscribe({
      next: detail => {
        this.selectedManifest.set(detail);
        this.closing.set(false);
        this.refreshManifestsQuietly();
      },
      error: err => {
        this.closing.set(false);
        this.showError(err.message);
      }
    });
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
  }
}
