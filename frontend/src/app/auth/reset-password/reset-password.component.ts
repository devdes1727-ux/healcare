import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>New Password</h2>
        <p>Enter the otp and your new password.</p>
        
        <div class="form-group">
          <label>Otp</label>
          <input [(ngModel)]="otp" placeholder="Otp" />
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input type="password" [(ngModel)]="newPassword" placeholder="••••••••" />
        </div>

        <button (click)="reset()" [disabled]="isLoading">
          {{ isLoading ? 'Resetting...' : 'Change Password' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; align-items: center; justify-content: center; min-height: 80vh; background: #f8fafc; }
    .auth-card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
    h2 { margin: 0 0 10px; font-weight: 800; color: #1e293b; }
    p { color: #64748b; margin-bottom: 30px; }
    .form-group { text-align: left; margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
    input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; }
    button { width: 100%; background: #2563eb; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }
  `]
})
export class ResetPasswordComponent {
  otp = '';
  newPassword = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  reset() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.http.post('http://localhost:5000/api/auth/reset-password', {
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.isLoading = false;
          this.toast.success(res?.message || 'Password changed successfully');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 300);

          this.cdr.markForCheck();
        });
      },

      error: (err) => {
        this.zone.run(() => {
          this.isLoading = false;

          const msg =
            err?.error?.message ||
            err?.message ||
            'Invalid OTP';

          this.toast.error(msg);

          this.cdr.markForCheck();
        });
      }
    });
  }
}