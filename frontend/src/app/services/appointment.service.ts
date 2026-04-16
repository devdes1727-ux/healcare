import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5000/api/appointments';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, data, { headers: this.getHeaders() });
  }

  mockPaymentSuccess(appointmentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mock-payment`, { appointmentId }, { headers: this.getHeaders() });
  }

  getPatientAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient`, { headers: this.getHeaders() });
  }

  getDoctorAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor`, { headers: this.getHeaders() });
  }

  updateAppointmentStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  rescheduleAppointment(id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}/reschedule/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getAvailableSlots(doctorId: number, date: string) {

    return this.http.get(
      `${this.apiUrl}/available-slots/${doctorId}/${date}`,
      { headers: this.getHeaders() }
    );

  }
}
