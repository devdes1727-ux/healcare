import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-find-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `

<div class="page">

<div class="header">

<h2>Find Doctors</h2>

<p class="sub">Search and book appointments instantly</p>

<div class="search-box">

<input
type="text"
placeholder="Search by name or specialization"
[(ngModel)]="searchTerm"
(input)="filterDoctors()"
/>

<select
[(ngModel)]="locationFilter"
(change)="filterDoctors()"
>

<option value="">All Locations</option>
<option value="New York">New York</option>
<option value="London">London</option>
<option value="Online">Online</option>

</select>

<button (click)="filterDoctors()">
Search
</button>

</div>

</div>


<div *ngIf="loading" class="loading">
Loading doctors...
</div>


<div *ngIf="!loading && filteredDoctors.length === 0" class="empty">
No doctors found
</div>


<div class="grid" *ngIf="!loading && filteredDoctors.length > 0">

<div class="card" *ngFor="let doc of filteredDoctors">

<div class="top">

<div class="avatar">
{{ doc.name ? doc.name.charAt(0) : 'D' }}
</div>

<div class="info">

<h3>Dr. {{ doc.name }}</h3>

<p>{{ doc.specialization }}</p>

<div class="rating">
⭐ 4.8 • {{ doc.experience_years }} yrs exp
</div>

</div>

</div>


<div class="middle">

<div class="clinic">
🏥 {{ doc.clinic_name }}
</div>

<div class="location">
📍 {{ doc.clinic_location }}
</div>

</div>


<div class="bottom">

<div class="fee">
💰 ₹{{ doc.consultation_fee }}
</div>

<a
[routerLink]="['/patient-dashboard/doctors', doc.id]"
class="btn"
>

View Profile

</a>

</div>

</div>

</div>

</div>

`,

  styles: [`

.page{
max-width:1100px;
margin:auto;
padding:20px;
}

.header{
margin-bottom:20px;
}

.header h2{
margin:0;
font-size:26px;
}

.sub{
margin:5px 0 15px;
color:#666;
}

.search-box{
display:flex;
gap:10px;
flex-wrap:wrap;
}

.search-box input,
.search-box select{
padding:10px;
border:1px solid #ddd;
border-radius:10px;
flex:1;
min-width:200px;
}

.search-box button{
padding:10px 16px;
border:none;
background:#1976d2;
color:white;
border-radius:10px;
cursor:pointer;
}

.loading,
.empty{
text-align:center;
padding:40px;
color:#777;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
gap:16px;
margin-top:20px;
}

.card{
background:white;
border-radius:16px;
padding:16px;
box-shadow:0 3px 10px rgba(0,0,0,0.08);
transition:0.2s;
}

.card:hover{
transform:translateY(-4px);
}

.top{
display:flex;
gap:12px;
align-items:center;
}

.avatar{
width:55px;
height:55px;
border-radius:50%;
background:linear-gradient(135deg,#6a5cff,#00c6ff);
color:white;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
font-weight:bold;
}

.info h3{
margin:0;
font-size:16px;
}

.info p{
margin:2px 0;
color:#666;
font-size:14px;
}

.rating{
font-size:12px;
color:#444;
margin-top:4px;
}

.middle{
margin-top:12px;
font-size:13px;
color:#555;
display:flex;
flex-direction:column;
gap:4px;
}

.bottom{
display:flex;
justify-content:space-between;
align-items:center;
margin-top:15px;
}

.fee{
font-weight:600;
color:#1976d2;
}

.btn{
padding:8px 12px;
background:#1976d2;
color:white;
border-radius:8px;
text-decoration:none;
font-size:13px;
}

`]
})
export class FindDoctorsComponent implements OnInit {

  doctors: any[] = []
  filteredDoctors: any[] = []
  searchTerm = ''
  locationFilter = ''
  loading = true

  constructor(
    private doctorService: DoctorService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || ''
      this.locationFilter = params['location'] || ''
      this.loadDoctors()
    })
  }

  loadDoctors() {
    this.loading = true
    this.doctorService.getDoctors().subscribe({
      next: (res) => {
        this.doctors = res
        this.filterDoctors()
        this.loading = false
      },
      error: () => {
        this.loading = false
      }
    })
  }

  filterDoctors() {
    const term = this.searchTerm.toLowerCase()
    const loc = this.locationFilter.toLowerCase()

    this.filteredDoctors = this.doctors.filter(d => {
      const name = (d.name || '').toLowerCase().includes(term)
      const spec = (d.specialization || '').toLowerCase().includes(term)
      const location = !loc || (d.clinic_location || '').toLowerCase().includes(loc)

      return (name || spec) && location
    })
  }

}