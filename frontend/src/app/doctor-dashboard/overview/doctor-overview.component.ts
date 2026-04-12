import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="stat-card">
        <div class="stat-icon icon-blue">👥</div>
        <div class="stat-details">
          <h3>Total Patients</h3>
          <p class="stat-value">124</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-green">📅</div>
        <div class="stat-details">
          <h3>Today's Appts</h3>
          <p class="stat-value">12</p>
        </div>
      </div>
      <div class="stat-card cursor-pointer" routerLink="requests">
        <div class="stat-icon icon-yellow">⌛</div>
        <div class="stat-details">
          <h3>Pending Requests</h3>
          <p class="stat-value text-yellow">5</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-purple">💰</div>
        <div class="stat-details">
          <h3>Total Revenue</h3>
          <p class="stat-value">$4,250</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="card p-8 border-0 shadow-md">
          <div class="flex justify-between items-center mb-8">
            <h3 class="m-0 text-xl font-bold">Today's Schedule</h3>
            <a routerLink="requests" class="view-all-link">View All &rarr;</a>
          </div>
          
          <div class="empty-state py-12 text-center bg-secondary-alpha rounded-2xl border-dashed border-2">
            <div class="text-4xl mb-4">💤</div>
            <p class="text-muted font-medium m-0">No appointments scheduled for today yet.</p>
            <p class="text-xs text-muted mt-2">New requests will appear in your "Patient Requests" panel.</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="card p-8 border-0 shadow-md text-center bg-primary text-white">
          <div class="mb-6">
            <div class="w-20 h-20 bg-white-alpha rounded-full mx-auto flex items-center justify-center text-3xl">👨‍⚕️</div>
          </div>
          <h3 class="m-0 mb-2">Complete Your Profile</h3>
          <p class="text-white-alpha text-sm mb-8">Verified doctors get 5x more appointment requests and better visibility.</p>
          <button class="btn btn-white w-full py-4 font-bold" routerLink="profile">Go to Profile Setup</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--primary-color); }
    
    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .icon-blue { background: #dbeafe; color: #1e40af; }
    .icon-green { background: #dcfce3; color: #16a34a; }
    .icon-yellow { background: #fef3c7; color: #92400e; }
    .icon-purple { background: #f3e8ff; color: #9333ea; }
    .text-yellow { color: #d97706; }

    .stat-details h3 { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin: 0 0 0.5rem 0; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin: 0; }
    
    .view-all-link { color: var(--primary-color); text-decoration: none; font-weight: 700; font-size: 0.85rem; }
    .view-all-link:hover { text-decoration: underline; }

    .bg-white-alpha { background: rgba(255, 255, 255, 0.2); }
    .text-white-alpha { color: rgba(255, 255, 255, 0.8); }
    .btn-white { background: white; color: var(--primary-color); border: none; border-radius: 12px; cursor: pointer; }
    .btn-white:hover { background: #f8fafc; }
  `]
})
export class DoctorOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
