import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-doctor-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="page">

    <!-- TOP STATS -->
    <div class="stats">
      <div class="card">
        <div class="icon">📅</div>
        <div>
          <h4>Upcoming</h4>
          <p>{{ upcomingAppointments.length }}</p>
        </div>
      </div>

      <div class="card">
        <div class="icon">⏳</div>
        <div>
          <h4>Pending</h4>
          <p>{{ pendingCount }}</p>
        </div>
      </div>

      <div class="card">
        <div class="icon">👥</div>
        <div>
          <h4>Patients</h4>
          <p>{{ totalPatients }}</p>
        </div>
      </div>

      <div class="card">
        <div class="icon">💰</div>
        <div>
          <h4>Revenue</h4>
          <p>₹{{ revenue }}</p>
        </div>
      </div>
    </div>

    <!-- UPCOMING -->
    <div class="panel">

      <div class="panel-header">
        <h3>Upcoming Schedule</h3>

        <!-- IMPORTANT FIX -->
        <a routerLink="requests" class="view-all-link">View All &rarr;</a>
      </div>

      <div *ngIf="loading" class="loading">
        Loading appointments...
      </div>

      <div *ngIf="!loading && upcomingAppointments.length === 0" class="empty">
        <div>🫥</div>
        <p>No upcoming appointments</p>
      </div>

      <div class="list">

        <div class="item" *ngFor="let a of upcomingAppointments">

          <!-- AVATAR -->
          <div class="avatar"
               [style.backgroundImage]="a.patientImage ? 'url(' + a.patientImage + ')' : ''">
            {{ !a.patientImage ? (a.patientName?.charAt(0) || 'P') : '' }}
          </div>

          <!-- INFO -->
          <div class="info">
            <h4>{{ a.patientName }}</h4>
            <p>{{ a.patientEmail }}</p>

           <div class="meta">
              📅 {{ a.appointment_date | date:'dd MMM yyyy' }}
              • ⏰ {{ a.start_time }} - {{ a.end_time }}
              • {{ a.consultation_type | titlecase }}
            </div>
          </div>

          <!-- STATUS -->
          <span class="status" [class.ok]="a.status === 'confirmed'">
            {{ a.status }}
          </span>

        </div>

      </div>

    </div>
  </div>
  `,
  styles: [`
    .page { padding: 20px; background:#f5f7ff; min-height:100vh; }

    .stats {
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:12px;
      margin-bottom:20px;
    }

    .card {
      background:white;
      padding:14px;
      border-radius:14px;
      display:flex;
      gap:10px;
      align-items:center;
      box-shadow:0 4px 15px rgba(0,0,0,0.05);
    }

    .icon {
      width:42px;
      height:42px;
      background:#eef2ff;
      border-radius:10px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
    }

    .panel {
      background:white;
      border-radius:16px;
      padding:18px;
    }

    .panel-header {
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:12px;
    }

    .link {
      text-decoration:none;
      color:#2563eb;
      font-weight:700;
    }

    .list { display:flex; flex-direction:column; gap:10px; }

    .item {
      display:flex;
      align-items:center;
      gap:12px;
      padding:12px;
      border-radius:12px;
      background:#f8fafc;
    }

    .avatar {
      width:44px;
      height:44px;
      border-radius:12px;
      background:#4f46e5;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      background-size:cover;
      background-position:center;
    }

    .info { flex:1; }

    .info h4 { margin:0; font-size:14px; }
    .info p { margin:2px 0; font-size:12px; color:#64748b; }

    .meta { font-size:11px; color:#94a3b8; }

    .status {
      font-size:11px;
      padding:4px 8px;
      border-radius:8px;
      background:#fee2e2;
      color:#dc2626;
      font-weight:700;
    }

    .status.ok {
      background:#dcfce7;
      color:#16a34a;
    }

    .empty {
      text-align:center;
      padding:30px;
      color:#94a3b8;
    }

    .loading { padding:20px; text-align:center; }

    @media(max-width:1000px){
      .stats { grid-template-columns:repeat(2,1fr); }
    }

    @media(max-width:600px){
      .stats { grid-template-columns:1fr; }
    }
  `]
})
export class DoctorOverviewComponent implements OnInit {

  upcomingAppointments: any[] = [];
  loading = true;

  pendingCount = 0;
  totalPatients = 0;
  revenue = 0;

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.appointmentService.getDoctorAppointments().subscribe({
      next: (res: any[]) => {

        const now = new Date();

        // FIXED UPCOMING LOGIC (IMPORTANT)
        this.upcomingAppointments = res
          .filter(a => {
            const apptDate = new Date(a.appointment_date);
            return apptDate >= new Date(now.toDateString());
          })
          .sort((a, b) =>
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime()
          );

        this.pendingCount = res.filter(r => r.status === 'pending').length;

        this.totalPatients = new Set(res.map(r => r.patientEmail)).size;

        this.revenue = res
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + (r.amount || 0), 0);

        this.loading = false;
        this.cdr.markForCheck(); // IMPORTANT for OnPush
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}