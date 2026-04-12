import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="auth-card glassmorphism">
        <div class="auth-header text-center">
          <div class="logo-box mx-auto mb-6">
            <span class="logo">🧬</span>
          </div>
          <h1 class="auth-title">Forgot Password?</h1>
          <p class="auth-subtitle">Enter your email to receive a reset token</p>
        </div>

        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" class="mt-8">
          <div class="form-group mb-6">
            <label class="form-label">Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required 
                email
                class="form-control" 
                placeholder="doctor@healcare.com">
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block py-4 mt-4" 
            [disabled]="!forgotForm.valid || loading">
            {{ loading ? 'Generating Token...' : 'Send Reset Token' }}
          </button>
        </form>

        <div class="auth-footer text-center mt-8">
          <p>Remembered? <a routerLink="/login" class="link-primary">Back to Login</a></p>
        </div>
      </div>

      <div class="decorative-blob blob-1"></div>
      <div class="decorative-blob blob-2"></div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      position: relative;
      overflow: hidden;
      padding: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem;
      border-radius: 2rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      z-index: 10;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .logo-box {
      width: 64px;
      height: 64px;
      background: var(--primary-color);
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px var(--primary-alpha);
    }
    .logo { font-size: 2rem; }
    .auth-title { font-size: 2rem; font-weight: 800; color: var(--text-main); margin: 0; }
    .auth-subtitle { color: var(--text-muted); margin-top: 0.5rem; font-size: 0.875rem; }
    
    .form-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.5px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.25rem; }
    .form-control { width: 100%; padding: 1rem 1rem 1rem 3rem; border: 1.5px solid var(--border-light); border-radius: 1rem; background: var(--bg-main); transition: all 0.2s; font-family: inherit; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px var(--primary-alpha); }
    
    .btn-block { width: 100%; }
    .link-primary { color: var(--primary-color); font-weight: 700; text-decoration: none; }
    .link-primary:hover { text-decoration: underline; }

    .decorative-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; z-index: 1; }
    .blob-1 { width: 500px; height: 500px; background: var(--primary-color); top: -100px; right: -100px; }
    .blob-2 { width: 400px; height: 400px; background: #9333ea; bottom: -50px; left: -100px; }

    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  constructor(private http: HttpClient, private toast: ToastService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    this.loading = true;
    this.http.post('http://localhost:5000/api/auth/forgot-password', { email: this.email }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toast.success(`Token: ${res.token} (Demo Mode)`);
        this.router.navigate(['/reset-password'], { queryParams: { token: res.token } });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to generate token');
        this.cdr.detectChanges();
      }
    });
  }
}
