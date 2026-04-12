import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
  <main>
    <!-- Hero Section -->
    <section class="hero w-full">
      <div class="container">
        <div class="hero-content animate-fade-in flex flex-col items-center text-center">
          <span class="badge">Healthcare SaaS Platform</span>
          <h1 class="hero-title">Premium Healthcare At Your Fingertips.</h1>
          <p class="hero-subtitle">Book appointments with verified top-tier doctors in seconds. Experience seamless online and offline consultations with secure records.</p>
          
          <div class="search-bar-container w-full max-w-800">
            <div class="search-bar flex w-full">
              <div class="input-group flex-2">
                <input type="text" 
                  [(ngModel)]="searchQuery" 
                  (input)="onSearchInput()"
                  placeholder="Search by doctor name or specialization" 
                  class="search-input">
                <div class="suggestions" *ngIf="showDoctorSuggestions && filteredDoctors.length > 0">
                  <div class="suggestion-item" *ngFor="let doc of filteredDoctors" (click)="selectDoctor(doc)">
                    <span class="doc-name">{{doc.name}}</span>
                    <span class="doc-spec">{{doc.specialization}}</span>
                  </div>
                </div>
              </div>
              <div class="input-group flex-1">
                <input type="text" 
                  [(ngModel)]="locationQuery" 
                  (input)="onLocationInput()"
                  placeholder="Location" 
                  class="search-input location">
                <div class="suggestions" *ngIf="showLocationSuggestions && filteredLocations.length > 0">
                  <div class="suggestion-item" *ngFor="let loc of filteredLocations" (click)="selectLocation(loc)">
                    {{loc}}
                  </div>
                </div>
              </div>
              <button class="btn btn-primary search-btn" (click)="performSearch()">Find Doctor</button>
            </div>
          </div>
          
          <div class="trust-badges flex gap-8 items-center mt-8">
            <div class="trust-item">
              <strong>10k+</strong> Verified Doctors
            </div>
            <div class="trust-item">
              <strong>50k+</strong> Happy Patients
            </div>
            <div class="trust-item">
              <strong>4.9/5</strong> App Rating
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works container mt-8 mb-8 text-center">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-grid">
        <div class="step-card card">
          <div class="step-icon">1</div>
          <h3>Search Doctor</h3>
          <p>Find the best doctor based on specialization, rating, and location.</p>
        </div>
        <div class="step-card card">
          <div class="step-icon">2</div>
          <h3>Book Appointment</h3>
          <p>Choose an available slot and book your appointment instantly.</p>
        </div>
        <div class="step-card card">
          <div class="step-icon">3</div>
          <h3>Get Consulted</h3>
          <p>Attend via video call or visit the clinic in person.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials container my-12 py-12">
      <h2 class="section-title text-center">What Our Patients Say</h2>
      <div class="testimonials-grid">
        <div class="testimonial-card card" *ngFor="let t of testimonials">
          <div class="rating">
            <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= t.rating">★</span>
          </div>
          <p class="testimonial-text">"{{t.text}}"</p>
          <div class="testimonial-author">
            <div class="author-info">
              <h4 class="author-name">{{t.name}}</h4>
              <p class="author-meta">{{t.location}}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Section -->
    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-icon">+</span>
            <span class="logo-text">HealCare</span>
          </div>
          <p class="mt-4 text-muted">A premium healthcare management platform designed for doctors and patients to provide seamless care.</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/patient-dashboard/doctors">Find Doctors</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Services</h4>
          <ul>
            <li><a href="#">Online Consultations</a></li>
            <li><a href="#">Clinic Visits</a></li>
            <li><a href="#">Health Records</a></li>
            <li><a href="#">Doctor Search</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h4>Contact Info</h4>
          <p>Email: support@healcare.com</p>
          <p>Phone: +1 (234) 567-890</p>
          <div class="social-links mt-4">
            <!-- Social Icons would go here -->
          </div>
        </div>
      </div>
      <div class="footer-bottom text-center py-6 mt-8 border-t border-light">
        <p>&copy; 2024 HealCare SaaS. All rights reserved.</p>
      </div>
    </footer>
  </main>
  `,
  styles: [`
    /* Hero Section */
    .hero {
      padding: 6rem 0 4rem;
      background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-main) 100%);
    }
    .badge {
      background: rgba(37, 99, 235, 0.1);
      color: var(--primary-color);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      max-width: 800px;
      color: var(--text-main);
    }
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      max-width: 600px;
      margin-bottom: 3rem;
    }

    /* Search Bar */
    .search-bar-container {
      position: relative;
      z-index: 10;
    }
    .search-bar {
      background: var(--bg-card);
      padding: 0.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-light);
    }
    .input-group {
      position: relative;
    }
    .search-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      color: var(--text-main);
      outline: none;
    }
    .search-input.location {
      border-left: 1px solid var(--border-light);
    }
    .search-btn {
      border-radius: var(--radius-md);
      padding: 1rem 2rem;
      margin-left: 0.5rem;
    }

    .suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      box-shadow: var(--shadow-md);
      max-height: 250px;
      overflow-y: auto;
      text-align: left;
    }
    .suggestion-item {
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
    }
    .suggestion-item:hover {
      background: var(--bg-secondary);
    }
    .doc-spec {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .testimonial-card {
      padding: 2rem;
    }
    .rating {
      color: #fbbf24;
      margin-bottom: 1rem;
    }
    .testimonial-text {
      font-style: italic;
      color: var(--text-main);
      margin-bottom: 1.5rem;
    }
    .author-name {
      font-weight: 700;
      margin: 0;
    }
    .author-meta {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    /* Footer */
    .footer {
      background: var(--bg-secondary);
      padding: 4rem 0 0;
      margin-top: 4rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    .footer-brand .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .footer-links h4, .footer-contact h4 {
      margin-bottom: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .footer-links ul {
      list-style: none;
      padding: 0;
    }
    .footer-links li {
      margin-bottom: 0.75rem;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: var(--primary-color);
    }
    .footer-contact p {
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    /* Sections */
    .section-title {
      font-size: 2.5rem;
      margin-bottom: 3rem;
      font-weight: 700;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .step-card {
      padding: 2rem;
      text-align: center;
    }
    .step-icon {
      width: 60px;
      height: 60px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto 1.5rem;
    }

    @media (max-width: 992px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 576px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
      .search-bar {
        flex-direction: column;
      }
      .search-input.location {
        border-left: none;
        border-top: 1px solid var(--border-light);
      }
      .search-btn {
        margin-left: 0;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  searchQuery: string = '';
  locationQuery: string = '';
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  filteredLocations: string[] = [];
  showDoctorSuggestions: boolean = false;
  showLocationSuggestions: boolean = false;

  testimonials = [
    { name: 'Sarah Johnson', location: 'New York', text: 'HealCare made it so easy to find a specialist for my condition. The booking process was seamless!', rating: 5 },
    { name: 'Michael Chen', location: 'San Francisco', text: 'I love the video consultation feature. It saved me hours of commute and waiting time.', rating: 5 },
    { name: 'Emily Davis', location: 'Chicago', text: 'The interface is very clean and professional. I can easily manage all my family appointments in one place.', rating: 4 }
  ];

  locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

  constructor(private doctorService: DoctorService, private router: Router) {}

  ngOnInit() {
    this.doctorService.getDoctors().subscribe(data => {
      this.doctors = data;
    });
  }

  onSearchInput() {
    if (this.searchQuery.length > 1) {
      this.filteredDoctors = this.doctors.filter(d => 
        d.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (d.specialization && d.specialization.toLowerCase().includes(this.searchQuery.toLowerCase()))
      ).slice(0, 5);
      this.showDoctorSuggestions = true;
    } else {
      this.showDoctorSuggestions = false;
    }
  }

  onLocationInput() {
    if (this.locationQuery.length > 0) {
      this.filteredLocations = this.locations.filter(l => 
        l.toLowerCase().includes(this.locationQuery.toLowerCase())
      ).slice(0, 5);
      this.showLocationSuggestions = true;
    } else {
      this.showLocationSuggestions = false;
    }
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

  performSearch() {
    this.router.navigate(['/patient-dashboard/doctors'], { 
      queryParams: { 
        search: this.searchQuery, 
        location: this.locationQuery 
      } 
    });
  }
}

