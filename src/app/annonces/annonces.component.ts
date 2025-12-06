import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnnonceService, Annonce } from './../Service/annonces-service.service';

interface ImageFile {
  data: string;
  name: string;
  file?: File;
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
export class AnnoncesComponent implements OnInit, OnDestroy {
  annonceForm!: FormGroup;
  uploadedImages: ImageFile[] = [];
  
  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' | '' = '';
  showAlert = false;
  
  titreCount = 0;
  descriptionCount = 0;
  isSubmitting = false;
  uploadProgress = 0;
  
  private destroy$ = new Subject<void>();
  
  villes = [
    'Bamenda', 'Yaoundé', 'Douala', 'Bafoussam', 
    'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 
    'Buea', 'Limbe', 'Kribi', 'Ebolowa'
  ];
  
  typesAnnonce = [
    { 
      value: 'vente', 
      label: 'Vente',
      icon: 'https://i.pinimg.com/1200x/1e/61/35/1e613566d77e10b94b3cce09ebf1ca29.jpg',
      description: 'Vendez vos biens'
    },
    { 
      value: 'location', 
      label: 'Location',
      icon: 'https://i.pinimg.com/736x/5f/02/bd/5f02bd3ab817ae1e4c352b1f2ea3bd5b.jpg',
      description: 'Louez votre propriété'
    },
    { 
      value: 'service', 
      label: 'Service',
      icon: 'https://i.pinimg.com/736x/c8/69/db/c869db8ebd11924c5f34d49224b16433.jpg',
      description: 'Proposez vos services'
    },
    { 
      value: 'emploi', 
      label: 'Emploi',
      icon: 'https://i.pinimg.com/1200x/c1/f3/de/c1f3de20dc86889561a311fc01bcf4d7.jpg',
      description: 'Offres d\'emploi'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private annonceService: AnnonceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCharacterCounters();
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.displayAlert('Vous devez être connecté pour créer une annonce', 'warning');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  initForm(): void {
    this.annonceForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      type: ['', Validators.required],
      prix: [null, [Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      ville: ['', Validators.required],
      quartier: ['', Validators.maxLength(100)],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+237)?[62]\d{8}$/)]],
      email: ['', [Validators.email]]
    });
  }

  setupCharacterCounters(): void {
    this.annonceForm.get('titre')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.titreCount = value ? value.length : 0;
      });

    this.annonceForm.get('description')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
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
      this.displayAlert(`Seulement ${remainingSlots} image(s) peuvent être ajoutée(s)`, 'warning');
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
            name: file.name,
            file: file
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.displayAlert('Image supprimée', 'info');
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

  async onSubmit(): Promise<void> {
    if (this.annonceForm.invalid) {
      this.markFormGroupTouched(this.annonceForm);
      this.displayAlert('Veuillez remplir correctement tous les champs obligatoires', 'error');
      this.scrollToFirstError();
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.displayAlert('Ajoutez au moins une image pour votre annonce', 'error');
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    try {
      // First, upload images to server
      let imageUrls: string[] = [];
      
      if (this.uploadedImages.length > 0) {
        const files = this.uploadedImages
          .filter(img => img.file)
          .map(img => img.file!);
        
        if (files.length > 0) {
          this.displayAlert('Upload des images en cours...', 'info');
          this.uploadProgress = 30;
          
          const uploadResponse = await this.annonceService
            .uploadImages(files)
            .pipe(takeUntil(this.destroy$))
            .toPromise();
          
          if (uploadResponse?.success && uploadResponse.data) {
            imageUrls = uploadResponse.data;
            this.uploadProgress = 60;
          }
        } else {
          // Use base64 images if no files (fallback)
          imageUrls = this.uploadedImages.map(img => img.data);
        }
      }

      // Then create the annonce
      const annonceData: Annonce = {
        ...this.annonceForm.value,
        images: imageUrls,
        statut: 'active'
      };

      this.uploadProgress = 80;

      this.annonceService.createAnnonce(annonceData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.uploadProgress = 100;
            
            if (response.success) {
              this.displayAlert('Annonce publiée avec succès ! Redirection en cours...', 'success');
              
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1500);
            } else {
              throw new Error(response.message || 'Erreur lors de la publication');
            }
          },
          error: (error) => {
            console.error('Error creating annonce:', error);
            this.displayAlert(
              error.message || 'Erreur lors de la publication. Veuillez réessayer.', 
              'error'
            );
            this.isSubmitting = false;
            this.uploadProgress = 0;
          }
        });

    } catch (error: any) {
      console.error('Error in submission:', error);
      this.displayAlert(
        error.message || 'Erreur lors de l\'upload des images. Veuillez réessayer.', 
        'error'
      );
      this.isSubmitting = false;
      this.uploadProgress = 0;
    }
  }

  private scrollToFirstError(): void {
    const firstError = document.querySelector('.form-group.invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
    if (field.errors['pattern']) return 'Format invalide (ex: +237 6XX XX XX XX)';
    if (field.errors['min']) return 'Le prix doit être positif';
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    }
    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    }

    return 'Champ invalide';
  }

  selectType(typeValue: string): void {
    this.annonceForm.patchValue({ type: typeValue });
  }
}