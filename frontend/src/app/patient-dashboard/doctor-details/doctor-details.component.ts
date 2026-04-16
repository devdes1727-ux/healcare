import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    <div class="page-root" *ngIf="doctor">

      <div *ngIf="loading" class="loading-screen">
        <div class="loading-orb"></div>
        <p class="loading-text">Loading availability…</p>
      </div>

      <div *ngIf="!loading" class="layout">

        <!-- ── LEFT PANEL ── -->
        <aside class="panel-left">

          <!-- Hero -->
          <div class="profile-hero">
            <div style="display: flex; gap: 20px;">
              <div class="avatar-wrap">
                <div class="avatar-img" *ngIf="doctor.profile_image" [style.backgroundImage]="'url(' + doctor.profile_image + ')'"></div>
                <div class="avatar-placeholder" *ngIf="!doctor.profile_image">{{ (doctor.name || 'D').charAt(0) }}</div>
                <span class="badge-verified" *ngIf="doctor.is_verified">✓</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <h1 class="doc-name">Dr. {{ doctor.name }}</h1>
                <span class="doc-spec">{{ doctor.specialization }}</span>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-pill">
                <span class="stat-val">{{ doctor.experience_years }}+</span>
                <span class="stat-lbl">Years</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-pill">
                <span class="stat-val">4.9</span>
                <span class="stat-lbl">Rating</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-pill">
                <span class="stat-val">₹{{ doctor.consultation_fee }}</span>
                <span class="stat-lbl">Fee</span>
              </div>
            </div>
            <div>
              <h5 class="section-label">About</h5>
              <p class="about-text">
                Dr. {{ doctor.name }} is a highly qualified {{ doctor.specialization }} with over
                {{ doctor.experience_years }} years of clinical expertise. Known for a patient-centric
                approach at {{ doctor.clinic_name }}.
              </p>
            </div>
          </div>

          <!-- Info Rows -->
          <div class="section-card info-list">
            <div class="info-item">
              <span class="info-ico">📍</span>
              <div>
                <span class="info-lbl">Clinic</span>
                <span class="info-val">{{ doctor.clinic_location }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-ico">📜</span>
              <div>
                <span class="info-lbl">Education</span>
                <span class="info-val">MBBS, MD – {{ doctor.specialization }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-ico">🌐</span>
              <div>
                <span class="info-lbl">Languages</span>
                <span class="info-val">English, Tamil, Hindi</span>
              </div>
            </div>
          </div>

          <!-- Reviews peek -->
          <div class="section-card">
            <div class="reviews-header">
              <h5 class="section-label">Patient Reviews</h5>
              <button class="link-btn" (click)="openReviews()">View all</button>
            </div>
            <div class="reviews-peek">
              <div class="review-card" *ngFor="let r of mockReviews.slice(0,2)">
                <div class="reviewer-row">
                  <div class="reviewer-av">{{ r.name.charAt(0) }}</div>
                  <div>
                    <span class="reviewer-name">{{ r.name }}</span>
                    <span class="stars">★★★★★</span>
                  </div>
                </div>
                <p class="review-text">"{{ r.text }}"</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── RIGHT PANEL ── -->
        <main class="panel-right">
          <div class="booking-card">

            <!-- Header -->
            <div class="booking-header">
              <div>
                <p class="booking-eyebrow">Schedule a Consultation</p>
                <h2 class="booking-title">Book Appointment</h2>
              </div>
              <div class="fee-tag">₹{{ doctor.consultation_fee }}</div>
            </div>

            <div class="booking-body">

              <!-- Step 1: Date -->
              <div class="step-section">
                <div class="step-head">
                  <span class="step-num">01</span>
                  <h4 class="step-title">Choose a Date</h4>
                </div>
                <div class="date-track">
                  <div *ngFor="let day of availableDays"
                    class="date-tile"
                    [class.active]="selectedDate === day.fullDate"
                    [class.disabled]="!day.hasSlots"
                    (click)="selectDate(day)">
                    <span class="tile-month">{{ day.month }}</span>
                    <span class="tile-day">{{ day.dateNumber }}</span>
                    <span class="tile-week">{{ day.name.substring(0,3) }}</span>
                    <span class="tile-dot" *ngIf="day.hasSlots"></span>
                  </div>
                </div>
              </div>

              <!-- Step 2: Slots -->
              <div class="step-section" *ngIf="selectedDate">
                <div class="step-head">
                  <span class="step-num">02</span>
                  <h4 class="step-title">Select a Time Slot</h4>
                </div>
                <div *ngIf="daySlots.length === 0" class="empty-slots">No slots available for this date.</div>
                <div class="slots-grid">
                  <button *ngFor="let slot of daySlots"
                    class="slot-btn"
                    [class.active]="selectedSlot?.id === slot.id"
                    (click)="selectedSlot = slot">
                    {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                  </button>
                </div>
              </div>

              <!-- Step 3: Mode -->
              <div class="step-section">
                <div class="step-head">
                  <span class="step-num">03</span>
                  <h4 class="step-title">Consultation Mode</h4>
                </div>
                <div class="mode-grid">
                  <label class="mode-tile" [class.active]="selectedType === 'online'">
                    <input type="radio" value="online" [(ngModel)]="selectedType" class="sr-only">
                    <span class="mode-icon">🎥</span>
                    <span class="mode-label">Online Call</span>
                    <span class="mode-sub">Video / Audio</span>
                  </label>
                  <label class="mode-tile" [class.active]="selectedType === 'offline'">
                    <input type="radio" value="offline" [(ngModel)]="selectedType" class="sr-only">
                    <span class="mode-icon">🏢</span>
                    <span class="mode-label">Clinic Visit</span>
                    <span class="mode-sub">In-person</span>
                  </label>
                </div>
              </div>

              <!-- Payment -->
              <div class="step-section">
                <div class="step-head">
                  <span class="step-num">04</span>
                  <h4 class="step-title">Payment Method</h4>
                </div>
                <div class="pay-grid">
                  <div class="pay-tile" [class.active]="selectedPayment === 'card'" (click)="selectedPayment = 'card'">
                    <span class="pay-icon">💳</span>
                    <div>
                      <span class="pay-label">Card / NetBanking</span>
                      <span class="pay-sub">Visa, Mastercard, Net</span>
                    </div>
                    <span class="pay-radio" [class.checked]="selectedPayment === 'card'"></span>
                  </div>
                  <div class="pay-tile" [class.active]="selectedPayment === 'upi'" (click)="selectedPayment = 'upi'">
                    <span class="pay-icon">📱</span>
                    <div>
                      <span class="pay-label">UPI / Wallets</span>
                      <span class="pay-sub">GPay, PhonePe, Paytm</span>
                    </div>
                    <span class="pay-radio" [class.checked]="selectedPayment === 'upi'"></span>
                  </div>
                </div>
              </div>

              <!-- Summary strip -->
              <div class="summary-strip" *ngIf="selectedSlot">
                <div class="summary-item">
                  <span class="sum-lbl">Date</span>
                  <span class="sum-val">{{ selectedDate }}</span>
                </div>
                <div class="summary-item">
                  <span class="sum-lbl">Time</span>
                  <span class="sum-val">{{ formatTime(selectedSlot.start_time) + " - " + formatTime(selectedSlot.end_time)}}</span>
                </div>
                <div class="summary-item">
                  <span class="sum-lbl">Mode</span>
                  <span class="sum-val">{{ selectedType === 'online' ? 'Online Call' : 'Clinic Visit' }}</span>
                </div>
                <div class="summary-item">
                  <span class="sum-lbl">Total</span>
                  <span class="sum-val sum-price">₹{{ doctor.consultation_fee }}</span>
                </div>
              </div>

              <!-- CTA -->
              <button class="cta-btn" [disabled]="booking || !selectedSlot" (click)="confirmBooking()">
                <ng-container *ngIf="!booking">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Confirm & Pay ₹{{ doctor.consultation_fee }}
                </ng-container>
                <ng-container *ngIf="booking">
                  <span class="spin-ring"></span> Processing…
                </ng-container>
              </button>

              <p class="secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                256-bit SSL · Secured by Razorpay
              </p>

            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Review Modal -->
    <div class="modal-overlay" *ngIf="showReviewModal" (click)="showReviewModal = false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-top">
          <h3 class="modal-title">Patient Testimonials</h3>
          <button class="modal-close" (click)="showReviewModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-reviews">
          <div class="modal-review" *ngFor="let r of mockReviews">
            <div class="modal-rev-row">
              <div class="modal-av">{{ r.name.charAt(0) }}</div>
              <div>
                <span class="modal-rev-name">{{ r.name }}</span>
                <span class="stars">★★★★★</span>
              </div>
              <span class="modal-score">5.0</span>
            </div>
            <p class="modal-rev-text">"{{ r.text }}"</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

    :host {
      --c-bg: #F0F4FF;
      --c-surface: #FFFFFF;
      --c-border: #E2E8F6;
      --c-primary: #3B5BDB;
      --c-primary-dark: #2F4AC0;
      --c-primary-light: #EEF2FF;
      --c-primary-glow: rgba(59,91,219,0.18);
      --c-text: #0F1B3D;
      --c-muted: #64748B;
      --c-accent: #F59E0B;
      --c-green: #10B981;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
      --shadow-lg: 0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
      --r-card: 24px;
      --r-sm: 12px;
      font-family: 'DM Sans', sans-serif;
      display: block;
      background: var(--c-bg);
      min-height: 100vh;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page-root {
      min-height: 100vh;
      padding: 32px 24px 60px;
      background: var(--c-bg);
      background-image: radial-gradient(ellipse at 20% 10%, rgba(59,91,219,0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(245,158,11,0.04) 0%, transparent 50%);
    }

    /* Loading */
    .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; }
    .loading-orb { width: 52px; height: 52px; border-radius: 50%; border: 3px solid var(--c-border); border-top-color: var(--c-primary); animation: spin 0.9s linear infinite; }
    .loading-text { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600; color: var(--c-muted); }

    /* Layout */
    .layout {display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }

    /* Panels */
    .panel-left { display: flex; flex-direction: column; gap: 16px; }
    .panel-right {}

    /* Profile Hero */
    .profile-hero {
      background: var(--c-surface);
      border-radius: var(--r-card);
      padding: 20px;
      display: inline-block;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--c-border);
      position: relative;
      overflow: hidden;
    }
    .profile-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, var(--c-primary-light) 0%, transparent 50%);
      pointer-events: none;
    }

    .avatar-wrap { position: relative; width: 108px; height: 108px; margin-bottom: 20px; }
    .avatar-img { width: 100%; height: 100%; border-radius: 28px; background-size: cover; background-position: center;border: 3px solid white; }
    .avatar-placeholder { width: 100%; height: 100%; border-radius: 28px; background: linear-gradient(135deg, var(--c-primary) 0%, #5B7FEE 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; font-family: 'Sora', sans-serif; }
    .badge-verified { position: absolute; bottom: -4px; right: -4px; background: var(--c-green); color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; border: 3px solid white; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }

    .doc-name { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--c-text); letter-spacing: -0.5px;display: inline-block; }
    .doc-spec { font-size: 0.875rem; font-weight: 500; color: var(--c-primary);}

    .stats-row { display: flex; align-items: center; gap: 0; background: var(--c-bg); border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--c-border); }
    .stat-pill { padding: 10px 20px; text-align: center; }
    .stat-divider { width: 1px; height: 30px; background: var(--c-border); }
    .stat-val { display: block; font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 800; color: var(--c-text); }
    .stat-lbl { display: block; font-size: 0.65rem; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

    /* Section Card */
    .section-card { background: var(--c-surface); border-radius: var(--r-card); padding: 22px; box-shadow: var(--shadow-sm); border: 1px solid var(--c-border); }
    .section-label { font-family: 'Sora', sans-serif; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--c-muted); margin-bottom: 12px; }
    .about-text { font-size: 0.875rem; line-height: 1.7; color: var(--c-muted); }

    .info-list { display: flex; flex-direction: column; gap: 16px; }
    .info-item { display: flex; gap: 12px; align-items: flex-start; }
    .info-ico { font-size: 1.1rem; background: var(--c-bg); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--c-border); }
    .info-lbl { display: block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--c-muted); }
    .info-val { display: block; font-size: 0.875rem; font-weight: 600; color: var(--c-text); margin-top: 2px; }

    .reviews-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .link-btn { background: none; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: var(--c-primary); font-family: inherit; }
    .reviews-peek { display: flex; flex-direction: column; gap: 12px; }
    .review-card { background: var(--c-bg); border-radius: var(--r-sm); padding: 14px; border: 1px solid var(--c-border); }
    .reviewer-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .reviewer-av { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, var(--c-primary) 0%, #5B7FEE 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; font-family: 'Sora', sans-serif; }
    .reviewer-name { display: block; font-size: 0.8rem; font-weight: 700; color: var(--c-text); }
    .stars { color: #F59E0B; font-size: 0.65rem; display: block; }
    .review-text { font-size: 0.8rem; color: var(--c-muted); line-height: 1.5; font-style: italic; }

    /* Booking Card */
    .booking-card { background: var(--c-surface); border-radius: 28px; box-shadow: var(--shadow-lg); border: 1px solid var(--c-border); overflow: hidden; }

    .booking-header {
      background: linear-gradient(135deg, #3B5BDB 0%, #2F4AC0 100%);
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .booking-header::after {
      content: '';
      position: absolute;
      right: -40px; top: -40px;
      width: 160px; height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .booking-eyebrow { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.65); margin-bottom: 4px; }
    .booking-title { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: white; letter-spacing: -0.3px; }
    .fee-tag { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 10px 18px; font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 800; color: white; }

    .booking-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

    /* Steps */
    .step-section {}
    .step-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .step-num { font-family: 'Sora', sans-serif; font-size: 0.65rem; font-weight: 800; color: var(--c-primary); background: var(--c-primary-light); padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px; }
    .step-title { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: var(--c-text); }

    /* Dates */
    .date-track { display: flex; gap: 10px; overflow-x: auto; padding: 8px; scrollbar-width: none; }
    .date-track::-webkit-scrollbar { display: none; }
    .date-tile {
      min-width: 68px;
      padding: 14px 10px 10px;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: 18px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      position: relative;
      flex-shrink: 0;
    }
    .date-tile:hover:not(.disabled) { border-color: #97ABEE; background: white; transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .date-tile.active { border-color: var(--c-primary); background: var(--c-primary-light); transform: translateY(-3px); box-shadow: 0 6px 20px var(--c-primary-glow); }
    .date-tile.disabled { opacity: 0.35; cursor: not-allowed; }
    .tile-month { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: var(--c-muted); letter-spacing: 0.5px; }
    .tile-day { font-family: 'Sora', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--c-text); line-height: 1; }
    .date-tile.active .tile-day { color: var(--c-primary); }
    .tile-week { font-size: 0.6rem; font-weight: 600; color: var(--c-muted); }
    .tile-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--c-green); margin-top: 4px; }
    .date-tile.active .tile-dot { background: var(--c-primary); }

    /* Slots */
    .empty-slots { color: var(--c-muted); font-size: 0.875rem; background: var(--c-bg); padding: 16px; border-radius: var(--r-sm); text-align: center; }
    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
    .slot-btn {
      padding: 13px 10px;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-sm);
      font-size: 0.85rem;
      font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      color: var(--c-text);
      cursor: pointer;
      transition: all 0.2s;
    }
    .slot-btn:hover { border-color: #97ABEE; background: white; }
    .slot-btn.active { background: var(--c-primary); border-color: var(--c-primary); color: white; box-shadow: 0 6px 16px var(--c-primary-glow); transform: scale(1.03); }

    /* Mode */
    .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .mode-tile {
      padding: 10px;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: 18px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }
    .mode-tile:hover { border-color: #97ABEE; background: white; }
    .mode-tile.active { border-color: var(--c-primary); background: var(--c-primary-light); box-shadow: 0 4px 16px var(--c-primary-glow); }
    .mode-icon { font-size: 1.6rem;margin-right: 10px;}
    .mode-label { font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700; color: var(--c-text); }
    .mode-sub { font-size: 0.72rem; color: var(--c-muted); }

    /* Payment */
    .pay-grid { display: flex; flex-direction: row; gap: 20px; }
    .pay-tile {
      padding: 16px;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: var(--r-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.2s;
    }
    .pay-tile:hover { border-color: #97ABEE; background: white; }
    .pay-tile.active { border-color: var(--c-primary); background: var(--c-primary-light); }
    .pay-icon { font-size: 1.4rem; }
    .pay-tile > div { flex: 1; }
    .pay-label { display: block; font-size: 0.875rem; font-weight: 700; color: var(--c-text); }
    .pay-sub { display: block; font-size: 0.72rem; color: var(--c-muted); margin-top: 2px; }
    .pay-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--c-border); flex-shrink: 0; transition: all 0.2s; }
    .pay-radio.checked { border-color: var(--c-primary); background: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-light); }

    /* Summary Strip */
    .summary-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      background: var(--c-bg);
      border: 1.5px solid var(--c-border);
      border-radius: 16px;
      overflow: hidden;
    }
    .summary-item { padding: 14px 16px; border-right: 1px solid var(--c-border); }
    .summary-item:last-child { border-right: none; }
    .sum-lbl { display: block; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--c-muted); margin-bottom: 4px; }
    .sum-val { display: block; font-size: 0.8rem; font-weight: 700; color: var(--c-text); }
    .sum-price { color: var(--c-primary); font-family: 'Sora', sans-serif; font-size: 0.95rem; }

    /* CTA */
    .cta-btn {
      width: 100%;
      padding: 20px;
      background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
      color: white;
      border: none;
      border-radius: 18px;
      font-family: 'Sora', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 8px 24px var(--c-primary-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      letter-spacing: -0.2px;
    }
    .cta-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(59,91,219,0.3); }
    .cta-btn:active:not(:disabled) { transform: translateY(-1px); }
    .cta-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    .secure-note { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.72rem; font-weight: 600; color: var(--c-muted); opacity: 0.7; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,27,61,0.6); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.2s ease; }
    .modal-box { background: var(--c-surface); border-radius: 24px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); overflow: hidden; animation: slideUp 0.3s ease; }
    .modal-top { padding: 24px 24px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--c-border); }
    .modal-title { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--c-text); }
    .modal-close { background: var(--c-bg); border: none; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-muted); transition: 0.2s; }
    .modal-close:hover { background: #FEE2E2; color: #EF4444; }
    .modal-reviews { padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 18px; max-height: 400px; overflow-y: auto; }
    .modal-review { background: var(--c-bg); border-radius: 16px; padding: 18px; border: 1px solid var(--c-border); }
    .modal-rev-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .modal-av { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--c-primary) 0%, #5B7FEE 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; font-family: 'Sora', sans-serif; }
    .modal-rev-name { display: block; font-size: 0.875rem; font-weight: 700; color: var(--c-text); }
    .modal-score { margin-left: auto; font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 800; color: var(--c-accent); }
    .modal-rev-text { font-size: 0.875rem; color: var(--c-muted); line-height: 1.6; font-style: italic; }

    /* Utilities */
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
    .spin-ring { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.35); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; vertical-align: middle; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .summary-strip { grid-template-columns: 1fr 1fr; }
      .summary-item:nth-child(2) { border-right: none; }
    }
    @media (max-width: 480px) {
      .page-root { padding: 16px 12px 60px; }
      .booking-body { padding: 20px; }
      .summary-strip { grid-template-columns: 1fr 1fr; }
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.fetchDoctorDetails(id);
  }

  fetchDoctorDetails(id: string) {
    this.loading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (res) => {
        this.doctor = res;
        this.generateAvailableDays();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load doctor profile');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateAvailableDays() {
    this.scheduleService.getSlotsByDoctorId(this.doctor.id).subscribe({
      next: (slots: any) => {
        const today = new Date();
        this.availableDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() + i + 1);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const dateString = date.toISOString().split('T')[0];
          const daySlots = slots.filter((s: any) => s.available_day === dayName);
          return {
            fullDate: dateString,
            name: dayName,
            dateNumber: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            hasSlots: daySlots.length > 0,
            slots: daySlots
          };
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load availability');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectDate(day: any) {
    if (!day.hasSlots) { this.toastService.warning('No available slots for this day'); return; }
    this.selectedDate = day.fullDate;
    this.daySlots = day.slots;
    this.selectedSlot = null;
  }

  formatTime(time: string) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    return `${hNum % 12 || 12}:${m} ${ampm}`;
  }

  openReviews() { this.showReviewModal = true; }

  confirmBooking() {

    // ✅ check slot first
    if (!this.selectedSlot) {
      this.toastService.error('Please select a time slot');
      return;
    }

    // ✅ build slot range safely (HH:mm-HH:mm)
    const slotRange =
      this.selectedSlot.start_time.substring(0, 5)
      + '-'
      + this.selectedSlot.end_time.substring(0, 5);


    // ✅ prevent double-click booking
    if (this.booking) return;

    this.booking = true;


    this.appointmentService.bookAppointment({
      doctorId: this.doctor.id,
      date: this.selectedDate,
      timeSlot: slotRange,
      type: this.selectedType
    })
      .subscribe({

        next: (res) => {

          this.booking = false;

          if (!res?.appointment?.id) {
            this.toastService.error('Invalid booking response');
            return;
          }

          // ✅ move to payment
          this.initiateRazorpay(res);

        },

        error: (err) => {

          console.error(err);

          this.booking = false;

          this.toastService.error(
            err?.error?.message || 'Failed to initiate booking'
          );

        }

      });

  }
  initiateRazorpay(res: any) {
    const rzp = new window.Razorpay({
      key: 'rzp_test_SHaxEvQdfSKk6c',
      amount: this.doctor.consultation_fee * 100,
      currency: 'INR',
      name: 'HealCare Platform',
      description: `Consultation with Dr. ${this.doctor.name}`,
      method: { upi: this.selectedPayment === 'upi', card: this.selectedPayment === 'card', netbanking: this.selectedPayment === 'card' },
      handler: () => {
        this.appointmentService.mockPaymentSuccess(res.appointment.id).subscribe(() => {
          this.toastService.success('Booking Confirmed!');
          this.router.navigate(['/patient-dashboard/appointments']);
        });
      },
      prefill: { name: localStorage.getItem('name') || 'Patient', email: 'patient@healcare.com' },
      theme: { color: '#3B5BDB' }
    });
    rzp.open();
    this.booking = false;
  }
}