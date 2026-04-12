import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterModule,
  ActivatedRoute
} from '@angular/router';

import {
  DoctorService
} from '../../services/doctor.service';


@Component({

  selector: 'app-find-doctors',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  template: `

<div class="page">

<!-- HEADER -->

<div class="header">

<h2>Find Doctors</h2>

<p class="sub">
Search and book appointments instantly
</p>


<div class="search-box">

<input
type="text"
placeholder="Search doctor name or specialization"
[(ngModel)]="searchTerm"
(input)="filterDoctors()"
/>


<select
[(ngModel)]="locationFilter"
(change)="filterDoctors()"
>

<option value="">All Locations</option>

<option
*ngFor="let loc of locations"
[value]="loc"
>

{{loc}}

</option>

</select>


<button (click)="filterDoctors()">
Search
</button>

</div>

</div>



<!-- LOADING -->

<div
*ngIf="loading"
class="loading"
>

Loading doctors...

</div>



<!-- EMPTY -->

<div
*ngIf="!loading && filteredDoctors.length === 0"
class="empty"
>

No verified doctors found

</div>



<!-- DOCTOR GRID -->

<div
class="grid"
*ngIf="!loading && filteredDoctors.length > 0"
>

<div
class="card"
*ngFor="let doc of filteredDoctors"
>

<!-- TOP SECTION -->

<div class="top">

<div class="avatar-wrapper">

<img
*ngIf="doc.profile_image"
[src]="getProfileImage(doc.profile_image)"
class="avatar-img"
(error)="doc.profile_image=null"
/>


<div
*ngIf="!doc.profile_image"
class="avatar-fallback"
>

{{ doc.name?.charAt(0) || 'D' }}

</div>


<span
*ngIf="doc.verification_status === 'approved'"
class="verified-icon"
>

✔

</span>

</div>



<div class="info">

<h3 class="doctor-name">

Dr. {{ doc.name }}

<span
*ngIf="doc.verification_status === 'approved'"
class="verified-label"
>

✔ Verified

</span>

</h3>


<p>

{{ doc.specialization }}

</p>


<div class="rating">

⭐ 4.8 • {{ doc.experience_years }} yrs exp

</div>

</div>

</div>



<!-- CLINIC INFO -->

<div class="middle">

<div>

🏥 {{ doc.clinic_name || 'Clinic details unavailable' }}

</div>


<div>

📍 {{ doc.clinic_location || 'Location unavailable' }}

</div>

</div>



<!-- ACTION FOOTER -->

<div class="bottom">

<div class="fee">

₹{{ doc.consultation_fee }}

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



  styles: [

    `

.page{
max-width:1100px;
margin:auto;
padding:20px;
}


.header{
margin-bottom:25px;
}


.header h2{
margin:0;
font-size:26px;
}


.sub{
margin:6px 0 18px;
color:#6b7280;
}


.search-box{
display:flex;
gap:10px;
flex-wrap:wrap;
}


.search-box input,
.search-box select{
padding:12px;
border:1px solid #e5e7eb;
border-radius:10px;
flex:1;
min-width:200px;
}


.search-box button{
padding:12px 20px;
background:#2563eb;
color:white;
border:none;
border-radius:10px;
cursor:pointer;
}


.loading,
.empty{
text-align:center;
padding:40px;
color:#6b7280;
}


.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
gap:18px;
}


.card{
background:white;
border-radius:16px;
padding:18px;
box-shadow:0 3px 12px rgba(0,0,0,.06);
transition:.25s;
}


.card:hover{
transform:translateY(-6px);
}


.top{
display:flex;
gap:12px;
align-items:center;
}


.avatar-wrapper{
width:55px;
height:55px;
border-radius:50%;
overflow:hidden;
position:relative;
background:#eef2ff;
display:flex;
align-items:center;
justify-content:center;
}


.avatar-img{
width:100%;
height:100%;
object-fit:cover;
}


.avatar-fallback{
font-size:22px;
font-weight:bold;
color:#4f46e5;
}


.verified-icon{
position:absolute;
bottom:-2px;
right:-2px;
background:#10b981;
color:white;
width:18px;
height:18px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:10px;
border:2px solid white;
}


.doctor-name{
display:flex;
align-items:center;
gap:6px;
margin:0;
}


.verified-label{
background:#ecfdf5;
color:#059669;
font-size:11px;
padding:2px 8px;
border-radius:20px;
font-weight:600;
}


.info p{
margin:3px 0;
color:#6b7280;
}


.rating{
font-size:12px;
color:#374151;
}


.middle{
margin-top:12px;
font-size:13px;
color:#4b5563;
display:flex;
flex-direction:column;
gap:5px;
}


.bottom{
display:flex;
justify-content:space-between;
align-items:center;
margin-top:16px;
}


.fee{
font-weight:600;
color:#2563eb;
}


.btn{
padding:8px 14px;
background:#2563eb;
color:white;
border-radius:8px;
text-decoration:none;
font-size:13px;
}

`

  ]

})

export class FindDoctorsComponent implements OnInit {

  doctors: any[] = []

  filteredDoctors: any[] = []

  locations: string[] = []

  searchTerm = ''

  locationFilter = ''

  loading = true


  constructor(

    private doctorService: DoctorService,

    private route: ActivatedRoute,

    private cdr: ChangeDetectorRef

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

      next: (res: any[]) => {

        // SHOW ONLY APPROVED DOCTORS

        this.doctors = res.filter(

          d => d.verification_status === 'approved'

        )


        // BUILD LOCATION FILTER LIST

        this.locations = [

          ...new Set(

            this.doctors

              .map(d => d.clinic_location)

              .filter(Boolean)

          )

        ]


        this.filterDoctors()

        this.loading = false

        this.cdr.detectChanges()

      },


      error: () => {

        this.loading = false

        this.cdr.detectChanges()

      }

    })

  }



  filterDoctors() {

    const term = this.searchTerm.toLowerCase()

    const loc = this.locationFilter.toLowerCase()


    this.filteredDoctors = this.doctors.filter(d => {

      const name = (d.name || '')

        .toLowerCase()

        .includes(term)


      const spec = (d.specialization || '')

        .toLowerCase()

        .includes(term)


      const location =

        !loc ||

        (d.clinic_location || '')

          .toLowerCase()

          .includes(loc)


      return (name || spec) && location

    })


  }



  getProfileImage(path: string) {

    if (!path) {

      return 'https://ui-avatars.com/api/?name=Doctor&background=2563eb&color=fff'

    }


    if (path.startsWith('http')) {

      return path

    }


    return `http://localhost:5000/${path}`

  }

}