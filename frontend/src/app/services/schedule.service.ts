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

  createSlot(slotData: any): Observable<any> {
    return this.http.post(this.apiUrl, slotData);
  }

  getMySlots(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`);
  }

  deleteSlot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getSlotsByDoctorId(doctorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctor/${doctorId}`);
  }
}
