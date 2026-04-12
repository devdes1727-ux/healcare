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


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `

<div class="container">

<h2 class="title">Doctor Verification Panel</h2>


<!-- STATS -->

<div class="stats">

<div class="card total">
<h4>Total Doctors</h4>
<h2>{{ doctors.length }}</h2>
</div>

<div class="card pending">
<h4>Pending</h4>
<h2>{{ pendingDoctors }}</h2>
</div>

<div class="card approved">
<h4>Approved</h4>
<h2>{{ approvedDoctors }}</h2>
</div>

</div>


<!-- FILTER BAR -->

<div class="toolbar">

<input
placeholder="Search doctor name..."
[(ngModel)]="searchText"
(input)="filterDoctors()" />

<select
[(ngModel)]="statusFilter"
(change)="filterDoctors()">

<option value="">All Status</option>
<option value="pending">Pending</option>
<option value="approved">Approved</option>

</select>

</div>


<!-- TABLE -->

<table *ngIf="filteredDoctors.length">

<thead>

<tr>
<th>Doctor</th>
<th>Specialization</th>
<th>Experience</th>
<th>Status</th>
<th>Action</th>
</tr>

</thead>


<tbody>

<tr
*ngFor="let doc of filteredDoctors; trackBy: trackByDoctor">

<td>

<div class="doctor">

<div class="avatar">

{{ getInitial(doc.name) }}

</div>

<div>

<div class="name">
{{ doc.name }}
</div>

<div class="email">
{{ doc.email }}
</div>

</div>

</div>

</td>


<td>{{ doc.specialization }}</td>

<td>{{ doc.experience_years }} yrs</td>


<td>

<span
class="badge"
[ngClass]="doc.verification_status">

{{ doc.verification_status }}

</span>

</td>


<td>

<button
*ngIf="doc.verification_status==='pending'"
class="approve-btn"
(click)="approveDoctor(doc)">

Approve

</button>


<span
*ngIf="doc.verification_status==='approved'"
class="verified">

✔ Verified

</span>

</td>

</tr>

</tbody>

</table>


<div
*ngIf="!filteredDoctors.length"
class="empty">

No doctors found

</div>


</div>

`,

  styles: [`

.container{
max-width:1200px;
margin:auto;
padding:30px;
font-family:Segoe UI;
}

.title{
margin-bottom:20px;
}

.stats{
display:flex;
gap:20px;
margin-bottom:20px;
}

.card{
flex:1;
padding:20px;
border-radius:10px;
background:white;
box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.total{border-left:5px solid #3b82f6;}
.pending{border-left:5px solid #f59e0b;}
.approved{border-left:5px solid #10b981;}

.toolbar{
display:flex;
gap:10px;
margin-bottom:20px;
}

.toolbar input,
.toolbar select{
padding:8px;
border-radius:6px;
border:1px solid #ddd;
}

table{
width:100%;
border-collapse:collapse;
background:white;
}

th{
text-align:left;
padding:12px;
border-bottom:2px solid #eee;
}

td{
padding:12px;
border-bottom:1px solid #eee;
}

.doctor{
display:flex;
gap:12px;
align-items:center;
}

.avatar{
width:40px;
height:40px;
border-radius:50%;
background:#2563eb;
color:white;
display:flex;
align-items:center;
justify-content:center;
font-weight:bold;
}

.name{
font-weight:600;
}

.email{
font-size:12px;
color:#777;
}

.badge{
padding:6px 12px;
border-radius:20px;
font-size:12px;
font-weight:600;
text-transform:capitalize;
}

.badge.pending{
background:#fff7ed;
color:#ea580c;
}

.badge.approved{
background:#ecfdf5;
color:#16a34a;
}

.approve-btn{
background:#2563eb;
color:white;
border:none;
padding:6px 14px;
border-radius:6px;
cursor:pointer;
}

.verified{
background:#10b981;
color:white;
padding:6px 14px;
border-radius:6px;
}

.empty{
padding:30px;
text-align:center;
color:#777;
}

`]

})
export class AdminDashboardComponent implements OnInit {

  doctors: any[] = []
  filteredDoctors: any[] = []

  searchText = ''
  statusFilter = ''

  pendingDoctors = 0
  approvedDoctors = 0


  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {

    if (this.authService.getRole() !== 'admin') {
      this.router.navigate(['/'])
      return
    }

    this.fetchDoctors()

  }


  fetchDoctors() {

    this.doctorService.getDoctors().subscribe({

      next: (res: any[]) => {

        this.doctors = [...res]
        this.filteredDoctors = [...res]

        this.updateStats()

        this.cdr.markForCheck()

      },

      error: () => {

        this.toast.error('Failed to load doctors')

      }

    })

  }


  approveDoctor(doc: any) {

    this.doctorService
      .approveDoctor(doc.id)
      .subscribe({

        next: () => {

          doc.verification_status = 'approved'

          this.updateStats()

          this.filterDoctors()

          this.toast.success('Doctor approved successfully')

          this.cdr.markForCheck()

        }

      })

  }


  updateStats() {

    this.pendingDoctors =
      this.doctors.filter(d => d.verification_status === 'pending').length

    this.approvedDoctors =
      this.doctors.filter(d => d.verification_status === 'approved').length

  }


  filterDoctors() {

    const search = this.searchText.toLowerCase()

    this.filteredDoctors = this.doctors.filter(doc => {

      const matchesSearch =
        doc.name.toLowerCase().includes(search)

      const matchesStatus =
        !this.statusFilter ||
        doc.verification_status === this.statusFilter

      return matchesSearch && matchesStatus

    })

    this.cdr.markForCheck()

  }


  trackByDoctor(index: number, doc: any) {

    return doc.id

  }


  getInitial(name: string) {

    return name ? name.charAt(0).toUpperCase() : 'D'

  }

}