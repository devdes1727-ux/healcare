import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="admin-container">
  <header class="admin-top">
    <div class="title">
       <h2>Command Center</h2>
       <p>{{ today | date:'fullDate' }}</p>
    </div>
    <div class="admin-actions">
       <button class="btn-export" (click)="export('patients')">Export Patients</button>
       <button class="btn-export" (click)="export('appointments')">Export Reports</button>
       <button class="btn-logout" (click)="logout()">Logout</button>
    </div>
  </header>

  <!-- REVENUE & CORE STATS -->
  <div class="stats-grid" *ngIf="stats">
    <div class="stat-main-card">
       <label>Total Revenue</label>
       <h2>₹{{ (stats.earnings.totalBookingCommissions + stats.earnings.subscriptionRevenue + stats.earnings.featuredRevenue) | number:'1.0-0' }}</h2>
       <div class="revenue-split">
          <div class="split-item">
             <span>Bookings</span>
             <strong>₹{{ stats.earnings.totalBookingCommissions | number:'1.0-0' }}</strong>
          </div>
          <div class="split-item">
             <span>Subs</span>
             <strong>₹{{ stats.earnings.subscriptionRevenue | number:'1.0-0' }}</strong>
          </div>
          <div class="split-item">
             <span>Ads</span>
             <strong>₹{{ stats.earnings.featuredRevenue | number:'1.0-0' }}</strong>
          </div>
       </div>
    </div>

    <div class="stat-mini-grid">
       <div class="mini-card blue">
          <div class="icon">👨‍⚕️</div>
          <div><h3>{{ stats.doctors.total }}</h3><p>Doctors</p></div>
       </div>
       <div class="mini-card green">
          <div class="icon">👥</div>
          <div><h3>{{ stats.patients.total }}</h3><p>Patients</p></div>
       </div>
       <div class="mini-card purple">
          <div class="icon">📅</div>
          <div><h3>{{ stats.appointments.total }}</h3><p>Bookings</p></div>
       </div>
       <div class="mini-card orange">
          <div class="icon">⚠️</div>
          <div><h3>{{ stats.appointments.cancelled }}</h3><p>Cancelled</p></div>
       </div>
    </div>
  </div>

  <!-- MANAGEMENT TABS -->
  <div class="management-section">
     <div class="tabs">
        <button [class.active]="activeTab === 'doctors'" (click)="activeTab = 'doctors'">Doctors Management</button>
        <button [class.active]="activeTab === 'patients'" (click)="activeTab = 'patients'">Patient Directory</button>
        <button [class.active]="activeTab === 'bookings'" (click)="activeTab = 'bookings'">Global Bookings</button>
     </div>

     <div class="tab-content">
        <!-- DOCTORS -->
        <div *ngIf="activeTab === 'doctors'" class="table-view">
           <div class="table-header">
              <input placeholder="Search doctors..." [(ngModel)]="search" />
              <div class="counter">{{ doctors.length }} Total Doctors</div>
           </div>
           <table>
              <thead>
                <tr>
                  <th>Doctor Details</th>
                  <th>Verification</th>
                  <th>Subscription</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of doctors">
                   <td>
                      <div class="prof">
                         <strong>{{ d.name }}</strong>
                         <small>{{ d.email }} • {{ d.specialization || 'General' }}</small>
                      </div>
                   </td>
                   <td><span class="v-badge" [class]="d.verification_status">{{ d.verification_status }}</span></td>
                   <td><span class="s-badge" [class]="d.subscription_status">{{ d.subscription_status }}</span></td>
                   <td>₹{{ d.consultation_fee }}</td>
                   <td>
                      <button class="btn-action" *ngIf="d.verification_status === 'pending'" (click)="approveDoctor(d)">Verify</button>
                      <button class="btn-action red" *ngIf="d.verification_status === 'approved'">Suspend</button>
                   </td>
                </tr>
              </tbody>
           </table>
        </div>

        <!-- PLACEHOLDERS FOR OTHERS -->
        <div *ngIf="activeTab === 'patients' || activeTab === 'bookings'" class="empty">
           <div class="empty-icon">📂</div>
           <p>Detailed {{ activeTab }} management reporting live-updating... Use Exports for full raw data.</p>
        </div>
     </div>
  </div>
</div>
`,
  styles: [`
    .admin-container { padding: 40px; background: #f1f5f9; min-height: 100vh; font-family: 'Outfit', sans-serif; }
    .admin-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .title h2 { margin: 0; font-size: 32px; font-weight: 800; color: #1e293b; }
    .title p { margin: 5px 0 0; color: #64748b; font-weight: 600; }
    .admin-actions { display: flex; gap: 12px; }

    .stats-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-bottom: 40px; }
    .stat-main-card { background: #1e293b; color: white; padding: 40px; border-radius: 30px; }
    .stat-main-card label { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .stat-main-card h2 { font-size: 48px; margin: 15px 0 30px; font-weight: 800; }
    .revenue-split { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; border-top: 1px solid #334155; padding-top: 25px; }
    .split-item span { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 5px; }
    .split-item strong { font-size: 18px; }

    .stat-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .mini-card { background: white; padding: 25px; border-radius: 24px; display: flex; gap: 20px; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
    .mini-card h3 { margin: 0; font-size: 24px; font-weight: 800; color: #1e293b; }
    .mini-card p { margin: 0; font-size: 13px; color: #64748b; font-weight: 600; }
    .mini-card .icon { font-size: 20px; width: 45px; height: 45px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

    .management-section { background: white; padding: 30px; border-radius: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
    .tabs { display: flex; gap: 10px; margin-bottom: 30px; background: #f8fafc; padding: 6px; border-radius: 15px; width: fit-content; }
    .tabs button { background: none; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 700; font-size: 14px; }
    .tabs button.active { background: white; color: #1e293b; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

    .table-view .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .table-view input { padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; width: 300px; outline: none; }
    .counter { font-size: 14px; font-weight: 700; color: #64748b; }

    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px; font-size: 12px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
    td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .prof strong { display: block; font-size: 15px; color: #1e293b; }
    .prof small { color: #94a3b8; }

    .v-badge { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .v-badge.pending { background: #fff7ed; color: #ea580c; }
    .v-badge.approved { background: #f0fdf4; color: #16a34a; }

    .s-badge { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: #f1f5f9; color: #475569; }
    .s-badge.featured { background: #faf5ff; color: #9333ea; border: 1px solid #e9d5ff; }

    .btn-action { background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; margin-right: 8px; }
    .btn-action.red { background: #fee2e2; color: #dc2626; }
    .btn-export { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-left: 10px; color: #1e293b; }
    .btn-logout { background: #fee2e2; color: #dc2626; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-left: 10px; }

    .empty { text-align: center; padding: 100px; }
    .empty-icon { font-size: 48px; margin-bottom: 20px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  today = new Date();
  stats: any = null;
  doctors: any[] = [];
  activeTab = 'doctors';
  search = '';

  constructor(
    private http: HttpClient,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.fetchStats();
    this.fetchDoctors();
  }

  fetchStats() {
    this.http.get('http://localhost:5000/api/admin/stats').subscribe(res => {
      this.stats = res;
      this.cdr.detectChanges();
    });
  }

  fetchDoctors() {
    this.http.get('http://localhost:5000/api/admin/doctors').subscribe((res: any) => {
      this.doctors = res;
      this.cdr.detectChanges();
    });
  }

  approveDoctor(doc: any) {
    this.doctorService.approveDoctor(doc.id).subscribe(() => {
      this.toast.success('Doctor verified successfully');
      this.refresh();
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  export(type: string) {
    window.open(`http://localhost:5000/api/admin/export/${type}?token=${this.authService.getToken()}`, '_blank');
  }
}