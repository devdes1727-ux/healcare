import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  AppointmentService
} from '../../services/appointment.service';

import {
  ToastService
} from '../../services/toast.service';


@Component({

  selector: 'app-my-appointments',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `

<div class="page-container">

<h2 class="page-title">
My Appointments
</h2>


<!-- LOADING -->

<div *ngIf="loading" class="loading">
Loading appointments...
</div>


<!-- EMPTY STATE -->

<div
*ngIf="!loading && displayedAppts.length===0"
class="empty">

No appointments booked yet

</div>


<!-- APPOINTMENT GRID -->

<div class="appointment-grid">

<div
*ngFor="let apt of displayedAppts; trackBy: trackByApt"
class="appointment-card">

<div class="card-header">

<div>

<h3>
Dr {{apt.doctorName}}
</h3>

<p class="speciality">
{{apt.specialization}}
</p>

</div>


<span
class="status-badge"
[ngClass]="apt.status">

{{apt.status}}

</span>

</div>



<div class="card-body">

<div class="info">
📅 {{apt.appointment_date | date:'mediumDate'}}
</div>

<div class="info">
🕒 {{apt.start_time + " - " + apt.end_time}}
</div>

<div class="info">
💻 {{apt.consultation_type}}
</div>

<div class="info">
💳 {{apt.payment_status}}
</div>

</div>



<div class="card-actions">

<button
*ngIf="showJoinBtn(apt)"
class="btn primary"
(click)="joinCall(apt)">

Join Call

</button>


<button
*ngIf="apt.status==='confirmed'"
class="btn outline"
(click)="openReschedule(apt)">

Reschedule

</button>


<button
*ngIf="apt.status==='confirmed'"
class="btn danger"
(click)="confirmCancel(apt)">

Cancel

</button>

</div>

</div>

</div>



<!-- CANCEL MODAL -->

<div
class="modal"
*ngIf="activeModal==='cancel'">

<div class="modal-box">

<h3>
Cancel Appointment?
</h3>

<p>
Are you sure you want to cancel?
</p>


<div class="modal-actions">

<button
class="btn danger"
(click)="executeCancel()">

Yes Cancel

</button>


<button
class="btn outline"
(click)="closeModal()">

Close

</button>

</div>

</div>

</div>



<!-- RESCHEDULE MODAL -->

<div
class="modal"
*ngIf="activeModal==='reschedule'">

<div class="modal-box">

<h3>
Request Reschedule
</h3>

<p class="hint">
Select new preferred slot
</p>

<input
type="date"
[(ngModel)]="newDate"
class="input"/>


<input
type="time"
[(ngModel)]="newTime"
class="input"/>


<div class="modal-actions">

<button
class="btn primary"
(click)="executeReschedule()">

Send Request

</button>


<button
class="btn outline"
(click)="closeModal()">

Cancel

</button>

</div>

</div>

</div>

</div>



<style>

.page-container{
max-width:1000px;
margin:auto;
padding:30px 20px 60px;
}


.page-title{
font-size:28px;
font-weight:600;
margin-bottom:25px;
}


.loading,
.empty{
text-align:center;
margin-top:40px;
font-size:18px;
color:#777;
}


/* GRID LAYOUT FIX */

.appointment-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
gap:20px;
}


/* CARD */

.appointment-card{
background:white;
border-radius:14px;
padding:18px;
box-shadow:0 3px 12px rgba(0,0,0,0.08);
transition:.2s;
}


.appointment-card:hover{
transform:translateY(-3px);
}


/* HEADER */

.card-header{
display:flex;
justify-content:space-between;
align-items:center;
}


.speciality{
color:#666;
font-size:14px;
}


/* BODY */

.card-body{
display:grid;
grid-template-columns:1fr 1fr;
gap:8px;
margin-top:12px;
}


.info{
font-size:15px;
}


/* ACTION BUTTONS */

.card-actions{
margin-top:15px;
display:flex;
gap:10px;
flex-wrap:wrap;
}


/* STATUS BADGE */

.status-badge{
padding:6px 14px;
border-radius:20px;
font-size:13px;
text-transform:capitalize;
}


.status-badge.confirmed{
background:#e6f7ef;
color:#12a150;
}


.status-badge.pending{
background:#fff4e5;
color:#e28b00;
}


.status-badge.cancelled_by_patient{
background:#ffe6e6;
color:#cc0000;
}


/* BUTTONS */

.btn{
padding:8px 14px;
border-radius:8px;
cursor:pointer;
border:none;
font-size:14px;
}


.btn.primary{
background:#1976d2;
color:white;
}


.btn.outline{
border:1px solid #ccc;
background:white;
}


.btn.danger{
background:#e53935;
color:white;
}


/* MODAL */

.modal{
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:rgba(0,0,0,0.4);
display:flex;
align-items:center;
justify-content:center;
z-index:1000;
}


.modal-box{
background:white;
padding:25px;
border-radius:14px;
width:320px;
}


.modal-actions{
margin-top:15px;
display:flex;
gap:10px;
}


.input{
width:100%;
padding:8px;
margin-top:10px;
}


.hint{
font-size:13px;
color:#666;
margin-bottom:10px;
}

</style>

`

})

export class MyAppointmentsComponent implements OnInit {

  displayedAppts: any[] = []

  loading = true

  activeModal: any = null

  selectedApt: any

  newDate = ''

  newTime = ''


  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {

    this.fetchAppointments()

  }


  fetchAppointments() {

    this.loading = true

    this.appointmentService
      .getPatientAppointments()
      .subscribe({

        next: (res: any) => {

          this.displayedAppts = [...res]

          this.loading = false

          this.cdr.markForCheck()

        },

        error: (err: any) => {

          this.loading = false

          this.toast.error(
            err?.error?.message ||
            "Failed to load appointments"
          )

          this.cdr.markForCheck()

        }

      })

  }


  showJoinBtn(apt: any) {

    return (
      apt.status === "confirmed" &&
      apt.consultation_type === "online" &&
      apt.meeting_link
    )

  }


  joinCall(apt: any) {

    window.open(
      apt.meeting_link,
      "_blank"
    )

  }


  confirmCancel(apt: any) {

    this.selectedApt = apt

    this.activeModal = 'cancel'

    this.cdr.markForCheck()

  }


  executeCancel() {

    this.appointmentService
      .updateAppointmentStatus(
        this.selectedApt.id,
        'cancelled_by_patient'
      )
      .subscribe({

        next: () => {

          this.toast.success(
            "Appointment cancelled"
          )

          this.closeModal()

          this.fetchAppointments()

        },

        error: (err: any) => {

          this.toast.error(
            err?.error?.message ||
            "Cancel failed"
          )

        }

      })

  }


  openReschedule(apt: any) {

    this.selectedApt = apt

    this.activeModal = 'reschedule'

    this.cdr.markForCheck()

  }


  executeReschedule() {

    if (!this.newDate || !this.newTime) {

      this.toast.error(
        "Select date & time"
      )

      return

    }

    this.appointmentService
      .rescheduleAppointment(
        this.selectedApt.id,
        {
          date: this.newDate,
          time: this.newTime
        }
      )
      .subscribe({

        next: () => {

          this.toast.success(
            "Reschedule request sent"
          )

          this.closeModal()

          this.fetchAppointments()

        },

        error: (err: any) => {

          this.toast.error(
            err?.error?.message ||
            "Slot unavailable"
          )

        }

      })

  }


  closeModal() {

    this.activeModal = null

    this.selectedApt = null

    this.newDate = ''

    this.newTime = ''

    this.cdr.markForCheck()

  }


  trackByApt(index: number, apt: any) {

    return apt.id

  }

}