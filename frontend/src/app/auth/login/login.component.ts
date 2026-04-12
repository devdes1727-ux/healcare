import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container flex justify-center items-center" style="min-height: 80vh">
      <div class="card" style="padding: 2rem; width: 100%; max-width: 400px;">
        <h2 class="text-center mb-4">Login to HealCare</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block mb-2">Email</label>
            <input type="email" class="search-input w-full border" [(ngModel)]="email" name="email" required style="border: 1px solid var(--border-light)">
          </div>
          <div class="mb-4">
            <label class="block mb-2">Password</label>
            <input type="password" class="search-input w-full border" [(ngModel)]="password" name="password" required style="border: 1px solid var(--border-light)">
          </div>
          <p class="text-danger mb-4" *ngIf="error">{{error}}</p>
          <button type="submit" class="btn btn-primary w-full">Login</button>
        </form>
        <p class="text-center mt-4">Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  `,
  styles: ['.border { border-radius: 4px; padding: 0.5rem 1rem; } .block { display: block; }']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const role = localStorage.getItem('role');
        if (role === 'doctor') this.router.navigate(['/doctor-dashboard']);
        else if (role === 'admin') this.router.navigate(['/admin-dashboard']);
        else this.router.navigate(['/patient-dashboard']);
      },
      error: (err) => {
        this.error = 'Invalid credentials';
      }
    });
  }
}
