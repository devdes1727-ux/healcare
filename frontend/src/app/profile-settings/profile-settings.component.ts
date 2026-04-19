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

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
<div class="page">
  <div class="header">
    <h2>Profile Settings</h2>
    <p class="sub">Complete your profile to build trust with patients</p>
  </div>

  <div class="layout">
    <aside class="sidebar">
      <button (click)="setTab('account')" [class.active]="activeTab==='account'">👤 Account</button>
      <button (click)="setTab('professional')" [class.active]="activeTab==='professional'">🎓 Professional</button>
      <button (click)="setTab('security')" [class.active]="activeTab==='security'">🔒 Security</button>
    </aside>

    <section class="content">
      <!-- ACCOUNT -->
      <div *ngIf="activeTab==='account'" class="card">
        <h3>Account Information</h3>
        <div class="avatar-section">
          <div class="avatar" [style.backgroundImage]="profile.profileImage ? 'url(' + profile.profileImage + ')' : ''">
            <span *ngIf="!profile.profileImage">{{ (profile.name || 'U').charAt(0) }}</span>
          </div>
          <div class="avatar-upload">
             <label for="avatarFile" class="upload-btn">Change Photo</label>
             <input id="avatarFile" type="file" (change)="onFileSelected($event)" style="display:none" />
             <p>JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="input-field">
            <label>Full Name</label>
            <input placeholder="Enter name" [(ngModel)]="profile.name" />
          </div>
          <div class="input-field">
            <label>Email Address</label>
            <input [value]="currentUser?.email" disabled />
          </div>
          <div class="input-field">
            <label>Contact Number</label>
            <input placeholder="Enter mobile" [(ngModel)]="profile.phone_number" />
          </div>
          <div class="input-field" *ngIf="currentUser?.role === 'patient'">
            <label>Date of Birth</label>
            <input type="date" [(ngModel)]="profile.dob" />
          </div>
           <div class="input-field" *ngIf="currentUser?.role === 'doctor'">
            <label>Age</label>
            <input type="number" [(ngModel)]="profile.age" />
          </div>
           <div class="input-field">
            <label>Gender</label>
            <select [(ngModel)]="profile.gender">
               <option value="Male">Male</option>
               <option value="Female">Female</option>
               <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <!-- PROFESSIONAL/PATIENT PROFILE -->
      <div *ngIf="activeTab==='professional'" class="card">
        <h3>{{ currentUser?.role === 'doctor' ? 'Professional Details' : 'Medical Details' }}</h3>
        
        <div class="form-grid">
          <!-- PATIENT FIELDS -->
          <ng-container *ngIf="currentUser?.role === 'patient'">
            <div class="input-field">
              <label>Blood Group</label>
              <select [(ngModel)]="profile.blood_group">
                 <option *ngFor="let bg of ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']" [value]="bg">{{bg}}</option>
              </select>
            </div>
            <div class="input-field full">
              <label>Current Address</label>
              <textarea placeholder="Line 1, City, Zip" [(ngModel)]="profile.address"></textarea>
            </div>
          </ng-container>

          <!-- DOCTOR FIELDS -->
          <ng-container *ngIf="currentUser?.role === 'doctor'">
             <div class="input-field">
                <label>Medical License Number</label>
                <input placeholder="Ex: REG123456" [(ngModel)]="profile.medical_license_number" />
             </div>
             <div class="input-field">
                <label>Specialization</label>
                <input placeholder="Ex: Cardiologist" [(ngModel)]="profile.specialization" />
             </div>
             <div class="input-field">
              <label>Treatment System</label>

              <div class="chip-group">

              <button
              type="button"
              class="chip"
              *ngFor="let system of treatmentOptions"
              [class.active]="profile.treatment_system_array.includes(system)"
              (click)="toggleTreatment(system)">

              {{ system }}

              </button>

              </div>

              <small class="hint">
              Select one or more treatment systems
              </small>

              </div>
             <div class="input-field">
                <label>Languages Spoken</label>
                <input placeholder="Ex: English, Hindi, Tamil" [(ngModel)]="profile.languages_spoken" />
             </div>
             <div class="input-field">
                <label>Experience (Years)</label>
                <input type="number" [(ngModel)]="profile.experience_years" />
             </div>
             <div class="input-field">
                <label>Consultation Fee (₹)</label>
                <input type="number" [(ngModel)]="profile.consultation_fee" />
             </div>
             <div class="input-field">
                <label>Clinic/Hospital Name</label>
                <input placeholder="Enter name" [(ngModel)]="profile.clinic_name" />
             </div>
             <div class="input-field">
                <label>Clinic Location</label>
                <input placeholder="City, Area" [(ngModel)]="profile.clinic_location" />
             </div>
             <div class="input-field">
                <label>Contact Privacy</label>
                <select [(ngModel)]="profile.show_contact_preference">
                   <option value="Show">Show to patients</option>
                   <option value="Hide">Hide from patients</option>
                </select>
             </div>
          </ng-container>
        </div>
      </div>

      <!-- SECURITY -->
      <div *ngIf="activeTab==='security'" class="card">
        <h3>Change Password</h3>
        <div class="form-grid single">
          <div class="input-field">
            <label>Current Password</label>
            <input type="password" [(ngModel)]="passwords.current" />
          </div>
          <div class="input-field">
            <label>New Password</label>
            <input type="password" [(ngModel)]="passwords.new" />
          </div>
          <div class="input-field">
            <label>Confirm New Password</label>
            <input type="password" [(ngModel)]="passwords.confirm" />
          </div>
          <button class="save-btn w-full" (click)="updatePassword()">Update Password</button>
        </div>
      </div>
    </section>
  </div>

  <div class="sticky-footer" *ngIf="activeTab !== 'security'">
    <p>Last updated: {{ profile.created_at | date:'shortTime' }}</p>
    <div class="actions">
       <button class="btn-ghost" (click)="loadProfileData()">Reset Changes</button>
       <button class="save-btn" (click)="saveProfile()" [disabled]="isSaving">
          {{ isSaving ? 'Updating...' : 'Save Settings' }}
       </button>
    </div>
  </div>
</div>
`,
  styles: [`
.page { max-width: 1000px; margin: auto; padding: 40px 20px; font-family: 'Outfit', sans-serif; }
.header { margin-bottom: 40px; }
.header h2 { font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0; }
.sub { color: var(--text-muted); font-size: 16px; margin-top: 8px; }

.layout { display: grid; grid-template-columns: 240px 1fr; gap: 30px; align-items: flex-start; }
.sidebar { display: flex; flex-direction: column; gap: 10px; background: var(--bg-card); padding: 15px; border-radius: 20px; border: 1px solid var(--border-light); }
.sidebar button { padding: 12px 20px; text-align: left; border: none; background: transparent; color: var(--text-muted); font-weight: 600; border-radius: 12px; cursor: pointer; transition: .2s; }
.sidebar button:hover { background: var(--bg-secondary); color: var(--text-main); }
.sidebar button.active { background: var(--primary-color); color: white; }

.content { display: flex; flex-direction: column; gap: 20px; }
.card { background: var(--bg-card); padding: 30px; border-radius: 24px; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm); }
.card h3 { margin: 0 0 25px; font-size: 20px; font-weight: 700; color: var(--text-main); }

.avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.avatar { width: 90px; height: 90px; border-radius: 30px; background: #f1f5f9; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #cbd5e1; border: 4px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
.avatar-upload p { font-size: 12px; color: #94a3b8; margin: 5px 0 0; }
.upload-btn { background: #1e293b; color: white; padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.input-field { display: flex; flex-direction: column; gap: 8px; }
.input-field.full { grid-column: 1 / -1; }
.input-field label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
.input-field input, .input-field select, .input-field textarea { padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-light); outline: none; font-size: 15px; color: var(--text-main); background: var(--bg-main); }
.input-field input:focus { border-color: var(--primary-color); }

.sticky-footer { position: sticky; bottom: 20px; background: #1e293b; color: white; margin-top: 40px; padding: 15px 30px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; }
.sticky-footer p { margin: 0; font-size: 12px; color: #94a3b8; }
.actions { display: flex; gap: 15px; }
.btn-ghost { background: transparent; color: white; border: 1px solid #334155; padding: 10px 20px; border-radius: 12px; cursor: pointer; }
.save-btn { background: #ef4444; color: white; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; }

.w-full { width: 100%; margin-top: 10px; }
.single { grid-template-columns: 1fr; max-width: 400px; }
.chip-group{
display:flex;
flex-wrap:wrap;
gap:10px;
margin-top:5px;
}

.chip{
padding:8px 16px;
border-radius:20px;
border:1px solid var(--border-light);
background:var(--bg-main);
cursor:pointer;
font-size:13px;
font-weight:600;
transition:.2s ease;
}

.chip:hover{
border-color:var(--primary-color);
}

.chip.active{
background:var(--primary-color);
color:white;
border-color:var(--primary-color);
}

.hint{
font-size:12px;
color:var(--text-muted);
margin-top:6px;
display:block;
}
@media(max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
`]
})
export class ProfileSettingsComponent implements OnInit {
  currentUser: User | null = null;
  profile: any = { name: '', profileImage: '' };
  treatmentOptions = [
    'Allopathy',
    'Homeopathy',
    'Ayurveda',
    'Siddha',
    'Unani'
  ];
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) this.loadProfileData();
    });
  }

  toggleTreatment(system: string) {

    if (!this.profile.treatment_system_array) {
      this.profile.treatment_system_array = [];
    }

    const index =
      this.profile.treatment_system_array.indexOf(system);

    if (index > -1) {

      this.profile.treatment_system_array.splice(index, 1);

    } else {

      this.profile.treatment_system_array.push(system);

    }

    this.cdr.markForCheck();

  }
  setTab(tab: string) {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  loadProfileData() {
    this.http.get('http://localhost:5000/api/auth/me').subscribe((res: any) => {
      this.profile = { ...res };
      if (this.profile.dob) this.profile.dob = this.profile.dob.split('T')[0];

      // Map comma string to array for multi-select
      if (this.profile.treatment_system) {
        this.profile.treatment_system_array = this.profile.treatment_system.split(',').map((s: any) => s.trim());
      } else {
        this.profile.treatment_system_array = [];
      }

      // Sync with AuthService to update Navbar
      this.authService.updateUserName(this.profile.name, this.profile.profile_image || this.profile.profileImage);

      this.cdr.markForCheck();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create local preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.profileImage = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.isSaving = true;
    const form = new FormData();

    // Copy profile and join treatment system array
    const dataToSave = { ...this.profile };
    if (dataToSave.treatment_system_array) {
      dataToSave.treatment_system = dataToSave.treatment_system_array.join(',');
      delete dataToSave.treatment_system_array;
    }

    Object.keys(dataToSave).forEach(k => {
      if (dataToSave[k] !== null && k !== 'profileImage' && k !== 'profile_image') {
        form.append(k, dataToSave[k]);
      }
    });

    if (this.selectedFile) form.append('profile_image', this.selectedFile);

    this.http.put('http://localhost:5000/api/auth/profile', form).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Profile updated successfully');
        this.loadProfileData();
      },
      error: () => { this.isSaving = false; this.toast.error('Update failed'); }
    });
  }

  updatePassword() {
    if (this.passwords.new !== this.passwords.confirm) return this.toast.error('Passwords mismatch');
    this.http.post('http://localhost:5000/api/auth/change-password', this.passwords).subscribe({
      next: () => {
        this.toast.success('Password changed');
        this.passwords = { current: '', new: '', confirm: '' };
      },
      error: () => this.toast.error('Incorrect current password')
    });
  }
}