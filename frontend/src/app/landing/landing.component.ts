import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';

@Component({

  selector: 'app-landing',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `


<!-- HERO SECTION -->

<section class="hero">

<div class="hero-content">

<span class="badge">
Trusted Healthcare Platform
</span>

<h1>
Find Trusted Doctors Near You
</h1>

<p>
Book clinic visits or online consultations instantly with verified specialists.
</p>


<!-- SEARCH BAR -->

<div class="search-wrapper">

<div class="search-bar">

<input
placeholder="Doctor name or specialization"
[(ngModel)]="searchQuery"
(input)="onSearchInput()"
/>

<input
placeholder="City"
[(ngModel)]="locationQuery"
(input)="onLocationInput()"
/>

<button (click)="performSearch()">
Search
</button>

</div>


<!-- DOCTOR SUGGESTIONS -->

<div
class="suggestions"
*ngIf="showDoctorSuggestions"
>

<div
class="suggestion"
*ngFor="let doc of filteredDoctors"
(click)="selectDoctor(doc)"
>

<img
*ngIf="doc.profile_image"
[src]="getProfileImage(doc.profile_image)"
class="suggestion-img"
/>

<span>
{{doc.name}}
</span>

<small>
{{doc.specialization}}
</small>

</div>

</div>


<!-- LOCATION SUGGESTIONS -->

<div
class="suggestions"
*ngIf="showLocationSuggestions"
>

<div
class="suggestion"
*ngFor="let loc of filteredLocations"
(click)="selectLocation(loc)"
>
{{loc}}
</div>

</div>

</div>




<!-- FEATURES -->

<section class="section">

<h2>Platform Features</h2>

<div class="feature-grid">

<div class="feature">
📅 Easy Appointment Scheduling
</div>

<div class="feature">
💬 Online Consultation Support
</div>

<div class="feature">
📁 Digital Health Records
</div>

<div class="feature">
🔔 Smart Notifications
</div>

</div>

</section>


<!-- HOW IT WORKS -->

<section class="section how-it-works">

<h2>How HealCare Works</h2>

<div class="steps">

<div class="step">
<div class="icon">🔍</div>
<h4>Search Doctor</h4>
<p>Find specialists by name, location or expertise.</p>
</div>

<div class="step">
<div class="icon">📅</div>
<h4>Book Appointment</h4>
<p>Select clinic visit or online consultation instantly.</p>
</div>

<div class="step">
<div class="icon">💬</div>
<h4>Consult Easily</h4>
<p>Connect securely with verified doctors anytime.</p>
</div>

</div>

</section>



<!-- SPECIALIZATIONS -->

<section class="section">

<h2>Browse by Specialization</h2>

<div class="chips">

<span
class="chip"
*ngFor="let sp of specializations"
(click)="quickSearch(sp)"
>
{{sp}}
</span>

</div>

</section>



<!-- WHY CHOOSE US -->

<section class="section why-us">

<h2>Why Choose HealCare?</h2>

<div class="why-grid">

<div class="why-card">
<h4>Verified Doctors</h4>
<p>All specialists are verified professionals.</p>
</div>

<div class="why-card">
<h4>Instant Booking</h4>
<p>Book appointments within seconds.</p>
</div>

<div class="why-card">
<h4>Online + Clinic Visits</h4>
<p>Flexible consultation options available.</p>
</div>

<div class="why-card">
<h4>Secure Platform</h4>
<p>Your health data stays protected.</p>
</div>

</div>

</section>



<!-- FEATURED DOCTORS -->

<section class="section">

<h2>Top Doctors</h2>

<div class="doctor-grid">

<div
class="doctor-card"
*ngFor="let doc of featuredDoctors"
(click)="openDoctor(doc)"
>

<div class="avatar-wrapper">

<img
*ngIf="doc.profile_image"
[src]="getProfileImage(doc.profile_image)"
class="avatar-img"
/>

<div
*ngIf="!doc.profile_image"
class="avatar-fallback"
>
{{doc.name[0]}}
</div>

</div>

<h4>{{doc.name}}</h4>

<p>{{doc.specialization}}</p>

<span>{{doc.clinic_location}}</span>

</div>

</div>

</section>



<!-- TRUST METRICS -->

<section class="metrics">

<div>
<b>{{doctors.length}}+</b>
Doctors
</div>

<div>
<b>50k+</b>
Patients
</div>

<div>
<b>4.9★</b>
Rating
</div>

</section>



<!-- DOCTOR CTA -->

<section class="doctor-cta">

<div>

<h2>Are you a Doctor?</h2>

<p>Join HealCare and grow your practice digitally.</p>

<button routerLink="/register-doctor">
Join as Doctor
</button>

</div>

</section>



<!-- TESTIMONIALS -->

<section class="section">

  <h2>Patient Reviews</h2>

  <div class="testimonial-grid">

    <div
      class="testimonial-card"
      *ngFor="let t of testimonials"
    >

      <div class="testimonial-header">

        <img src="assets/girl.jpg" alt="profile" class="profile-img"/>

        <div>
          <strong>{{t.name}}</strong>

          <div class="stars">
            ★★★★★
          </div>
        </div>

      </div>

      <p>
        "{{t.text}}"
      </p>

    </div>

  </div>

</section>





<!-- FOOTER -->

<footer class="footer">

<div class="footer-grid">

<div>
<h3>HealCare</h3>
<p>
Smart healthcare appointment platform connecting patients with trusted doctors.
</p>
</div>

<div>
<h4>Quick Links</h4>
<a routerLink="/">Home</a>
<a routerLink="/patient-dashboard/doctors">
Find Doctors
</a>
<a>
Contact
</a>
</div>

<div>
<h4>Services</h4>
<p>Online Consultation</p>
<p>Clinic Booking</p>
<p>Health Records</p>
</div>

<div>
<h4>Support</h4>
<p>support@healcare.com</p>
<p>+91 6382354944</p>
</div>

</div>

<div class="footer-bottom">
© 2026 HealCare SaaS Platform
</div>

</footer>

`,

  styles: [`


.hero{
text-align:center;
}


.hero h1{
font-size:46px;
margin:20px 0;
}


.search-wrapper{
max-width:700px;
margin:auto;
position:relative;
}


.search-bar{
display:flex;
background:white;
border-radius:14px;
box-shadow:0 5px 20px rgba(0,0,0,.08);
overflow:hidden;
margin:20px 0px;
}


.search-bar input{
flex:1;
padding:16px;
border:none;
outline:none;
}


.search-bar button{
background:#2563eb;
color:white;
padding:16px 30px;
border:none;
cursor:pointer;
}


.suggestions{
background:white;
position:absolute;
width:100%;
box-shadow:0 4px 10px rgba(0,0,0,.1);
border-radius:8px;
margin-top:6px;
}


.suggestion{
padding:10px;
display:flex;
gap:10px;
cursor:pointer;
}


.suggestion-img{
width:35px;
height:35px;
border-radius:50%;
object-fit:cover;
}


.chips{
margin-top:20px;
display:flex;
gap:10px;
flex-wrap:wrap;
justify-content:center;
}


.chip{
background:#eef4ff;
padding:8px 14px;
border-radius:20px;
cursor:pointer;
}


.section{
  width: 80%;
  margin:60px auto;
  text-align:center;
}
h2 {
  margin-bottom: 20px;
}


.how-it-works{
background:#f8fafc;
padding:60px 20px;
}


.steps{
display:flex;
justify-content:center;
gap:40px;
flex-wrap:wrap;
}


.step{
background:white;
padding:25px;
border-radius:12px;
width:250px;
box-shadow:0 3px 12px rgba(0,0,0,.08);
}


.icon{
font-size:40px;
margin-bottom:10px;
}


.why-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:20px;
}


.why-card{
background:white;
padding:20px;
border-radius:12px;
box-shadow:0 3px 12px rgba(0,0,0,.08);
}


.doctor-grid{
display:flex;
gap:20px;
}


.doctor-card{
background:white;
padding:20px;
border-radius:12px;
box-shadow:0 3px 12px rgba(0,0,0,.08);
cursor:pointer;
transition:.2s;
}


.doctor-card:hover{
transform:translateY(-5px);
}


.avatar-wrapper{
width:60px;
height:60px;
border-radius:50%;
overflow:hidden;
margin:auto;
background:#eef4ff;
display:flex;
align-items:center;
justify-content:center;
}


.avatar-img{
width:100%;
height:100%;
object-fit:cover;
}


.metrics{
display:flex;
justify-content:center;
gap:60px;
padding:60px;
background:#f8fafc;
font-size:22px;
}


.doctor-cta{
background:#2563eb;
color:white;
text-align:center;
padding:60px 20px;
}


.doctor-cta button{
background:white;
color:#2563eb;
border:none;
padding:14px 30px;
margin-top:15px;
border-radius:8px;
cursor:pointer;
font-weight:600;
}


.testimonial-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:20px;
}


.testimonial-card{
background:white;
padding:20px;
border-radius:10px;
box-shadow:0 3px 12px rgba(0,0,0,.08);
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.stars {
  color: #ffc107;
  font-size: 14px;
}

.feature-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:20px;
}


.feature{
background:#eef4ff;
padding:20px;
border-radius:10px;
font-weight:500;
}


.footer{
background:#0f172a;
color:white;
padding:50px 20px;
}


.footer-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
gap:30px;
}


.footer a{
display:block;
color:#cbd5e1;
margin:5px 0;
}


.footer-bottom{
text-align:center;
margin-top:30px;
opacity:.7;
}

`]

})

export class LandingComponent implements OnInit {

  searchQuery = '';
  locationQuery = '';
  doctors: any[] = [];
  featuredDoctors: any[] = [];
  filteredDoctors: any[] = [];
  filteredLocations: string[] = [];
  showDoctorSuggestions = false;
  showLocationSuggestions = false;
  specializations: string[] = [];

  testimonials = [
    { name: 'Rahul Kumar', text: 'Booking appointment was super easy.' },
    { name: 'Priya Sharma', text: 'Doctor consultation online saved my time.' },
    { name: 'Ankit Verma', text: 'Very smooth healthcare experience.' }
  ];

  constructor(
    private doctorService: DoctorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadDoctors();
  }



  loadDoctors() {

    this.doctorService.getDoctors().subscribe((docs: any[]) => {

      this.doctors = docs;
      this.featuredDoctors = docs.slice(0, 4);

      this.specializations = [
        ...new Set(docs.map(d => d.specialization))
      ].slice(0, 8);

      this.filteredLocations = [
        ...new Set(docs.map(d => d.clinic_location))
      ];

      this.cdr.detectChanges();

    });

  }

  getProfileImage(path: string) {

    if (!path)
      return 'https://ui-avatars.com/api/?name=Doctor&background=2563eb&color=fff';

    if (path.startsWith('http'))
      return path;

    return `http://localhost:5000/${path}`;

  }

  onSearchInput() {

    if (this.searchQuery.length > 1) {

      this.filteredDoctors = this.doctors
        .filter(d =>
          d.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          ||
          d.specialization?.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .slice(0, 5);

      this.showDoctorSuggestions = true;

    } else {

      this.showDoctorSuggestions = false;

    }

  }

  onLocationInput() {
    this.showLocationSuggestions = true;
  }

  selectDoctor(doc: any) {

    this.searchQuery = doc.name;
    this.showDoctorSuggestions = false;
    this.performSearch();

  }

  selectLocation(loc: string) {

    this.locationQuery = loc;
    this.showLocationSuggestions = false;

  }

  quickSearch(spec: string) {

    this.router.navigate(
      ['/patient-dashboard/doctors'],
      { queryParams: { search: spec } }
    );

  }

  performSearch() {

    this.router.navigate(
      ['/patient-dashboard/doctors'],
      {
        queryParams: {
          search: this.searchQuery,
          location: this.locationQuery
        }
      }
    );

  }

  openDoctor(doc: any) {

    this.router.navigate(
      ['/doctor', doc.id]
    );

  }

}

