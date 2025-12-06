import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnnonceService, Annonce } from '../Service/annonces-service.service';

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  views: number;
}

interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  ville?: string;
  avatar?: string;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  currentSection = 'dashboard';
  annonces: Annonce[] = [];
  filteredAnnonces: Annonce[] = [];
  recentAnnonces: Annonce[] = [];
  
  stats: DashboardStats = {
    total: 0,
    active: 0,
    inactive: 0,
    views: 0
  };

  user: User = {
    id: 1,
    nom: 'John Doe',
    email: 'john.doe@exemple.com',
    telephone: '',
    ville: ''
  };

  // Filters
  filterType = '';
  filterStatus = '';
  searchQuery = '';
  sortBy = 'recent';

  // Loading states
  isLoading = true;
  isDeleting = false;
  deletingId: number | null = null;

  // Alert
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' | '' = '';
  showAlert = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private annonceService: AnnonceService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadUserAnnonces();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  loadUserAnnonces(): void {
    this.isLoading = true;

    this.annonceService.getUserAnnonces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.annonces = response.data;
            this.filteredAnnonces = [...this.annonces];
            this.updateStats();
            this.loadRecentAnnonces();
            this.applyFilters();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading annonces:', error);
          this.displayAlert('Erreur lors du chargement des annonces', 'error');
          this.isLoading = false;
        }
      });
  }

  updateStats(): void {
    this.stats.total = this.annonces.length;
    this.stats.active = this.annonces.filter(a => a.statut === 'active').length;
    this.stats.inactive = this.annonces.filter(a => a.statut === 'inactive').length;
    this.stats.views = this.annonces.reduce((sum, a) => sum + (a.views || 0), 0);
  }

  loadRecentAnnonces(): void {
    this.recentAnnonces = this.annonces
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 3);
  }

  showSection(section: string): void {
    this.currentSection = section;
  }

  applyFilters(): void {
    let filtered = [...this.annonces];

    // Filter by type
    if (this.filterType) {
      filtered = filtered.filter(a => a.type === this.filterType);
    }

    // Filter by status
    if (this.filterStatus) {
      filtered = filtered.filter(a => a.statut === this.filterStatus);
    }

    // Search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.titre.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.ville.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.prix || 0) - (a.prix || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.prix || 0) - (b.prix || 0));
        break;
    }

    this.filteredAnnonces = filtered;
  }

  resetFilters(): void {
    this.filterType = '';
    this.filterStatus = '';
    this.searchQuery = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  createAnnonce(): void {
    this.router.navigate(['/annonces']);
  }

  viewAnnonce(id: number): void {
    this.router.navigate(['/annonces', id]);
  }

  editAnnonce(id: number): void {
    this.router.navigate(['/annonces', id, 'edit']);
  }

  deleteAnnonce(id: number): void {
    const annonce = this.annonces.find(a => a.id === id);
    if (!annonce) return;

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${annonce.titre}" ?`);
    if (!confirmed) return;

    this.isDeleting = true;
    this.deletingId = id;

    this.annonceService.deleteAnnonce(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.annonces = this.annonces.filter(a => a.id !== id);
            this.updateStats();
            this.loadRecentAnnonces();
            this.applyFilters();
            this.displayAlert('Annonce supprimée avec succès', 'success');
          }
          this.isDeleting = false;
          this.deletingId = null;
        },
        error: (error) => {
          console.error('Error deleting annonce:', error);
          this.displayAlert('Erreur lors de la suppression', 'error');
          this.isDeleting = false;
          this.deletingId = null;
        }
      });
  }

  toggleAnnonceStatus(id: number): void {
    const annonce = this.annonces.find(a => a.id === id);
    if (!annonce) return;

    const newStatus = annonce.statut === 'active' ? 'inactive' : 'active';

    this.annonceService.updateStatus(id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.annonces.findIndex(a => a.id === id);
            if (index !== -1) {
              this.annonces[index] = response.data;
              this.updateStats();
              this.applyFilters();
              this.displayAlert(
                `Annonce ${newStatus === 'active' ? 'activée' : 'désactivée'} avec succès`, 
                'success'
              );
            }
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.displayAlert('Erreur lors de la mise à jour du statut', 'error');
        }
      });
  }

  displayAlert(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
      setTimeout(() => {
        this.alertMessage = '';
        this.alertType = '';
      }, 300);
    }, 4000);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!confirmed) return;

    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  getTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'vente': 'Vente',
      'location': 'Location',
      'service': 'Service',
      'emploi': 'Emploi'
    };
    return types[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'vente': '🏷️',
      'location': '🏠',
      'service': '🛠️',
      'emploi': '💼'
    };
    return icons[type] || '📝';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatPrice(price: number | null): string {
    if (!price) return 'À négocier';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }
}