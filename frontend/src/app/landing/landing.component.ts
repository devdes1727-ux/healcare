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
import { ReviewService } from '../services/review.service';

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
<span class="badge">Trusted Healthcare Platform</span>
<h1>Find Trusted Doctors Near You</h1>
<p>Book clinic visits or online consultations instantly with verified specialists.</p>

<!-- SEARCH BAR -->
<div class="search-wrapper">
<div class="search-bar">
<input placeholder="Doctor name or specialization" [(ngModel)]="searchQuery" (input)="onSearchInput()"/>
<input placeholder="City" [(ngModel)]="locationQuery" (input)="onLocationInput()"/>
<button (click)="performSearch()">Search</button>
</div>

<!-- DOCTOR SUGGESTIONS -->
<div class="suggestions" *ngIf="showDoctorSuggestions">
<div class="suggestion" *ngFor="let doc of filteredDoctors" (click)="selectDoctor(doc)">
<img *ngIf="doc.profile_image" [src]="getProfileImage(doc.profile_image)" class="suggestion-img"/>
<span>{{doc.name}}</span>
<small>{{doc.specialization}}</small>
</div>
</div>
</div>
</div>

<!-- HOW IT WORKS -->
<section class="section how-it-works">
<h2>How HealCare Works</h2>
<div class="steps">
<div class="step"><div class="icon">🔍</div><h4>Search Doctor</h4><p>Find specialists by name, location or expertise.</p></div>
<div class="step"><div class="icon">📅</div><h4>Book Appointment</h4><p>Select clinic visit or online consultation instantly.</p></div>
<div class="step"><div class="icon">💬</div><h4>Consult Easily</h4><p>Connect securely with verified doctors anytime.</p></div>
</div>
</section>

<!-- MOTION GRAPHIC REVIEWS -->
<section class="section reviews-section">
  <h2>Hear from our Community</h2>
  
  <div class="marquee-wrapper">
    <div class="marquee marquee-ltr">
      <div class="review-pill" *ngFor="let r of allReviews">
         <img [src]="getProfileImage(r.reviewerImage)" class="pill-img" />
         <div class="pill-content">
            <strong>{{r.reviewerName}}</strong>
            <p>"{{r.comment}}"</p>
         </div>
      </div>
      <!-- Duplicate for loop -->
      <div class="review-pill" *ngFor="let r of allReviews">
         <img [src]="getProfileImage(r.reviewerImage)" class="pill-img" />
         <div class="pill-content">
            <strong>{{r.reviewerName}}</strong>
            <p>"{{r.comment}}"</p>
         </div>
      </div>
    </div>
  </div>

  <div class="marquee-wrapper mt-4">
    <div class="marquee marquee-rtl">
      <div class="review-pill patient-pill" *ngFor="let r of allReviews.slice().reverse()">
         <img [src]="getProfileImage(r.reviewerImage)" class="pill-img" />
         <div class="pill-content">
            <strong>{{r.reviewerName}}</strong>
            <p>"{{r.comment}}"</p>
         </div>
      </div>
       <!-- Duplicate for loop -->
       <div class="review-pill patient-pill" *ngFor="let r of allReviews.slice().reverse()">
         <img [src]="getProfileImage(r.reviewerImage)" class="pill-img" />
         <div class="pill-content">
            <strong>{{r.reviewerName}}</strong>
            <p>"{{r.comment}}"</p>
         </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURED DOCTORS -->
<section class="section">
<h2>Top Rated Doctors</h2>
<div class="doctor-grid">
<div class="doctor-card" *ngFor="let doc of featuredDoctors" (click)="openDoctor(doc)">
<div class="avatar-wrapper">
<img *ngIf="doc.profile_image" [src]="getProfileImage(doc.profile_image)" class="avatar-img"/>
<div *ngIf="!doc.profile_image" class="avatar-fallback">{{doc.name[0]}}</div>
</div>
<h4>{{doc.name}}</h4>
<p>{{doc.specialization}}</p>
<span>{{doc.clinic_location}}</span>
</div>
</div>
</section>

<!-- FOOTER -->
<footer class="footer">
<div class="footer-grid">
<div><h3>HealCare</h3><p>Smart healthcare appointment platform connecting patients with trusted doctors.</p></div>
<div><h4>Quick Links</h4><a routerLink="/">Home</a><a routerLink="/patient-dashboard/doctors">Find Doctors</a><a>Contact</a></div>
<div><h4>Services</h4><p>Online Consultation</p><p>Clinic Booking</p><p>Health Records</p></div>
<div><h4>Support</h4><p>support@healcare.com</p><p>+91 6382354944</p></div>
</div>
<div class="footer-bottom">© 2026 HealCare SaaS Platform</div>
</footer>
</section>
`,

  styles: [`
.hero{ text-align:center; padding: 60px 20px; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); }
.hero h1{ font-size:48px; margin:20px 0; color: #1e293b; font-weight: 800; }
.search-wrapper{ max-width:700px; margin:30px auto; position:relative; }
.search-bar{ display:flex; background:white; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,.05); overflow:hidden; border: 1px solid #e2e8f0; }
.search-bar input{ flex:1; padding:18px; border:none; outline:none; font-size: 16px; }
.search-bar button{ background:#2563eb; color:white; padding:18px 35px; border:none; cursor:pointer; font-weight: 600; }

.section{ width: 90%; max-width: 1200px; margin:80px auto; text-align:center; }
.how-it-works{ background:#f8fafc; padding:80px 20px; border-radius: 30px; }
.steps{ display:flex; justify-content:center; gap:30px; flex-wrap:wrap; margin-top: 40px; }
.step{ background: var(--bg-card); padding:35px; border-radius:24px; width:280px; box-shadow: var(--shadow-sm); transition: .3s; color: var(--text-main); border: 1px solid var(--border-light); }
.step:hover { transform: translateY(-10px); box-shadow: var(--shadow-md); }

/* REVIEWS MARQUEE */
.reviews-section { overflow: hidden; padding: 60px 0; }
.marquee-wrapper { width: 100%; overflow: hidden; position: relative; display: flex; }
.marquee { display: flex; gap: 20px; width: max-content; }
.marquee-ltr { animation: scroll-ltr 40s linear infinite; }
.marquee-rtl { animation: scroll-rtl 40s linear infinite; }

@keyframes scroll-ltr { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
@keyframes scroll-rtl { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.review-pill { background: var(--bg-card); padding: 15px 25px; border-radius: 50px; display: flex; align-items: center; gap: 15px; box-shadow: var(--shadow-sm); min-width: 300px; border: 1px solid var(--border-light); color: var(--text-main); }
.patient-pill { background: var(--bg-secondary); }
.pill-img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color); }
.pill-content { text-align: left; }
.pill-content strong { display: block; font-size: 14px; color: var(--text-main); }
.pill-content p { font-size: 13px; color: var(--text-muted); margin: 0; white-space: nowrap; }

.doctor-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:25px; margin-top: 40px; }
.doctor-card{ background: var(--bg-card); padding:30px; border-radius:24px; box-shadow: var(--shadow-sm); cursor:pointer; transition:.3s; border: 1px solid var(--border-light); color: var(--text-main); }
.doctor-card:hover{ transform:translateY(-10px); box-shadow: var(--shadow-md); }
.avatar-wrapper{ width:80px; height:80px; border-radius:24px; overflow:hidden; margin:0 auto 20px; background: var(--bg-secondary); }
.avatar-img{ width:100%; height:100%; object-fit:cover; }

.footer{ background:#0f172a; color:white; padding:80px 20px; margin-top: 100px; border-radius: 50px 50px 0 0; }
.footer-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:40px; max-width: 1200px; margin: auto; }
.footer a{ display:block; color:#94a3b8; margin:8px 0; text-decoration: none; transition: .2s; }
.footer a:hover { color: white; }
.footer-bottom{ text-align:center; margin-top:60px; padding-top: 30px; border-top: 1px solid #1e293b; color: #64748b; }

.mt-4 { margin-top: 20px; }
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

  allReviews: any[] = [
    { reviewerName: 'Dr. Sarah Wilson', comment: 'The platform helps me manage my slots efficiently.', reviewerImage: '' },
    { reviewerName: 'Rahul Sharma', comment: 'Found a great specialist within minutes!', reviewerImage: '' },
    { reviewerName: 'Dr. James Bond', comment: 'Commission structure is very fair.', reviewerImage: '' },
    { reviewerName: 'Priya Verma', comment: 'The online consultation was seamless.', reviewerImage: '' },
    { reviewerName: 'Ankit Gupta', comment: 'My digital health records are finally organized.', reviewerImage: '' }
  ];

  constructor(
    private doctorService: DoctorService,
    private reviewService: ReviewService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadDoctors();
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getPlatformReviews().subscribe(res => {
      if (res && res.length > 0) {
        this.allReviews = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe((docs: any[]) => {
      this.doctors = docs;
      this.featuredDoctors = docs.slice(0, 4);
      this.specializations = [...new Set(docs.map(d => d.specialization))].slice(0, 8);
      this.filteredLocations = [...new Set(docs.map(d => d.clinic_location))];
      this.cdr.detectChanges();
    });
  }

  getProfileImage(path: string) {
    if (!path) return 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path}`;
  }

  onSearchInput() {
    if (this.searchQuery.length > 1) {
      const term = this.searchQuery.toLowerCase();
      this.filteredDoctors = this.doctors.filter(d => 
        d.name.toLowerCase().includes(term) || 
        (d.specialization || '').toLowerCase().includes(term) ||
        (d.treatment_system || '').toLowerCase().includes(term)
      ).slice(0, 5);
      this.showDoctorSuggestions = true;
    } else {
      this.showDoctorSuggestions = false;
    }
    this.cdr.detectChanges();
  }

  onLocationInput() {
    this.showLocationSuggestions = true;
    this.cdr.detectChanges();
  }

  selectDoctor(doc: any) {
    this.searchQuery = doc.name;
    this.showDoctorSuggestions = false;
    this.performSearch();
  }

  selectLocation(loc: string) {
    this.locationQuery = loc;
    this.showLocationSuggestions = false;
    this.cdr.detectChanges();
  }

  quickSearch(spec: string) {
    this.router.navigate(['/patient-dashboard/doctors'], { queryParams: { search: spec } });
  }

  performSearch() {
    this.router.navigate(['/patient-dashboard/doctors'], { queryParams: { search: this.searchQuery, location: this.locationQuery } });
  }

  openDoctor(doc: any) {
    if (doc.slug) {
      this.router.navigate(['/doctor', doc.slug]);
    } else {
      this.router.navigate(['/doctor', doc.id]);
    }
  }

}
