import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Patient Portal</h3>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="./" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="icon-dashboard"></i> Overview
          </a>
          <a routerLink="doctors" routerLinkActive="active" class="nav-item">
            <i class="icon-search"></i> Find Doctors
          </a>
          <a routerLink="appointments" routerLinkActive="active" class="nav-item">
            <i class="icon-calendar"></i> My Appointments
          </a>
          <a routerLink="/profile-settings" routerLinkActive="active" class="nav-item">
            <i class="icon-settings"></i> Settings
          </a>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="dashboard-content">
        <div class="dashboard-header">
          <h2>{{ getPageTitle() }}</h2>
        </div>
        <div class="content-scroll">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      height: calc(100vh - 72px); /* Assuming navbar is 72px */
      background-color: var(--bg-secondary);
    }

    .sidebar {
      width: 260px;
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-light);
    }
    
    .sidebar-header h3 {
      margin: 0;
      color: var(--primary-color);
    }

    .sidebar-nav {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      padding: 0.75rem 1.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: rgba(37, 99, 235, 0.05);
      color: var(--primary-color);
    }

    .nav-item.active {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--primary-color);
      border-left-color: var(--primary-color);
    }

    .dashboard-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dashboard-header {
      padding: 1.5rem 2rem;
      background-color: var(--bg-main);
      border-bottom: 1px solid var(--border-light);
    }

    .dashboard-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--text-main);
    }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `]
})
export class PatientDashboardComponent {
  constructor(private router: Router) {}

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('doctors')) return 'Find & Book Doctors';
    if (url.includes('appointments')) return 'My Appointments';
    return 'Patient Overview';
  }
}
