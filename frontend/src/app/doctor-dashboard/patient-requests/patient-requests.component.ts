import {
  Component,
  OnInit
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

  selector: 'app-patient-requests',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  template: `

<div class="wrapper">


<div class="header">

<h2>

Appointment Requests

</h2>


<div class="tabs">

<button
class="tab"
[class.active]="filter==='pending'"
(click)="filterRequests('pending')"
>

Pending

</button>


<button
class="tab"
[class.active]="filter==='all'"
(click)="filterRequests('all')"
>

All

</button>


</div>

</div>



<!-- LOADER -->

<div *ngIf="loading" class="loader">

Loading requests...

</div>



<!-- EMPTY STATE -->

<div
*ngIf="!loading && displayedRequests.length===0"
class="empty"
>

📭 No appointment requests

</div>



<!-- REQUEST LIST -->

<div
*ngFor="let req of displayedRequests"
class="request-card"
>


<div class="left">


<div class="avatar">

{{req.patientName?.charAt(0) || 'P'}}

</div>


<div>


<h3>

{{req.patientName}}

</h3>


<div class="meta">

📅 {{req.appointment_date | date:'mediumDate'}}

</div>


<div class="meta">

🕒 {{req.appointment_time}}

</div>


<div class="meta">

👤 {{req.gender || 'N/A'}}

• {{req.age || 'N/A'}}

yrs

</div>


<div class="meta">

📞 {{req.phone_number || 'N/A'}}

</div>


</div>


</div>



<div class="right">


<div class="badges">


<span
class="badge"
[class.green]="req.payment_status==='paid'"
[class.orange]="req.payment_status!=='paid'"
>

{{req.payment_status}}

</span>


<span
class="badge blue"
>

{{req.consultation_type}}

</span>


<span
class="badge status"
[ngClass]="req.status"
>

{{req.status}}

</span>


</div>



<!-- ACTIONS -->

<div class="actions">


<!-- PENDING -->

<button
*ngIf="req.status==='pending'"
class="btn danger"
(click)="confirmDecline(req.id)"
>

Decline

</button>


<button
*ngIf="req.status==='pending'"
class="btn success"
(click)="updateStatus(req.id,'confirmed')"
>

Accept

</button>



<!-- CONFIRMED -->

<button
*ngIf="
req.status==='confirmed'
&& req.consultation_type==='online'
"
class="btn primary"
(click)="joinCall(req)"
>

Join Call

</button>


<button
*ngIf="req.status==='confirmed'"
class="btn outline"
(click)="openReschedule(req)"
>

Reschedule

</button>


<button
*ngIf="req.status==='confirmed'"
class="btn purple"
(click)="markCompleted(req.id)"
>

Complete

</button>


<button
*ngIf="req.status==='confirmed'"
class="btn danger"
(click)="cancelAppointment(req.id)"
>

Cancel

</button>


</div>


</div>


</div>



<!-- RESCHEDULE MODAL -->

<div
class="modal"
*ngIf="showRescheduleModal"
>

<div class="modal-card">

<h3>

Reschedule Appointment

</h3>


<input
type="date"
[(ngModel)]="newDate"
/>


<input
type="time"
[(ngModel)]="newTime"
/>


<div class="modal-actions">

<button
class="btn primary"
(click)="executeReschedule()"
>

Save

</button>


<button
class="btn outline"
(click)="showRescheduleModal=false"
>

Cancel

</button>


</div>

</div>

</div>



<!-- DECLINE MODAL -->

<div
class="modal"
*ngIf="showConfirmModal"
>

<div class="modal-card">

<h3>

Decline appointment?

</h3>


<div class="modal-actions">

<button
class="btn danger"
(click)="executeDecline()"
>

Yes Decline

</button>


<button
class="btn outline"
(click)="showConfirmModal=false"
>

Cancel

</button>


</div>

</div>

</div>

</div>



<style>

.wrapper{

max-width:1000px;
margin:auto;
padding:20px;

}


.header{

display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;

}


.tabs{

display:flex;
gap:10px;

}


.tab{

padding:6px 14px;
border-radius:8px;
border:none;
background:#eee;
cursor:pointer;

}


.tab.active{

background:#2563eb;
color:white;

}


.request-card{

display:flex;
justify-content:space-between;
background:white;
padding:20px;
border-radius:14px;
margin-bottom:15px;
box-shadow:0 2px 10px rgba(0,0,0,0.07);

}


.left{

display:flex;
gap:18px;

}


.avatar{

width:55px;
height:55px;
border-radius:50%;
background:#2563eb;
color:white;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;
font-weight:bold;

}


.meta{

font-size:14px;
color:#555;

}


.badges{

display:flex;
gap:6px;
margin-bottom:10px;

}


.badge{

padding:4px 10px;
border-radius:20px;
font-size:12px;

}


.badge.green{

background:#dcfce7;
color:#166534;

}


.badge.orange{

background:#fff4e5;
color:#9a6700;

}


.badge.blue{

background:#e0ecff;
color:#1d4ed8;

}


.status.confirmed{

background:#dcfce7;

}


.status.pending{

background:#fff4e5;

}


.status.completed{

background:#e0ecff;

}


.status.rejected,
.status.cancelled_by_doctor,
.status.cancelled_by_patient{

background:#fee2e2;

}


.actions{

display:flex;
gap:8px;
flex-wrap:wrap;

}


.btn{

padding:6px 14px;
border-radius:8px;
border:none;
cursor:pointer;

}


.primary{

background:#2563eb;
color:white;

}


.success{

background:#10b981;
color:white;

}


.danger{

background:#ef4444;
color:white;

}


.outline{

border:1px solid #ccc;
background:white;

}


.purple{

background:#7c3aed;
color:white;

}


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

}


.modal-card{

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


.loader,
.empty{

text-align:center;
margin-top:60px;

}

</style>

`
})

export class PatientRequestsComponent implements OnInit {


  requests: any[] = [];

  displayedRequests: any[] = [];

  loading = true;

  filter: 'pending' | 'all' = 'pending';

  showConfirmModal = false;

  showRescheduleModal = false;

  requestToDecline: number | null = null;

  selectedRequest: any;

  newDate = '';

  newTime = '';


  constructor(

    private appointmentService: AppointmentService,

    private toast: ToastService

  ) { }


  ngOnInit() {

    this.fetchRequests();

  }


  fetchRequests() {

    this.loading = true;

    this.appointmentService
      .getDoctorAppointments()
      .subscribe({

        next: (res: any) => {

          this.requests = res;

          this.filterRequests(this.filter);

          this.loading = false;

        },

        error: () => {

          this.toast.error("Load failed");

          this.loading = false;

        }

      });

  }


  filterRequests(type: 'pending' | 'all') {

    this.filter = type;

    this.displayedRequests =

      type === 'pending'

        ? this.requests.filter(r => r.status === 'pending')

        : [...this.requests];

  }


  updateStatus(id: number, status: string) {

    this.appointmentService
      .updateAppointmentStatus(id, status)
      .subscribe(() => {

        this.toast.success("Status updated");

        this.fetchRequests();

      });

  }


  confirmDecline(id: number) {

    this.requestToDecline = id;

    this.showConfirmModal = true;

  }


  executeDecline() {

    if (!this.requestToDecline) return;

    this.updateStatus(
      this.requestToDecline,
      "rejected"
    );

    this.showConfirmModal = false;

  }


  cancelAppointment(id: number) {

    this.updateStatus(
      id,
      "cancelled_by_doctor"
    );

  }


  markCompleted(id: number) {

    this.updateStatus(
      id,
      "completed"
    );

  }


  joinCall(req: any) {

    if (!req.meeting_link) {

      this.toast.error("Meeting link missing");

      return;

    }

    window.open(
      req.meeting_link,
      "_blank"
    );

  }


  openReschedule(req: any) {

    this.selectedRequest = req;

    this.showRescheduleModal = true;

  }


  executeReschedule() {

    this.appointmentService
      .rescheduleAppointment(
        this.selectedRequest.id,
        {
          date: this.newDate,
          time: this.newTime
        }
      )
      .subscribe(() => {

        this.toast.success("Rescheduled");

        this.fetchRequests();

        this.showRescheduleModal = false;

      });

  }

}