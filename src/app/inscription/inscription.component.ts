import { AuthService } from './../Service/aut-service.service';
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
  loginForm: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService : AuthService
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

  togglePasswordVisibility(field: 'password' | 'confirmPassword') : void {
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
  if (this.registerForm.valid) {
    const { nom, email, password } = this.registerForm.value;

    this.authService.register({
      name: nom,  
      email,
      password
    }).subscribe({
      next: (res) => {
        this.alertType = 'success';
        this.alertMessage = 'Inscription réussie !';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.alertType = 'error';
        this.alertMessage = err.error?.message || 'Erreur lors de l’inscription';
      }
    });

      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.alertMessage = '';
        this.alertType = '';
      }, 3000);
    }
  }
}