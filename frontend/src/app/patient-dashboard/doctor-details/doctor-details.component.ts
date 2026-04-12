import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ScheduleService } from '../../services/schedule.service';

declare var window: any;

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="loading" class="text-center py-20">
      <div class="spinner mx-auto"></div>
      <p class="text-muted mt-4">Loading doctor profile...</p>
    </div>
    
    <div *ngIf="!loading && !doctor" class="empty-state text-center py-12 border rounded bg-card">
      <div class="text-4xl mb-4">🩺</div>
      <h3>Doctor not found</h3>
      <p class="text-muted mb-6">The doctor profile you are looking for might have been moved or removed.</p>
      <button class="btn btn-outline" (click)="goBack()">Go Back to Search</button>
    </div>

    <div *ngIf="doctor" class="details-container animate-fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Col: Profile info -->
        <div class="lg:col-span-1">
          <div class="card p-8 text-center sticky-info">
            <div class="avatar-container mx-auto mb-6">
              <div class="avatar-img" *ngIf="doctor.profile_image" [style.backgroundImage]="'url(' + doctor.profile_image + ')'"></div>
              <div class="avatar-init" *ngIf="!doctor.profile_image">{{ (doctor.name || 'D').charAt(0) }}</div>
              <div class="verified-badge" *ngIf="doctor.is_verified" title="Verified Professional">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            
            <h2 class="m-0 mb-1 text-2xl font-bold">Dr. {{ doctor.name }}</h2>
            <p class="text-primary font-bold m-0 mb-6 px-4 py-1 bg-primary-alpha rounded-full inline-block">{{ doctor.specialization }}</p>

            <div class="stats-row flex justify-around mb-8 border-y py-4">
              <div class="stat-item">
                <span class="stat-value">{{ doctor.experience_years }}+</span>
                <span class="stat-label">Years Exp.</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ doctor.total_consultations || 450 }}+</span>
                <span class="stat-label">Patients</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">4.9/5</span>
                <span class="stat-label">Rating</span>
              </div>
            </div>

            <div class="info-list text-left">
              <div class="info-item mb-6">
                <label>Clinic / Hospital</label>
                <div class="value flex items-start gap-2">
                  <span class="icon">🏥</span>
                  <span>
                    <strong>{{ doctor.clinic_name || 'HealCare Specialist Center' }}</strong><br>
                    <small class="text-muted">{{ doctor.clinic_location }}</small>
                  </span>
                </div>
              </div>

              <div class="info-item mb-6">
                <label>Consultation Fee</label>
                <div class="value flex items-center gap-2">
                  <span class="icon">💰</span>
                  <span class="text-2xl font-bold text-green-600">\${{ doctor.consultation_fee }}</span>
                  <span class="text-xs text-muted">Incl. GST</span>
                </div>
              </div>
            </div>

            <button class="btn btn-ghost w-full mt-4 text-primary font-bold" (click)="openReviews()">
              View Other Patient Reviews &rarr;
            </button>
          </div>
        </div>

        <!-- Right Col: Booking slots -->
        <div class="lg:col-span-2">
          <div class="card p-8">
            <h3 class="m-0 mb-8 flex items-center gap-3">
              <span class="bg-primary text-white p-2 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              Book Your Appointment
            </h3>
            
            <div class="booking-step mb-8">
              <h4 class="mb-4 text-sm uppercase tracking-wider text-muted font-bold">1. Select Appointment Date</h4>
              <div class="days-container flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                <div *ngFor="let day of availableDays" 
                  class="day-card" 
                  [class.active]="selectedDate === day.fullDate"
                  (click)="selectDate(day)">
                  <span class="day-name">{{ day.name }}</span>
                  <span class="day-date">{{ day.dateNumber }} {{ day.month }}</span>
                  <span class="day-status" *ngIf="day.hasSlots">{{ day.slotsCount }} Slots</span>
                  <span class="day-status no-slots" *ngIf="!day.hasSlots">Fully Booked</span>
                </div>
              </div>
            </div>

            <div class="booking-step mb-8" *ngIf="selectedDate">
              <h4 class="mb-4 text-sm uppercase tracking-wider text-muted font-bold">2. Select Available Time Range</h4>
              <div class="slots-grid flex flex-wrap gap-4">
                <div *ngIf="daySlots.length === 0" class="text-muted italic py-4">No slots available for this day.</div>
                <button *ngFor="let slot of daySlots" 
                  class="slot-btn animate-scale-in" 
                  (click)="selectedSlot = slot" 
                  [class.active]="selectedSlot?.id === slot.id">
                  {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                </button>
              </div>
            </div>
            
            <div class="booking-step mb-8">
              <h4 class="mb-4 text-sm uppercase tracking-wider text-muted font-bold">3. Choose Consultation Mode</h4>
              <div class="flex gap-4">
                <label class="mode-card flex-1" [class.active]="selectedType === 'online'">
                  <input type="radio" name="type" value="online" [(ngModel)]="selectedType" class="hidden"> 
                  <div class="mode-icon">🌐</div>
                  <div class="mode-text">
                    <span class="title">Online Consult</span>
                    <span class="desc">High-quality Video & Audio</span>
                  </div>
                  <div class="mode-check"></div>
                </label>
                <label class="mode-card flex-1" [class.active]="selectedType === 'offline'">
                  <input type="radio" name="type" value="offline" [(ngModel)]="selectedType" class="hidden"> 
                  <div class="mode-icon">🏢</div>
                  <div class="mode-text">
                    <span class="title">Visit Clinic</span>
                    <span class="desc">Face-to-face Consultation</span>
                  </div>
                  <div class="mode-check"></div>
                </label>
              </div>
            </div>

            <div class="payment-summary bg-secondary-alpha p-6 rounded-2xl">
              <div class="flex justify-between items-center mb-6">
                <div>
                  <p class="text-sm text-muted m-0">Consultation Fee</p>
                  <h3 class="m-0 mt-1 font-bold text-3xl text-main">\${{ doctor.consultation_fee }}</h3>
                </div>
                <div class="payment-options flex gap-3">
                  <div
                    class="pay-badge"
                    [class.active]="selectedPayment === 'card'"
                    (click)="selectedPayment = 'card'"
                  >
                    <span class="pay-icon">💳</span>
                    Card / Net Banking
                  </div>
                  <div
                    class="pay-badge"
                    [class.active]="selectedPayment === 'upi'"
                    (click)="selectedPayment = 'upi'"
                  >
                    <span class="pay-icon">📱</span>
                    UPI (GooglePay / PhonePe)
                  </div>
                </div>
              </div>
              <button class="btn btn-primary w-full py-4 text-lg font-bold shadow-blue" [disabled]="booking" (click)="confirmBooking()">
                {{ booking ? 'Preparing Secure Checkout...' : 'Confirm Appointment & Pay' }}
              </button>
              <p class="text-center text-xs text-muted mt-4 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure 256-bit encrypted payment via Razorpay
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal (Hidden by default) -->
    <div class="modal-backdrop" *ngIf="showReviewModal" (click)="showReviewModal = false">
      <div class="modal-card max-w-lg" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
            <h3 class="m-0">Patient Reviews</h3>
            <button class="close-btn" (click)="showReviewModal = false">&times;</button>
        </div>
        <div class="reviews-list">
            <div class="review-item mb-6 pb-6 border-b" *ngFor="let r of mockReviews">
                <div class="flex justify-between mb-2">
                    <span class="font-bold">{{r.name}}</span>
                    <span class="text-yellow-500">★★★★★</span>
                </div>
                <p class="text-muted text-sm italic">"{{r.text}}"</p>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
    .card { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-light); }
    .sticky-info { position: sticky; top: 100px; }
    
    .avatar-container {
      width: 120px;
      height: 120px;
      position: relative;
    }
    .avatar-img, .avatar-init {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color);
      color: white;
      font-size: 3rem;
      font-weight: bold;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .verified-badge {
      position: absolute;
      bottom: 5px;
      right: 5px;
      background: #10b981;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--bg-card);
    }

    .stat-item { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.125rem; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

    .info-item label { display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; letter-spacing: 0.5px; }
    .info-item .icon { font-size: 1.25rem; }

    /* Booking UI */
    .day-card {
      min-width: 100px;
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--bg-card);
    }
    .day-card:hover { transform: translateY(-2px); border-color: var(--primary-color); }
    .day-card.active { border-color: var(--primary-color); background: rgba(37, 99, 235, 0.05); box-shadow: 0 8px 15px -10px var(--primary-color); position: relative; }
    .day-card.active::after { content: ''; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); border: 10px solid transparent; border-top-color: var(--primary-color); }
    .day-name { display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
    .day-date { display: block; font-size: 1.1rem; font-weight: 800; margin: 0.25rem 0; }
    .day-status { display: block; font-size: 0.7rem; color: #10b981; font-weight: 700; }
    .day-status.no-slots { color: #ef4444; }

    .slot-btn {
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border-light);
      background: var(--bg-main);
      color: var(--text-main);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .slot-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .slot-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); transform: scale(1.05); }

    .mode-card {
      border: 2px solid var(--border-light);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .mode-card:hover { border-color: var(--primary-color); }
    .mode-card.active { border-color: var(--primary-color); background: rgba(37, 99, 235, 0.03); }
    .mode-icon { font-size: 2rem; }
    .mode-text .title { display: block; font-weight: 800; font-size: 1rem; }
    .mode-text .desc { display: block; font-size: 0.75rem; color: var(--text-muted); }
    .mode-check { position: absolute; top: 1rem; right: 1rem; width: 20px; height: 20px; border: 2px solid var(--border-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .mode-card.active .mode-check { border-color: var(--primary-color); background: var(--primary-color); }
    .mode-card.active .mode-check::after { content: '✓'; color: white; font-size: 12px; font-weight: bold; }

    .pay-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      background: var(--bg-main);
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border-light);
    }
    .pay-badge.active { border-color: var(--primary-color); color: var(--primary-color); }

    .shadow-blue { box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); }
    
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-card { background: var(--bg-card); padding: 2.5rem; border-radius: 24px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); max-height: 80vh; overflow-y: auto; }
    .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--text-muted); }

    @media (max-width: 768px) {
      .stats-row { flex-wrap: wrap; gap: 1rem; }
      .mode-card { flex-direction: column; text-align: center; gap: 0.5rem; }
    }
  `]
})
export class DoctorDetailsComponent implements OnInit {
  doctor: any = null;
  loading = true;
  booking = false;

  availableDays: any[] = [];
  selectedDate: string = '';
  daySlots: any[] = [];
  selectedSlot: any = null;
  selectedType: 'online' | 'offline' = 'online';
  selectedPayment: 'card' | 'upi' = 'card';

  showReviewModal = false;
  mockReviews = [
    { name: 'John Peterson', text: 'Excellent doctor, very patient and explained everything clearly.' },
    { name: 'Aria Stark', text: 'Found the consultation very helpful. The video quality was great.' },
    { name: 'Bruce Wayne', text: 'Professional demeanor and very thorough examination of my medical history.' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private scheduleService: ScheduleService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDoctorDetails(id);
    }
  }

  fetchDoctorDetails(id: string) {
    this.loading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (res) => {
        this.doctor = res;
        this.generateAvailableDays();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load doctor profile');
        this.loading = false;
      }
    });
  }

  generateAvailableDays() {
    this.scheduleService.getSlotsByDoctorId(this.doctor.id).subscribe({
      next: (slots: any) => {
        const days = [];
        const today = new Date();

        for (let i = 1; i <= 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);

          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const dateString = date.toISOString().split('T')[0];

          const daySlots = slots.filter((s: any) => s.available_day === dayName);

          days.push({
            fullDate: dateString,
            name: dayName,
            dateNumber: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            hasSlots: daySlots.length > 0,
            slotsCount: daySlots.length,
            slots: daySlots
          });
        }
        this.availableDays = days;
      },
      error: () => this.toastService.error('Failed to load availability')
    });
  }

  selectDate(day: any) {
    if (!day.hasSlots) {
      this.toastService.warning('No available slots for this day');
      return;
    }
    this.selectedDate = day.fullDate;
    this.daySlots = day.slots;
    this.selectedSlot = null;
  }

  formatTime(time: string) {
    if (!time) return '';
    let [h, m] = time.split(':');
    let hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    hNum = hNum % 12 || 12;
    return `${hNum}:${m} ${ampm}`;
  }

  openReviews() {
    this.showReviewModal = true;
  }

  goBack() {
    this.router.navigate(['/patient-dashboard/doctors']);
  }

  confirmBooking() {
    // Requirement 30: Validation alert message
    if (!this.selectedSlot) {
      this.toastService.error('Please select an appointment time slot');
      return;
    }
    if (!this.selectedType) {
      this.toastService.error('Please select a consultation mode');
      return;
    }

    this.booking = true;

    const bookingData = {
      doctorId: this.doctor.id,
      date: this.selectedDate,
      timeSlot: this.selectedSlot.start_time,
      type: this.selectedType
    };

    this.appointmentService.bookAppointment(bookingData).subscribe({
      next: (res) => {
        this.initiateRazorpay(res);
      },
      error: () => {
        this.booking = false;
        this.toastService.error('Failed to initiate booking');
      }
    });
  }

  initiateRazorpay(res: any) {
    const options = {
      key: 'rzp_test_SHaxEvQdfSKk6c',
      amount: this.doctor.consultation_fee * 100,
      currency: 'INR',
      name: 'HealCare Platform',
      description: `Consultation with Dr. ${this.doctor.name}`,
      method: {
        upi: this.selectedPayment === 'upi',
        card: this.selectedPayment === 'card',
        netbanking: this.selectedPayment === 'card'
      },
      handler: (response: any) => {
        this.appointmentService.mockPaymentSuccess(res.appointment.id).subscribe(() => {
          this.toastService.success('Booking Successful! Appointment Confirmed.');
          this.router.navigate(['/patient-dashboard/appointments']);
        });
      },
      prefill: {
        name: localStorage.getItem('name') || 'Patient',
        email: 'patient@healcare.com'
      },
      theme: { color: '#2563eb' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    this.booking = false;
  }
}
