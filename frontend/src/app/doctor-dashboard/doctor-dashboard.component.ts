import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Doctor Panel</h3>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="./" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <i class="icon-dashboard"></i> Overview
          </a>
          <a routerLink="profile" routerLinkActive="active" class="nav-item">
            <i class="icon-user"></i> Profile Setup
          </a>
          <a routerLink="requests" routerLinkActive="active" class="nav-item">
            <i class="icon-users"></i> Patient Requests
          </a>
          <a routerLink="schedule" routerLinkActive="active" class="nav-item">
            <i class="icon-calendar"></i> Schedule Manager
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
      .sidebar {
        display: none; /* In a real app, add a hamburger menu toggle */
      }
    }
  `]
})
export class DoctorDashboardComponent {
  constructor(private router: Router) { }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('profile')) return 'Profile Management';
    if (url.includes('requests')) return 'Patient Requests';
    if (url.includes('schedule')) return 'Schedule Manager';
    if (url.includes('doctors')) return 'Find Doctors';
    return 'Dashboard Overview';
  }
}
