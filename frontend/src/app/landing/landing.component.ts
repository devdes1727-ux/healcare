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
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="hero">
  <div class="hero-content">
    <span class="badge">Trusted Healthcare Platform</span>
    <h1>Find Trusted Doctors Near You</h1>
    <p>Book clinic visits or online consultations instantly with verified specialists.</p>

    <div class="search-wrapper">
      <div class="search-bar">
        <input placeholder="Doctor name or specialization" [(ngModel)]="searchQuery" (input)="onSearchInput()"/>
        <input placeholder="City" [(ngModel)]="locationQuery" (input)="onLocationInput()"/>
        <button (click)="performSearch()">Search</button>
      </div>

      <div class="suggestions" *ngIf="showDoctorSuggestions">
        <div class="suggestion" *ngFor="let doc of filteredDoctors" (click)="selectDoctor(doc)">
          <img *ngIf="doc.profile_image" [src]="getProfileImage(doc.profile_image)" class="suggestion-img"/>
          <span>{{doc.name}}</span>
          <small>{{doc.specialization}}</small>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section how-it-works">
  <h2>How HealCare Works</h2>
  <div class="steps">
    <div class="step"><div class="icon">🔍</div><h4>Search Doctor</h4><p>Find specialists by name, location or expertise.</p></div>
    <div class="step"><div class="icon">📅</div><h4>Book Appointment</h4><p>Select clinic visit or online consultation instantly.</p></div>
    <div class="step"><div class="icon">💬</div><h4>Consult Easily</h4><p>Connect securely with verified doctors anytime.</p></div>
  </div>
</section>

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

<section class="section reviews-section">
  <h2>Hear from our Community</h2>

  <div class="marquee-wrapper">
    <div class="marquee marquee-ltr">
      <div class="review-pill" *ngFor="let r of allReviews">
        <img [src]="getProfileImage(r.reviewerImage)" class="pill-img"/>
        <div class="pill-content">
          <strong>{{r.reviewerName}}</strong>
          <p>"{{r.comment}}"</p>
        </div>
      </div>
      <div class="review-pill" *ngFor="let r of allReviews">
        <img [src]="getProfileImage(r.reviewerImage)" class="pill-img"/>
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
        <img [src]="getProfileImage(r.reviewerImage)" class="pill-img"/>
        <div class="pill-content">
          <strong>{{r.reviewerName}}</strong>
          <p>"{{r.comment}}"</p>
        </div>
      </div>
      <div class="review-pill patient-pill" *ngFor="let r of allReviews.slice().reverse()">
        <img [src]="getProfileImage(r.reviewerImage)" class="pill-img"/>
        <div class="pill-content">
          <strong>{{r.reviewerName}}</strong>
          <p>"{{r.comment}}"</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="about-wrapper">
  <div class="about-hero">
    <div class="hero-left">
      <h1>About HealCare</h1>
      <p>A smart healthcare platform connecting patients and doctors in one seamless system. Manage appointments, walk-ins, payments, and consultations effortlessly.</p>
      <div class="btns">
        <button class="primary" routerLink="/patient-dashboard/doctors">Book Appointment</button>
        <button class="secondary">Explore Features</button>
      </div>
    </div>
    <div class="hero-right">
      <div class="stat-card">
        <div><h2>10K+</h2><p>Patients</p></div>
        <div><h2>500+</h2><p>Doctors</p></div>
        <div><h2>24/7</h2><p>Support</p></div>
      </div>
    </div>
  </div>

  <div class="mission">
    <h2>Our Mission</h2>
    <p>To simplify healthcare access using technology. We reduce waiting time, improve doctor-patient communication, and bring digital transformation to clinics and hospitals.</p>
  </div>

  <div class="features">
    <h2>Why HealCare?</h2>
    <div class="features-grid">
      <div class="card"><h3>⚡ Instant Booking</h3><p>Patients can book appointments in seconds without delays.</p></div>
      <div class="card"><h3>📅 Smart Scheduling</h3><p>Doctors can manage online, offline, and walk-in schedules easily.</p></div>
      <div class="card"><h3>💳 Secure Payments</h3><p>Integrated payments with commission tracking and revenue insights.</p></div>
      <div class="card"><h3>📊 Analytics Dashboard</h3><p>Real-time insights for doctors: patients, earnings, performance.</p></div>
    </div>
  </div>

  <div class="cta">
    <h2>Start Your Healthcare Journey Today</h2>
    <p>Join thousands of patients and doctors already using HealCare.</p>
    <button routerLink="/register">Get Started</button>
  </div>
</section>

<footer class="footer">
  <div class="footer-grid">
    <div><h3>HealCare</h3><p>Smart healthcare appointment platform connecting patients with trusted doctors.</p></div>
    <div><h4>Quick Links</h4><a routerLink="/">Home</a><a routerLink="/patient-dashboard/doctors">Find Doctors</a><a>Contact</a></div>
    <div><h4>Services</h4><p>Online Consultation</p><p>Clinic Booking</p><p>Health Records</p></div>
    <div><h4>Support</h4><p>support@healcare.com</p><p>+91 6382354944</p></div>
  </div>
  <div class="footer-bottom">© 2026 HealCare SaaS Platform</div>
</footer>
  `,
  styles: [`
.hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}
.hero h1 {
  font-size: 48px;
  margin: 20px 0;
  color: #1e293b;
  font-weight: 800;
}
.hero p {
  font-size: 18px;
  color: #64748b;
}
.badge {
  background: #dbeafe;
  color: #2563eb;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}
.search-wrapper {
  max-width: 700px;
  margin: 30px auto;
  position: relative;
}
.search-bar {
  display: flex;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.search-bar input {
  flex: 1;
  padding: 18px;
  border: none;
  outline: none;
  font-size: 16px;
}
.search-bar button {
  background: #2563eb;
  color: white;
  padding: 18px 35px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background .2s;
}
.search-bar button:hover {
  background: #1d4ed8;
}
.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
  z-index: 100;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.suggestion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background .15s;
}
.suggestion:hover {
  background: #f1f5f9;
}
.suggestion-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.section {
  width: 90%;
  max-width: 1200px;
  margin: 80px auto;
  text-align: center;
}
.section h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.how-it-works {
  background: #f8fafc;
  padding: 80px 40px;
  border-radius: 30px;
}
.steps {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-top: 40px;
}
.step {
  background: var(--bg-card, white);
  padding: 35px;
  border-radius: 24px;
  width: 280px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  transition: .3s;
  border: 1px solid #e2e8f0;
}
.step:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 30px rgba(0,0,0,.1);
}
.step .icon {
  font-size: 36px;
  margin-bottom: 16px;
}
.step h4 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}
.step p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.doctor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 40px;
}
.doctor-card {
  background: var(--bg-card, white);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  cursor: pointer;
  transition: .3s;
  border: 1px solid #e2e8f0;
  text-align: center;
}
.doctor-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 30px rgba(0,0,0,.1);
}
.doctor-card h4 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 6px;
}
.doctor-card p {
  font-size: 14px;
  color: #2563eb;
  margin: 0 0 6px;
}
.doctor-card span {
  font-size: 13px;
  color: #94a3b8;
}
.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  overflow: hidden;
  margin: 0 auto 20px;
  background: #e0e7ff;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #2563eb;
}

.reviews-section {
  overflow: hidden;
  padding: 60px 0;
  width: 100%;
  max-width: 100%;
}
.reviews-section h2 {
  margin-bottom: 40px;
}
.marquee-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
}
.marquee {
  display: flex;
  gap: 20px;
  width: max-content;
}
.marquee-ltr {
  animation: scroll-ltr 40s linear infinite;
}
.marquee-rtl {
  animation: scroll-rtl 40s linear infinite;
}
.marquee-wrapper:hover .marquee {
  animation-play-state: paused;
}
@keyframes scroll-ltr {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
@keyframes scroll-rtl {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.review-pill {
  background: var(--bg-card, white);
  padding: 15px 25px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  min-width: 300px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.patient-pill {
  background: #f0f7ff;
}
.pill-img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2563eb;
  flex-shrink: 0;
}
.pill-content {
  text-align: left;
}
.pill-content strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.pill-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
.mt-4 {
  margin-top: 20px;
}

.about-wrapper {
  padding: 80px 10%;
  background: var(--bg-main, #f8fafc);
}
.about-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  margin-bottom: 80px;
}
.hero-left {
  flex: 1;
  min-width: 280px;
}
.hero-left h1 {
  font-size: 42px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 16px;
}
.hero-left p {
  font-size: 16px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 28px;
}
.btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btns .primary {
  background: #2563eb;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s;
}
.btns .primary:hover {
  background: #1d4ed8;
}
.btns .secondary {
  background: white;
  color: #2563eb;
  padding: 14px 28px;
  border: 2px solid #2563eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}
.btns .secondary:hover {
  background: #eff6ff;
}
.hero-right {
  flex: 1;
  min-width: 240px;
}
.stat-card {
  padding: 36px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  display: flex;
  gap: 30px;
  justify-content: center;
  border: 1px solid #e2e8f0;
}
.stat-card div {
  text-align: center;
}
.stat-card h2 {
  font-size: 32px;
  font-weight: 800;
  color: #2563eb;
  margin: 0;
}
.stat-card p {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0;
}

.mission {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 80px;
}
.mission h2 {
  font-size: 30px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}
.mission p {
  font-size: 16px;
  color: #64748b;
  line-height: 1.8;
}

.features {
  text-align: center;
  margin-bottom: 80px;
}
.features h2 {
  font-size: 30px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 36px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.card {
  padding: 30px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  text-align: left;
  border: 1px solid #e2e8f0;
  transition: .3s;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 28px rgba(0,0,0,.1);
}
.card h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #1e293b;
}
.card p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

.cta {
  padding: 60px 40px;
  border-radius: 28px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: white;
  text-align: center;
}
.cta h2 {
  font-size: 30px;
  font-weight: 800;
  margin: 0 0 12px;
}
.cta p {
  font-size: 16px;
  opacity: .85;
  margin: 0 0 28px;
}
.cta button {
  background: white;
  color: #2563eb;
  padding: 14px 36px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}
.cta button:hover {
  transform: scale(1.03);
}

.footer {
  background: #0f172a;
  color: white;
  padding: 80px 20px;
  border-radius: 50px 50px 0 0;
  margin-top: 0;
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}
.footer h3 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 12px;
}
.footer h4 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #e2e8f0;
}
.footer p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 6px;
}
.footer a {
  display: block;
  color: #94a3b8;
  margin: 8px 0;
  text-decoration: none;
  font-size: 14px;
  transition: .2s;
}
.footer a:hover {
  color: white;
}
.footer-bottom {
  text-align: center;
  margin-top: 60px;
  padding-top: 30px;
  border-top: 1px solid #1e293b;
  color: #64748b;
  font-size: 14px;
}
  `]
})
export class LandingComponent implements OnInit {

  searchQuery = '';
  locationQuery = '';
  doctors: any[] = [];
  featuredDoctors: any[] = [];
  filteredDoctors: any[] = [];
  showDoctorSuggestions = false;

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

  loadDoctors() {
    this.doctorService.getDoctors().subscribe((docs: any[]) => {
      this.doctors = docs;
      this.featuredDoctors = docs.slice(0, 4);
      this.cdr.detectChanges();
    });
  }

  loadReviews() {
    this.reviewService.getPlatformReviews().subscribe(res => {
      if (res && res.length > 0) {
        this.allReviews = res;
        this.cdr.detectChanges();
      }
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
    this.cdr.detectChanges();
  }

  selectDoctor(doc: any) {
    this.searchQuery = doc.name;
    this.showDoctorSuggestions = false;
    this.performSearch();
  }

  performSearch() {
    this.router.navigate(['/patient-dashboard/doctors'], {
      queryParams: { search: this.searchQuery, location: this.locationQuery }
    });
  }

  openDoctor(doc: any) {
    this.router.navigate([doc.slug ? `/doctor/${doc.slug}` : `/doctor/${doc.id}`]);
  }
}