import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-public-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doctor-profile" *ngIf="doctor">
      <header class="profile-header">
        <div class="container">
           <img [src]="getProfileImage(doctor.profile_image)" class="profile-img" />
           <div class="info">
              <h1>Dr. {{ doctor.name }}</h1>
              <p class="spec">{{ doctor.specialization }}</p>
              <p class="exp">{{ doctor.experience_years }}+ Years Experience</p>
           </div>
        </div>
      </header>

      <div class="container main-content">
         <div class="details-card">
            <p>Specialist in {{ doctor.specialization }} with over {{ doctor.experience_years }} years of clinical practice.</p>
            
            <div class="meta-row">
               <span>🧬 System:</span>
               <strong>{{ doctor.treatment_system || 'Allopathy' }}</strong>
            </div>

            <div class="meta-row">
               <span>🏥 Clinic:</span>
               <strong>{{ doctor.clinic_name }}</strong>
            </div>
            <div class="meta-row">
               <span>📍 Location:</span>
               <strong>{{ doctor.clinic_location }}</strong>
            </div>
            <div class="meta-row">
               <span>💰 Consultation Fee:</span>
               <strong>₹{{ doctor.consultation_fee }}</strong>
            </div>
            <div class="meta-row">
               <span>🗣️ Languages:</span>
               <strong>{{ doctor.languages_spoken || 'English' }}</strong>
            </div>
         </div>

         <div class="booking-card">
            <h3>Book Appointment</h3>
            <p>Ready to consult? Choose a slot and book instantly.</p>
            <button class="btn-primary">Check Availability</button>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .doctor-profile { font-family: 'Outfit', sans-serif; }
    .profile-header { background: #0f172a; color: white; padding: 60px 0; }
    .container { max-width: 1000px; margin: auto; padding: 0 20px; }
    .container.main-content { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-top: -40px; }
    
    .profile-header .container { display: flex; gap: 40px; align-items: center; }
    .profile-img { width: 150px; height: 150px; border-radius: 30px; object-fit: cover; border: 5px solid rgba(255,255,255,0.1); }
    
    .info h1 { margin: 0; font-size: 36px; }
    .spec { font-size: 20px; color: #94a3b8; margin: 10px 0; }
    
    .details-card, .booking-card { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .meta-row { margin: 15px 0; display: flex; gap: 10px; font-size: 16px; }
    .meta-row span { color: #64748b; min-width: 150px; }
    
    .btn-primary { width: 100%; background: #2563eb; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 20px; }
    
    @media (max-width: 768px) {
      .container.main-content { grid-template-columns: 1fr; margin-top: 20px; }
      .profile-header .container { flex-direction: column; text-align: center; }
    }
  `]
})
export class PublicDoctorProfileComponent implements OnInit {
  doctor: any;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.doctorService.getDoctorBySlug(slug).subscribe(res => {
        this.doctor = res;
        this.setSEO();
      });
    }
  }

  setSEO() {
    this.title.setTitle(`Dr. ${this.doctor.name} - ${this.doctor.specialization} In ${this.doctor.clinic_location}`);
    this.meta.updateTag({ name: 'description', content: `Book an appointment with Dr. ${this.doctor.name}, a specialist in ${this.doctor.specialization} located in ${this.doctor.clinic_location}. ₹${this.doctor.consultation_fee} fee.` });
    
    // Add Schema Markup
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Physician",
      "name": `Dr. ${this.doctor.name}`,
      "image": this.getProfileImage(this.doctor.profile_image),
      "medicalSpecialty": this.doctor.specialization,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": this.doctor.clinic_location
      }
    });
    document.head.appendChild(script);
  }

  getProfileImage(path: string) {
    if (!path) return 'https://ui-avatars.com/api/?name=Doctor&background=2563eb&color=fff';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path}`;
  }
}
