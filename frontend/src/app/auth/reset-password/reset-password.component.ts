import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="auth-card glassmorphism">
        <div class="auth-header text-center">
          <div class="logo-box mx-auto mb-6">
            <span class="logo">🔐</span>
          </div>
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Create a new secure password for your account</p>
        </div>

        <form (ngSubmit)="onSubmit()" #resetForm="ngForm" class="mt-8">
          <div class="form-group mb-6">
            <label class="form-label">Recovery Token</label>
            <div class="input-wrapper">
              <span class="input-icon">🔑</span>
              <input 
                type="text" 
                [(ngModel)]="token" 
                name="token" 
                required 
                class="form-control" 
                placeholder="Enter 8-digit token">
            </div>
          </div>

          <div class="form-group mb-6">
            <label class="form-label">New Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                [(ngModel)]="newPassword" 
                name="newPassword" 
                required 
                minlength="6"
                class="form-control" 
                placeholder="••••••••">
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block py-4 mt-4" 
            [disabled]="!resetForm.valid || loading">
            {{ loading ? 'Saving Changes...' : 'Update Password' }}
          </button>
        </form>

        <div class="auth-footer text-center mt-8">
          <p>Changed your mind? <a routerLink="/login" class="link-primary">Back to Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); padding: 1.5rem; }
    .auth-card { width: 100%; max-width: 440px; padding: 3rem; border-radius: 2rem; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); }
    .logo-box { width: 64px; height: 64px; background: #ef4444; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; }
    .logo { font-size: 2rem; }
    .auth-title { font-size: 2rem; font-weight: 800; color: var(--text-main); margin: 0; }
    .auth-subtitle { color: var(--text-muted); margin-top: 0.5rem; font-size: 0.875rem; }
    
    .form-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.25rem; }
    .form-control { width: 100%; padding: 1rem 1rem 1rem 3rem; border: 1.5px solid var(--border-light); border-radius: 1rem; background: var(--bg-main); transition: all 0.2s; font-family: inherit; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px var(--primary-alpha); }
    
    .btn-block { width: 100%; }
    .link-primary { color: var(--primary-color); font-weight: 700; text-decoration: none; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  loading = false;

  constructor(
    private http: HttpClient, 
    private toast: ToastService, 
    private router: Router, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    this.loading = true;
    this.http.post('http://localhost:5000/api/auth/reset-password', { 
      token: this.token, 
      newPassword: this.newPassword 
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Password updated successfully!');
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to reset password');
        this.cdr.detectChanges();
      }
    });
  }
}
