import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:5000/api/reviews';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  }

  addReview(reviewData: any): Observable<any> {
    return this.http.post(this.apiUrl, reviewData, { headers: this.getHeaders() });
  }

  getDoctorReviews(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getPlatformReviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/platform`);
  }
}
