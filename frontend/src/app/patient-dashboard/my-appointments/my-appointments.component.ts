import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
<div class="page-container">
  <header class="header">
    <h2>Medical Consultations</h2>
    <div class="tabs">
       <button [class.active]="filter === 'upcoming'" (click)="setFilter('upcoming')">Upcoming</button>
       <button [class.active]="filter === 'past'" (click)="setFilter('past')">Past Visits</button>
    </div>
  </header>

  <div *ngIf="loading" class="loading">Fetching your records...</div>

  <div class="appointment-list" *ngIf="!loading">
    <div class="apt-card" *ngFor="let apt of displayedAppts" (click)="openDetails(apt)">
      <div class="apt-info">
        <div class="doc-avatar">{{ apt.doctorName[0] }}</div>
        <div>
          <h3>Dr. {{ apt.doctorName }}</h3>
          <p>{{ apt.specialization }} • <b>{{ apt.consultation_type | titlecase }}</b></p>
        </div>
      </div>
      <div class="apt-time">
         <span class="date">{{ apt.appointment_date | date:'dd MMM yyyy' }}</span>
         <span class="time">{{ apt.start_time }}</span>
      </div>
      <div class="apt-status">
         <span class="badge" [class]="apt.status">{{ apt.status }}</span>
         <span class="booked-by" *ngIf="apt.booked_by === 'doctor'">Added by doctor</span>
      </div>
    </div>
  </div>

  <!-- BOOKING DETAIL MODAL -->
  <div class="details-overlay" *ngIf="selectedApt" (click)="selectedApt = null">
    <div class="details-modal" (click)="$event.stopPropagation()">
      <button class="close-btn" (click)="selectedApt = null">✕</button>
      
      <div class="modal-header">
        <h2>Consultation Details</h2>
        <span class="badge" [class]="selectedApt.status">{{ selectedApt.status }}</span>
      </div>

      <div class="sections-grid">
        <div class="main-details">
          <div class="detail-row">
            <strong>Doctor:</strong> <span>Dr. {{ selectedApt.doctorName }} ({{ selectedApt.specialization }})</span>
          </div>
          <div class="detail-row">
            <strong>Schedule:</strong> <span>{{ selectedApt.appointment_date | date:'fullDate' }} at {{ selectedApt.start_time }}</span>
          </div>
          <div class="detail-row">
            <strong>Duration:</strong> <span>{{ selectedApt.duration || 15 }} mins</span>
          </div>
          <div class="detail-row">
            <strong>Booked By:</strong> <span>{{ selectedApt.booked_by | titlecase }}</span>
          </div>

          <div class="visit-summary" *ngIf="selectedApt.visit_summary">
             <h4>Visit Summary</h4>
             <p>{{ selectedApt.visit_summary }}</p>
             <div class="follow-up" *ngIf="selectedApt.follow_up_date">
                <strong>Next Follow-up:</strong> {{ selectedApt.follow_up_date | date }}
                <div class="follow-btns" *ngIf="selectedApt.follow_up_status === 'pending'">
                   <button class="btn-sm green" (click)="respondFollowUp('accepted')">Accept</button>
                   <button class="btn-sm red" (click)="respondFollowUp('denied')">Deny</button>
                </div>
                <span class="fu-status" *ngIf="selectedApt.follow_up_status !== 'pending'">{{ selectedApt.follow_up_status | titlecase }}</span>
             </div>
          </div>
        </div>

        <div class="actions-panel">
          <button class="btn-primary w-full" *ngIf="showJoinBtn(selectedApt)" (click)="joinCall(selectedApt)">Join Video Link</button>
          <button class="btn-outline w-full" *ngIf="selectedApt.status === 'completed'">Book Again</button>
          <div class="upload-section" *ngIf="selectedApt.status === 'completed'">
             <label>Files & Prescriptions</label>
             <div class="file-drop">
                <span>{{ selectedApt.prescription_file ? '1 File Uploaded' : 'Upload File' }}</span>
                <input type="file" (change)="onUploadFile($event)" />
             </div>
          </div>
          <button class="btn-red w-full" *ngIf="selectedApt.status === 'confirmed'" (click)="cancelApt()">Cancel Booking</button>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
.page-container { max-width: 900px; margin: auto; padding: 40px 20px; font-family: 'Outfit', sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header h2 { margin: 0; font-size: 28px; color: #1e293b; font-weight: 800; }
.tabs { display: flex; background: #f1f5f9; padding: 5px; border-radius: 12px; }
.tabs button { border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #64748b; background: none; }
.tabs button.active { background: white; color: #1e293b; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

.appointment-list { display: flex; flex-direction: column; gap: 12px; }
.apt-card { background: white; padding: 20px; border-radius: 20px; display: grid; grid-template-columns: 2fr 1fr 1fr; align-items: center; cursor: pointer; transition: .2s; border: 1px solid #f1f5f9; box-shadow: 0 5px 15px rgba(0,0,0,0.02); }
.apt-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: #e2e8f0; }

.apt-info { display: flex; gap: 15px; align-items: center; }
.doc-avatar { width: 50px; height: 50px; background: #eef2ff; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #4f46e5; font-size: 20px; }
.apt-info h3 { margin: 0; font-size: 16px; color: #1e293b; }
.apt-info p { margin: 3px 0 0; font-size: 13px; color: #94a3b8; }

.apt-time { display: flex; flex-direction: column; text-align: center; }
.apt-time .date { font-weight: 700; color: #1e293b; font-size: 14px; }
.apt-time .time { font-size: 13px; color: #64748b; }

.apt-status { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }

.badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.badge.confirmed { background: #f0fdf4; color: #16a34a; }
.badge.pending { background: #fffbeb; color: #d97706; }
.badge.completed { background: #eff6ff; color: #2563eb; }
.badge.no_show { background: #fef2f2; color: #dc2626; }
.booked-by { font-size: 10px; color: #94a3b8; font-style: italic; }

/* MODAL */
.details-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.details-modal { background: white; width: 90%; max-width: 700px; border-radius: 30px; padding: 40px; position: relative; animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.close-btn { position: absolute; top: 25px; right: 25px; border: none; background: #f1f5f9; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.modal-header h2 { margin: 0; font-size: 24px; font-weight: 800; }

.sections-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
.detail-row { margin-bottom: 12px; font-size: 15px; border-bottom: 1px solid #f8fafc; padding-bottom: 8px; }
.detail-row strong { color: #64748b; width: 100px; display: inline-block; }

.visit-summary { margin-top: 25px; background: #f8fafc; padding: 20px; border-radius: 20px; border-left: 4px solid #4f46e5; }
.visit-summary h4 { margin: 0 0 10px; font-size: 16px; }
.follow-up { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 14px; }
.follow-btns { display: flex; gap: 10px; margin-top: 10px; }
.btn-sm { padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
.green { background: #dcfce7; color: #16a34a; }
.red { background: #fee2e2; color: #dc2626; }

.actions-panel { display: flex; flex-direction: column; gap: 15px; }
.btn-primary { background: #1e293b; color: white; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-weight: 700; }
.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; cursor: pointer; font-weight: 700; }
.btn-red { background: #fee2e2; color: #dc2626; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-weight: 700; }
.w-full { width: 100%; }

.upload-section { background: #f1f5f9; padding: 15px; border-radius: 15px; }
.upload-section label { font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 10px; }
.file-drop { border: 2px dashed #cbd5e1; padding: 20px; border-radius: 12px; text-align: center; position: relative; }
.file-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

@media(max-width: 600px) { .apt-card { grid-template-columns: 1fr; gap: 15px; } .sections-grid { grid-template-columns: 1fr; } }
`]
})
export class MyAppointmentsComponent implements OnInit {
  allAppts: any[] = [];
  displayedAppts: any[] = [];
  loading = true;
  filter = 'upcoming';
  selectedApt: any = null;

  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { this.fetchAppointments(); }

  fetchAppointments() {
    this.loading = true;
    this.appointmentService.getPatientAppointments().subscribe((res: any) => {
      this.allAppts = res;
      this.applyFilter();
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  setFilter(f: string) {
    this.filter = f;
    this.applyFilter();
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.displayedAppts = this.allAppts.filter(a => {
      const d = new Date(a.appointment_date);
      return this.filter === 'upcoming' ? d >= today : d < today;
    });
    this.cdr.detectChanges();
  }

  openDetails(apt: any) { this.selectedApt = apt; }

  showJoinBtn(apt: any) { return apt.status === 'confirmed' && apt.consultation_type === 'online' && apt.meeting_link; }

  joinCall(apt: any) { window.open(apt.meeting_link, '_blank'); }

  cancelApt() {
    if (!confirm('Cancel this booking?')) return;
    this.appointmentService.updateAppointmentStatus(this.selectedApt.id, 'cancelled_by_patient').subscribe(() => {
      this.toast.success('Cancelled');
      this.selectedApt = null;
      this.fetchAppointments();
    });
  }

  respondFollowUp(status: string) {
    // Implement follow-up status update API
    this.toast.success(`Follow-up ${status}`);
    this.selectedApt.follow_up_status = status;
    this.cdr.detectChanges();
  }

  onUploadFile(event: any) {
    this.toast.success('File uploaded');
    this.selectedApt.prescription_file = 'attached';
    this.cdr.detectChanges();
  }
}