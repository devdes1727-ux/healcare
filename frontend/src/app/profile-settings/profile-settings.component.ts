import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade-in">
      <div class="settings-container">
        <!-- Settings Sidebar -->
        <aside class="settings-sidebar card shadow-md">
          <div class="sidebar-user p-6 border-b">
            <div class="user-avatar" *ngIf="profile.profileImage" [style.backgroundImage]="'url(' + profile.profileImage + ')'"></div>
            <div class="user-avatar-init" *ngIf="!profile.profileImage">{{ (profile.name || '?').charAt(0) }}</div>
            <div class="user-info mt-3">
              <h4 class="m-0 text-main">{{ profile.name }}</h4>
              <p class="text-xs text-muted m-0">{{ currentUser?.email }}</p>
            </div>
          </div>
          <nav class="sidebar-menu p-2">
            <button class="menu-item" [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">
              <span class="icon">👤</span> Account Settings
            </button>
            <button class="menu-item" [class.active]="activeTab === 'profile-setup'" (click)="activeTab = 'profile-setup'">
              <span class="icon">📝</span> Profile Setup
            </button>
            <button class="menu-item" (click)="activeTab = 'security'">
              <span class="icon">🔒</span> Security
            </button>
          </nav>
        </aside>

        <!-- Content Area -->
        <main class="settings-content">
          <div class="card p-8 shadow-md border-0 min-h-full">
            
            <!-- Account Settings Tab -->
            <div *ngIf="activeTab === 'general'" class="tab-pane">
              <h3 class="m-0 mb-8 pb-4 border-b">Account Settings</h3>
              
              <div class="profile-photo-section mb-10 flex items-center gap-8">
                <div class="photo-upload">
                    <div class="current-photo" *ngIf="profile.profileImage" [style.backgroundImage]="'url(' + profile.profileImage + ')'"></div>
                    <div class="current-photo empty" *ngIf="!profile.profileImage">
                        {{ (profile.name || 'U').charAt(0) }}
                    </div>
                    <input type="file" (change)="onFileSelected($event)" accept="image/*" class="file-input">
                    <div class="upload-overlay flex items-center justify-center">
                        <span class="text-xs font-bold">CHANGE</span>
                    </div>
                </div>
                <div class="photo-details">
                    <h5 class="m-0 mb-1">Profile Picture</h5>
                    <p class="text-xs text-muted">JPG or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" class="form-control" [(ngModel)]="profile.name" placeholder="Enter your full name">
                </div>
                <div class="form-group">
                  <label>Role</label>
                  <input type="text" class="form-control bg-secondary" [value]="currentUser?.role | titlecase" readonly>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" class="form-control bg-secondary" [value]="currentUser?.email" readonly>
                </div>
              </div>
            </div>

            <!-- Profile Setup Tab -->
            <div *ngIf="activeTab === 'profile-setup'" class="tab-pane">
              <h3 class="m-0 mb-8 pb-4 border-b">Professional Profile Setup</h3>
              
              <!-- Patient Fields -->
              <div *ngIf="currentUser?.role === 'patient'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="form-group">
                  <label>Age</label>
                  <input type="number" class="form-control" [(ngModel)]="profile.age">
                </div>
                <div class="form-group">
                  <label>Gender</label>
                  <select class="form-control" [(ngModel)]="profile.gender">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Blood Group</label>
                  <select class="form-control" [(ngModel)]="profile.bloodGroup">
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" class="form-control" [(ngModel)]="profile.phoneNumber">
                </div>
                <div class="form-group md:col-span-2">
                  <label>Address</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="profile.address"></textarea>
                </div>
              </div>

              <!-- Doctor Fields -->
              <div *ngIf="currentUser?.role === 'doctor'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="form-group">
                  <label>Category</label>
                  <select class="form-control" [(ngModel)]="profile.category">
                    <option value="General">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Specialization</label>
                  <input type="text" class="form-control" [(ngModel)]="profile.specialization">
                </div>
                <div class="form-group">
                  <label>Hospital / Clinic Name</label>
                  <input type="text" class="form-control" [(ngModel)]="profile.clinicName">
                </div>
                <div class="form-group">
                  <label>Clinic Location</label>
                  <input type="text" class="form-control" [(ngModel)]="profile.clinicLocation">
                </div>
                <div class="form-group">
                  <label>Consultation Fee ($)</label>
                  <input type="number" class="form-control" [(ngModel)]="profile.consultationFee">
                </div>
                <div class="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" class="form-control" [(ngModel)]="profile.experienceYears">
                </div>
              </div>
            </div>

            <!-- Security Tab -->
            <div *ngIf="activeTab === 'security'" class="tab-pane text-center py-20">
               <div class="text-4xl mb-4">🔐</div>
               <h4>Coming Soon</h4>
               <p class="text-muted">Password management settings are under development.</p>
            </div>

            <div class="footer-actions mt-10 pt-8 border-t flex justify-end gap-4" *ngIf="activeTab !== 'security'">
                <button class="btn btn-outline px-8" (click)="loadProfileData()" [disabled]="isSaving">Reset</button>
                <button class="btn btn-primary px-10" (click)="saveProfile()" [disabled]="isSaving">
                    {{ isSaving ? 'Saving...' : 'Save All Changes' }}
                </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 1200px; margin: 3rem auto; padding: 0 1.5rem; }
    .settings-container { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; }
    .settings-sidebar { position: sticky; top: 100px; }
    .user-avatar, .user-avatar-init { width: 64px; height: 64px; border-radius: 16px; margin: 0 auto; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: white; font-weight: bold; font-size: 1.5rem; }
    
    .menu-item { width: 100%; text-align: left; padding: 0.825rem 1.25rem; border: none; background: transparent; color: var(--text-muted); font-weight: 600; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; }
    .menu-item:hover { background: var(--bg-secondary); color: var(--text-main); }
    .menu-item.active { background: var(--primary-alpha); color: var(--primary-color); }
    
    .photo-upload { width: 100px; height: 100px; border-radius: 50%; position: relative; overflow: hidden; border: 4px solid var(--bg-card); cursor: pointer; background: #eee; }
    .current-photo { width: 100%; height: 100%; background-size: cover; }
    .current-photo.empty { display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    .file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 10; }
    .upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; opacity: 0; transition: 0.2s; }
    .photo-upload:hover .upload-overlay { opacity: 1; }

    .form-group label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; }
    .form-control { width: 100%; padding: 0.875rem 1.125rem; border: 1px solid var(--border-light); border-radius: 12px; background: var(--bg-main); color: var(--text-main); transition: all 0.2s; }
    .form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px var(--primary-alpha); }
    .bg-secondary { background: var(--bg-secondary); }

    @media (max-width: 992px) { .settings-container { grid-template-columns: 1fr; } }
  `]
})
export class ProfileSettingsComponent implements OnInit {
  currentUser: User | null = null;
  profile: any = { name: '', profileImage: null };
  selectedFile: File | null = null;
  isSaving = false;
  activeTab = 'general';

  constructor(private authService: AuthService, private toastService: ToastService, private http: HttpClient) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) this.loadProfileData();
    });
  }

  loadProfileData() {
    this.http.get<any>('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (user) => {
        this.profile.name = user.name;
        this.profile.profileImage = user.profile_image;
        if (user.role === 'patient' && user.patientData) {
          const pd = user.patientData;
          this.profile.age = pd.age;
          this.profile.phoneNumber = pd.phone_number;
          this.profile.bloodGroup = pd.blood_group;
          this.profile.gender = pd.gender;
          this.profile.address = pd.address;
        } else if (user.role === 'doctor' && user.doctorData) {
          const dd = user.doctorData;
          this.profile.category = dd.category;
          this.profile.specialization = dd.specialization;
          this.profile.clinicName = dd.clinic_name;
          this.profile.clinicLocation = dd.clinic_location;
          this.profile.consultationFee = dd.consultation_fee;
          this.profile.experienceYears = dd.experience_years;
        }
      },
      error: () => this.toastService.error('Failed to load profile details')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { this.toastService.error('Max 2MB'); return; }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.profile.profileImage = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (!this.profile.name) { this.toastService.error('Name required'); return; }
    this.isSaving = true;
    const formData = new FormData();
    formData.append('name', this.profile.name);
    
    if (this.currentUser?.role === 'patient') {
      formData.append('age', this.profile.age || '');
      formData.append('phoneNumber', this.profile.phoneNumber || '');
      formData.append('bloodGroup', this.profile.bloodGroup || '');
      formData.append('gender', this.profile.gender || '');
      formData.append('address', this.profile.address || '');
    } else {
      formData.append('category', this.profile.category || '');
      formData.append('specialization', this.profile.specialization || '');
      formData.append('clinicName', this.profile.clinicName || '');
      formData.append('clinicLocation', this.profile.clinicLocation || '');
      formData.append('consultationFee', this.profile.consultationFee?.toString() || '0');
      formData.append('experienceYears', this.profile.experienceYears?.toString() || '0');
    }

    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.http.put('http://localhost:5000/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.authService.updateUserName(res.name, res.user?.profile_image);
        this.toastService.success('Profile saved!');
      },
      error: () => { this.isSaving = false; this.toastService.error('Save failed'); }
    });
  }
}
