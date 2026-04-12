import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService } from '../services/doctor.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-8" style="min-height: 80vh">
      <div class="flex justify-between items-center mb-8">
        <h2>Admin Dashboard</h2>
        <button class="btn btn-outline" (click)="logout()">Logout</button>
      </div>

      <div class="card" style="padding: 2rem;">
        <h3>Doctor Verifications</h3>
        <p class="text-muted mb-4">You must approve doctors before they appear in the patient directory.</p>
        
        <div *ngIf="doctors.length === 0" class="mt-4" style="color: var(--text-muted)">No doctors found.</div>
        
        <table class="w-full mt-4" style="text-align: left; border-collapse: collapse;" *ngIf="doctors.length > 0">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-light)">
              <th style="padding: 1rem 0">Name</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of doctors" style="border-bottom: 1px solid var(--border-light)">
              <td style="padding: 1rem 0">Dr. {{ doc.userId?.name }}</td>
              <td>{{ doc.specialization }}</td>
              <td><span [ngStyle]="{'color': doc.status === 'approved' ? 'var(--success)' : 'var(--warning)'}">{{ doc.status | uppercase }}</span></td>
              <td>
                <button *ngIf="doc.status !== 'approved'" class="btn btn-primary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" (click)="approve(doc._id)">Approve</button>
                <span *ngIf="doc.status === 'approved'" class="text-muted">Verified</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: ['.text-muted { color: var(--text-muted); }']
})
export class AdminDashboardComponent implements OnInit {
  doctors: any[] = [];

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.authService.getRole() !== 'admin') this.router.navigate(['/']);
    this.fetchDoctors();
  }

  fetchDoctors() {
    // In a real app we would have an admin route returning ALL doctors regardless of status
    // Here we'll modify the backend or just assume we have access.
    // For this demonstration, we'll assume the /api/doctors endpoint was tweaked to return all or we created an admin one.
    this.doctorService.getDoctors().subscribe({
      next: (res) => this.doctors = res,
      error: (err) => console.error(err)
    });
  }

  approve(id: string) {
    this.doctorService.approveDoctor(id).subscribe({
      next: (res) => {
        this.toastService.success('Doctor approved!');
        this.fetchDoctors();
      },
      error: (err) => this.toastService.error('Approval failed')
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
