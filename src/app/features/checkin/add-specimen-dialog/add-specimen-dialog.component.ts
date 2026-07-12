import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddOffManifestSpecimenRequest } from '../../../core/models';

@Component({
  selector: 'app-add-specimen-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-specimen-dialog.component.html',
  styleUrl: './add-specimen-dialog.component.css'
})
export class AddSpecimenDialogComponent {
  submit = output<AddOffManifestSpecimenRequest>();
  cancel = output<void>();

  submitting = signal(false);

  code = signal('');
  patient = signal('');
  site = signal('');
  provider = signal('');
  validationError = signal<string | null>(null);

  onSubmit(): void {
    if (!this.code().trim()) {
      this.validationError.set('Specimen code is required.');
      return;
    }
    if (!this.patient().trim()) {
      this.validationError.set('Patient is required.');
      return;
    }
    this.validationError.set(null);
    this.submit.emit({
      code: this.code().trim(),
      patient: this.patient().trim(),
      site: this.site().trim() || undefined,
      provider: this.provider().trim() || undefined
    });
  }
}
