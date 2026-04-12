import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // =========================
  // INIT USER (FIXED)
  // =========================
  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const profileImage = localStorage.getItem('profileImage');

    if (token && role && name) {
      this.currentUserSubject.next({
        name,
        role,
        token,
        email: email || undefined,
        profileImage: profileImage || undefined
      });

      return;
    }

    // fallback: fetch from backend
    if (token) {
      this.http.get<any>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          const user: User = {
            name: res.name || 'User',
            role: res.role,
            email: res.email,
            token,
            profileImage: res.profile_image || res.profileImage || ''
          };

          this.saveToStorage(user);
          this.currentUserSubject.next(user);
        },
        error: () => this.logout()
      });
    }
  }

  // =========================
  // LOGIN
  // =========================
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        const user: User = {
          name: res.name,
          role: res.role,
          email: res.email,
          token: res.token,
          profileImage: res.profile_image
        };

        this.saveToStorage(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  // =========================
  // REGISTER
  // =========================
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((res: any) => {
        const newUser: User = {
          name: res.name,
          role: res.role,
          email: res.email,
          token: res.token,
          profileImage: res.profile_image
        };

        this.saveToStorage(newUser);
        this.currentUserSubject.next(newUser);
      })
    );
  }

  // =========================
  // SAVE STORAGE (FIXED)
  // =========================
  private saveToStorage(user: User) {
    localStorage.setItem('token', user.token || '');
    localStorage.setItem('role', user.role);
    localStorage.setItem('name', user.name);

    if (user.email) localStorage.setItem('email', user.email);
    if (user.profileImage) localStorage.setItem('profileImage', user.profileImage);
  }

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  // =========================
  // UPDATE NAME + IMAGE
  // =========================
  updateUserName(name: string, profileImage?: string) {
    const current = this.currentUserSubject.value;

    if (!current) return;

    const updated: User = {
      ...current,
      name,
      profileImage: profileImage || current.profileImage
    };

    this.saveToStorage(updated);
    this.currentUserSubject.next(updated);
  }

  // =========================
  // HELPERS
  // =========================
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