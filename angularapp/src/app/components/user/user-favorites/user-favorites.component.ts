import { Component, OnInit } from '@angular/core';
import { FavoriteWorkshop } from '../../../models/favorite-workshop.model';
import { FavoriteWorkshopService } from '../../../services/favorite-workshop.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-favorites',
  templateUrl: './user-favorites.component.html',
  styleUrls: ['./user-favorites.component.css']
})
export class UserFavoritesComponent implements OnInit {
  favorites: FavoriteWorkshop[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private favoriteWorkshopService: FavoriteWorkshopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteWorkshopService.getFavorites().subscribe(
      (data) => {
        this.favorites = data;
        this.loading = false;
      },
      () => {
        this.loading = false;
        this.errorMessage = 'Failed to load favorites.';
      }
    );
  }

  removeFavorite(workshopEventId: number): void {
    this.favoriteWorkshopService.removeFavorite(workshopEventId).subscribe(
      () => this.loadFavorites(),
      (err) => this.errorMessage = err?.error?.message || 'Failed to remove favorite.'
    );
  }

  openWorkshop(workshopEventId: number): void {
    this.router.navigate(['/user/book-event', workshopEventId]);
  }
}
