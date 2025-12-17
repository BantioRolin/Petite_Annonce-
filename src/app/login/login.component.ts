import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../Service/aut-service.service';

interface Benefit {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  alertMessage = '';
  alertType: 'success' | 'error' | '' = '';
  isLoading = false;

  benefits: Benefit[] = [
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Gérer vos annonces'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Voir vos messages'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/128/6270/6270448.png',
      text: 'Suivre vos favoris'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return fieldName === 'email' ? 'Email requis' : 'Mot de passe requis';
    }
    
    if (field?.hasError('email')) {
      return 'Adresse email invalide';
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
  Object.keys(this.loginForm.controls).forEach(key => {
    this.loginForm.get(key)?.markAsTouched();
  });

  if (this.loginForm.valid) {
    this.isLoading = true;
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login({ email, password }).subscribe({
  next: (res) => {
    if (typeof res === 'string') {
      // "Invalid credentials"
      this.alertType = 'error';
      this.alertMessage = res;
    } else {
      this.alertType = 'success';
      this.alertMessage = 'Connexion réussie';
      this.router.navigate(['/dashboard']);
    }
  },
  error: () => {
    this.alertType = 'error';
    this.alertMessage = 'Erreur serveur';
  }
});

    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
    }, 3000);
  }
}


  // onSubmit(): void {
  //   // Marquer tous les champs comme touchés pour afficher les erreurs
  //   Object.keys(this.loginForm.controls).forEach(key => {
  //     this.loginForm.get(key)?.markAsTouched();
  //   });

  //   if (this.loginForm.valid) {
  //     this.isLoading = true;
  //     this.alertType = 'success';
  //     this.alertMessage = 'Connexion...';

  //     const email = this.loginForm.get('email')?.value;
  //     const password = this.loginForm.get('password')?.value;

  //     // Simulation d'authentification
  //     setTimeout(() => {
  //       // Vérifier les identifiants (démo)
  //       if (email === 'demo@exemple.com' && password === 'demo123') {
  //         this.alertType = 'success';
  //         this.alertMessage = 'Connexion réussie !';
          
  //         // Redirection après succès
  //         setTimeout(() => {
  //           this.router.navigate(['/dashboard']); // ou '/accueil'
  //         }, 1000);
  //       } else {
  //         this.alertType = 'error';
  //         this.alertMessage = 'Identifiants incorrects';
  //         this.isLoading = false;
          
  //         // Effacer le message après 3 secondes
  //         setTimeout(() => {
  //           this.alertMessage = '';
  //           this.alertType = '';
  //         }, 3000);
  //       }
  //     }, 800);
  //   } else {
  //     this.alertType = 'error';
  //     this.alertMessage = 'Veuillez corriger les erreurs dans le formulaire';
      
  //     // Effacer le message après 3 secondes
  //     setTimeout(() => {
  //       this.alertMessage = '';
  //       this.alertType = '';
  //     }, 3000);
  //   }
  // }
}
