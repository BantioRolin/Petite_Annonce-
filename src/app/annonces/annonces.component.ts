import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ImageFile {
  data: string;
  name: string;
}

interface Annonce {
  id: number;
  titre: string;
  type: string;
  prix: number | null;
  description: string;
  ville: string;
  quartier: string;
  telephone: string;
  email: string;
  images: string[];
  date: string;
  views: number;
  statut: string;
}

@Component({
  selector: 'app-create-annonce',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './annonces.component.html',
  styleUrls: ['./annonces.component.scss']
})
export class AnnoncesComponent implements OnInit {
  annonceForm!: FormGroup;
  uploadedImages: ImageFile[] = [];
  
  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  
  alertMessage = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert = false;
  
  titreCount = 0;
  descriptionCount = 0;
  isSubmitting = false;
  
  villes = [
    'Bamenda', 'Yaoundé', 'Douala', 'Bafoussam', 
    'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 
    'Buea', 'Limbe'
  ];
  
  typesAnnonce = [
    { 
      value: 'vente', 
      label: 'Vente',
      icon: 'https://cdn-icons-png.flaticon.com/512/3514/3514447.png'
    },
    { 
      value: 'location', 
      label: 'Location',
      icon: 'https://cdn-icons-png.flaticon.com/512/1183/1183336.png'
    },
    { 
      value: 'service', 
      label: 'Service',
      icon: 'https://cdn-icons-png.flaticon.com/512/3074/3074767.png'
    },
    { 
      value: 'emploi', 
      label: 'Emploi',
      icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCharacterCounters();
  }

  initForm(): void {
    this.annonceForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      prix: [null, [Validators.min(0)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      ville: ['', Validators.required],
      quartier: [''],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+237)?[62]\d{8}$/)]],
      email: ['', [Validators.email]]
    });
  }

  setupCharacterCounters(): void {
    this.annonceForm.get('titre')?.valueChanges.subscribe(value => {
      this.titreCount = value ? value.length : 0;
    });

    this.annonceForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionCount = value ? value.length : 0;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.processFiles(files);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
    
    if (!event.dataTransfer?.files) return;
    const files = Array.from(event.dataTransfer.files);
    this.processFiles(files);
  }

  processFiles(files: File[]): void {
    if (this.uploadedImages.length >= this.MAX_IMAGES) {
      this.displayAlert(`Vous avez atteint la limite de ${this.MAX_IMAGES} images`, 'error');
      return;
    }

    const remainingSlots = this.MAX_IMAGES - this.uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      this.displayAlert(`Seulement ${remainingSlots} image(s) peuvent être ajoutée(s)`, 'error');
    }

    filesToProcess.forEach(file => {
      if (file.size > this.MAX_FILE_SIZE) {
        this.displayAlert(`L'image ${file.name} dépasse la taille maximale de 5 MB`, 'error');
        return;
      }

      if (!file.type.match('image/(jpeg|png|jpg|webp)')) {
        this.displayAlert('Format non supporté. Utilisez JPG, PNG ou WEBP', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.uploadedImages.push({
            data: e.target.result as string,
            name: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  displayAlert(message: string, type: 'success' | 'error'): void {
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

  onSubmit(): void {
    if (this.annonceForm.invalid) {
      this.markFormGroupTouched(this.annonceForm);
      this.displayAlert('Veuillez remplir correctement tous les champs obligatoires', 'error');
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.displayAlert('Ajoutez au moins une image pour votre annonce', 'error');
      return;
    }

    this.isSubmitting = true;

    const annonce: Annonce = {
      id: Date.now(),
      ...this.annonceForm.value,
      images: this.uploadedImages.map(img => img.data),
      date: new Date().toISOString(),
      views: 0,
      statut: 'active'
    };

    // Simulate API call
    setTimeout(() => {
      try {
        const annonces: Annonce[] = JSON.parse(localStorage.getItem('annonces') || '[]');
        annonces.unshift(annonce);
        localStorage.setItem('annonces', JSON.stringify(annonces));

        this.displayAlert('Annonce publiée avec succès ! Redirection en cours...', 'success');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      } catch (error) {
        this.displayAlert('Erreur lors de la publication. Veuillez réessayer.', 'error');
        this.isSubmitting = false;
      }
    }, 800);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.annonceForm.dirty || this.uploadedImages.length > 0) {
      const confirmed = confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données seront perdues.');
      if (!confirmed) return;
    }
    this.router.navigate(['/dashboard']);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    fileInput?.click();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.annonceForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.annonceForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['email']) return 'Email invalide';
    if (field.errors['pattern']) return 'Format invalide';
    if (field.errors['min']) return 'Le prix doit être positif';
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;

    return 'Champ invalide';
  }
}