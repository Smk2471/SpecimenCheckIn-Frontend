import { Component, computed, input } from '@angular/core';

// One shared pill for both manifest statuses and specimen statuses - the
// color/label mapping is intentionally centralized here so the palette stays
// consistent everywhere a status appears (worklist card, detail header, table row).
@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `<span class="pill" [class]="'pill-' + colorClass()">{{ label() }}</span>`,
  styles: [`
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      line-height: 1.4;
    }
    .pill-open      { background: #E7EEF5; color: var(--status-open); }
    .pill-intransit { background: #EEF0F2; color: var(--status-intransit); }
    .pill-closed    { background: var(--success-bg); color: var(--status-closed); }
    .pill-closeddisc{ background: var(--warning-bg); color: var(--status-closed-disc); }
    .pill-pending   { background: #EEF0F2; color: var(--status-pending); }
    .pill-received  { background: var(--success-bg); color: var(--status-received); }
    .pill-flagged   { background: var(--danger-bg); color: var(--status-flagged); }
    .pill-added     { background: #F1ECFA; color: var(--status-added); }
  `]
})
export class StatusPillComponent {
  status = input.required<string>();

  private static readonly LABELS: Record<string, string> = {
    InTransit: 'In Transit',
    Open: 'Open',
    Closed: 'Closed',
    ClosedWithDiscrepancy: 'Closed w/ Discrepancy',
    Pending: 'Pending',
    Received: 'Received',
    Flagged: 'Flagged',
    Added: 'Off-Manifest'
  };

  private static readonly COLOR_CLASSES: Record<string, string> = {
    InTransit: 'intransit',
    Open: 'open',
    Closed: 'closed',
    ClosedWithDiscrepancy: 'closeddisc',
    Pending: 'pending',
    Received: 'received',
    Flagged: 'flagged',
    Added: 'added'
  };

  label = computed(() => StatusPillComponent.LABELS[this.status()] ?? this.status());
  colorClass = computed(() => StatusPillComponent.COLOR_CLASSES[this.status()] ?? 'pending');
}
