import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="ps-root">

  <div class="ps-hero">
    <div class="ps-hero-bg"></div>
    <div class="ps-hero-inner">
      <div class="ps-avatar-wrap">
        <div class="ps-avatar" [style.backgroundImage]="'url(' + (profile.profileImage || profile.profile_image || '') + ')'">          <span *ngIf="!profile.profileImage && !profile.profile_image">{{ (profile.name || 'U').charAt(0).toUpperCase() }}</span>
        </div>
        <label for="avatarFile" class="ps-avatar-edit" title="Change photo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </label>
        <input id="avatarFile" type="file" (change)="onFileSelected($event)" style="display:none" accept="image/*"/>
      </div>
      <div class="ps-hero-info">
        <h1>{{ profile.name || 'Your Name' }}</h1>
        <div class="ps-role-badge" [class.doctor]="currentUser?.role === 'doctor'" [class.patient]="currentUser?.role === 'patient'">
          {{ currentUser?.role === 'doctor' ? '🩺 Doctor' : '🧑 Patient' }}
        </div>
        <p class="ps-email">{{ currentUser?.email }}</p>
      </div>
    </div>

    <nav class="ps-tabs">
      <button class="ps-tab" [class.active]="activeTab==='account'" (click)="setTab('account')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Account
      </button>
      <button class="ps-tab" [class.active]="activeTab==='professional'" (click)="setTab('professional')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        {{ currentUser?.role === 'doctor' ? 'Professional' : 'Medical' }}
      </button>
      <button class="ps-tab" [class.active]="activeTab==='security'" (click)="setTab('security')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Security
      </button>
      <div class="ps-tab-indicator" [style.left]="tabIndicatorLeft"></div>
    </nav>
  </div>

  <div class="ps-body">

    <div *ngIf="activeTab==='account'" class="ps-panel">
      <div class="ps-section-title">
        <span class="ps-section-icon">👤</span>
        <div>
          <h2>Account Information</h2>
          <p>Update your personal details and contact information</p>
        </div>
      </div>

      <div class="ps-grid">
        <div class="ps-field">
          <label>Full Name</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <input placeholder="Enter your full name" [(ngModel)]="profile.name"/>
          </div>
        </div>

        <div class="ps-field">
          <label>Email Address</label>
          <div class="ps-input-wrap disabled">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input [value]="currentUser?.email" disabled/>
          </div>
        </div>

        <div class="ps-field">
          <label>Contact Number</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.94 5.94l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input placeholder="+91 00000 00000" [(ngModel)]="profile.phone_number"/>
          </div>
        </div>

        <div class="ps-field" *ngIf="currentUser?.role === 'patient'">
          <label>Date of Birth</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <input type="date" [(ngModel)]="profile.dob"/>
          </div>
        </div>

        <div class="ps-field" *ngIf="currentUser?.role === 'doctor'">
          <label>Age</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <input type="number" placeholder="Age" [(ngModel)]="profile.age"/>
          </div>
        </div>

        <div class="ps-field">
          <label>Gender</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <select [(ngModel)]="profile.gender">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="activeTab==='professional'" class="ps-panel">
      <div class="ps-section-title">
        <span class="ps-section-icon">{{ currentUser?.role === 'doctor' ? '🎓' : '🏥' }}</span>
        <div>
          <h2>{{ currentUser?.role === 'doctor' ? 'Professional Details' : 'Medical Details' }}</h2>
          <p>{{ currentUser?.role === 'doctor' ? 'Your credentials and clinic information' : 'Your health and address information' }}</p>
        </div>
      </div>

      <div class="ps-grid" *ngIf="currentUser?.role === 'patient'">
        <div class="ps-field">
          <label>Blood Group</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>
            <select [(ngModel)]="profile.blood_group">
              <option value="">Select blood group</option>
              <option *ngFor="let bg of ['A+','A-','B+','B-','O+','O-','AB+','AB-']" [value]="bg">{{bg}}</option>
            </select>
          </div>
        </div>
        <div class="ps-field ps-full">
          <label>Current Address</label>
          <div class="ps-input-wrap textarea-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <textarea placeholder="Street, City, State, ZIP" [(ngModel)]="profile.address" rows="3"></textarea>
          </div>
        </div>
      </div>

      <div *ngIf="currentUser?.role === 'doctor'">
        <div class="ps-subheading">Credentials</div>
        <div class="ps-grid">
          <div class="ps-field">
            <label>Medical License Number</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              <input placeholder="REG123456" [(ngModel)]="profile.medical_license_number"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Specialization</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 1-2-2V9m6 5h10a2 2 0 0 0 2-2V9m0 0H3"/></svg>
              <input placeholder="e.g. Cardiologist" [(ngModel)]="profile.specialization"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Languages Spoken</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <input placeholder="English, Hindi, Tamil" [(ngModel)]="profile.languages_spoken"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Experience (Years)</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <input type="number" placeholder="0" [(ngModel)]="profile.experience_years"/>
            </div>
          </div>
        </div>

       <div class="ps-subheading">Treatment Systems</div>
        <div class="ps-chips">
          <button
            type="button"
            class="ps-chip"
            *ngFor="let system of treatmentOptions"
            [class.active]="profile.treatment_system === system"
            (click)="selectTreatment(system)"
          >
            {{ system }}
          </button>
        </div>

        <p class="ps-hint">Select anyone treatment system you practice</p>
        <div class="ps-subheading">Clinic Information</div>
        <div class="ps-grid">
          <div class="ps-field">
            <label>Clinic / Hospital Name</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <input placeholder="Enter clinic name" [(ngModel)]="profile.clinic_name"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Clinic Location</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input placeholder="City, Area" [(ngModel)]="profile.clinic_location"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Consultation Fee (₹)</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <input type="number" placeholder="500" [(ngModel)]="profile.consultation_fee"/>
            </div>
          </div>
          <div class="ps-field">
            <label>Contact Privacy</label>
            <div class="ps-input-wrap">
              <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <select [(ngModel)]="profile.show_contact_preference">
                <option value="Show">Show to patients</option>
                <option value="Hide">Hide from patients</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="activeTab==='security'" class="ps-panel">
      <div class="ps-section-title">
        <span class="ps-section-icon">🔒</span>
        <div>
          <h2>Change Password</h2>
          <p>Keep your account secure with a strong password</p>
        </div>
      </div>

      <div class="ps-security-form">
        <div class="ps-field">
          <label>Current Password</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" placeholder="Enter current password" [(ngModel)]="passwords.current"/>
          </div>
        </div>
        <div class="ps-divider"></div>
        <div class="ps-field">
          <label>New Password</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
            <input type="password" placeholder="Enter new password" [(ngModel)]="passwords.new"/>
          </div>
        </div>
        <div class="ps-field">
          <label>Confirm New Password</label>
          <div class="ps-input-wrap">
            <svg class="ps-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" placeholder="Re-enter new password" [(ngModel)]="passwords.confirm"/>
          </div>
        </div>
        <button class="ps-pwd-btn" (click)="updatePassword()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Update Password
        </button>
      </div>
    </div>

  </div>

  <div class="ps-footer" *ngIf="activeTab !== 'security'">
    <span class="ps-footer-meta">Last updated: {{ profile.created_at | date:'mediumDate' }}</span>
    <div class="ps-footer-actions">
      <button class="ps-btn-ghost" (click)="loadProfileData()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Reset
      </button>
      <button class="ps-btn-save" (click)="saveProfile()" [disabled]="isSaving">
        <svg *ngIf="!isSaving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span class="ps-spinner" *ngIf="isSaving"></span>
        {{ isSaving ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>
  </div>

</div>
  `,
  styles: [`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:host { display: block; font-family: 'DM Sans', sans-serif; }

.ps-root {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 20px 120px;
}

.ps-hero {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04);
}

.ps-hero-bg {
  height: 100px;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%);
  position: relative;
}
.ps-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.ps-hero-inner {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 0 28px 20px;
  margin-top: -36px;
  position: relative;
}

.ps-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.ps-avatar {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  background-size: cover;
  background-position: center;
  border: 4px solid var(--bg-card, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: #2563eb;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
}
.ps-avatar-edit {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 26px;
  height: 26px;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .2s;
  box-shadow: 0 2px 8px rgba(37,99,235,.4);
}
.ps-avatar-edit:hover { background: #1d4ed8; }

.ps-hero-info {
  padding-bottom: 4px;
  flex: 1;
}
.ps-hero-info h1 {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 6px;
  line-height: 1.2;
}
.ps-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
  margin-bottom: 4px;
}
.ps-role-badge.doctor { background: #dbeafe; color: #1d4ed8; }
.ps-role-badge.patient { background: #dcfce7; color: #16a34a; }
.ps-email {
  font-size: 13px;
  color: var(--text-muted, #64748b);
  margin: 0;
  font-family: 'DM Mono', monospace;
}

.ps-tabs {
  display: flex;
  position: relative;
  padding: 0 20px;
  border-top: 1px solid var(--border-light, #e8edf2);
  gap: 4px;
}
.ps-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 18px;
  background: none;
  border: none;
  color: var(--text-muted, #64748b);
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color .2s;
  position: relative;
  z-index: 1;
}
.ps-tab:hover { color: #2563eb; }
.ps-tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}
.ps-tab svg { opacity: .7; }
.ps-tab.active svg { opacity: 1; }

.ps-body {
  animation: ps-fadein .25s ease;
}
@keyframes ps-fadein {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ps-panel {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 24px;
  padding: 28px 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04);
}

.ps-section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light, #e8edf2);
}
.ps-section-icon {
  width: 46px;
  height: 46px;
  background: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.ps-section-title h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin: 0 0 3px;
}
.ps-section-title p {
  font-size: 13px;
  color: var(--text-muted, #64748b);
  margin: 0;
}

.ps-subheading {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-muted, #94a3b8);
  margin: 28px 0 14px;
}

.ps-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ps-full { grid-column: 1 / -1; }

.ps-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ps-field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted, #64748b);
  letter-spacing: .02em;
  text-transform: uppercase;
}

.ps-input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-main, #f8fafc);
  border: 1.5px solid var(--border-light, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.ps-input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,.08);
}
.ps-input-wrap.disabled {
  opacity: .6;
  cursor: not-allowed;
}
.ps-input-wrap.textarea-wrap { align-items: flex-start; }
.ps-input-wrap.textarea-wrap .ps-input-icon { margin-top: 14px; }

.ps-input-icon {
  margin-left: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}
.ps-input-wrap input,
.ps-input-wrap select,
.ps-input-wrap textarea {
  flex: 1;
  padding: 11px 14px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text-main, #0f172a);
  font-weight: 500;
}
.ps-input-wrap textarea { resize: vertical; min-height: 80px; }
.ps-input-wrap select { cursor: pointer; }
.ps-input-wrap input:disabled { cursor: not-allowed; }

.ps-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ps-chip {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--border-light, #e2e8f0);
  background: var(--bg-main, #f8fafc);
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  color: var(--text-main, #334155);
  cursor: pointer;
  transition: all .18s;
}
.ps-chip:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.ps-chip.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 2px 8px rgba(37,99,235,.25); }
.ps-hint {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  margin-top: 8px;
}

.ps-security-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 420px;
}
.ps-divider {
  height: 1px;
  background: var(--border-light, #e8edf2);
  margin: 4px 0;
}
.ps-pwd-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  color: white;
  border: none;
  padding: 13px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  margin-top: 6px;
  transition: background .2s, transform .15s;
  width: fit-content;
}
.ps-pwd-btn:hover { background: #1e293b; transform: translateY(-1px); }

.ps-footer {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 820px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: white;
  padding: 14px 20px 14px 24px;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.06);
  z-index: 100;
}
.ps-footer-meta {
  font-size: 12px;
  color: #64748b;
  font-family: 'DM Mono', monospace;
}
.ps-footer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.ps-btn-ghost {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #1e293b;
  padding: 9px 18px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: .2s;
}
.ps-btn-ghost:hover { color: white; border-color: #334155; }
.ps-btn-save {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background .2s, transform .15s;
}
.ps-btn-save:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
.ps-btn-save:disabled { opacity: .6; cursor: not-allowed; }
.ps-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ps-spin .6s linear infinite;
  flex-shrink: 0;
}
@keyframes ps-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .ps-root { padding: 20px 14px 100px; }
  .ps-grid { grid-template-columns: 1fr; }
  .ps-hero-inner { flex-direction: column; align-items: flex-start; margin-top: -28px; }
  .ps-footer { bottom: 12px; width: calc(100% - 28px); flex-direction: column; gap: 10px; text-align: center; }
  .ps-footer-actions { width: 100%; justify-content: center; }
  .ps-panel { padding: 20px 18px; }
}
  `]
})
export class ProfileSettingsComponent implements OnInit {
  currentUser: User | null = null;
  profile: any = { name: '', profileImage: '', treatment_system: '' };
  treatmentOptions = ['Allopathy', 'Homeopathy', 'Ayurveda', 'Siddha', 'Unani'];
  passwords = { current: '', new: '', confirm: '' };
  activeTab = 'account';
  selectedFile: File | null = null;
  isSaving = false;

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      this.currentUser = user;
      if (user) this.loadProfileData();
    });
  }

  get tabIndicatorLeft(): string {
    const map: Record<string, string> = { account: '0%', professional: '33.33%', security: '66.66%' };
    return map[this.activeTab] || '0%';
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  selectTreatment(system: string) {
    this.profile.treatment_system = system;
    this.cdr.markForCheck();
  }

  loadProfileData() {
    this.http.get('http://localhost:5000/api/auth/me').subscribe((res: any) => {
      this.profile = { ...res };
      if (this.profile.dob) this.profile.dob = this.profile.dob.split('T')[0];
      this.profile.treatment_system = this.profile.treatment_system || '';
      this.cdr.markForCheck();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profile.profileImage = e.target.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.isSaving = true;
    const form = new FormData();
    const dataToSave = { ...this.profile };
    Object.keys(dataToSave).forEach(k => {
      if (dataToSave[k] !== null && dataToSave[k] !== undefined && k !== 'profileImage' && k !== 'profile_image') {
        form.append(k, dataToSave[k]);
      }
    });
    if (this.selectedFile) form.append('profile_image', this.selectedFile);
    this.http.put('http://localhost:5000/api/auth/profile', form).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Profile updated successfully');
        this.authService.updateUserName(this.profile.name, this.profile.profile_image || this.profile.profileImage);
        this.loadProfileData();
      },
      error: () => {
        this.isSaving = false;
        this.toast.error('Update failed');
      }
    });
  }

  updatePassword() {
    if (this.passwords.new !== this.passwords.confirm) return this.toast.error('Passwords do not match');
    this.http.post('http://localhost:5000/api/auth/change-password', this.passwords).subscribe({
      next: () => {
        this.toast.success('Password changed successfully');
        this.passwords = { current: '', new: '', confirm: '' };
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('Incorrect current password')
    });
  }
}