import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface Benefit {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  alertMessage = '';
  alertType: 'success' | 'error' | '' = '';

  benefits: Benefit[] = [
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Publication gratuite'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Gestion facile'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Visibilité maximale'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    
    if (fieldName === 'confirmPassword' && field?.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    if (this.registerForm.valid) {
      this.alertType = 'success';
      this.alertMessage = 'Inscription réussie ! Redirection...';

      // Simulation d'envoi au serveur
      console.log('Données du formulaire:', this.registerForm.value);

      // Redirection après 1.5 secondes
      setTimeout(() => {
        this.router.navigate(['/connexion']);
      }, 1500);
    } else {
      this.alertType = 'error';
      
      if (!this.registerForm.get('terms')?.value) {
        this.alertMessage = 'Veuillez accepter les conditions d\'utilisation';
      } else {
        this.alertMessage = 'Veuillez corriger les erreurs dans le formulaire';
      }

      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.alertMessage = '';
        this.alertType = '';
      }, 3000);
    }
  }
}