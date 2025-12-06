import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnnonceService, Annonce } from './../Service/annonces-service.service';

interface ImageFile {
  data: string;
  name: string;
  file?: File;
  isExisting?: boolean; // Flag to identify existing images
}

@Component({
  selector: 'app-edit-annonce',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './edit-annonce.component.html',
  styleUrls: ['./edit-annonce.component.scss']
})
export class EditAnnonceComponent implements OnInit, OnDestroy {
  annonceForm!: FormGroup;
  uploadedImages: ImageFile[] = [];
  annonceId!: number;
  originalAnnonce!: Annonce;
  
  readonly MAX_IMAGES = 5;
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' | 'info' | '' = '';
  showAlert = false;
  
  titreCount = 0;
  descriptionCount = 0;
  isSubmitting = false;
  isLoading = true;
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
      icon: 'https://cdn-icons-png.flaticon.com/512/3514/3514447.png',
      description: 'Vendez vos biens'
    },
    { 
      value: 'location', 
      label: 'Location',
      icon: 'https://cdn-icons-png.flaticon.com/512/1183/1183336.png',
      description: 'Louez votre propriété'
    },
    { 
      value: 'service', 
      label: 'Service',
      icon: 'https://cdn-icons-png.flaticon.com/512/3074/3074767.png',
      description: 'Proposez vos services'
    },
    { 
      value: 'emploi', 
      label: 'Emploi',
      icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      description: 'Offres d\'emploi'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private annonceService: AnnonceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCharacterCounters();
    this.loadAnnonce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnnonce(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.displayAlert('ID d\'annonce invalide', 'error');
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      return;
    }

    this.annonceId = parseInt(id, 10);
    
    this.annonceService.getAnnonceById(this.annonceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.originalAnnonce = response.data;
            this.populateForm(response.data);
            this.isLoading = false;
          } else {
            throw new Error('Annonce non trouvée');
          }
        },
        error: (error) => {
          console.error('Error loading annonce:', error);
          this.displayAlert('Impossible de charger l\'annonce', 'error');
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        }
      });
  }

  private populateForm(annonce: Annonce): void {
    this.annonceForm.patchValue({
      titre: annonce.titre,
      type: annonce.type,
      prix: annonce.prix,
      description: annonce.description,
      ville: annonce.ville,
      quartier: annonce.quartier,
      telephone: annonce.telephone,
      email: annonce.email
    });

    // Load existing images
    if (annonce.images && annonce.images.length > 0) {
      this.uploadedImages = annonce.images.map((url, index) => ({
        data: url,
        name: `Image ${index + 1}`,
        isExisting: true
      }));
    }

    // Update character counts
    this.titreCount = annonce.titre?.length || 0;
    this.descriptionCount = annonce.description?.length || 0;
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
            file: file,
            isExisting: false
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
      let imageUrls: string[] = [];
      
      // Separate existing and new images
      const existingImages = this.uploadedImages
        .filter(img => img.isExisting)
        .map(img => img.data);
      
      const newImages = this.uploadedImages
        .filter(img => !img.isExisting && img.file)
        .map(img => img.file!);

      // Upload new images if any
      if (newImages.length > 0) {
        this.displayAlert('Upload des nouvelles images en cours...', 'info');
        this.uploadProgress = 30;
        
        const uploadResponse = await this.annonceService
          .uploadImages(newImages)
          .pipe(takeUntil(this.destroy$))
          .toPromise();
        
        if (uploadResponse?.success && uploadResponse.data) {
          imageUrls = [...existingImages, ...uploadResponse.data];
          this.uploadProgress = 60;
        }
      } else {
        // Only existing images
        imageUrls = existingImages;
        this.uploadProgress = 60;
      }

      // Update the annonce
      const updateData: Partial<Annonce> = {
        ...this.annonceForm.value,
        images: imageUrls
      };

      this.uploadProgress = 80;

      this.annonceService.updateAnnonce(this.annonceId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.uploadProgress = 100;
            
            if (response.success) {
              this.displayAlert('Annonce modifiée avec succès ! Redirection en cours...', 'success');
              
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1500);
            } else {
              throw new Error(response.message || 'Erreur lors de la modification');
            }
          },
          error: (error) => {
            console.error('Error updating annonce:', error);
            this.displayAlert(
              error.message || 'Erreur lors de la modification. Veuillez réessayer.', 
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
    if (this.annonceForm.dirty) {
      const confirmed = confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.');
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

  hasChanges(): boolean {
    if (!this.originalAnnonce) return false;
    
    const formValue = this.annonceForm.value;
    
    return (
      formValue.titre !== this.originalAnnonce.titre ||
      formValue.type !== this.originalAnnonce.type ||
      formValue.prix !== this.originalAnnonce.prix ||
      formValue.description !== this.originalAnnonce.description ||
      formValue.ville !== this.originalAnnonce.ville ||
      formValue.quartier !== this.originalAnnonce.quartier ||
      formValue.telephone !== this.originalAnnonce.telephone ||
      formValue.email !== this.originalAnnonce.email ||
      this.uploadedImages.length !== this.originalAnnonce.images?.length
    );
  }
}