import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="patient-dash">
      <header class="dash-hero">
        <div class="welcome-text">
           <h1>Hello, {{ currentUser?.name }}! 👋</h1>
           <p>Stay on top of your health journey. You have <b>{{ upcomingCount }}</b> appointments this week.</p>
        </div>
        <div class="action-btns">
           <button class="btn-primary" routerLink="doctors">Find New Doctor</button>
        </div>
      </header>

      <div class="main-grid">
         <!-- LEFT: STATS & NEXT APPT -->
         <div class="left-col">
            <div class="stats-cards">
               <div class="s-card green">
                  <strong>{{ totalVisits }}</strong>
                  <p>Consultations</p>
               </div>
               <div class="s-card blue">
                  <strong>{{ upcomingCount }}</strong>
                  <p>Schedules</p>
               </div>
               <div class="s-card purple">
                  <strong>2</strong>
                  <p>Reports</p>
               </div>
            </div>

            <div class="next-apt-card" *ngIf="nextApt">
               <label>Next Appointment</label>
               <div class="apt-content">
                  <div class="doc-avatar">{{ nextApt.doctorName[0] }}</div>
                  <div class="details">
                     <h4>Dr. {{ nextApt.doctorName }}</h4>
                     <p>{{ nextApt.specialization }} • {{ nextApt.consultation_type | titlecase }}</p>
                     <div class="time-box">
                        📅 {{ nextApt.appointment_date | date }} • ⏰ {{ nextApt.start_time }}
                     </div>
                  </div>
                  <button class="btn-check" routerLink="appointments">Details</button>
               </div>
            </div>

            <div class="empty-next" *ngIf="!nextApt">
               <h4>No upcoming appointments</h4>
               <p>Your schedule is clear. Need a checkup?</p>
               <button routerLink="doctors">Book Now</button>
            </div>
         </div>

         <!-- RIGHT: QUICK TIPS / HISTORY -->
         <div class="right-col">
            <div class="health-tips">
               <h3>Health Tips for You</h3>
               <div class="tip-item">
                  <span>🍎</span>
                  <p>An apple a day keeps the doctor away. Keep eating healthy!</p>
               </div>
               <div class="tip-item">
                  <span>💧</span>
                  <p>Don't forget to drink 3L of water today for better metabolism.</p>
               </div>
            </div>

            <div class="quick-links">
               <h3>My Services</h3>
               <a routerLink="appointments" class="link-item">
                  <span>📅</span> My Schedule
               </a>
               <a class="link-item">
                  <span>📄</span> Medical Records
               </a>
               <a class="link-item">
                  <span>💳</span> Billing History
               </a>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-dash { padding: 40px; background: #fbfcfe; min-height: 100vh; font-family: 'Outfit', sans-serif; }
    .dash-hero { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .welcome-text h1 { margin: 0; font-size: 34px; font-weight: 800; color: #1e293b; }
    .welcome-text p { margin: 8px 0 0; color: #64748b; font-size: 17px; }
    .btn-primary { background: #2563eb; color: white; border: none; padding: 14px 25px; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 15px; }

    .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
    .stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .s-card { padding: 25px; border-radius: 24px; text-align: center; color: white; }
    .s-card strong { font-size: 32px; font-weight: 800; display: block; }
    .s-card p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
    .green { background: #10b981; }
    .blue { background: #3b82f6; }
    .purple { background: #8b5cf6; }

    .next-apt-card { background: white; padding: 30px; border-radius: 30px; border: 1px solid #f1f5f9; box-shadow: 0 15px 40px rgba(0,0,0,0.03); }
    .next-apt-card label { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: block; }
    .apt-content { display: flex; align-items: center; gap: 25px; }
    .doc-avatar { width: 70px; height: 70px; background: #eef2ff; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #2563eb; }
    .details h4 { margin: 0; font-size: 20px; }
    .details p { margin: 5px 0; color: #64748b; font-size: 15px; }
    .time-box { background: #f8fafc; padding: 6px 15px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #1e293b; display: inline-block; margin-top: 10px; }
    .btn-check { margin-left: auto; background: #f1f5f9; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; color: #1e293b; }

    .empty-next { background: white; padding: 40px; border-radius: 30px; text-align: center; border: 2px dashed #e2e8f0; }
    .empty-next h4 { margin: 0; font-size: 20px; }
    .empty-next p { color: #64748b; margin: 10px 0 20px; }
    .empty-next button { background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; }

    .health-tips, .quick-links { background: white; padding: 30px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; margin-bottom: 30px; }
    .health-tips h3, .quick-links h3 { font-size: 19px; margin-top: 0; margin-bottom: 20px; }
    .tip-item { display: flex; gap: 15px; margin-bottom: 15px; }
    .tip-item span { font-size: 24px; }
    .tip-item p { margin: 0; font-size: 14px; color: #475569; line-height: 1.5; }

    .link-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 15px; background: #f8fafc; margin-bottom: 10px; text-decoration: none; color: #1e293b; font-weight: 700; font-size: 14px; transition: .2s; }
    .link-item:hover { background: #f1f5f9; transform: translateX(5px); }

    @media (max-width: 1000px) { .main-grid { grid-template-columns: 1fr; } }
  `]
})
export class PatientOverviewComponent implements OnInit {
  currentUser: any;
  nextApt: any = null;
  totalVisits = 0;
  upcomingCount = 0;

  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.loadData();
  }

  loadData() {
    this.appointmentService.getPatientAppointments().subscribe((res: any[]) => {
      this.totalVisits = res.filter(a => a.status === 'completed').length;
      const upcoming = res.filter(a => a.status === 'confirmed' || a.status === 'pending')
                         .sort((a,b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
      
      this.upcomingCount = upcoming.length;
      this.nextApt = upcoming[0] || null;
      this.cdr.detectChanges();
    });
  }
}