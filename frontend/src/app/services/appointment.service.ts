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

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, data);
  }

  bookWalkin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book-walkin`, data);
  }

  mockPaymentSuccess(appointmentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mock-payment`, { appointmentId });
  }

  getPatientAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient`);
  }

  getDoctorAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor`);
  }

  updateAppointmentStatus(
    id: number,
    status: string,
    appointment_source: string,
    visitSummary?: string,
    followUpDate?: string
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      {
        status,
        appointment_source,
        visitSummary,
        followUpDate
      }
    );

  }

  rescheduleAppointment(id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}/reschedule/${id}`,
      data
    );
  }

  getAvailableSlots(doctorId: number, date: string) {
    return this.http.get(
      `${this.apiUrl}/available-slots/${doctorId}/${date}`
    );
  }
}
