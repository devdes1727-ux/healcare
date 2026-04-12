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

  <!-- HEADER -->
  <div class="header">
    <h2>Settings</h2>
    <p class="sub">Manage your account & profile</p>
  </div>

  <div class="layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <button (click)="setTab('general')" [class.active]="activeTab==='general'">
        👤 Account
      </button>

      <button (click)="setTab('profile')" [class.active]="activeTab==='profile'">
        🧾 Profile
      </button>

      <button (click)="setTab('security')" [class.active]="activeTab==='security'">
        🔒 Security
      </button>

    </aside>

    <!-- CONTENT -->
    <section class="content">

      <!-- ACCOUNT -->
      <div *ngIf="activeTab==='general'" class="card">

        <h3>Account Settings</h3>

        <div class="avatar-box">
          <div class="avatar"
               [style.backgroundImage]="profile.profileImage ? 'url(' + profile.profileImage + ')' : ''">
            <span *ngIf="!profile.profileImage">
              {{ (profile.name || 'U').charAt(0) }}
            </span>
          </div>

          <input type="file" (change)="onFileSelected($event)" />
        </div>

        <div class="grid">
          <input placeholder="Name" [(ngModel)]="profile.name" />
          <input [value]="currentUser?.email" disabled />
        </div>

      </div>

      <!-- PROFILE -->
      <div *ngIf="activeTab==='profile'" class="card">

        <h3>Profile Details</h3>

        <div class="grid">

          <ng-container *ngIf="currentUser?.role === 'patient'">
            <input placeholder="Age" [(ngModel)]="profile.age" />
            <input placeholder="Gender" [(ngModel)]="profile.gender" />
            <input placeholder="Phone" [(ngModel)]="profile.phoneNumber" />
            <input placeholder="Blood Group" [(ngModel)]="profile.bloodGroup" />
            <textarea placeholder="Address" [(ngModel)]="profile.address"></textarea>
          </ng-container>

          <ng-container *ngIf="currentUser?.role === 'doctor'">
            <input placeholder="Specialization" [(ngModel)]="profile.specialization" />
            <input placeholder="Clinic Name" [(ngModel)]="profile.clinicName" />
            <input placeholder="Location" [(ngModel)]="profile.clinicLocation" />
            <input type="number" placeholder="Fee" [(ngModel)]="profile.consultationFee" />
            <input type="number" placeholder="Experience" [(ngModel)]="profile.experienceYears" />
          </ng-container>

        </div>

      </div>

      <!-- SECURITY -->
      <div *ngIf="activeTab==='security'" class="card">

        <h3>Change Password</h3>

        <input type="password" placeholder="Current Password" [(ngModel)]="passwords.current" />
        <input type="password" placeholder="New Password" [(ngModel)]="passwords.new" />
        <input type="password" placeholder="Confirm Password" [(ngModel)]="passwords.confirm" />

        <button class="btn" (click)="updatePassword()">
          Update Password
        </button>

      </div>

    </section>
  </div>

  <!-- FOOTER -->
  <div class="footer" *ngIf="activeTab !== 'security'">
    <button (click)="loadProfileData()">Reset</button>
    <button class="primary" (click)="saveProfile()">
      {{ isSaving ? 'Saving...' : 'Save Changes' }}
    </button>
  </div>

</div>
`,

  styles: [`
.page{
  max-width:1100px;
  margin:auto;
  padding:20px;
  font-family:system-ui;
}

.header h2{margin:0;font-size:26px;}
.sub{color:#6b7280;margin-top:4px;}

.layout{
  display:grid;
  grid-template-columns:220px 1fr;
  gap:16px;
}

/* SIDEBAR FIX */
.sidebar{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.sidebar button{
  padding:12px;
  border:none;
  background:#f3f4f6;
  border-radius:10px;
  cursor:pointer;
  text-align:left;
  transition:0.2s;
}

.sidebar button:hover{
  background:#e5e7eb;
}

.sidebar button.active{
  background:#4f46e5;
  color:white;
}

/* CARD */
.card{
  background:white;
  padding:20px;
  border-radius:14px;
  box-shadow:0 3px 10px rgba(0,0,0,.06);
}

/* AVATAR */
.avatar-box{
  display:flex;
  gap:12px;
  align-items:center;
  margin-bottom:15px;
}

.avatar{
  width:70px;
  height:70px;
  border-radius:50%;
  background:#ddd;
  display:flex;
  align-items:center;
  justify-content:center;
  background-size:cover;
  font-weight:600;
}

/* GRID */
.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

input,textarea{
  padding:10px;
  border:1px solid #e5e7eb;
  border-radius:8px;
}

/* FOOTER */
.footer{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:15px;
}

button.primary{
  background:#4f46e5;
  color:white;
  padding:10px 14px;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

button{
  padding:10px 14px;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

@media(max-width:900px){
  .layout{grid-template-columns:1fr;}
}
  `]
})
export class ProfileSettingsComponent implements OnInit {

  currentUser: User | null = null;

  profile: any = {
    name: '',
    profileImage: ''
  };

  passwords = { current: '', new: '', confirm: '' };

  activeTab = 'general';
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
      this.cdr.markForCheck();
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  loadProfileData() {
    this.http.get('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (res: any) => {
        this.profile = { ...this.profile, ...res };
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to load profile');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
  }

  saveProfile() {
    this.isSaving = true;

    const form = new FormData();
    form.append('name', this.profile.name || '');

    Object.keys(this.profile).forEach(k => {
      if (this.profile[k] && k !== 'profileImage') {
        form.append(k, this.profile[k]);
      }
    });

    if (this.selectedFile) {
      form.append('profileImage', this.selectedFile);
    }

    this.http.put('http://localhost:5000/api/auth/profile', form, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Profile updated');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.toast.error('Update failed');
      }
    });
  }

  updatePassword() {
    if (this.passwords.new !== this.passwords.confirm) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.http.post('http://localhost:5000/api/auth/change-password', this.passwords, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: () => this.toast.success('Password updated'),
      error: () => this.toast.error('Failed')
    });
  }
}