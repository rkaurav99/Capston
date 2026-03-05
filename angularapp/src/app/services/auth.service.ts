import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Login } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public apiUrl = '';

  // BehaviorSubjects to track user role and userId across the app
  private userRoleSubject = new BehaviorSubject<string>(localStorage.getItem('userRole') || '');
  private userIdSubject = new BehaviorSubject<number>(Number(localStorage.getItem('userId')) || 0);

  public userRole$ = this.userRoleSubject.asObservable();
  public userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Base64-encode a string (used to obscure sensitive fields in the request payload).
   */
  private encodeBase64(value: string): string {
    return btoa(value);
  }

  /**
   * Register a new user.
   * Encodes Email and Password as Base64 before sending.
   */
  register(user: User): Observable<any> {
    const encoded = {
      ...user,
      Email: this.encodeBase64(user.Email),
      Password: this.encodeBase64(user.Password)
    };
    return this.http.post(`${this.apiUrl}/api/register`, encoded, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  /**
   * Login a user.
   * Encodes Email and Password as Base64 before sending.
   * On success, stores JWT token in localStorage and updates role/userId BehaviorSubjects.
   */
  login(login: Login): Observable<any> {
    const encoded = {
      Email: this.encodeBase64(login.Email),
      Password: this.encodeBase64(login.Password)
    };
    return this.http.post(`${this.apiUrl}/api/login`, encoded, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);

          // Decode JWT payload to extract role and userId
          const payload = this.decodeToken(response.token);
          const role = payload.role || '';
          const userId = payload.UserId || '';

          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', userId);
          this.userRoleSubject.next(role);
          this.userIdSubject.next(Number(userId) || 0);
        }
      })
    );
  }

  /**
   * Decode a JWT token's payload (without verification).
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return {};
    }
  }

  /**
   * Get the stored JWT token from localStorage.
   */
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * Check if the user is currently logged in (has a token).
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get the current user's role.
   */
  getUserRole(): string {
    return localStorage.getItem('userRole') || '';
  }

  /**
   * Get the current user's ID.
   */
  getUserId(): number {
    return Number(localStorage.getItem('userId')) || 0;
  }

  /**
   * Logout the user — clear all stored data and reset BehaviorSubjects.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    this.userRoleSubject.next('');
    this.userIdSubject.next(0);
  }

  /**
   * Build HTTP headers with the JWT Authorization token.
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
