import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // ✅ ADD THIS BLOCK
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  },

  {
    path: 'doctor-dashboard',
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component')
        .then(m => m.DoctorDashboardComponent),
    canActivate: [authGuard, roleGuard('doctor')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./doctor-dashboard/overview/doctor-overview.component')
            .then(m => m.DoctorOverviewComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./doctor-dashboard/profile/doctor-profile.component')
            .then(m => m.DoctorProfileComponent)
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./doctor-dashboard/patient-requests/patient-requests.component')
            .then(m => m.PatientRequestsComponent)
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./doctor-dashboard/schedule-manager/schedule-manager.component')
            .then(m => m.ScheduleManagerComponent)
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./patient-dashboard/find-doctors/find-doctors.component')
            .then(m => m.FindDoctorsComponent)
      },
    ]
  },

  {
    path: 'patient-dashboard',
    loadComponent: () =>
      import('./patient-dashboard/patient-dashboard.component')
        .then(m => m.PatientDashboardComponent),
    canActivate: [authGuard, roleGuard('patient')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./patient-dashboard/overview/patient-overview.component')
            .then(m => m.PatientOverviewComponent)
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./patient-dashboard/find-doctors/find-doctors.component')
            .then(m => m.FindDoctorsComponent)
      },
      {
        path: 'doctors/:id',
        loadComponent: () =>
          import('./patient-dashboard/doctor-details/doctor-details.component')
            .then(m => m.DoctorDetailsComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./patient-dashboard/my-appointments/my-appointments.component')
            .then(m => m.MyAppointmentsComponent)
      },

      // ✅ ADD THIS
      {
        path: 'settings',
        loadComponent: () =>
          import('./profile-settings/profile-settings.component')
            .then(m => m.ProfileSettingsComponent)
      }
    ]
  },

  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },

  {
    path: 'profile-settings',
    loadComponent: () =>
      import('./profile-settings/profile-settings.component')
        .then(m => m.ProfileSettingsComponent),
    canActivate: [authGuard]
  },

  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component')
        .then(m => m.LandingComponent)
  },

  // ⚠️ KEEP THIS LAST ALWAYS
  { path: '**', redirectTo: '' }
];