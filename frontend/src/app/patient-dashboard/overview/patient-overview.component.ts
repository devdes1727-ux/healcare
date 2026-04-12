import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600">📅</div>
        <div class="stat-details">
          <h3>Upcoming Appointments</h3>
          <p class="stat-value">2</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-100 text-green-600">✅</div>
        <div class="stat-details">
          <h3>Completed Visits</h3>
          <p class="stat-value">5</p>
        </div>
      </div>
      <div class="stat-card cursor-pointer" routerLink="../doctors">
        <div class="stat-icon bg-purple-100 text-purple-600">🔍</div>
        <div class="stat-details">
          <h3 class="text-primary m-0 mt-1">Find a new Doctor</h3>
          <p class="text-sm text-muted m-0">Search directory &rarr;</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="m-0">Next Appointment</h3>
          <a routerLink="../appointments" class="text-sm">View all</a>
        </div>
        <div class="border rounded p-4">
          <div class="flex justify-between">
            <div class="flex gap-4">
              <div class="date-box bg-secondary rounded text-center p-2 min-w-16">
                <span class="block text-sm font-bold text-primary">OCT</span>
                <span class="block text-2xl font-bold">12</span>
              </div>
              <div>
                <h4 class="m-0 mt-1">Dr. Sarah Johnson</h4>
                <p class="text-sm text-muted m-0 mt-1">Cardiologist &bull; Online Consult</p>
                <p class="text-sm font-bold mt-2 m-0">10:00 AM - 10:30 AM</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t flex gap-2">
            <button class="btn btn-primary btn-sm w-full">Join Meeting</button>
            <button class="btn btn-outline btn-sm w-full">Reschedule</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s;
    }
    .stat-card.cursor-pointer:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .bg-blue-100 { background: #dbeafe; } .text-blue-600 { color: #2563eb; }
    .bg-green-100 { background: #dcfce3; } .text-green-600 { color: #16a34a; }
    .bg-purple-100 { background: #f3e8ff; } .text-purple-600 { color: #9333ea; }

    .stat-details h3 {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0 0 0.25rem 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }
    
    .grid { display: grid; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-4 { margin-bottom: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .p-2 { padding: 0.5rem; }
    .m-0 { margin: 0; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .pt-4 { padding-top: 1rem; }
    .border { border: 1px solid var(--border-light); }
    .border-t { border-top: 1px solid var(--border-light); }
    .rounded { border-radius: var(--radius-md); }
    .bg-secondary { background-color: var(--bg-secondary); }
    .text-sm { font-size: 0.875rem; }
    .text-muted { color: var(--text-muted); }
    .text-primary { color: var(--primary-color); }
    .font-bold { font-weight: 700; }
    .block { display: block; }
    .text-center { text-align: center; }
    .text-2xl { font-size: 1.5rem; }
    .min-w-16 { min-width: 4rem; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
    .w-full { width: 100%; }
    
    @media (min-width: 768px) { .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (min-width: 1024px) { .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `]
})
export class PatientOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
