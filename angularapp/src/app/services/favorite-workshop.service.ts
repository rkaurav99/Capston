import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FavoriteWorkshop } from '../models/favorite-workshop.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteWorkshopService {
  public apiUrl = '';

  constructor(private http: HttpClient) {}

  addFavorite(workshopEventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/favorites/${workshopEventId}`, {});
  }

  removeFavorite(workshopEventId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/favorites/${workshopEventId}`);
  }

  getFavorites(): Observable<FavoriteWorkshop[]> {
    return this.http.get<FavoriteWorkshop[]>(`${this.apiUrl}/api/favorites`);
  }

  isFavorite(workshopEventId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/api/favorites/${workshopEventId}/is-favorite`);
  }
}
