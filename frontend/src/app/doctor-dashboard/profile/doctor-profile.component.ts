import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="root">

      <!-- Page skeleton while loading -->
      <div class="skeleton-wrap" *ngIf="pageLoading">
        <div class="sk-header">
          <div class="sk-av"></div>
          <div class="sk-lines">
            <div class="sk-line w60"></div>
            <div class="sk-line w40"></div>
          </div>
        </div>
        <div class="sk-grid">
          <div class="sk-field" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>
      </div>

      <!-- Actual Form -->
      <form class="profile-form" (ngSubmit)="saveProfile()" #profileForm="ngForm" *ngIf="!pageLoading">

        <!-- Page Title -->
        <div class="page-head">
          <div>
            <p class="page-eyebrow">Doctor Dashboard</p>
            <h1 class="page-title">My Profile</h1>
          </div>
          <div class="head-actions">
            <span class="saved-pill" *ngIf="savedStatus">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ savedStatus }}
            </span>
            <button type="submit" class="save-btn" [disabled]="!profileForm.valid || isSaving">
              <span class="spin-ring" *ngIf="isSaving"></span>
              <svg *ngIf="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ isSaving ? 'Saving…' : 'Save Profile' }}
            </button>
          </div>
        </div>

        <div class="form-layout">

          <!-- LEFT: Avatar + Identity -->
          <div class="col-left">
            <div class="card-block">
              <h4 class="block-title">Photo & Identity</h4>

              <div class="av-section">
                <div class="av-wrap">
                  <div class="av-img"
                    [style.backgroundImage]="profile.profileImage ? 'url(' + profile.profileImage + ')' : 'none'">
                    <span class="av-placeholder" *ngIf="!profile.profileImage">
                      {{ profile.name ? profile.name.charAt(0).toUpperCase() : '?' }}
                    </span>
                    <div class="av-overlay">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>
                  <input class="av-file-input" type="file" accept="image/*" (change)="onFileSelected($event)">
                </div>
                <p class="av-hint">Click to upload · JPG, PNG, WebP</p>
                <div class="verified-row" *ngIf="profile.profileImage">
                  <span class="verified-chip">✓ Photo uploaded</span>
                </div>
              </div>

              <div class="form-field mt-20">
                <label class="field-lbl">Full Name</label>
                <div class="input-prefix-wrap">
                  <span class="input-prefix">Dr.</span>
                  <input type="text" class="field-input with-prefix" [(ngModel)]="profile.name" name="name" required placeholder="Your full name">
                </div>
              </div>

              <div class="form-field">
                <label class="field-lbl">Consultation Type</label>
                <div class="select-wrap">
                  <select class="field-input" [(ngModel)]="profile.consultationType" name="consultationType">
                    <option value="both">Online & In-Clinic</option>
                    <option value="online">Online Only</option>
                    <option value="offline">In-Clinic Only</option>
                  </select>
                  <svg class="select-caret" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Details -->
          <div class="col-right">

            <!-- Professional Details -->
            <div class="card-block">
              <h4 class="block-title">Professional Details</h4>
              <div class="fields-grid">

                <div class="form-field">
                  <label class="field-lbl">Specialization</label>
                  <input type="text" class="field-input" [(ngModel)]="profile.specialization" name="specialization" required placeholder="e.g. Cardiologist">
                </div>

                <div class="form-field">
                  <label class="field-lbl">Years of Experience</label>
                  <div class="input-suffix-wrap">
                    <input type="number" class="field-input with-suffix" [(ngModel)]="profile.experienceYears" name="experienceYears" required placeholder="0" min="0" max="60">
                    <span class="input-suffix">yrs</span>
                  </div>
                </div>

                <div class="form-field span-full">
                  <label class="field-lbl">Consultation Fee</label>
                  <div class="input-prefix-wrap">
                    <span class="input-prefix">₹</span>
                    <input type="number" class="field-input with-prefix" [(ngModel)]="profile.consultationFee" name="consultationFee" required placeholder="0" min="0">
                  </div>
                  <p class="field-hint">Amount patients pay per consultation session</p>
                </div>

              </div>
            </div>

            <!-- Clinic Info -->
            <div class="card-block">
              <h4 class="block-title">Clinic Information</h4>
              <div class="fields-grid">

                <div class="form-field">
                  <label class="field-lbl">Clinic Name</label>
                  <input type="text" class="field-input" [(ngModel)]="profile.clinicName" name="clinicName" required placeholder="e.g. HeartCare Center">
                </div>

                <div class="form-field">
                  <label class="field-lbl">Location / City</label>
                  <div class="input-prefix-wrap">
                    <span class="input-prefix">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <input type="text" class="field-input with-prefix" [(ngModel)]="profile.clinicLocation" name="clinicLocation" required placeholder="e.g. Chennai, Tamil Nadu">
                  </div>
                </div>

              </div>
            </div>

            <!-- Profile Preview Strip -->
            <div class="preview-strip" *ngIf="profile.name && profile.specialization">
              <p class="preview-label">Profile Preview</p>
              <div class="preview-card">
                <div class="preview-av">
                  <div class="prev-av-img" [style.backgroundImage]="profile.profileImage ? 'url(' + profile.profileImage + ')' : 'none'">
                    <span *ngIf="!profile.profileImage">{{ profile.name?.charAt(0) || '?' }}</span>
                  </div>
                </div>
                <div class="preview-info">
                  <span class="prev-name">Dr. {{ profile.name }}</span>
                  <span class="prev-spec">{{ profile.specialization }}</span>
                  <div class="prev-tags">
                    <span class="prev-tag" *ngIf="profile.experienceYears">{{ profile.experienceYears }}+ yrs</span>
                    <span class="prev-tag green" *ngIf="profile.consultationFee">₹{{ profile.consultationFee }}</span>
                    <span class="prev-tag blue" *ngIf="profile.clinicLocation">{{ profile.clinicLocation }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :host {
      --bg: #F0F4FF;
      --surface: #FFFFFF;
      --border: #E2E8F6;
      --primary: #3B5BDB;
      --primary-dark: #2F4AC0;
      --primary-light: #EEF2FF;
      --primary-glow: rgba(59,91,219,0.15);
      --text: #0F1B3D;
      --muted: #64748B;
      --green: #10B981;
      --green-light: #ECFDF5;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.07);
      font-family: 'DM Sans', sans-serif;
      display: block;
      background: var(--bg);
      min-height: 100vh;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .root { padding: 36px 28px 64px; max-width: 1100px; margin: 0 auto; }

    /* Skeleton */
    .skeleton-wrap { padding: 36px 28px; max-width: 1100px; margin: 0 auto; }
    .sk-header { display: flex; gap: 20px; align-items: center; margin-bottom: 32px; }
    .sk-av { width: 80px; height: 80px; border-radius: 20px; background: #E2E8F0; animation: pulse 1.4s ease-in-out infinite; flex-shrink: 0; }
    .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .sk-line { height: 14px; border-radius: 8px; background: #E2E8F0; animation: pulse 1.4s ease-in-out infinite; }
    .sk-line.w60 { width: 60%; }
    .sk-line.w40 { width: 40%; }
    .sk-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .sk-field { height: 56px; border-radius: 12px; background: #E2E8F0; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }

    /* Page Head */
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
    .page-eyebrow { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--primary); margin-bottom: 4px; }
    .page-title { font-family: 'Sora', sans-serif; font-size: 1.9rem; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }

    .head-actions { display: flex; align-items: center; gap: 12px; }

    .saved-pill {
      display: flex; align-items: center; gap: 6px;
      background: var(--green-light); color: var(--green);
      border: 1px solid #A7F3D0; border-radius: 20px;
      padding: 7px 14px; font-size: 0.78rem; font-weight: 700;
      animation: fadeIn 0.3s ease;
    }

    .save-btn {
      display: flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; border: none; border-radius: 14px;
      padding: 13px 22px; font-family: 'Sora', sans-serif;
      font-size: 0.875rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 6px 20px var(--primary-glow);
    }
    .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,91,219,0.25); }
    .save-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    /* Layout */
    .form-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }

    /* Blocks */
    .card-block { background: var(--surface); border-radius: 20px; padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); margin-bottom: 20px; }
    .block-title { font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }

    /* Avatar */
    .av-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 22px; }
    .av-wrap { position: relative; width: 100px; height: 100px; cursor: pointer; }
    .av-img {
      width: 100%; height: 100%; border-radius: 26px;
      background: var(--primary-light); background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white; box-shadow: 0 6px 20px rgba(59,91,219,0.15);
      overflow: hidden; transition: 0.2s;
    }
    .av-wrap:hover .av-img { transform: scale(1.03); }
    .av-placeholder { font-family: 'Sora', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--primary); }
    .av-overlay {
      position: absolute; inset: 0; border-radius: 26px;
      background: rgba(59,91,219,0.7); display: flex;
      align-items: center; justify-content: center; color: white;
      opacity: 0; transition: 0.2s;
    }
    .av-wrap:hover .av-overlay { opacity: 1; }
    .av-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
    .av-hint { font-size: 0.72rem; color: var(--muted); margin-top: 10px; text-align: center; }
    .verified-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--green-light); color: var(--green); border: 1px solid #A7F3D0; border-radius: 20px; padding: 4px 12px; font-size: 0.72rem; font-weight: 700; margin-top: 6px; }
    .mt-20 { margin-top: 20px; }

    /* Fields */
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .span-full { grid-column: 1 / -1; }

    .form-field { display: flex; flex-direction: column; gap: 7px; }
    .field-lbl { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); }
    .field-hint { font-size: 0.72rem; color: var(--muted); margin-top: 3px; }

    .field-input {
      width: 100%; padding: 12px 14px;
      background: var(--bg); border: 1.5px solid var(--border);
      border-radius: 12px; font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem; font-weight: 500; color: var(--text);
      outline: none; transition: all 0.2s;
      -webkit-appearance: none; appearance: none;
    }
    .field-input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-light); }
    .field-input::placeholder { color: #B0BBC8; }
    .field-input.with-prefix { padding-left: 46px; }
    .field-input.with-suffix { padding-right: 46px; }

    .input-prefix-wrap, .input-suffix-wrap { position: relative; }
    .input-prefix {
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 42px; display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: var(--muted);
      border-right: 1px solid var(--border); background: white;
      border-radius: 12px 0 0 12px; pointer-events: none;
    }
    .input-suffix {
      position: absolute; right: 0; top: 0; bottom: 0;
      width: 42px; display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; color: var(--muted);
      border-left: 1px solid var(--border); background: white;
      border-radius: 0 12px 12px 0; pointer-events: none;
    }

    .select-wrap { position: relative; }
    .select-caret { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--muted); }

    /* Preview Strip */
    .preview-strip { background: var(--surface); border-radius: 20px; padding: 20px 22px; border: 1.5px dashed var(--border); box-shadow: none; }
    .preview-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); margin-bottom: 14px; }
    .preview-card { display: flex; align-items: center; gap: 14px; }
    .preview-av {}
    .prev-av-img {
      width: 48px; height: 48px; border-radius: 14px;
      background: var(--primary-light); background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.2rem; color: var(--primary);
    }
    .preview-info { display: flex; flex-direction: column; gap: 4px; }
    .prev-name { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 800; color: var(--text); }
    .prev-spec { font-size: 0.8rem; color: var(--muted); }
    .prev-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .prev-tag { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; font-size: 0.7rem; font-weight: 700; color: var(--muted); }
    .prev-tag.green { background: var(--green-light); color: var(--green); border-color: #A7F3D0; }
    .prev-tag.blue { background: var(--primary-light); color: var(--primary); border-color: #C7D2F5; }

    .spin-ring { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; display: inline-block; animation: spin 0.8s linear infinite; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .fields-grid { grid-template-columns: 1fr; }
      .span-full { grid-column: 1; }
    }
    @media (max-width: 560px) {
      .root { padding: 20px 14px 48px; }
      .page-head { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class DoctorProfileComponent implements OnInit {
  profile: any = { consultationType: 'both', name: '' };
  savedStatus = '';
  isSaving = false;
  pageLoading = true;
  selectedFile: File | null = null;

  constructor(
    private doctorService: DoctorService,
    private toastService: ToastService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { this.fetchProfile(); }

  fetchProfile() {
    this.pageLoading = true;
    this.cdr.detectChanges();

    this.http.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (user: any) => {
        this.profile.name = user.name?.startsWith('Dr. ') ? user.name.replace('Dr. ', '') : (user.name || '');
        this.profile.profileImage = user.profile_image || '';
        if (user.role === 'doctor') {
          this.profile.specialization = user.specialization || '';
          this.profile.experienceYears = user.experience_years || 0;
          this.profile.consultationFee = user.consultation_fee || 0;
          this.profile.clinicName = user.clinic_name || '';
          this.profile.clinicLocation = user.clinic_location || '';
          this.profile.consultationType = user.consultation_type || 'both';
        }
        this.pageLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load profile');
        this.pageLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profile.profileImage = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.isSaving = true;
    this.savedStatus = '';
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('name', this.profile.name);
    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.http.put('http://localhost:5000/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).pipe(
      mergeMap((authRes: any) => {
        if (authRes.name || authRes.user?.profile_image) {
          this.authService.updateUserName(authRes.name || this.profile.name, authRes.user?.profile_image);
        }
        return this.doctorService.createProfile({
          specialization: this.profile.specialization,
          experienceYears: this.profile.experienceYears,
          consultationFee: this.profile.consultationFee,
          clinicName: this.profile.clinicName,
          clinicLocation: this.profile.clinicLocation,
          consultationType: this.profile.consultationType
        });
      })
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.savedStatus = 'Changes saved';
        this.toastService.success('Profile updated successfully!');
        this.cdr.detectChanges();
        setTimeout(() => { this.savedStatus = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.isSaving = false;
        this.toastService.error('Failed to save profile');
        this.cdr.detectChanges();
      }
    });
  }
}