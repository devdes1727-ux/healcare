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

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  }

  getDoctors(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, profileData, { headers: this.getHeaders() });
  }

  approveDoctor(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${id}`, {}, { headers: this.getHeaders() });
  }
}
