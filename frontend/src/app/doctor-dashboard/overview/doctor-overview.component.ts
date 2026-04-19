import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-doctor-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="page-wrapper">
    <!-- DASHBOARD HEADER -->
    <header class="dash-header">
       <div class="welcome">
          <h2>Doctor Command Center</h2>
          <p>You have {{ todayCount }} consultations today.</p>
       </div>
       <div class="badge-status" [class]="subscriptionStatus">
          {{ subscriptionStatus | uppercase }} PLAN
       </div>
    </header>

    <!-- METRICS GRID -->
    <div class="metrics">
      <div class="metric-card">
        <label>Today</label>
        <h3>{{ todayCount }}</h3>
        <p>Appointments</p>
      </div>
      <div class="metric-card">
        <label>Patients</label>
        <h3>{{ totalPatients }}</h3>
        <p>Total Life-time</p>
      </div>
      <div class="metric-card">
        <label>Upcoming</label>
        <h3>{{ upcomingAppointments.length }}</h3>
        <p>Future Bookings</p>
      </div>
      <div class="metric-card">
        <label>Completed</label>
        <h3>{{ completedCount }}</h3>
        <p>Successful Visits</p>
      </div>
      <div class="metric-card highlighted">
        <label>Total Earnings</label>
        <h3>₹{{ revenue | number:'1.0-2' }}</h3>
        <p>After Commission</p>
      </div>
    </div>

    <div class="content-grid">
      <!-- UPCOMING LIST -->
      <section class="section appointments">
        <div class="section-header">
           <h3>Awaiting Consultation</h3>
           <div class="btns">
              <button class="btn-sm secondary" (click)="exportPatients()">Export CSV</button>
              <button class="btn-sm primary" (click)="showWalkinModal = true">Add Walk-in</button>
           </div>
        </div>

        <div class="apt-table-wrapper">
           <div *ngIf="loading" class="loading-state">Syncing data...</div>
           <div *ngIf="!loading && upcomingAppointments.length === 0" class="empty-state">No appointments for today.</div>
           
           <table *ngIf="!loading && upcomingAppointments.length > 0">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Schedule</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of upcomingAppointments">
                  <td>
                    <div class="pat-info">
                       <strong>{{ a.patientName }}</strong>
                       <small>{{ a.phone_number }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="sched-info">
                       <span>{{ a.appointment_date | date:'dd MMM' }}</span>
                       <small>{{ a.start_time }}</small>
                    </div>
                  </td>
                  <td><span class="type-tag" [class]="a.consultation_type">{{ a.consultation_type }}</span></td>
                  <td><span class="badge" [class]="a.status">{{ a.status }}</span></td>
                  <td>
                     <button class="btn-icon" (click)="markComplete(a)" *ngIf="a.status !== 'completed'">✅</button>
                  </td>
                </tr>
              </tbody>
           </table>
        </div>
      </section>

       <!-- QUICK ACTIONS / INFO -->
      <aside class="sidebar">
         <div class="sidebar-card promo" *ngIf="subscriptionStatus === 'trial'">
            <h4>Free Trial ending soon!</h4>
            <p>Upgrade to Monthly Plan at ₹499 to keep receiving bookings.</p>
            <button class="btn-sm" (click)="upgradePlan()">Upgrade Now</button>
         </div>

         <div class="sidebar-card">
            <h4>Featured Profile</h4>
            <p>Get 10x more visibility by promoting your profile.</p>
            <button class="btn-sm outline" (click)="boostProfile()">Boost Profile</button>
         </div>
      </aside>
    </div>

    <!-- WALK-IN MODAL -->
   <div class="modal-backdrop" *ngIf="showWalkinModal" (click)="showWalkinModal = false">
  <div class="modal" (click)="$event.stopPropagation()">
    
    <header>
      <h3>New Walk-in Booking</h3>
      <button class="close" (click)="showWalkinModal = false">✕</button>
    </header>

    <div class="form-body">

      <!-- Patient Name -->
      <div class="input-grid">
        <div class="input-i">
          <label>Patient Name *</label>
          <input placeholder="Full Name" [(ngModel)]="walkinData.patientName" />
        </div>

        <!-- Mobile -->
        <div class="input-i">
          <label>Mobile Number</label>
          <input placeholder="Ex: 9876543210" [(ngModel)]="walkinData.phone" />
        </div>
      </div>

      <!-- DOB / Age -->
      <div class="input-grid">
        <div class="input-i">
          <label>Date of Birth</label>
          <input type="date" [(ngModel)]="walkinData.dob"/>
        </div>

        <div class="input-i">
          <label>Age *</label>
          <input type="number" [(ngModel)]="walkinData.age"/>
        </div>
      </div>

      <!-- Gender / Blood -->
      <div class="input-grid">
        <div class="input-i">
          <label>Gender *</label>
          <select [(ngModel)]="walkinData.gender">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="input-i">
          <label>Blood Group</label>
          <select [(ngModel)]="walkinData.bloodGroup">
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      <!-- Date / Slot -->
      <div class="input-grid">
        <div class="input-i">
          <label>Consultation Date *</label>
          <input type="date" [(ngModel)]="walkinData.date" />
        </div>

        <div class="input-i">
          <label>Preferred Slot *</label>
          <select [(ngModel)]="walkinData.timeSlot">
            <option value="">Choose Slot</option>
            <option *ngFor="let s of ['09:00-09:15','09:15-09:30','10:00-10:15','11:30-11:45']" [value]="s">
              {{s}}
            </option>
          </select>
        </div>
      </div>

      <button class="btn-primary" (click)="bookWalkin()" [disabled]="isBooking">
        {{ isBooking ? 'Booking...' : 'Confirm Booking' }}
      </button>

    </div>
  </div>
</div>
  </div>
  `,
  styles: [`
    .page-wrapper { padding: 30px; background: var(--bg-main); min-height: 100vh; font-family: 'Outfit', sans-serif; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .welcome h2 { margin: 0; font-size: 32px; font-weight: 800; color: var(--text-main); }
    .welcome p { margin: 5px 0 0; color: var(--text-muted); font-size: 16px; }
    .badge-status { padding: 8px 15px; border-radius: 12px; font-weight: 800; font-size: 12px; }
    .badge-status.trial { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .badge-status.active { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

    .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 40px; }
    .metric-card { background: var(--bg-card); padding: 25px; border-radius: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
    .metric-card label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-card h3 { margin: 10px 0 2px; font-size: 32px; font-weight: 800; color: var(--text-main); }
    .metric-card p { margin: 0; font-size: 13px; color: var(--text-muted); }
    .metric-card.highlighted { background: var(--primary-color); color: white; border: none; }
    .metric-card.highlighted h3 { color: white; }
    .metric-card.highlighted label, .metric-card.highlighted p { color: rgba(255,255,255,0.7); }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
    .section { background: var(--bg-card); padding: 30px; border-radius: 30px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-light); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .section-header h3 { margin: 0; font-size: 22px; font-weight: 800; color: var(--text-main); }
    .btns { display: flex; gap: 10px; }

    .apt-table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-light); text-transform: uppercase; }
    td { padding: 18px 15px; border-bottom: 1px solid var(--border-light); color: var(--text-main); }
    
    .pat-info strong { display: block; font-size: 15px; color: var(--text-main); }
    .pat-info small { color: var(--text-muted); font-size: 12px; }
    .sched-info span { display: block; font-weight: 700; color: var(--text-main); }
    .sched-info small { color: var(--primary-color); font-weight: 700; font-size: 11px; }

    .type-tag { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .type-tag.online { background: #eff6ff; color: #2563eb; }
    .type-tag.offline { background: #f8fafc; color: #64748b; }

    .badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .badge.confirmed { background: #f0fdf4; color: #16a34a; }
    .badge.no_show { background: #fef2f2; color: #dc2626; }

    .btn-sm { padding: 10px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 13px; }
    .btn-sm.primary { background: #2563eb; color: white; }
    .btn-sm.secondary { background: #f1f5f9; color: #1e293b; }
    .btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; }

    .sidebar { display: flex; flex-direction: column; gap: 20px; }
    .sidebar-card { background: var(--bg-card); padding: 25px; border-radius: 24px; border: 1px solid var(--border-light); color: var(--text-main); }
    .sidebar-card.promo { background: var(--primary-color); color: white; border: none; }
    .sidebar-card h4 { margin: 0 0 10px; font-size: 18px; font-weight: 800; }
    .sidebar-card p { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }

    /* MODAL */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal { background: var(--bg-card); width: 450px; border-radius: 30px; overflow: hidden; animation: slideUp 0.3s ease; color: var(--text-main); border: 1px solid var(--border-light); }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal header { padding: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); }
    .modal header h3 { margin: 0; font-size: 20px; font-weight: 800; }
    .close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); }
    .form-body { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
    .input-i label { display: block; font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
    .input-i input, .input-i select { width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 12px; outline: none; background: var(--bg-main); color: var(--text-main); transition: border-color 0.2s; }
    .input-i input:focus, .input-i select:focus { border-color: var(--primary-color); }
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .btn-primary { background: #2563eb; color: white; width: 100%; padding: 15px; border-radius: 15px; border: none; font-weight: 800; cursor: pointer; transition: transform 0.2s; }
    .btn-primary:active { transform: scale(0.98); }

    @media(max-width: 1200px) { .metrics { grid-template-columns: repeat(3, 1fr); } .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DoctorOverviewComponent implements OnInit {
  upcomingAppointments: any[] = [];
  loading = true;
  todayCount = 0;
  totalPatients = 0;
  completedCount = 0;
  revenue = 0;
  subscriptionStatus = 'trial';
  isBooking = false;

  showWalkinModal = false;
  walkinData = {
    patientName: '',
    phone: '',
    date: '',
    timeSlot: '',
    dob: '',
    age: null as number | null,
    gender: 'Male',
    bloodGroup: 'A+'
  };

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;

    this.appointmentService.getDoctorAppointments().subscribe({
      next: (res: any[]) => {
        const todayStr = new Date().toDateString();
        const normalized = res.map(a => ({
          ...a,
          patientName: a.patientName || a.patient_name || 'Walk-in Patient',
          phone_number: a.phone_number || a.phone || '',
          start_time: a.start_time || a.appointment_start_time,
          patientId: a.patientId || a.patient_id || null
        }));
        this.upcomingAppointments = normalized.filter(
          a => a.status === 'confirmed' || a.status === 'pending'
        );
        this.todayCount = normalized.filter(a =>
          new Date(a.appointment_date).toDateString() === todayStr
        ).length;
        this.completedCount = normalized.filter(
          a => a.status === 'completed'
        ).length;
        const patientIds = normalized
          .map(r => r.patientId)
          .filter(id => id !== null && id !== undefined);
        this.totalPatients = new Set(patientIds).size;
        this.revenue = normalized
          .filter(r => r.payment_status === 'paid')
          .reduce((sum, r) => sum + (parseFloat(r.doctor_earnings) || 0), 0);
        this.doctorService.getMyProfile().subscribe((doc: any) => {
          this.subscriptionStatus = doc.subscription_status || 'trial';
          this.cdr.markForCheck();
        });
        this.loading = false;
        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error('Refresh error:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  upgradePlan() {
    this.doctorService.createSubscriptionSession().subscribe({
      next: (res: any) => {
        if (res.url) window.location.href = res.url;
      },
      error: () => this.toast.error('Failed to start subscription checkout')
    });
  }

  boostProfile() {
    this.doctorService.createPromotionSession().subscribe({
      next: (res: any) => {
        if (res.url) window.location.href = res.url;
      },
      error: () => this.toast.error('Failed to start promotion checkout')
    });
  }


  bookWalkin() {
    if (
      !this.walkinData.patientName ||
      !this.walkinData.gender ||
      this.walkinData.age === null ||
      !this.walkinData.date ||
      !this.walkinData.timeSlot
    ) {
      this.toast.error('Please fill all required fields');
      return;
    }

    this.isBooking = true;
    this.cdr.markForCheck();

    const payload = {
      patientName: this.walkinData.patientName,
      age: this.walkinData.age,
      gender: this.walkinData.gender,
      date: this.walkinData.date,
      timeSlot: this.walkinData.timeSlot,
      phone: this.walkinData.phone || null,
      bloodGroup: this.walkinData.bloodGroup || null
    };

    this.appointmentService.bookWalkin(payload).subscribe({
      next: (res: any) => {
        this.isBooking = false;
        this.showWalkinModal = false;

        console.log('SUCCESS RESPONSE:', res);

        this.toast.success(res?.message || 'Walk-in booked successfully');

        // reset form
        this.walkinData = {
          patientName: '',
          phone: '',
          date: '',
          timeSlot: '',
          dob: '',
          age: null,
          gender: 'Male',
          bloodGroup: 'A+'
        };

        this.refresh();
        this.cdr.markForCheck();
      },

      error: (err) => {
        this.isBooking = false;

        console.log('ERROR RESPONSE:', err);

        const msg =
          err?.error?.message ||
          err?.message ||
          'Booking failed';

        this.toast.error(msg);

        this.cdr.markForCheck();
      }
    });
  }

  markComplete(apt: any) {
    this.appointmentService.updateAppointmentStatus(apt.id, 'completed').subscribe(() => {
      this.toast.success('Consultation completed');
      this.refresh();
    });
  }

  exportPatients() {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5000/api/doctors/export-patients?token=${token}`, '_blank');
  }
}