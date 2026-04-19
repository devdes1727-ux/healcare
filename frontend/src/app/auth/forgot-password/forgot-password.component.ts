import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a reset otp.</p>
        
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" placeholder="e.g. johndoe@gmail.com" />
        </div>

        <button (click)="sendOtp()" [disabled]="isLoading">
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div *ngIf="otpSent" class="success-box">
           Check your email for the reset code and enter it on the next screen.
        </div>
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
    .success-box { margin-top: 20px; background: #f0fdf4; color: #166534; padding: 15px; border-radius: 12px; font-size: 14px; }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  otpSent = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  sendOtp() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.http.post('http://localhost:5000/api/auth/forgot-password', {
      email: this.email
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.otpSent = true;

        const message = res?.message || 'Reset code sent to your email';
        this.toast.success(message);

        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 1500);
      },

      error: (err) => {
        this.isLoading = false;

        const message =
          err?.error?.message ||
          err?.message ||
          'Something went wrong';

        this.toast.error(message);

        this.cdr.markForCheck();
      }
    });
  }
}
