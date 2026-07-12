import { Component, input, output } from '@angular/core';
import { ManifestDetail, Specimen } from '../../../core/models';
import { StatusPillComponent } from '../status-pill/status-pill.component';

@Component({
  selector: 'app-manifest-detail',
  standalone: true,
  imports: [StatusPillComponent],
  templateUrl: './manifest-detail.component.html',
  styleUrl: './manifest-detail.component.css'
})
export class ManifestDetailComponent {
  manifest = input<ManifestDetail | null>(null);
  loading = input(false);
  actionInFlightId = input<string | null>(null); // specimen id currently mid-request, for per-row spinners
  closing = input(false);

  receive = output<string>();
  flag = output<string>();
  addSpecimen = output<void>();
  close = output<void>();

  isManifestOpen(m: ManifestDetail): boolean {
    return m.status === 'Open' || m.status === 'InTransit';
  }

  isRowBusy(specimenId: string): boolean {
    return this.actionInFlightId() === specimenId;
  }

  canReceive(s: Specimen): boolean {
    return s.status === 'Pending' || s.status === 'Flagged';
  }

  canFlag(s: Specimen): boolean {
    return s.status === 'Pending';
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
