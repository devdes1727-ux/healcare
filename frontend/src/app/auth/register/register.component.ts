import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper flex items-center justify-center">
      <div class="glass-card animate-scale-in">
        <div class="auth-header">
          <div class="logo-box">✨</div>
          <h1 class="auth-title">Get Started</h1>
          <p class="auth-subtitle">Join HealCare to manage your health</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input type="text" [(ngModel)]="name" name="name" placeholder="John Doe" required>
            </div>
          </div>

          <div class="form-group mt-5">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input type="email" [(ngModel)]="email" name="email" placeholder="name@example.com" required>
            </div>
          </div>

          <div class="form-group mt-5">
            <label>Master Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input type="password" [(ngModel)]="password" name="password" placeholder="Secure Password" required>
            </div>
          </div>

          <div class="form-group mt-5">
            <label>You are a:</label>
            <div class="role-selector">
              <div class="role-option" [class.selected]="role === 'patient'" (click)="role = 'patient'">
                <span class="role-icon">🩹</span>
                <span>Patient</span>
                <div class="check" *ngIf="role === 'patient'">✔️</div>
              </div>
              <div class="role-option" [class.selected]="role === 'doctor'" (click)="role = 'doctor'">
                <span class="role-icon">🩺</span>
                <span>Doctor</span>
                <div class="check" *ngIf="role === 'doctor'">✔️</div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <button type="submit" class="btn-auth" [disabled]="loading">
              <span *ngIf="!loading">Create Account</span>
              <div *ngIf="loading" class="loader-tiny"></div>
            </button>
          </div>
        </form>

        <div class="auth-footer text-center mt-8">
          <p>Already joined? <a routerLink="/login" class="link-primary">Sign in instead</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; background: radial-gradient(circle at bottom left, #EEF2FF 0%, #E0E7FF 40%, #F5F3FF 100%); padding: 2rem; }
    .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 40px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); width: 100%; max-width: 500px; padding: 3rem; }
    
    .auth-header { text-align: center; margin-bottom: 2.5rem; }
    .logo-box { width: 64px; height: 64px; background: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .auth-title { font-size: 2.25rem; font-weight: 950; color: #1E293B; margin: 0; }
    .auth-subtitle { color: #64748B; font-size: 0.95rem; margin-top: 0.5rem; }

    .form-group label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748B; margin-bottom: 0.65rem; letter-spacing: 1px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 16px; top: 14px; opacity: 0.5; }
    .input-wrapper input { width: 100%; padding: 14px 16px 14px 48px; border: 2.5px solid #F1F5F9; border-radius: 16px; font-size: 1rem; font-weight: 600; background: white; transition: 0.3s; }
    .input-wrapper input:focus { border-color: #2563EB; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

    .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .role-option { padding: 14px; border: 2.5px solid #F1F5F9; border-radius: 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 800; position: relative; transition: 0.2s; background: white; }
    .role-option:hover { border-color: #E2E8F0; }
    .role-option.selected { border-color: #2563EB; background: #Eff6FF; color: #2563EB; }
    .role-icon { font-size: 1.25rem; }
    .check { position: absolute; right: 12px; font-size: 0.8rem; }

    .btn-auth { width: 100%; padding: 18px; background: #2563EB; color: white; border: none; border-radius: 18px; font-size: 1.1rem; font-weight: 900; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .btn-auth:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4); }

    .link-primary { color: #2563EB; font-weight: 800; text-decoration: none; }
    
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .loader-tiny { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'patient';
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit() {
    this.loading = true;
    this.authService.register({ 
      name: this.name, 
      email: this.email, 
      password: this.password, 
      role: this.role 
    }).subscribe({
      next: (res) => {
        this.toast.success('Registration successful! Welcome to HealCare.');
        if (this.role === 'doctor') this.router.navigate(['/doctor-dashboard']);
        else this.router.navigate(['/patient-dashboard']);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Registration failed. This email may already be in use.');
      }
    });
  }
}
