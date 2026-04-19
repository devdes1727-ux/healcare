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

<form (ngSubmit)="saveProfile()" *ngIf="!pageLoading">

<div class="page-head">

<div>
<p class="page-eyebrow">Doctor Dashboard</p>
<h1 class="page-title">My Profile</h1>
</div>

<button
type="submit"
class="save-btn"
[disabled]="isSaving">

{{ isSaving ? 'Saving...' : 'Save Profile' }}

</button>

</div>


<div class="form-layout">


<!-- LEFT PANEL -->

<div class="col-left">

<div class="card-block">

<h4 class="block-title">
Photo & Identity
</h4>


<div class="av-section">

<div class="av-wrap">

<div
class="av-img"
[style.backgroundImage]="profile.profileImage ? 'url(' + profile.profileImage + ')' : 'none'">

<span
class="av-placeholder"
*ngIf="!profile.profileImage">

{{ profile.name ? profile.name[0] : '?' }}

</span>

</div>

<input
class="av-file-input"
type="file"
accept="image/*"
(change)="onFileSelected($event)">

</div>


<p class="av-hint">

Click to upload JPG PNG WEBP

</p>

</div>


<div class="form-field">

<label>
Full Name
</label>

<input
class="field-input"
[(ngModel)]="profile.name"
name="name">

</div>

</div>

</div>



<!-- RIGHT PANEL -->

<div class="col-right">


<div class="card-block">

<h4 class="block-title">

Professional Details

</h4>


<div class="fields-grid">


<div class="form-field">

<label>Specialization</label>

<input
class="field-input"
[(ngModel)]="profile.specialization"
name="specialization">

</div>


<div class="form-field">

<label>Experience Years</label>

<input
type="number"
class="field-input"
[(ngModel)]="profile.experienceYears"
name="experienceYears">

</div>


<div class="form-field">

<label>Consultation Fee</label>

<input
type="number"
class="field-input"
[(ngModel)]="profile.consultationFee"
name="consultationFee">

</div>


<div class="form-field">

<label>Clinic Name</label>

<input
class="field-input"
[(ngModel)]="profile.clinicName"
name="clinicName">

</div>


<div class="form-field">

<label>Clinic Location</label>

<input
class="field-input"
[(ngModel)]="profile.clinicLocation"
name="clinicLocation">

</div>


<div class="form-field">
<label>Treatment System</label>

<div class="chip-group">

<button
type="button"
class="chip"
*ngFor="let system of treatmentOptions"
[class.active]="profile.treatmentSystem.includes(system)"
(click)="toggleTreatment(system)">

{{ system }}

</button>

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

.root{
padding:24px;
background: var(--bg-main);
min-height:100vh;
font-family: inherit;
color: var(--text-main);
}

.page-head{
display:flex;
justify-content:space-between;
margin-bottom:20px;
}

.page-title{
font-size:22px;
font-weight:600;
}

.save-btn{
background:#3b5bdb;
color:white;
border:none;
padding:10px 18px;
border-radius:10px;
cursor:pointer;
}

.form-layout{
display:grid;
grid-template-columns:300px 1fr;
gap:20px;
}

.card-block{
background: var(--bg-card);
padding:20px;
border-radius:14px;
border: 1px solid var(--border-light);
color: var(--text-main);
}
.chip-group{
display:flex;
flex-wrap:wrap;
gap:10px;
}

.chip{
padding:8px 14px;
border-radius:20px;
border:1px solid var(--border-light);
background:var(--bg-main);
cursor:pointer;
font-size:13px;
transition:all .2s ease;
}

.chip:hover{
border-color:#3b5bdb;
}

.chip.active{
background:#3b5bdb;
color:white;
border-color:#3b5bdb;
}
.block-title{
font-size:13px;
margin-bottom:12px;
font-weight:600;
}

.av-wrap{
width:100px;
height:100px;
position:relative;
cursor:pointer;
}

.av-img{
width:100%;
height:100%;
border-radius:20px;
background: var(--bg-secondary);
background-size:cover;
background-position:center;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
color: var(--primary-color);
font-weight:bold;
}

.av-file-input{
position:absolute;
inset:0;
opacity:0;
cursor:pointer;
}

.fields-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.field-input{
padding:10px;
border-radius:8px;
border:1px solid var(--border-light);
width:100%;
background: var(--bg-main);
color: var(--text-main);
}

`]

})

export class DoctorProfileComponent implements OnInit {

  profile: any = {};
  treatmentOptions = [
    'Allopathy',
    'Siddha',
    'Homeopathy',
    'Ayurveda',
    'Unani'
  ];

  selectedFile: File | null = null;

  pageLoading = true;

  isSaving = false;


  constructor(

    private http: HttpClient,

    private doctorService: DoctorService,

    private authService: AuthService,

    private toast: ToastService,

    private cdr: ChangeDetectorRef

  ) { }


  ngOnInit() {

    this.fetchProfile();

  }

  toggleTreatment(system: string) {

    if (!this.profile.treatmentSystem) {
      this.profile.treatmentSystem = [];
    }

    const index = this.profile.treatmentSystem.indexOf(system);

    if (index > -1) {
      this.profile.treatmentSystem.splice(index, 1);
    } else {
      this.profile.treatmentSystem.push(system);
    }

  }

  fetchProfile() {

    this.http.get(

      'http://localhost:5000/api/auth/me',

      {

        headers: {

          Authorization:

            `Bearer ${this.authService.getToken()}`

        }

      }

    ).subscribe({

      next: (user: any) => {

        this.profile.name = user.name || '';

        this.profile.profileImage = user.profile_image || '';

        this.profile.specialization = user.specialization || '';

        this.profile.experienceYears = user.experience_years || 0;

        this.profile.consultationFee = user.consultation_fee || 0;

        this.profile.clinicName = user.clinic_name || '';

        this.profile.clinicLocation = user.clinic_location || '';

        this.profile.treatmentSystem = user.treatment_system ? user.treatment_system.split(',') : [];
        // Sync Navbar
        this.authService.updateUserName(this.profile.name, this.profile.profileImage);
        this.pageLoading = false;
        this.cdr.detectChanges();
      },

      error: () => {

        this.toast.error("Load failed");

        this.pageLoading = false;

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

    };

    reader.readAsDataURL(file);

  }
  saveProfile(): void {
    this.isSaving = true;

    const formData = new FormData();
    formData.append('name', this.profile.name || '');

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.http.put(
      'http://localhost:5000/api/auth/profile',
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      }
    ).pipe(
      mergeMap((response: any) => {
        if (response?.user?.profile_image) {
          this.profile.profileImage = response.user.profile_image;
        }

        return this.doctorService.createProfile({
          specialization: this.profile.specialization || '',
          experienceYears: this.profile.experienceYears || 0,
          consultationFee: this.profile.consultationFee || 0,
          clinicName: this.profile.clinicName || '',
          clinicLocation: this.profile.clinicLocation || '',
          treatment_system: Array.isArray(this.profile.treatmentSystem) ? this.profile.treatmentSystem.join(',') : (this.profile.treatmentSystem || '')
        });
      })
    ).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully');
        // Sync Navbar
        this.authService.updateUserName(this.profile.name, this.profile.profileImage);
        this.isSaving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.toast.error('Failed to update profile');
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

}