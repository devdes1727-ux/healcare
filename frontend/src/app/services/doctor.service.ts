import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:5000/api/doctors';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDoctors(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getDoctorBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/${slug}`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  createProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, profileData);
  }

  approveDoctor(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${id}`, {});
  }

  // Leave Management
  addLeave(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave`, data);
  }

  getLeaveDays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leave/me`);
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leave/${id}`);
  }

  upgradeSubscription(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/upgrade-subscription`, data);
  }

  promoteProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/promote-profile`, data);
  }

  createSubscriptionSession(): Observable<any> {
    return this.http.post(`http://localhost:5000/api/payments/create-subscription-session`, {});
  }

  createPromotionSession(): Observable<any> {
    return this.http.post(`http://localhost:5000/api/payments/create-promotion-session`, {});
  }
}
