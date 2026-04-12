import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:5000/api/slots';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  }

  createSlot(slotData: any): Observable<any> {
    return this.http.post(this.apiUrl, slotData, { headers: this.getHeaders() });
  }

  getMySlots(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  deleteSlot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getSlotsByDoctorId(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor/${doctorId}`, { headers: this.getHeaders() });
  }
}
