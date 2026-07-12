import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantService } from './core/tenant.service';
import { CheckinPageComponent } from './features/checkin/checkin-page/checkin-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CheckinPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(readonly tenant: TenantService) {}

  onLabChange(labId: string): void {
    this.tenant.setLab(labId);
  }
}
