import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  title: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="dashboard">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    
    <div class="brand">
      <div class="logo">🏥</div>
      <div>
        <h3>Patient Portal</h3>
        <small>Health Dashboard</small>
      </div>
    </div>

    <nav class="menu">
      <a
        *ngFor="let item of menuItems"
        [routerLink]="item.route"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: item.route === './' }"
        class="menu-item"
      >
        <span class="icon">{{ item.icon }}</span>
        {{ item.label }}
      </a>
    </nav>

  </aside>

  <!-- MAIN -->
  <main class="main">

    <section class="content">
      <router-outlet></router-outlet>
    </section>

  </main>

</div>
`,

  styles: [`
.dashboard{
  display:flex;
  height:100vh;
  background:#f6f7fb;
}

/* SIDEBAR */
.sidebar{
  width:220px;
  background:#fff;
  border-right:1px solid #eee;
  display:flex;
  flex-direction:column;
}

.brand{
  display:flex;
  gap:10px;
  align-items:center;
  padding:20px;
  border-bottom:1px solid #eee;
}

.logo{
  width:42px;
  height:42px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#4f46e5;
  color:#fff;
  border-radius:10px;
  font-size:18px;
}

.brand h3{
  margin:0;
  font-size:16px;
}

.brand small{
  color:#6b7280;
}

/* MENU */
.menu{
  display:flex;
  flex-direction:column;
  padding:10px;
  gap:6px;
}

.menu-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 14px;
  border-radius:10px;
  text-decoration:none;
  color:#6b7280;
  font-weight:500;
  transition:0.2s;
}

.menu-item:hover{
  background:#f3f4f6;
  color:#111;
}

.menu-item.active{
  background:#4f46e5;
  color:#fff;
}

/* MAIN */
.main{
  flex:1;
  display:flex;
  flex-direction:column;
}

/* TOPBAR */
.topbar{
  background:#fff;
  padding:18px 24px;
  border-bottom:1px solid #eee;
}

.topbar h2{
  margin:0;
  font-size:20px;
}

.topbar p{
  margin:4px 0 0;
  color:#6b7280;
  font-size:13px;
}

/* CONTENT */
.content{
  overflow:auto;
}

/* MOBILE */
@media(max-width:768px){
  .sidebar{
    display:none;
  }
}
  `]
})
export class PatientDashboardComponent {

  pageTitle = 'Patient Overview';

  menuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: '📊',
      route: './',
      title: 'Patient Overview'
    },
    {
      label: 'Find Doctors',
      icon: '🩺',
      route: 'doctors',
      title: 'Find & Book Doctors'
    },
    {
      label: 'Appointments',
      icon: '📅',
      route: 'appointments',
      title: 'My Appointments'
    },
    {
      label: 'Settings',
      icon: '⚙️',
      route: 'settings',
      title: 'Settings'
    }
  ];

  constructor(private router: Router) {
    // CLEAN dynamic title (NO hardcoding with URL checks)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitle();
      });

    this.updateTitle();
  }

  private updateTitle() {
    const currentUrl = this.router.url;

    const match = this.menuItems.find(item =>
      currentUrl.includes(item.route.replace('./', ''))
    );

    this.pageTitle = match?.title || 'Patient Dashboard';
  }
}