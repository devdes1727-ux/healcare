import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-patient-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `

<div class="dashboard-wrapper">

<!-- Stats Cards -->

<div class="stats-grid">

<div class="stat-card">
<div class="stat-icon blue">📅</div>

<div>
<h4>Upcoming Appointments</h4>
<p class="stat-value">{{ upcomingCount }}</p>
</div>
</div>


<div class="stat-card">
<div class="stat-icon green">✅</div>

<div>
<h4>Completed Visits</h4>
<p class="stat-value">{{ completedCount }}</p>
</div>
</div>


<div class="stat-card clickable" routerLink="/patient-dashboard/doctors">
<div class="stat-icon purple">🔍</div>

<div>
<h4 class="primary">Find Doctor</h4>
<p class="small">Search directory →</p>
</div>
</div>

</div>



<!-- Next Appointment Card -->

<div class="card">

<div class="card-header">

<h3>Next Appointment</h3>

<a routerLink="../appointments">View all</a>

</div>



<!-- Loading -->

<div *ngIf="loading" class="loading">

Loading appointment...

</div>



<!-- Empty -->

<div *ngIf="!loading && !nextAppointment" class="empty">

No upcoming appointments found

</div>



<!-- Appointment -->

<div *ngIf="nextAppointment" class="appointment-box">

<div class="appointment-left">

<div class="date-box">

<span>

{{ nextAppointment.appointment_date | date:'MMM' }}

</span>

<b>

{{ nextAppointment.appointment_date | date:'dd' }}

</b>

</div>



<div>

<h4>

Dr. {{ nextAppointment.doctorName }}

</h4>

<p>

{{ nextAppointment.specialization }}

• {{ nextAppointment.consultation_type }}

</p>

<p class="time">

{{ nextAppointment.start_time + " - " + nextAppointment.end_time }}

</p>

</div>

</div>



<div class="actions">

<button
*ngIf="showJoinBtn()"
class="btn primary"
(click)="joinMeeting()"
>

Join Meeting

</button>


<button
class="btn outline"
routerLink="../appointments"
>

Manage

</button>

</div>

</div>

</div>

</div>
  `,

  styles: [`

.dashboard-wrapper{
padding:20px;
}


.stats-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:20px;
margin-bottom:25px;
}


.stat-card{
background:white;
border-radius:12px;
padding:18px;
display:flex;
gap:15px;
align-items:center;
box-shadow:0 2px 8px rgba(0,0,0,0.06);
}


.stat-card.clickable{
cursor:pointer;
transition:.2s;
}


.stat-card.clickable:hover{
transform:translateY(-3px);
}


.stat-icon{
width:45px;
height:45px;
border-radius:8px;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;
}


.blue{background:#e3f2fd;color:#1976d2;}
.green{background:#e8f5e9;color:#2e7d32;}
.purple{background:#f3e5f5;color:#7b1fa2;}


.stat-value{
font-size:26px;
font-weight:700;
margin:0;
}


.card{
background:white;
border-radius:14px;
padding:20px;
box-shadow:0 3px 12px rgba(0,0,0,0.08);
}


.card-header{
display:flex;
justify-content:space-between;
margin-bottom:15px;
}


.loading,
.empty{
text-align:center;
padding:25px;
color:#777;
}


.appointment-box{
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:20px;
}


.appointment-left{
display:flex;
gap:15px;
align-items:center;
}


.date-box{
background:#f5f7fa;
padding:10px;
border-radius:10px;
text-align:center;
min-width:55px;
}


.date-box span{
display:block;
font-size:12px;
}


.date-box b{
font-size:22px;
}


.time{
margin-top:5px;
font-weight:600;
}


.actions{
display:flex;
gap:10px;
}


.btn{
padding:7px 14px;
border-radius:8px;
cursor:pointer;
border:none;
}


.primary{
color:#1976d2;
}


.outline{
border:1px solid #ccc;
background:white;
}


.primary-text{
color:#1976d2;
}


.small{
font-size:13px;
color:#666;
}

  `]
})

export class PatientOverviewComponent implements OnInit {

  upcomingCount = 0;
  completedCount = 0;

  nextAppointment: any = null;

  loading = true;


  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }



  ngOnInit() {

    this.loadAppointments();

  }



  loadAppointments() {

    this.appointmentService
      .getPatientAppointments()
      .subscribe({

        next: (res: any[]) => {

          const today = new Date();

          const upcoming = res.filter(a =>
            a.status === "confirmed" &&
            new Date(a.appointment_date) >= today
          );


          const completed = res.filter(a =>
            a.status === "completed"
          );


          this.upcomingCount = upcoming.length;

          this.completedCount = completed.length;


          this.nextAppointment = upcoming.length
            ? upcoming.sort(
              (a, b) =>
                new Date(a.appointment_date).getTime()
                -
                new Date(b.appointment_date).getTime()
            )[0]
            : null;


          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (err) => {

          this.loading = false;

          this.toast.error(
            err?.error?.message ||
            "Failed loading overview"
          );

          this.cdr.detectChanges();

        }

      });

  }



  showJoinBtn() {

    return (

      this.nextAppointment?.consultation_type === "online"
      &&
      this.nextAppointment?.meeting_link

    );

  }



  joinMeeting() {

    window.open(
      this.nextAppointment.meeting_link,
      "_blank"
    );

  }

}