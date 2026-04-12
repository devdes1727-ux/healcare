import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card p-8 max-w-3xl">
      <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
        <div class="profile-header mb-8 flex gap-6 items-center">
          <div class="avatar-upload relative">
            <div class="avatar-placeholder" [style.backgroundImage]="'url(' + (profile.profileImage || '') + ')'">
              <span *ngIf="!profile.profileImage" class="icon">📷</span>
            </div>
            <input type="file" (change)="onFileSelected($event)" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
            <button type="button" class="btn btn-outline btn-sm mt-2">Change Photo</button>
          </div>
          <div class="profile-title w-full flex-1">
            <h3 class="m-0 mb-2">Public Profile</h3>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" [(ngModel)]="profile.name" name="name" required placeholder="e.g. John Doe">
            </div>
            <p class="text-muted mt-1 text-sm">This information will be displayed to patients.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="form-group">
            <label>Specialization</label>
            <input type="text" class="form-control" [(ngModel)]="profile.specialization" name="specialization" required placeholder="e.g. Cardiologist">
          </div>
          <div class="form-group">
            <label>Experience (Years)</label>
            <input type="number" class="form-control" [(ngModel)]="profile.experienceYears" name="experienceYears" required placeholder="e.g. 10">
          </div>
          <div class="form-group">
            <label>Consultation Fee ($)</label>
            <input type="number" class="form-control" [(ngModel)]="profile.consultationFee" name="consultationFee" required placeholder="e.g. 150">
          </div>
          <div class="form-group">
            <label>Consultation Type</label>
            <select class="form-control" [(ngModel)]="profile.consultationType" name="consultationType">
              <option value="both">Both (Online & In-clinic)</option>
              <option value="online">Online Only</option>
              <option value="offline">In-clinic Only</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="mb-4">Clinic Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label>Clinic Name</label>
              <input type="text" class="form-control" [(ngModel)]="profile.clinicName" name="clinicName" required placeholder="e.g. HeartCare Center">
            </div>
            <div class="form-group">
              <label>Clinic Location</label>
              <input type="text" class="form-control" [(ngModel)]="profile.clinicLocation" name="clinicLocation" required placeholder="e.g. New York, NY">
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8 pt-6 border-t">
          <span *ngIf="savedStatus" class="saved-message text-success self-center">{{ savedStatus }}</span>
          <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid || isSaving">
            {{ isSaving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .max-w-3xl { max-width: 48rem; }
    .p-8 { padding: 2rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-8 { margin-top: 2rem; }
    .pt-6 { padding-top: 1.5rem; }
    .m-0 { margin: 0; }
    .border-t { border-top: 1px solid var(--border-light); }
    .text-muted { color: var(--text-muted); }
    .text-success { color: var(--success); font-weight: 500; }
    
    .avatar-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 2px dashed var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background-size: cover;
      background-position: center;
    }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .opacity-0 { opacity: 0; }
    .cursor-pointer { cursor: pointer; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    
    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-main);
    }
    
    .form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      background: var(--bg-main);
      color: var(--text-main);
      transition: all 0.2s;
      font-family: inherit;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .grid { display: grid; }
    .gap-6 { gap: 1.5rem; }
    @media (min-width: 768px) { .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `]
})
export class DoctorProfileComponent implements OnInit {
  profile: any = { consultationType: 'both', name: '' };
  savedStatus = '';
  isSaving = false;
  selectedFile: File | null = null;

  constructor(
    private doctorService: DoctorService, 
    private toastService: ToastService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.http.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe((user: any) => {
      this.profile.name = user.name;
      this.profile.profileImage = user.profile_image;
      
      this.http.get('http://localhost:5000/api/doctors', {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` }
      }).subscribe((res: any) => {
        const myDoc = res.find((d: any) => d.email === user.email);
        if (myDoc) {
          this.profile.specialization = myDoc.specialization;
          this.profile.experienceYears = myDoc.experience_years;
          this.profile.consultationFee = myDoc.consultation_fee;
          this.profile.clinicName = myDoc.clinic_name;
          this.profile.clinicLocation = myDoc.clinic_location;
        }
      });
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.isSaving = true;

    // 1. Update Core User Details first
    const formData = new FormData();
    formData.append('name', this.profile.name);
    if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
    }
    
    this.http.put('http://localhost:5000/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).pipe(
      mergeMap((authRes: any) => {
        if (authRes.name || authRes.user?.profile_image) {
          this.authService.updateUserName(authRes.name || this.profile.name, authRes.user?.profile_image);
        }
        // 2. Update Medical Details
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
      next: (doctorRes) => {
        this.isSaving = false;
        this.toastService.success('Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving = false;
        this.toastService.error('Failed to save profile fully');
      }
    });
  }
}
