import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-wrapper flex items-center justify-center">
      <div class="glass-card animate-scale-in">
        <div class="auth-header">
          <div class="logo-box">❤️</div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Login to your HealCare account</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input type="email" [(ngModel)]="email" name="email" placeholder="name@example.com" required>
            </div>
          </div>

          <div class="form-group mt-6">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>

              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
              >

              <span class="eye-icon" (click)="togglePassword()">
                {{ showPassword ? '🙈' : '👁️' }}
              </span>

            </div>
          </div>

          <div class="flex items-center justify-between mt-4">
            <label class="checkbox-container">
              <input type="checkbox">
              <span class="checkmark"></span>
              Remember me
            </label>
            <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <div class="mt-10">
            <button type="submit" class="btn-auth" [disabled]="loading">
              <span *ngIf="!loading">Sign In</span>
              <div *ngIf="loading" class="loader-tiny"></div>
            </button>
          </div>
        </form>

        <div class="auth-footer text-center mt-8">
          <p>New to HealCare? <a routerLink="/register" class="link-primary">Create an account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; background: radial-gradient(circle at top right, #EEF2FF 0%, #E0E7FF 40%, #DBEAFE 100%); padding: 2rem; }
    .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 40px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 450px; padding: 3rem; }
    
    .eye-icon { position: absolute; right: 16px; top: 14px; cursor: pointer; opacity: 0.6; font-size: 18px; }
    .eye-icon:hover { opacity: 1; }
    .eye-icon { position: absolute; right: 16px; top: 14px; cursor: pointer; opacity: 0.6; transition: 0.2s; }
    .eye-icon:hover { opacity: 1; }

    .auth-header { text-align: center; margin-bottom: 3rem; }
    .logo-box { width: 64px; height: 64px; background: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .auth-title { font-size: 2.25rem; font-weight: 900; color: #1E293B; margin: 0; }
    .auth-subtitle { color: #64748B; font-size: 1rem; margin-top: 0.5rem; }

    .form-group label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748B; margin-bottom: 0.75rem; letter-spacing: 1px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 16px; top: 14px; opacity: 0.5; }
    .input-wrapper input { width: 100%; padding: 14px 16px 14px 48px; border: 2px solid #F1F5F9; border-radius: 16px; font-size: 1rem; font-weight: 600; background: white; transition: 0.3s; }
    .input-wrapper input:focus { border-color: #2563EB; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

    .btn-auth { width: 100%; padding: 16px; background: #2563EB; color: white; border: none; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .btn-auth:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4); }
    .btn-auth:disabled { opacity: 0.7; cursor: not-allowed; }

    .forgot-link { font-size: 0.85rem; font-weight: 700; color: #2563EB; text-decoration: none; }
    .link-primary { color: #2563EB; font-weight: 800; text-decoration: none; }
    .link-primary:hover { text-decoration: underline; }

    .checkbox-container { display: block; position: relative; padding-left: 28px; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: #64748B; user-select: none; }
    .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark { position: absolute; top: 2px; left: 0; height: 18px; width: 18px; background-color: #F1F5F9; border-radius: 5px; }
    .checkbox-container:hover input ~ .checkmark { background-color: #E2E8F0; }
    .checkbox-container input:checked ~ .checkmark { background-color: #2563EB; }
    .checkmark:after { content: ""; position: absolute; display: none; }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }
    .checkbox-container .checkmark:after { left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

    .loader-tiny { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loading = true;
    this.cdr.markForCheck();
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.toast.success(`Welcome back, ${res.name}!`);
        if (res.role === 'doctor') this.router.navigate(['/doctor-dashboard']);
        else if (res.role === 'admin') this.router.navigate(['/admin-dashboard']);
        else this.router.navigate(['/patient-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        const message = err?.error?.message || 'Invalid credentials. Please try again.';
        this.toast.error(message);
      }
    });
  }
}
