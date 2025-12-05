import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- HEADER -->
    <header class="header">
        <nav class="navbar">
            <div class="logo">
                <h1>📢 Petites Annonces</h1>
            </div>
            <div class="user-menu">
                <div class="user-info">
                    <div class="avatar">JD</div>
                    <div>
                        <div style="font-weight: 600;">John Doe</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">john.doe&#64;exemple.com</div>
                    </div>
                </div>
                <button class="btn btn-logout" (click)="logout()">Déconnexion</button>
            </div>
        </nav>
    </header>

    <!-- MAIN CONTAINER -->
    <div class="main-container">
        <!-- SIDEBAR -->
        <aside class="sidebar">
            <h3>Menu</h3>
            <ul class="menu-list">
                <li class="menu-item" [class.active]="currentSection === 'dashboard'" (click)="showSection('dashboard')">
                    <span class="menu-icon">📊</span>
                    <span>Tableau de bord</span>
                </li>
                <li class="menu-item" [class.active]="currentSection === 'annonces'" (click)="showSection('annonces')">
                    <span class="menu-icon">📝</span>
                    <span>Mes annonces</span>
                </li>
                <li class="menu-item" [class.active]="currentSection === 'profil'" (click)="showSection('profil')">
                    <span class="menu-icon">👤</span>
                    <span>Mon profil</span>
                </li>
                <li class="menu-item" [class.active]="currentSection === 'parametres'" (click)="showSection('parametres')">
                    <span class="menu-icon">⚙️</span>
                    <span>Paramètres</span>
                </li>
            </ul>
        </aside>

        <!-- CONTENT AREA -->
        <main class="content-area">
            <!-- DASHBOARD SECTION -->
            <div id="dashboard-section" class="section" [style.display]="currentSection === 'dashboard' ? 'block' : 'none'">
                <div class="content-header">
                    <h2 class="content-title">Tableau de bord</h2>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">{{stats.total}}</div>
                        <div class="stat-label">Total des annonces</div>
                    </div>
                    <div class="stat-card secondary">
                        <div class="stat-value">{{stats.active}}</div>
                        <div class="stat-label">Annonces actives</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-value">{{stats.views}}</div>
                        <div class="stat-label">Vues totales</div>
                    </div>
                </div>

                <h3 style="margin-bottom: 1rem;">Annonces récentes</h3>
                <div *ngIf="recentAnnonces.length === 0">
                    <p style="color: #6b7280;">Aucune annonce récente</p>
                </div>
                <div class="annonces-grid" *ngIf="recentAnnonces.length > 0">
                    <div class="annonce-card" *ngFor="let annonce of recentAnnonces">
                        <div class="annonce-image">
                            <img *ngIf="annonce.images?.length" [src]="annonce.images[0]" [alt]="annonce.titre">
                            <span *ngIf="!annonce.images?.length">📷</span>
                        </div>
                        <div class="annonce-info">
                            <div class="annonce-header">
                                <h3 class="annonce-title">{{annonce.titre}}</h3>
                                <span class="badge badge-success">Nouvelle</span>
                            </div>
                            <p class="annonce-description">{{annonce.description.substring(0, 100)}}...</p>
                            <div class="annonce-meta">
                                <span>📅 {{annonce.date | date:'dd/MM/yyyy'}}</span>
                            </div>
                        </div>
                        <div class="annonce-actions">
                            <button class="btn btn-sm btn-secondary" (click)="viewAnnonce(annonce.id)">
                                👁️ Voir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ANNONCES SECTION -->
            <div id="annonces-section" class="section" [style.display]="currentSection === 'annonces' ? 'block' : 'none'">
                <div class="content-header">
                    <h2 class="content-title">Mes annonces</h2>
                    <button class="btn btn-primary" (click)="openCreateModal()">
                        <span>➕</span>
                        <span>Créer une annonce</span>
                    </button>
                </div>

                <div *ngIf="annonces.length === 0" class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3 class="empty-state-title">Aucune annonce</h3>
                    <p class="empty-state-text">Vous n'avez pas encore créé d'annonce. Commencez maintenant !</p>
                    <button class="btn btn-primary" (click)="openCreateModal()">Créer ma première annonce</button>
                </div>

                <div class="annonces-grid" *ngIf="annonces.length > 0">
                    <div class="annonce-card" *ngFor="let annonce of annonces">
                        <div class="annonce-image">
                            <img *ngIf="annonce.images?.length" [src]="annonce.images[0]" [alt]="annonce.titre">
                            <span *ngIf="!annonce.images?.length">📷</span>
                        </div>
                        <div class="annonce-info">
                            <div class="annonce-header">
                                <h3 class="annonce-title">{{annonce.titre}}</h3>
                                <span class="badge badge-primary">{{annonce.type}}</span>
                            </div>
                            <p class="annonce-description">{{annonce.description.substring(0, 150)}}...</p>
                            <div class="annonce-meta">
                                <span>👁️ {{annonce.views || 0}} vues</span>
                                <span>📅 {{annonce.date | date:'dd/MM/yyyy'}}</span>
                                <span *ngIf="annonce.prix">💰 {{annonce.prix}} FCFA</span>
                            </div>
                        </div>
                        <div class="annonce-actions">
                            <button class="btn btn-sm btn-secondary" (click)="viewAnnonce(annonce.id)">
                                👁️ Voir
                            </button>
                            <button class="btn btn-sm btn-warning" (click)="editAnnonce(annonce.id)">
                                ✏️ Modifier
                            </button>
                            <button class="btn btn-sm btn-danger" (click)="deleteAnnonce(annonce.id)">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PROFIL SECTION -->
            <div id="profil-section" class="section" [style.display]="currentSection === 'profil' ? 'block' : 'none'">
                <div class="content-header">
                    <h2 class="content-title">Mon profil</h2>
                </div>
                <div style="max-width: 600px;">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" [(ngModel)]="profileData.nom" name="nom">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" [(ngModel)]="profileData.email" name="email" disabled>
                    </div>
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" [(ngModel)]="profileData.telephone" name="telephone" placeholder="+237 6XX XX XX XX">
                    </div>
                    <div class="form-group">
                        <label>Ville</label>
                        <input type="text" [(ngModel)]="profileData.ville" name="ville" placeholder="Bamenda">
                    </div>
                    <button class="btn btn-primary" (click)="saveProfile()">Enregistrer les modifications</button>
                </div>
            </div>

            <!-- PARAMETRES SECTION -->
            <div id="parametres-section" class="section" [style.display]="currentSection === 'parametres' ? 'block' : 'none'">
                <div class="content-header">
                    <h2 class="content-title">Paramètres</h2>
                </div>
                <div style="max-width: 600px;">
                    <h3 style="margin-bottom: 1rem;">Notifications</h3>
                    <div class="form-group">
                        <label class="checkbox-label" style="display: flex; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" [(ngModel)]="settings.emailNotif" name="emailNotif">
                            <span>Recevoir des notifications par email</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label" style="display: flex; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" [(ngModel)]="settings.alertes" name="alertes">
                            <span>Alertes pour les nouvelles annonces similaires</span>
                        </label>
                    </div>
                    <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--border-color);">
                    <h3 style="margin-bottom: 1rem;">Sécurité</h3>
                    <button class="btn btn-warning" (click)="changePassword()">Changer le mot de passe</button>
                </div>
            </div>
        </main>
    </div>

    <!-- MODAL CREATE/EDIT ANNONCE -->
    <div id="annonceModal" class="modal" [class.active]="isModalOpen">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">{{modalTitle}}</h3>
                <button class="btn-close" (click)="closeModal()">✕</button>
            </div>
            <form (submit)="onSubmit($event)">
                <div class="form-group">
                    <label>Titre de l'annonce *</label>
                    <input type="text" [(ngModel)]="formData.titre" name="titre" required placeholder="Ex: Appartement 2 pièces à louer">
                </div>

                <div class="form-group">
                    <label>Type d'annonce *</label>
                    <select [(ngModel)]="formData.type" name="type" required>
                        <option value="">Sélectionnez un type</option>
                        <option value="vente">Vente</option>
                        <option value="location">Location</option>
                        <option value="service">Service</option>
                        <option value="emploi">Emploi</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Description *</label>
                    <textarea [(ngModel)]="formData.description" name="description" required placeholder="Décrivez votre annonce en détail..."></textarea>
                </div>

                <div class="form-group">
                    <label>Prix (optionnel)</label>
                    <input type="number" [(ngModel)]="formData.prix" name="prix" placeholder="Ex: 50000">
                </div>

                <div class="form-group">
                    <label>Images</label>
                    <div class="image-upload-area" (click)="imageInput.click()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
                        <div>Cliquez pour ajouter des images</div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
                            Maximum 5 images
                        </div>
                    </div>
                    <input #imageInput type="file" accept="image/*" multiple style="display: none;" (change)="handleImageUpload($event)">
                    <div class="image-preview-grid" *ngIf="currentImages.length > 0">
                        <div *ngFor="let img of currentImages; let i = index" style="position: relative;">
                            <img [src]="img" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;">
                            <button type="button" (click)="removeImage(i)" style="position: absolute; top: 4px; right: 4px; background: red; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">✕</button>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
                    <button type="submit" class="btn btn-primary">Publier l'annonce</button>
                </div>
            </form>
        </div>
    </div>
  `,
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent2 implements OnInit {
  currentSection = 'dashboard';
  annonces: any[] = [];
  recentAnnonces: any[] = [];
  stats = { total: 0, active: 0, views: 0 };
  isModalOpen = false;
  modalTitle = 'Créer une annonce';
  currentImages: string[] = [];
  editingId: number | null = null;
  
  formData = {
    titre: '',
    type: '',
    description: '',
    prix: null as number | null
  };

  profileData = {
    nom: 'John Doe',
    email: 'john.doe@exemple.com',
    telephone: '',
    ville: ''
  };

  settings = {
    emailNotif: true,
    alertes: true
  };

  ngOnInit() {
    this.loadAnnonces();
    this.updateStats();
  }

  loadAnnonces() {
    const stored = localStorage.getItem('annonces');
    this.annonces = stored ? JSON.parse(stored) : [];
    this.recentAnnonces = this.annonces.slice(-3).reverse();
  }

  updateStats() {
    this.stats.total = this.annonces.length;
    this.stats.active = this.annonces.length;
    this.stats.views = this.annonces.reduce((sum, a) => sum + (a.views || 0), 0);
  }

  showSection(section: string) {
    this.currentSection = section;
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.modalTitle = 'Créer une annonce';
    this.editingId = null;
    this.currentImages = [];
    this.formData = { titre: '', type: '', description: '', prix: null };
  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleImageUpload(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    if (this.currentImages.length + files.length > 5) {
      alert('Maximum 5 images autorisées');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.currentImages.splice(index, 1);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    const newAnnonce = {
      id: this.editingId || Date.now(),
      ...this.formData,
      images: this.currentImages,
      date: new Date().toISOString(),
      views: 0
    };

    if (this.editingId) {
      const index = this.annonces.findIndex(a => a.id === this.editingId);
      this.annonces[index] = newAnnonce;
    } else {
      this.annonces.push(newAnnonce);
    }

    localStorage.setItem('annonces', JSON.stringify(this.annonces));
    this.loadAnnonces();
    this.updateStats();
    this.closeModal();
  }

  viewAnnonce(id: number) {
    console.log('View annonce', id);
    // Vous pouvez ajouter une navigation vers une page de détails
  }

  editAnnonce(id: number) {
    const annonce = this.annonces.find(a => a.id === id);
    if (annonce) {
      this.editingId = id;
      this.formData = { 
        titre: annonce.titre,
        type: annonce.type,
        description: annonce.description,
        prix: annonce.prix
      };
      this.currentImages = annonce.images || [];
      this.modalTitle = 'Modifier l\'annonce';
      this.isModalOpen = true;
    }
  }

  deleteAnnonce(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.annonces = this.annonces.filter(a => a.id !== id);
      localStorage.setItem('annonces', JSON.stringify(this.annonces));
      this.loadAnnonces();
      this.updateStats();
    }
  }

  saveProfile() {
    alert('Profil enregistré avec succès !');
    // Ici vous pouvez ajouter la logique pour sauvegarder dans une API
  }

  changePassword() {
    alert('Fonctionnalité de changement de mot de passe à implémenter');
    // Ici vous pouvez ouvrir un modal pour changer le mot de passe
  }

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Logique de déconnexion
      console.log('Déconnexion');
      // Vous pouvez rediriger vers la page de login
    }
  }
}