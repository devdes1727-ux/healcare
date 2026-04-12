import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  name: string;
  role: string;
  email?: string;
  token?: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    if (token && role && name) {
      this.currentUserSubject.next({ name, role, token, email: email || undefined });
    } else if (token && role) {
      // Stale session: fetch name from server
      this.http.get(`${this.apiUrl}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (res: any) => {
          const userName = res.name || res.Name || 'User';
          const profileImage = res.profile_image || '';
          const email = res.email || '';
          localStorage.setItem('name', userName);
          if (email) localStorage.setItem('email', email);
          if (profileImage) localStorage.setItem('profileImage', profileImage);
          this.currentUserSubject.next({ name: userName, role, token, profileImage, email: email || undefined });
        },
        error: () => {
          // Token expired or invalid — clear stale data
          this.logout();
        }
      });
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setUserData(res);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          this.setUserData(res);
        }
      })
    );
  }

  private setUserData(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('name', res.name);
    if (res.email) localStorage.setItem('email', res.email);
    if (res.user && res.user.profile_image) {
      localStorage.setItem('profileImage', res.user.profile_image);
    }
    this.currentUserSubject.next({ 
      name: res.name, 
      role: res.role, 
      token: res.token,
      email: res.email,
      profileImage: res.user?.profile_image 
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('profileImage');
    this.currentUserSubject.next(null);
  }

  updateUserName(name: string, profileImage?: string) {
    localStorage.setItem('name', name);
    if (profileImage) localStorage.setItem('profileImage', profileImage);
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      this.currentUserSubject.next({ ...currentUser, name, profileImage: profileImage || currentUser.profileImage });
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    return this.currentUserSubject.value?.role || localStorage.getItem('role') || '';
  }
}
