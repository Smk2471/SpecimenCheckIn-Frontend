import { Component, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { TenantService } from '../../../core/tenant.service';
import {
  AddOffManifestSpecimenRequest,
  ManifestDetail,
  ManifestListItem
} from '../../../core/models';
import { ManifestWorklistComponent } from '../manifest-worklist/manifest-worklist.component';
import { ManifestDetailComponent } from '../manifest-detail/manifest-detail.component';
import { AddSpecimenDialogComponent } from '../add-specimen-dialog/add-specimen-dialog.component';

@Component({
  selector: 'app-checkin-page',
  standalone: true,
  imports: [
    ManifestWorklistComponent,
    ManifestDetailComponent,
    AddSpecimenDialogComponent
  ],
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

  constructor() {
    // Initial load
    this.loadManifests();

    // Reload everything whenever the selected lab changes.
    effect(() => {
      this.tenant.currentLabId();

      // Reset page state
      this.selectedManifestId.set(null);
      this.selectedManifest.set(null);

      this.detailLoading.set(false);
      this.actionInFlightId.set(null);
      this.closing.set(false);
      this.showAddDialog.set(false);
      this.errorMessage.set(null);

      this.loadManifests();
    });
  }

  loadManifests(): void {
    this.listLoading.set(true);

    this.api.listManifests().subscribe({
      next: manifests => {
        this.manifests.set(manifests);
        this.listLoading.set(false);
      },
      error: err => {
        this.listLoading.set(false);
        this.showError(err.message);
      }
    });
  }

  private refreshManifestsQuietly(): void {
    this.api.listManifests().subscribe({
      next: manifests => {
        this.manifests.set(manifests);

        // If the currently selected manifest no longer exists
        // (because the user switched labs or data changed),
        // clear the detail pane.
        const selectedId = this.selectedManifestId();

        if (
          selectedId &&
          !manifests.some(m => m.id === selectedId)
        ) {
          this.selectedManifestId.set(null);
          this.selectedManifest.set(null);
          this.detailLoading.set(false);
        }
      },
      error: () => {
        // Background refresh - ignore failures.
      }
    });
  }

  selectManifest(id: string): void {
    this.selectedManifestId.set(id);
    this.detailLoading.set(true);
    this.errorMessage.set(null);

    this.api.getManifest(id).subscribe({
      next: detail => {
        // Ignore stale responses if user already selected another manifest.
        if (this.selectedManifestId() !== id) {
          return;
        }

        this.selectedManifest.set(detail);
        this.detailLoading.set(false);
      },
      error: err => {
        if (this.selectedManifestId() !== id) {
          return;
        }

        this.detailLoading.set(false);
        this.selectedManifest.set(null);
        this.showError(err.message);
      }
    });
  }

  onReceive(specimenId: string): void {
    const manifestId = this.selectedManifestId();

    if (!manifestId) {
      return;
    }

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

    if (!manifestId) {
      return;
    }

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

    if (!manifestId) {
      return;
    }

    this.api.addOffManifestSpecimen(manifestId, request).subscribe({
      next: detail => {
        this.selectedManifest.set(detail);
        this.showAddDialog.set(false);
        this.refreshManifestsQuietly();
      },
      error: err => {
        this.showError(err.message);
      }
    });
  }

  onClose(): void {
    const manifestId = this.selectedManifestId();

    if (!manifestId) {
      return;
    }

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
