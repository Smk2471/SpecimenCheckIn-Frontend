import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManifestListItem } from '../../../core/models';
import { StatusPillComponent } from '../status-pill/status-pill.component';

@Component({
  selector: 'app-manifest-worklist',
  standalone: true,
  imports: [FormsModule, StatusPillComponent],
  templateUrl: './manifest-worklist.component.html',
  styleUrl: './manifest-worklist.component.css'
})
export class ManifestWorklistComponent {
  manifests = input.required<ManifestListItem[]>();
  selectedId = input<string | null>(null);
  loading = input(false);

  select = output<string>();

  searchTerm = signal('');

  filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.manifests();
    return this.manifests().filter(
      m => m.code.toLowerCase().includes(term) || m.clinicName.toLowerCase().includes(term)
    );
  });

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
